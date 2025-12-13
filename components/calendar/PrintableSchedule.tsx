import { format, parse } from "date-fns";
import { Box, Grid, Stack, Typography } from "@mui/material";

import { WORSHIP_IN_SONG_MARKER } from "@/lib/constants";
import { getWednesdaysAndSundaysInMonth } from "@/lib/helpers/scheduling";
import type {
  TSchedule,
  TScheduleEntry,
  TSchedulePrintExtras,
  TDeacons,
} from "@/types";

export type WorshipScope = "full" | "morning" | "evening" | null;

/**
 * Gets the worship scope for a date. Now checks if there are any worship_in_song entries
 * for that date and returns "full" if found (since we now mark individual roles as worship).
 * This maintains backward compatibility while supporting role-specific worship marking.
 */
export const worshipScopeForDate = (
  entries: TScheduleEntry[],
  dateStr: string,
): WorshipScope => {
  const entry = entries.find(
    (e) => e.date === dateStr && e.role === "worship_in_song",
  );
  if (!entry) return null;

  const token = (entry.servantId || "").toLowerCase();
  if (token.includes("morning")) return "morning";
  if (token.includes("evening")) return "evening";
  return "full";
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse" as const,
  fontSize: "12px",
};

const headerCell = {
  border: "1px solid #000",
  padding: "6px 8px",
  fontWeight: 700,
  textAlign: "center" as const,
  backgroundColor: "rgba(0,0,0,0.04)",
};

const cell = {
  border: "1px solid #000",
  padding: "6px 8px",
  textAlign: "center" as const,
  minWidth: "90px",
};

const dateCell = { ...cell, fontWeight: 700, minWidth: "80px" };
const worshipCell = {
  ...cell,
  fontWeight: 700,
  backgroundColor: "rgba(255,193,7,0.15)",
};

type PrintableScheduleProps = {
  schedule: TSchedule;
  men: Array<{ id: string; firstName: string; lastName: string; photoFile?: string | File }>;
  deacons: TDeacons[];
  extras: TSchedulePrintExtras;
  monthLabel: string;
};

