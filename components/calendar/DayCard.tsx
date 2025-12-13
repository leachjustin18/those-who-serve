'use client';

import { Edit as EditIcon } from "@mui/icons-material";
import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { format, parse } from "date-fns";

import { ManAvatar } from "@/components/ui";
import { getRoleLabel } from "@/lib/helpers/getRoleLabel";
import type { TScheduleEntry } from "@/types";

interface DayCardProps {
  dateStr: string;
  dayName: "Wednesday" | "Sunday";
  entries: TScheduleEntry[];
  worshipInSong: TScheduleEntry | undefined;
  isFinalized: boolean;
  getServantName: (id: string) => string;
  getServant: (id: string) => any;
  onEdit: (entry: TScheduleEntry) => void;
  onMarkWorshipInSong: (dateStr: string, dayName: "Wednesday" | "Sunday") => void;
  onRemoveWorshipInSong: (dateStr: string) => void;
}

export function DayCard({
  dateStr,
  dayName,
  entries,
  worshipInSong,
  isFinalized,
  getServantName,
  getServant,
  onEdit,
  onMarkWorshipInSong,
  onRemoveWorshipInSong,
}: DayCardProps) {
  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle2" color="textSecondary">
          {dayName}, {format(parse(dateStr, "yyyy-MM-dd", new Date()), "MMM d")}
        </Typography>

        {worshipInSong ? (
          <Stack gap={2} mt={2}>
            <Box
              p={2}
              bgcolor="warning.lighter"
              borderRadius={1}
              sx={{ textAlign: "center" }}
            >
              <Typography variant="subtitle2" fontWeight={600} color="warning.main">
                Worship in Song
              </Typography>
              <Typography variant="caption" color="textSecondary" display="block" mt={0.5}>
                Full day event
              </Typography>
            </Box>
            <Button
              size="small"
              startIcon={<EditIcon />}
              disabled={isFinalized}
              onClick={() => onRemoveWorshipInSong(dateStr)}
            >
              Change
            </Button>
          </Stack>
        ) : (
          <Stack gap={1.5} mt={2}>
            {entries.map((entry, idx) => (
              <Box
                key={`${entry.date}-${entry.role}-${idx}`}
                p={1.5}
                bgcolor="action.hover"
                borderRadius={1}
                sx={{
                  border: `1px solid ${isFinalized ? "transparent" : "rgba(25, 118, 210, 0.12)"
                    }`,
                }}
              >
                <Typography variant="subtitle2" color="textSecondary">
                  {getRoleLabel(entry.role)}
                </Typography>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  gap={1}
                  sx={{ mt: 0.5 }}
                >
                  <Stack direction="row" alignItems="center" gap={1}>
                    <ManAvatar
                      name={getServantName(entry.servantId)}
                      photo={getServant(entry.servantId)?.photoFile as string | undefined}
                    />
                    <Typography variant="body2" fontWeight={600}>
                      {getServantName(entry.servantId)}
                    </Typography>
                  </Stack>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => onEdit(entry)}
                    disabled={isFinalized}
                  >
                    Change
                  </Button>
                </Stack>
              </Box>
            ))}
            <Button
              size="small"
              startIcon={<EditIcon />}
              onClick={() => onMarkWorshipInSong(dateStr, dayName)}
              disabled={isFinalized}
              sx={{ mt: 1 }}
            >
              Mark as Worship in Song
            </Button>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
