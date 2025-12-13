"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  ToggleButtonGroup,
  ToggleButton,
  OutlinedInput,
  Button,
} from "@mui/material";
import { addMonths, format, parse } from "date-fns";
import { useForm, Controller, useWatch } from "react-hook-form";
import { useReactToPrint } from "react-to-print";
import PrintIcon from '@mui/icons-material/Print';

import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { DayCard } from "@/components/calendar/DayCard";
import { PrintableSchedule } from "@/components/calendar/PrintableSchedule";
import { EditEntryModal } from "@/components/calendar/EditEntryModal";
import { FinalizingBackdrop } from "@/components/calendar/FinalizingBackdrop";
import { MonthlyRolesSection } from "@/components/calendar/MonthlyRolesSection";
import { useCache } from "@/components/context/Cache";
import { AlertSnackbar } from "@/components/ui";
import { ROLE_OPTIONS, EMPTY_PRINT_EXTRAS, WORSHIP_IN_SONG_MARKER } from "@/lib/constants";
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
import type { TSchedulePrintExtras } from "@/types";

type CalendarViewMode = "edit" | "print";


export default function Calendar() {
  const { men: allMen, schedules: allSchedules, deacons: allDeacons } = useCache();
  const [viewedMonth, setViewedMonth] = useState(format(new Date(), "yyyy-MM"));
  const [viewMode, setViewMode] = useState<CalendarViewMode>("edit");

  const contentRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `Those Who Serve ${viewedMonth}`,
  });

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
    reset,
    trigger,
    getValues,
  } = useForm<TSchedulePrintExtras>({
    defaultValues: EMPTY_PRINT_EXTRAS,
    mode: "onBlur",
  });
  const watchedPrintExtras =
    useWatch({ control }) ?? EMPTY_PRINT_EXTRAS;

  useEffect(() => {
    if (currentSchedule?.printExtras) {
      reset({
        ...EMPTY_PRINT_EXTRAS,
        ...currentSchedule.printExtras,
        monthlyDeacons: currentSchedule.printExtras.monthlyDeacons ?? [],
      });
    } else {
      reset(EMPTY_PRINT_EXTRAS);
    }
  }, [currentSchedule, reset]);

  useEffect(() => {
    if (!currentSchedule && viewMode !== "edit") {
      (() => {
        setViewMode("edit");
      })();
    }
  }, [currentSchedule, viewMode]);

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

  const handleFinalizeSchedule = async () => {
    const isValid = await trigger([
      "cardBoys",
      "communionFamily",
      "monthlyDeacons",
    ]);

    if (!isValid) {
      snackbar.showSnackbar({
        severity: "warning",
        message:
          "Please fill Card Boys, Communion Family, and select two Deacons before finalizing.",
      });
      setViewMode("edit");
      return;
    }

    const extras = getValues();
    await scheduleActions.finalizeSchedule({
      ...EMPTY_PRINT_EXTRAS,
      ...extras,
      monthlyDeacons: extras.monthlyDeacons ?? [],
    });
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
  const monthLabel = format(parse(viewedMonth, "yyyy-MM", new Date()), "MMMM yyyy");
  const printableExtras: TSchedulePrintExtras = useMemo(() => {
    const watched = watchedPrintExtras || EMPTY_PRINT_EXTRAS;
    return {
      ...EMPTY_PRINT_EXTRAS,
      ...watched,
      monthlyDeacons: watched.monthlyDeacons ?? [],
    };
  }, [watchedPrintExtras]);

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
        onFinalizeSchedule={handleFinalizeSchedule}
      />

      <AlertSnackbar
        open={snackbar.open}
        severity={snackbar.messageInfo?.severity}
        title={snackbar.messageInfo?.title}
        message={snackbar.messageInfo?.message}
        onClose={snackbar.handleClose}
        slotProps={{ transition: { onExited: snackbar.handleExited } }}
      />

      <FinalizingBackdrop open={scheduleActions.finalizingSchedule} />

      {currentSchedule && (
        <Box
          mb={3}
          display="flex"
          sx={{ flexDirection: "column" }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            View Mode
          </Typography>
          <ToggleButtonGroup
            exclusive
            value={viewMode}
            color="primary"
            size="small"
            onChange={(_event, next) => {
              if (next) {
                setViewMode(next);
              }
            }}
            sx={{
              mb: 2,
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              "& .MuiToggleButtonGroup-grouped": {
                margin: 0,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                borderLeft: (theme) =>
                  `1px solid ${theme.palette.divider}`,
                flex: { xs: "1 1 calc(50% - 8px)", sm: "0 0 auto" },
              },
              "& .MuiToggleButtonGroup-grouped:not(:first-of-type)": {
                borderLeft: (theme) =>
                  `1px solid ${theme.palette.divider}`,
              },
            }}

          >
            <ToggleButton sx={{
              justifyContent: "center",
              "&.Mui-selected": {
                boxShadow: 3,
                borderColor: "primary.main",
              },
              "&.Mui-selected:hover": {
                boxShadow: 4,
              },
            }} value="edit">Edit Schedule</ToggleButton>
            <ToggleButton sx={{
              justifyContent: "center",
              "&.Mui-selected": {
                boxShadow: 3,
                borderColor: "primary.main",
              },
              "&.Mui-selected:hover": {
                boxShadow: 4,
              },
            }} value="print">Print View</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      )}

      {currentSchedule ? (
        viewMode === "edit" ? (
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
                            disabled={currentSchedule.finalized}
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
                            disabled={currentSchedule.finalized}
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
                          <FormControl fullWidth error={!!fieldState.error}>
                            <InputLabel id="monthly-deacons-label">
                              Deacons in Charge
                            </InputLabel>
                            <Select<string[]>
                              labelId="monthly-deacons-label"
                              multiple
                              value={field.value ?? []}
                              disabled={currentSchedule.finalized}
                              onChange={(event, _child) => {
                                const {
                                  target: { value },
                                } = event;

                                field.onChange(
                                  typeof value === "string"
                                    ? value.split(",")
                                    : value,
                                );
                              }}
                              input={
                                <OutlinedInput label="Deacons for the Month" />
                              }
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
                                          disabled={currentSchedule.finalized}
                                          onMouseDown={(e) => e.stopPropagation()}
                                          onDelete={() => {
                                            const updated = selectedIds.filter(
                                              (selectedId) =>
                                                selectedId !== id,
                                            );
                                            field.onChange(updated);

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
                            {!currentSchedule.finalized && (<FormHelperText>
                              {fieldState.error?.message ||
                                "Select exactly two deacons"}
                            </FormHelperText>
                            )}
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
                const entries = getEntriesForDate(
                  currentSchedule,
                  dateStr,
                ).filter(
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
                        scheduleActions.addWorshipInSong(
                          date,
                          WORSHIP_IN_SONG_MARKER,
                        )
                      }
                      onRemoveWorshipInSong={scheduleActions.removeWorshipInSong}
                    />
                  </Grid>
                );
              })}
            </Grid>
          </>
        ) : (
          <>
            <Box mb={2}>
              <Button
                variant="contained"
                disabled={!currentSchedule.finalized}
                fullWidth
                sx={{ maxWidth: { sm: 200 } }}
                onClick={handlePrint}
                startIcon={<PrintIcon />}
              >
                Print Schedule

              </Button>
              {!currentSchedule.finalized && (
                <FormHelperText>
                  Finilize the schedule to enable printing
                </FormHelperText>
              )}
            </Box>


            <Card>
              <CardContent ref={contentRef}>
                <PrintableSchedule
                  schedule={currentSchedule}
                  men={allMen}
                  deacons={allDeacons}
                  extras={printableExtras}
                  monthLabel={monthLabel}
                />
              </CardContent>
            </Card>
          </>
        )
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
        onMarkAsWorship={scheduleActions.markRoleAsWorshipInSong}
        onUnmarkAsWorship={scheduleActions.unmarkRoleAsWorship}
      />
    </Box>
  );
}