export function PrintableSchedule({
  schedule,
  men,
  deacons,
  extras,
  monthLabel,
}: PrintableScheduleProps) {
  const getName = (servantId: string) => {
    const servant = men.find((m) => m.id === servantId);
    if (!servant) return "";
    return `${servant.firstName ?? ""} ${servant.lastName ?? ""}`.trim();
  };

  /**
   * Check if a specific role is marked as worship in song for a given date.
   * A role is marked as worship if there's a worship_in_song entry for that date.
   */
  const isRoleMarkedAsWorship = (dateStr: string, role: string): boolean => {
    // Check if this specific role is marked as worship (servantId is WORSHIP_IN_SONG_MARKER)
    const roleEntry = schedule.entries.find(
      (e) => e.date === dateStr && e.role === role,
    );
    // If the role entry exists and its servant is the worship marker, it's marked as worship
    return roleEntry?.servantId === WORSHIP_IN_SONG_MARKER;
  };

  const monthlyNames = (role: string) =>
    schedule.entries
      .filter((e) => e.role === role)
      .map((e) => getName(e.servantId))
      .filter(Boolean);

  const dateList = getWednesdaysAndSundaysInMonth(schedule.month);
  const sundayDates = dateList.filter((d) => getDayNameFromDate(d) === "Sunday");
  const wednesdayDates = dateList.filter((d) => getDayNameFromDate(d) === "Wednesday");

  const roleNamesForDate = (dateStr: string, role: string) =>
    schedule.entries
      .filter((e) => e.date === dateStr && e.role === role)
      .map((e) => getName(e.servantId))
      .filter(Boolean);

  const renderNames = (names: string[]) =>
    names.length > 0 ? (
      <Stack spacing={0.5} alignItems="center">
        {names.map((name, idx) => (
          <Typography
            key={`${name}-${idx}`}
            variant="body2"
            sx={{ fontSize: "12px", fontWeight: 600 }}
          >
            {name}
          </Typography>
        ))}
      </Stack>
    ) : (
      <Typography
        component="span"
        variant="body2"
        sx={{ fontSize: "12px", opacity: 0.7 }}
      >
        —
      </Typography>
    );

  const formatShortDate = (dateStr: string) =>
    format(parse(dateStr, "yyyy-MM-dd", new Date()), "d-MMM");

  const announcements = monthlyNames("announcements").join(", ") || "—";
  const ushers = monthlyNames("usher").join(", ") || "—";
  const deaconsInCharage =
    (extras.monthlyDeacons || [])
      .map((id) => {
        const match = deacons.find((d) => d.id === id);

        return {
          name: match ? `${match.firstName} ${match.lastName}` : undefined,
          phoneNumber: match?.phoneNumber,
        };

      })

  return (
    <Box sx={{ color: "text.primary" }}>
      <Typography
        variant="h5"
        textAlign="center"
        fontWeight={800}
        sx={{ mt: 0.5, mb: 1.5 }}
      >
        THOSE PRIVILEGED TO SERVE {monthLabel.toUpperCase()}
      </Typography>

      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Stack spacing={0.5}>
            {[
              { label: "Announcements", value: announcements },
              { label: "Ushers", value: ushers },
            ].map((item) => (
              <Stack
                key={item.label}
                direction="row"
                spacing={1}
                alignItems="baseline"
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  {item.label}:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {item.value}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Stack spacing={0.5}>
            {[
              { label: "Communion", value: extras.communionFamily || "—" },
              { label: "Card Boys", value: extras.cardBoys || "—" }
            ].map((item) => (
              <Stack
                key={item.label}
                direction="row"
                spacing={1}
                alignItems="baseline"
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  {item.label}:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {item.value}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Grid>
      </Grid>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          Sunday Schedule
        </Typography>
        <Box sx={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={headerCell}>Date</th>
                <th style={headerCell}>Morning Singing</th>
                <th style={headerCell}>Lord&apos;s Table</th>
                <th style={headerCell}>Morning Prayers</th>
                <th style={headerCell}>Evening Singing</th>
                <th style={headerCell}>Evening Prayers</th>
              </tr>
            </thead>
            <tbody>
              {sundayDates.map((dateStr) => {
                const worshipScope = worshipScopeForDate(
                  schedule.entries,
                  dateStr,
                );
                return (
                  <tr key={dateStr}>
                    <td style={dateCell}>{formatShortDate(dateStr)}</td>
                    {worshipScope === "full" ? (
                      <td style={worshipCell} colSpan={5}>
                        WORSHIP IN SONG
                      </td>
                    ) : (
                      <>
                        <td style={cell}>
                          {isRoleMarkedAsWorship(dateStr, "morning_singing") ? (
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: "12px",
                                fontWeight: 700,
                                color: "warning.dark",
                              }}
                            >
                              WORSHIP IN SONG
                            </Typography>
                          ) : (
                            renderNames(roleNamesForDate(dateStr, "morning_singing"))
                          )}
                        </td>
                        <td style={cell}>
                          {isRoleMarkedAsWorship(dateStr, "lords_table") ? (
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: "12px",
                                fontWeight: 700,
                                color: "warning.dark",
                              }}
                            >
                              WORSHIP IN SONG
                            </Typography>
                          ) : (
                            renderNames(roleNamesForDate(dateStr, "lords_table"))
                          )}
                        </td>
                        <td style={cell}>
                          {isRoleMarkedAsWorship(dateStr, "morning_prayer") ? (
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: "12px",
                                fontWeight: 700,
                                color: "warning.dark",
                              }}
                            >
                              WORSHIP IN SONG
                            </Typography>
                          ) : (
                            renderNames(roleNamesForDate(dateStr, "morning_prayer"))
                          )}
                        </td>
                        <td style={cell}>
                          {isRoleMarkedAsWorship(dateStr, "evening_singing") ? (
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: "12px",
                                fontWeight: 700,
                                color: "warning.dark",
                              }}
                            >
                              WORSHIP IN SONG
                            </Typography>
                          ) : (
                            renderNames(roleNamesForDate(dateStr, "evening_singing"))
                          )}
                        </td>
                        <td style={cell}>
                          {isRoleMarkedAsWorship(dateStr, "evening_prayers") ? (
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: "12px",
                                fontWeight: 700,
                                color: "warning.dark",
                              }}
                            >
                              WORSHIP IN SONG
                            </Typography>
                          ) : (
                            renderNames(roleNamesForDate(dateStr, "evening_prayers"))
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Box>
      </Box>

      <Box>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          Wednesday Schedule
        </Typography>
        <Box sx={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={headerCell}>Date</th>
                <th style={headerCell}>Lead Singing</th>
                <th style={headerCell}>Devotional</th>
                <th style={headerCell}>Closing Prayer</th>
              </tr>
            </thead>
            <tbody>
              {wednesdayDates.map((dateStr) => {
                const worshipScope = worshipScopeForDate(
                  schedule.entries,
                  dateStr,
                );
                return (
                  <tr key={dateStr}>
                    <td style={dateCell}>{formatShortDate(dateStr)}</td>
                    {worshipScope ? (
                      <td style={worshipCell} colSpan={3}>
                        WORSHIP IN SONG
                      </td>
                    ) : (
                      <>
                        <td style={cell}>
                          {isRoleMarkedAsWorship(dateStr, "lead_singing") ? (
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: "12px",
                                fontWeight: 700,
                                color: "warning.dark",
                              }}
                            >
                              WORSHIP IN SONG
                            </Typography>
                          ) : (
                            renderNames(roleNamesForDate(dateStr, "lead_singing"))
                          )}
                        </td>
                        <td style={cell}>
                          {isRoleMarkedAsWorship(dateStr, "devotional") ? (
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: "12px",
                                fontWeight: 700,
                                color: "warning.dark",
                              }}
                            >
                              WORSHIP IN SONG
                            </Typography>
                          ) : (
                            renderNames(roleNamesForDate(dateStr, "devotional"))
                          )}
                        </td>
                        <td style={cell}>
                          {isRoleMarkedAsWorship(dateStr, "closing_prayer") ? (
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: "12px",
                                fontWeight: 700,
                                color: "warning.dark",
                              }}
                            >
                              WORSHIP IN SONG
                            </Typography>
                          ) : (
                            renderNames(roleNamesForDate(dateStr, "closing_prayer"))
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Box>
      </Box>

      <Box sx={{ mt: 3, textAlign: "center" }}>
        <Typography
          variant="body2"
          sx={{ fontStyle: "italic", fontWeight: 600, letterSpacing: 0.3 }}
        >
          IF YOU ARE UNABLE TO SERVE AND OR IF YOU GET SOMEONE TO SUBSTITUTE FOR YOU.
        </Typography>
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, letterSpacing: 0.3 }}
        >
          PLEASE LET THE DEACONS BELOW KNOW AS SOON AS POSSIBLE.
        </Typography>
        <Typography
          variant="body2"
          sx={{ fontWeight: 700, letterSpacing: 0.3, mt: 0.5 }}
        >
          {deaconsInCharage.length !== 2
            ? "__________ & __________"
            : deaconsInCharage
              .map(
                (d) =>
                  `${d?.name || "__________"} ${d?.phoneNumber || "__________"}`,
              )
              .join(" & ")}
        </Typography>
      </Box>
    </Box>
  );
}

function getDayNameFromDate(dateStr: string): "Wednesday" | "Sunday" {
  const date = parse(dateStr, "yyyy-MM-dd", new Date());
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 ? "Sunday" : "Wednesday";
}
