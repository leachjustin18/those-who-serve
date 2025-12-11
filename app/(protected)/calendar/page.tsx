"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Chip,
  FormHelperText,
} from "@mui/material";
import { addMonths, format, parse } from "date-fns";
import { useForm, Controller } from "react-hook-form";
import { useReactToPrint } from "react-to-print";

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
import { EMPTY_PRINT_EXTRAS } from "@/lib/constants";
import type { TSchedulePrintExtras } from "@/types";


export default function Calendar() {
  const { men: allMen, schedules: allSchedules, deacons: allDeacons } = useCache();
  const [viewedMonth, setViewedMonth] = useState(format(new Date(), "yyyy-MM"));

  const snackbar = useSnackbarQueue();

  const currentSchedule = allSchedules.find(s => s.month === viewedMonth) || null;

  const scheduleActions = useScheduleActions(
    viewedMonth,
    currentSchedule,
    allSchedules,
    (message, severity) => snackbar.showSnackbar({ message, severity }),
  );

  const editModal = useEditModal(scheduleActions.updateEntry);

  const {
    control,
    formState: { errors },
  } = useForm<TSchedulePrintExtras>({
    defaultValues: EMPTY_PRINT_EXTRAS,
    mode: "onBlur",
  });

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
    setViewedMonth(viewedMonth);
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

          <Card sx={{ mb: 4 }}>
            <CardContent>
              <form>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller
                      name="cardBoys"
                      control={control}
                      rules={{ required: "Card boys are required" }}
                      render={({ field, fieldState }) => (
                        <TextField
                          label="Card Boys"
                          {...field}
                          error={!!fieldState.error}
                          fullWidth
                          helperText={fieldState.error?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>

                    <Controller
                      name="communionFamily"
                      control={control}
                      rules={{ required: "Communion family is required" }}
                      render={({ field, fieldState }) => (
                        <TextField
                          label="Communion family"
                          {...field}
                          error={!!fieldState.error}
                          fullWidth
                          helperText={fieldState.error?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller
                      name="monthlyDeacons"
                      control={control}
                      rules={{
                        validate: (value) =>
                          value && value.length === 2
                            ? true
                            : "Select exactly two deacons",
                      }}
                      render={({ field, fieldState }) => (
                        <FormControl fullWidth error={!!fieldState.error} >
                          <InputLabel id="monthly-deacons-label">
                            Deacons for the Month
                          </InputLabel>
                          <Select<string[]>
                            labelId="monthly-deacons-label"
                            multiple
                            value={field.value ?? []}
                            onChange={(event, _child) => {
                              const {
                                target: { value },
                              } = event;
                              field.onChange(
                                typeof value === "string" ? value.split(",") : value,
                              );
                            }}

                            renderValue={(selected) => {
                              const selectedIds = Array.isArray(selected)
                                ? selected
                                : [];
                              if (selectedIds.length === 0) {
                                return "Select two deacons";
                              }

                              return (
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 0.5,
                                  }}
                                >
                                  {selectedIds.map((id) => {
                                    const deacon = allDeacons.find(
                                      (d) => d.id === id,
                                    );
                                    const name = deacon
                                      ? `${deacon.firstName} ${deacon.lastName}`.trim()
                                      : "Unknown";
                                    return (
                                      <Chip
                                        key={id}
                                        label={name}
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onDelete={() => {
                                          const updated = selectedIds.filter(
                                            (selectedId) => selectedId !== id,
                                          );
                                          field.onChange(updated ?? "");
                                        }}
                                      />
                                    );
                                  })}
                                </Box>
                              );
                            }}
                          >
                            {allDeacons.map((deacon) => (
                              <MenuItem
                                key={deacon.id}
                                value={deacon.id}
                                disabled={
                                  (field.value || []).length >= 2 &&
                                  !(field.value || []).includes(deacon.id)
                                }
                              >
                                {`${deacon.firstName} ${deacon.lastName}`.trim()}
                              </MenuItem>
                            ))}
                          </Select>
                          <FormHelperText>
                            {fieldState.error?.message}
                          </FormHelperText>
                        </FormControl>
                      )}
                    />
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>

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
