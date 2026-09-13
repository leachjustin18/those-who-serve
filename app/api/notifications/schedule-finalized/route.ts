import { NextRequest, NextResponse } from "next/server";
import { addDays, format, parse } from "date-fns";
import { fetchMen } from "@/lib/api/men";
import { fetchSchedule } from "@/lib/api/schedules";
import { getRoleLabel } from "@/lib/helpers/getRoleLabel";
import { renderScheduleNotificationEmail } from "@/lib/emails/renderScheduleNotification";
import { sendGmailBatch } from "@/lib/helpers/googleGmail";
import { recordErrorLogs } from "@/lib/helpers/emailFailures";
import { isValidMonth } from "@/lib/helpers/scheduleValidation";

type RequestBody = {
  month?: string;
};

const APP_BASE_URL = process.env.SERVER_HOST ?? process.env.NEXTAUTH_URL ?? "";

function buildGoogleCalendarLink({
  title,
  date,
  details,
}: {
  title: string;
  date: string;
  details: string;
}) {
  const start = parse(date, "yyyy-MM-dd", new Date());
  const end = addDays(start, 1);
  const startStr = format(start, "yyyyMMdd");
  const endStr = format(end, "yyyyMMdd");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${startStr}/${endStr}`,
    details,
    ctz: "America/Chicago",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function buildIcsLink({
  title,
  date,
  details,
}: {
  title: string;
  date: string;
  details: string;
}) {
  const params = new URLSearchParams({
    title,
    date,
    details,
  });
  return `${APP_BASE_URL || ""}/api/calendar/ics?${params.toString()}`;
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as RequestBody | null;

  if (!body?.month) {
    return NextResponse.json({ error: "month is required" }, { status: 400 });
  }

  // Validate month format
  if (!isValidMonth(body.month)) {
    return NextResponse.json(
      { error: "Invalid month format. Use YYYY-MM format." },
      { status: 400 },
    );
  }

  try {
    const [men, schedule] = await Promise.all([
      fetchMen(),
      fetchSchedule(body.month),
    ]);

    if (!schedule) {
      return NextResponse.json(
        { error: `No schedule found for ${body.month}` },
        { status: 404 },
      );
    }

    const menById = new Map(men.map((man) => [man.id, man]));
    const monthLabel = format(parse(body.month, "yyyy-MM", new Date()), "MMMM yyyy");

    const assignmentsByServant = new Map<
      string,
      Array<{
        id: string;
        displayDate: string;
        dayName: string;
        roleLabel: string;
        calendarLink: string;
        icsLink: string;
        timestamp: number;
      }>
    >();

    const immediateFailures: Array<{
      to?: string | null;
      reason: string;
      details?: string;
      subject?: string;
      context?: Record<string, any>;
    }> = [];

    for (const entry of schedule.entries) {
      const man = menById.get(entry.servantId);
      if (!man || !man.email) {
        immediateFailures.push({
          to: man?.email ?? null,
          reason: "missing_email",
          details: man ? "Man has no email" : "Servant not found",
          context: { servantId: entry.servantId, date: entry.date, month: body.month },
        });
        continue;
      }

      const dateObj = parse(entry.date, "yyyy-MM-dd", new Date());
      const roleLabel = getRoleLabel(entry.role);
      const dayName = format(dateObj, "EEEE");
      const displayDate = format(dateObj, "MMMM d");

      const calendarLink = buildGoogleCalendarLink({
        title: `${roleLabel} — ${monthLabel}`,
        date: entry.date,
        details: `Serving as ${roleLabel} on ${displayDate} (${dayName}).`,
      });
      const icsLink = buildIcsLink({
        title: `${roleLabel} — ${monthLabel}`,
        date: entry.date,
        details: `Serving as ${roleLabel} on ${displayDate} (${dayName}).`,
      });

      const existing = assignmentsByServant.get(entry.servantId) ?? [];
      existing.push({
        id: `${entry.date}-${entry.role}`,
        displayDate,
        dayName,
        roleLabel,
        calendarLink,
        icsLink,
        timestamp: dateObj.getTime(),
      });
      assignmentsByServant.set(entry.servantId, existing);
    }



    const sent: string[] = [];
    const failed: Array<{ servantId: string; reason: string }> = [];

    // Persist immediate failures (e.g., missing or invalid emails) so operators can review them
    if (immediateFailures.length > 0) {
      try {
        const entries = immediateFailures.map((f) => ({
          to: f.to ?? null,
          errorType: "email_failure",
          reason: f.reason,
          details: f.details ?? undefined,
          context: f.context ?? {},
        }));
        await recordErrorLogs(entries as any);

        // Also report these as failed so the API response reflects them
        for (const f of immediateFailures) {
          const servantId = f.context?.servantId;
          if (servantId) {
            failed.push({ servantId, reason: f.reason });
          }
        }
      } catch (recErr) {
        console.error("Failed to record immediate email failures", recErr);
      }
    }

    for (const [servantId, assignments] of assignmentsByServant.entries()) {
      const man = menById.get(servantId);
      if (!man) continue;

      assignments.sort((a, b) => a.timestamp - b.timestamp);

      const { html, text } = await renderScheduleNotificationEmail({
        recipientName: man.firstName || "Brother",
        monthLabel,
        assignments: assignments.map(({ timestamp, ...rest }) => rest),
      });

      const subject = `Your serving schedule for ${monthLabel}`;

      const result = await sendGmailBatch({
        to: man.email,
        subject,
        html,
        text,
        concurrency: 3,
        retryTransient: true,
      });

      if (result.successes.length > 0) sent.push(servantId);

      if (result.failures.length > 0) {
        // record failures to Firestore for operator review
        const entries = result.failures.map((f) => ({
          to: f.to,
          reason: f.reason,
          details: f.details,
          subject,
          context: { servantId, month: body.month, notificationType: "schedule_finalized" },
        }));
        try {
          await recordErrorLogs(entries);
        } catch (recErr) {
          console.error("Failed to record email failures", recErr);
        }

        for (const f of result.failures) {
          failed.push({ servantId, reason: f.reason });
        }
      }
    }

    const status = failed.length > 0 ? 207 : 200;

    return NextResponse.json({ sent, failed }, { status });
  } catch (err) {
    console.error("Error sending schedule notifications", err);
    return NextResponse.json(
      { error: "Failed to send schedule notifications" },
      { status: 500 },
    );
  }
}
