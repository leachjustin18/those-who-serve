import { NextRequest, NextResponse } from "next/server";
import { addDays, format, parse } from "date-fns";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title");
  const date = searchParams.get("date");
  const details = searchParams.get("details") ?? "";
  const tz = searchParams.get("tz") ?? "America/Chicago";

  if (!title || !date) {
    return NextResponse.json({ error: "title and date are required" }, { status: 400 });
  }

  const start = parse(date, "yyyy-MM-dd", new Date());
  const end = addDays(start, 1);
  const startStr = format(start, "yyyyMMdd");
  const endStr = format(end, "yyyyMMdd");
  const uid = `${date}-${title}`.replace(/\s+/g, "-");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ThoseWhoServe//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `SUMMARY:${title}`,
    `DTSTART;VALUE=DATE:${startStr}`,
    `DTEND;VALUE=DATE:${endStr}`,
    `DESCRIPTION:${details}`,
    `TZID:${tz}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="event.ics"`,
    },
  });
}
