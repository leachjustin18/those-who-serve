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
    <Stack
      direction={{ xs: "column", md: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", md: "center" }}
      spacing={2}
      mb={3}
      sx={{ width: "100%" }}
    >
      <Stack
        direction="row"
        alignItems="center"
        gap={2}
        flexWrap="wrap"
        justifyContent={{ xs: "center", md: "flex-start" }}
        sx={{ width: "100%" }}
      >
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

      <Stack
        direction={{ xs: "column", sm: "row" }}
        gap={2}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent={{ xs: "flex-start", md: "flex-end" }}
        sx={{ width: { xs: "100%", md: "auto" } }}
      >
        {!currentSchedule ? (
          <Button
            fullWidth
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onGenerateSchedule}
            disabled={generatingSchedule || isPastMonth}
          >
            {generatingSchedule ? "Generating..." : "Generate Schedule"}
          </Button>
        ) : currentSchedule.finalized ? (
          <Typography
            variant="subtitle2"
            sx={{ color: "success.main", fontWeight: 600, textAlign: "center", width: "100%" }}
          >
            ✓ Finalized
          </Typography>
        ) : (
          <>
            <Button
              variant="outlined"
              onClick={onGenerateSchedule}
              disabled={generatingSchedule}
            >
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
          </>
        )}
      </Stack>
    </Stack>
  );
}
