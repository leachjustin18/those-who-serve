'use client';

import {
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import { Button, Stack, Typography } from "@mui/material";
import { format, parse } from "date-fns";

import type { TSchedule } from "@/types";

const todayMonthStr = format(new Date(), "yyyy-MM");

interface CalendarHeaderProps {
  viewedMonth: string;
  currentSchedule: TSchedule | null;
  generatingSchedule: boolean;
  finalizingSchedule: boolean;
  isPastMonth: boolean;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onGoToToday: () => void;
  onGenerateSchedule: () => void;
  onFinalizeSchedule: () => void;
}

export function CalendarHeader({
  viewedMonth,
  currentSchedule,
  generatingSchedule,
  finalizingSchedule,
  isPastMonth,
  onPreviousMonth,
  onNextMonth,
  onGoToToday,
  onGenerateSchedule,
  onFinalizeSchedule,
}: CalendarHeaderProps) {
  const monthLabel = format(
    parse(viewedMonth, "yyyy-MM", new Date()),
    "MMMM yyyy",
  );

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
      <Stack direction="row" alignItems="center" gap={2}>
        <Button size="small" onClick={onPreviousMonth} startIcon={<ChevronLeftIcon />}>
          Previous
        </Button>
        <Stack alignItems="center" sx={{ minWidth: 200 }}>
          <Typography variant="h5" fontWeight={600}>
            {monthLabel}
          </Typography>
          {viewedMonth !== todayMonthStr && (
            <Button size="small" variant="text" onClick={onGoToToday}>
              Back to Today
            </Button>
          )}
        </Stack>
        <Button size="small" onClick={onNextMonth} endIcon={<ChevronRightIcon />}>
          Next
        </Button>
      </Stack>

      {!currentSchedule ? (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onGenerateSchedule}
          disabled={generatingSchedule || isPastMonth}
        >
          {generatingSchedule ? "Generating..." : "Generate Schedule"}
        </Button>
      ) : currentSchedule.finalized ? (
        <Typography variant="subtitle2" sx={{ color: "success.main", fontWeight: 600 }}>
          ✓ Finalized
        </Typography>
      ) : (
        <Stack direction="row" gap={2}>
          <Button variant="outlined" onClick={onGenerateSchedule} disabled={generatingSchedule}>
            Regenerate
          </Button>
          <Button
            variant="contained"
            startIcon={<CheckCircleIcon />}
            onClick={onFinalizeSchedule}
            disabled={finalizingSchedule}
          >
            {finalizingSchedule ? "Finalizing..." : "Finalize"}
          </Button>
        </Stack>
      )}
    </Stack>
  );
}
