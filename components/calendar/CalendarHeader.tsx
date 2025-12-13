'use client';

import {
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import { Box, Button, Stack, Typography } from "@mui/material";
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
  const isCurrentMonth = viewedMonth === todayMonthStr;

  const renderScheduleActions = () => {
    if (!currentSchedule) {
      return (
        <Button
          fullWidth
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onGenerateSchedule}
          disabled={generatingSchedule || isPastMonth}
        >
          {generatingSchedule ? "Generating..." : "Generate Schedule"}
        </Button>
      );
    }

    if (currentSchedule.finalized) {
      return (
        <Typography
          variant="subtitle2"
          sx={{
            color: "success.main",
            fontWeight: 600,
            textAlign: "center",
            width: "100%",
          }}
        >
          ✓ Finalized
        </Typography>
      );
    }

    return (
      <Stack
        direction={{ xs: "column", sm: "row" }}
        gap={1.5}
        width="100%"
        alignItems={{ xs: "stretch", sm: "center" }}
      >
        <Button
          variant="outlined"
          onClick={onGenerateSchedule}
          disabled={generatingSchedule}
          fullWidth
        >
          Regenerate
        </Button>
        <Button
          variant="contained"
          startIcon={<CheckCircleIcon />}
          onClick={onFinalizeSchedule}
          disabled={finalizingSchedule}
          fullWidth
        >
          {finalizingSchedule ? "Finalizing..." : "Finalize"}
        </Button>
      </Stack>
    );
  };

  const navigationControls = (
    <Stack
    direction="row"
    spacing={1}
    alignItems="center"
    justifyContent="center"
    sx={{ width: "100%" }}
  >
    <Button
      size="small"
      startIcon={<ChevronLeftIcon />}
      onClick={onPreviousMonth}
      sx={{ minWidth: 120 }}
    >
      Previous
    </Button>
    <Button
      size="small"
      endIcon={<ChevronRightIcon />}
      onClick={onNextMonth}
      sx={{ minWidth: 120 }}
    >
      Next
    </Button>
  </Stack>
  );

  const actions = renderScheduleActions();

  return (
    <Stack spacing={2} mb={3} sx={{ width: "100%" }}>
      {/* Desktop layout */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        gap={2}
        sx={{ width: "100%", display: { xs: "none", md: "flex" } }}
      >
        <Box flex={1} display="flex" justifyContent="flex-start">
          {navigationControls}
        </Box>

        <Stack alignItems="center" spacing={0.5}>
          <Typography variant="h5" fontWeight={600}>
            {monthLabel}
          </Typography>
          {!isCurrentMonth && (
            <Button size="small" variant="text" onClick={onGoToToday} sx={{ fontWeight: 600 }}>
              Back to Today
            </Button>
          )}
        </Stack>

        <Box flex={1} display="flex" justifyContent="flex-end">
          <Box sx={{ width: "100%", maxWidth: 360 }}>{actions}</Box>
        </Box>
      </Stack>

      {/* Mobile layout */}
      <Stack spacing={1.5} sx={{ display: { xs: "flex", md: "none" } }} alignItems="center">
        <Stack alignItems="center" spacing={0.5}>
          <Typography variant="h5" fontWeight={600} textAlign="center">
            {monthLabel}
          </Typography>
          {!isCurrentMonth && (
            <Button size="small" variant="text" onClick={onGoToToday} sx={{ fontWeight: 600 }}>
              Back to Today
            </Button>
          )}
        </Stack>
        <Box sx={{ width: "100%" }}>{actions}</Box>
        {navigationControls}
      </Stack>
    </Stack>
  );
}
