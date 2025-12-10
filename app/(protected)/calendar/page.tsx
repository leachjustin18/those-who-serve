"use client";

import { useState } from "react";
import { Box, CircularProgress, Typography, Grid } from "@mui/material";
import { addMonths, format, parse } from "date-fns";

import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { DayCard } from "@/components/calendar/DayCard";
import { EditEntryModal } from "@/components/calendar/EditEntryModal";
import { FinalizingBackdrop } from "@/components/calendar/FinalizingBackdrop";
import { MonthlyRolesSection } from "@/components/calendar/MonthlyRolesSection";
import { useCache } from "@/components/context/Cache";
import { AlertSnackbar } from "@/components/ui";
import { ROLE_OPTIONS } from "@/lib/constants";
import {
  getAvailableServantsForOverride,
  getDayNameFromDate,
  getEntriesForDate,
  getMonthlyEntries,
  isPastMonth,
} from "@/lib/helpers/calendarHelpers";
import { getWednesdaysAndSundaysInMonth } from "@/lib/helpers/scheduling";
import { useSnackbarQueue } from "@/lib/hooks/useSnackbarQueue";
import { useEditModal } from "@/lib/hooks/useEditModal";
import { useScheduleActions } from "@/lib/hooks/useScheduleActions";
import { useScheduleData } from "@/lib/hooks/useScheduleData";

const todayMonthStr = format(new Date(), "yyyy-MM");

export default function Calendar() {
  const { men: allMen } = useCache();
  const [viewedMonth, setViewedMonth] = useState(todayMonthStr);

  const snackbar = useSnackbarQueue();
  const { currentSchedule, setCurrentSchedule, loading } = useScheduleData(
    viewedMonth,
    (message, severity) => snackbar.showSnackbar({ message, severity }),
  );
  const scheduleActions = useScheduleActions(
    viewedMonth,
    currentSchedule,
    setCurrentSchedule,
    (message, severity) => snackbar.showSnackbar({ message, severity }),
  );
  const editModal = useEditModal(scheduleActions.updateEntry);

  const handlePreviousMonth = () => {
    setViewedMonth((prev) =>
      format(addMonths(parse(prev, "yyyy-MM", new Date()), -1), "yyyy-MM"),
    );
  };

  const handleNextMonth = () => {
    setViewedMonth((prev) =>
      format(addMonths(parse(prev, "yyyy-MM", new Date()), 1), "yyyy-MM"),
    );
  };

  const handleGoToToday = () => {
    setViewedMonth(todayMonthStr);
  };

  const getServant = (servantId: string) => allMen.find((m) => m.id === servantId);
  const getServantName = (servantId: string): string => {
    const servant = getServant(servantId);
    return servant
      ? `${servant.firstName} ${servant.lastName}`.trim()
      : "Unknown";
  };

  const monthlyEntries = getMonthlyEntries(currentSchedule);
  const allDates = getWednesdaysAndSundaysInMonth(viewedMonth);
  const pastMonth = isPastMonth(viewedMonth);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <CalendarHeader
        viewedMonth={viewedMonth}
        currentSchedule={currentSchedule}
        generatingSchedule={scheduleActions.generatingSchedule}
        finalizingSchedule={scheduleActions.finalizingSchedule}
        isPastMonth={pastMonth}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
        onGoToToday={handleGoToToday}
        onGenerateSchedule={scheduleActions.generateSchedule}
        onFinalizeSchedule={scheduleActions.finalizeSchedule}
      />

      <AlertSnackbar
        open={snackbar.open}
        severity={snackbar.messageInfo?.severity}
        title={snackbar.messageInfo?.title}
        message={snackbar.messageInfo?.message}
        onClose={snackbar.handleClose}
        slotProps={{ transition: { onExited: snackbar.handleExited } }}
      />

      <FinalizingBackdrop open={scheduleActions.sendingNotifications} />

      {currentSchedule ? (
        <>
          {monthlyEntries.length > 0 && (
            <MonthlyRolesSection
              entries={monthlyEntries}
              getServantName={getServantName}
              getServant={getServant}
              onEdit={editModal.openEditModal}
              isFinalized={currentSchedule.finalized || false}
            />
          )}

          <Typography variant="h6" fontWeight={600} mb={2}>
            Schedule
          </Typography>
          <Grid container spacing={2} mb={4}>
            {allDates.map((dateStr) => {
              const dayName = getDayNameFromDate(dateStr);
              const entries = getEntriesForDate(currentSchedule, dateStr).filter(
                (e) => !ROLE_OPTIONS.find((r) => r.value === e.role && r.isMonthly),
              );
              const worshipInSong = currentSchedule.entries.find(
                (e) => e.date === dateStr && e.role === "worship_in_song",
              );

              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={dateStr}>
                  <DayCard
                    dateStr={dateStr}
                    dayName={dayName}
                    entries={entries}
                    worshipInSong={worshipInSong}
                    isFinalized={currentSchedule.finalized || false}
                    getServantName={getServantName}
                    getServant={getServant}
                    onEdit={editModal.openEditModal}
                    onMarkWorshipInSong={(date) =>
                      scheduleActions.addWorshipInSong(date, "worship-in-song-marker")
                    }
                    onRemoveWorshipInSong={scheduleActions.removeWorshipInSong}
                  />
                </Grid>
              );
            })}
          </Grid>
        </>
      ) : (
        <Box sx={{ p: 2, textAlign: "center", color: "text.secondary" }}>
          <Typography>
            No schedule exists for this month. Click &quot;Generate Schedule&quot; to create one.
          </Typography>
        </Box>
      )}

      <EditEntryModal
        isOpen={editModal.editModal.isOpen}
        entry={editModal.editModal.entry}
        selectedServantId={editModal.editModal.selectedServantId}
        availableServants={
          editModal.editModal.entry
            ? getAvailableServantsForOverride(
              allMen,
              editModal.editModal.entry.role,
              editModal.editModal.entry.date,
              currentSchedule?.entries || [],
            )
            : []
        }
        onClose={editModal.closeEditModal}
        onSave={editModal.saveEditModal}
        onServantChange={editModal.updateSelectedServant}
      />
    </Box>
  );
}
