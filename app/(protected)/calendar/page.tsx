"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Stack,
  Typography,
  Divider,
  type SelectChangeEvent,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  Add as AddIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import { format, parse, addMonths } from "date-fns";
import { useCache } from "@/components/context/Cache";
import { AlertSnackbar } from "@/components/ui";
import { getRoleLabel } from "@/lib/helpers/getRoleLabel";
import {
  generateScheduleForMonth,
  getWednesdaysAndSundaysInMonth,
  getMonthlyRoles,
  hasRoleConflict,
} from "@/lib/helpers/scheduling";
import {
  fetchSchedule,
  createSchedule,
  updateSchedule,
  updateMenLastServed,
} from "@/lib/api/schedules";
import { updateMan } from "@/lib/api/men";
import type { TScheduleEntry, TSchedule } from "@/types";
import { ROLE_OPTIONS } from "@/lib/constants";

const todayMonthStr = format(new Date(), "yyyy-MM");

/**
 * Gets day name from ISO date string.
 */
function getDayNameFromDate(dateStr: string): "Wednesday" | "Sunday" {
  const date = parse(dateStr, "yyyy-MM-dd", new Date());
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 ? "Sunday" : "Wednesday";
}

export default function Calendar() {
  const { men: allMen, setMen, schedules, setSchedules } = useCache();

  // State
  const [viewedMonth, setViewedMonth] = useState(todayMonthStr);
  const [currentSchedule, setCurrentSchedule] = useState<TSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingSchedule, setGeneratingSchedule] = useState(false);
  const [finalizingSchedule, setFinalizingSchedule] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error" | "info" | "warning">("info");

  // Override modal state
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    entry: TScheduleEntry | null;
    selectedServantId: string;
  }>({
    isOpen: false,
    entry: null,
    selectedServantId: "",
  });


  // Load schedule when viewed month changes
  useEffect(() => {
    const loadSchedule = async () => {
      try {
        setLoading(true);
        const schedule = await fetchSchedule(viewedMonth);
        if (schedule) {
          setCurrentSchedule(schedule);
        } else {
          setCurrentSchedule(null);
        }
      } catch (err) {
        setAlertMessage("Failed to load schedule");
        setAlertSeverity("error");
        setAlertOpen(true);
      } finally {
        setLoading(false);
      }
    };

    loadSchedule();
  }, [viewedMonth]);

  // Get servant name
  const getServantName = (servantId: string): string => {
    const servant = allMen.find((m) => m.id === servantId);
    return servant
      ? `${servant.firstName} ${servant.lastName}`.trim()
      : "Unknown";
  };

  // Generate new schedule
  const handleGenerateSchedule = useCallback(async () => {
    try {
      setGeneratingSchedule(true);
      const entries = generateScheduleForMonth(viewedMonth, allMen);
      const newSchedule: TSchedule = {
        id: viewedMonth,
        month: viewedMonth,
        entries,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const created = await createSchedule(newSchedule);
      setCurrentSchedule(created);

      // Update men's lastServed timestamps based on this schedule
      // This allows subsequent regenerations to pick different people
      const timestamp = Date.now();
      const updatedMen = allMen.map((man) => {
        let updated = { ...man };
        // For each role this man is assigned in the schedule, update lastServed
        entries.forEach((entry) => {
          if (entry.servantId === man.id) {
            updated.lastServed = {
              ...(updated.lastServed ?? {}),
              [entry.role]: timestamp,
            };
          }
        });
        return updated;
      });

      // Update cache with new men data
      setMen(updatedMen);

      // Update cache schedules
      const updated = schedules.filter((s) => s.month !== viewedMonth);
      setSchedules([...updated, created]);

      setAlertMessage("Schedule generated successfully");
      setAlertSeverity("success");
      setAlertOpen(true);
    } catch (err) {
      setAlertMessage("Failed to generate schedule");
      setAlertSeverity("error");
      setAlertOpen(true);
    } finally {
      setGeneratingSchedule(false);
    }
  }, [allMen, setMen, schedules, setSchedules, viewedMonth]);

  // Update single entry
  const handleUpdateEntry = useCallback(async (originalEntry: TScheduleEntry, newServantId: string) => {
    if (!currentSchedule) return;

    try {
      const newEntries = currentSchedule.entries.map((e) =>
        e.date === originalEntry.date &&
          e.role === originalEntry.role &&
          e.servantId === originalEntry.servantId
          ? { ...originalEntry, servantId: newServantId }
          : e,
      );

      const updated = await updateSchedule(viewedMonth, {
        entries: newEntries,
      });

      setCurrentSchedule(updated);

      // Update cache
      const updatedSchedules = schedules.map((s) =>
        s.month === viewedMonth ? updated : s,
      );
      setSchedules(updatedSchedules);

      setAlertMessage("Assignment updated");
      setAlertSeverity("success");
      setAlertOpen(true);
    } catch (err) {
      setAlertMessage("Failed to update assignment");
      setAlertSeverity("error");
      setAlertOpen(true);
    }
  }, [currentSchedule, schedules, setSchedules, viewedMonth]);

  // Add/Override Worship in Song entry
  const handleAddWorshipInSong = useCallback(
    async (dateStr: string, servantId: string) => {
      if (!currentSchedule) return;

      try {
        // Remove existing worship_in_song for this date if it exists, then add new one
        const newEntries = currentSchedule.entries
          .filter((e) => !(e.date === dateStr && e.role === "worship_in_song"))
          .concat([
            {
              date: dateStr,
              role: "worship_in_song",
              servantId,
            },
          ]);

        const updated = await updateSchedule(viewedMonth, {
          entries: newEntries,
        });

        setCurrentSchedule(updated);

        // Update cache
        const updatedSchedules = schedules.map((s) =>
          s.month === viewedMonth ? updated : s,
        );
        setSchedules(updatedSchedules);

        setAlertMessage("Worship in Song set");
        setAlertSeverity("success");
        setAlertOpen(true);
      } catch (err) {
        setAlertMessage("Failed to set Worship in Song");
        setAlertSeverity("error");
        setAlertOpen(true);
      }
    },
    [currentSchedule, schedules, setSchedules, viewedMonth],
  );

  // Finalize schedule and update lastServed
  const handleFinalizeSchedule = useCallback(async () => {
    if (!currentSchedule) return;

    try {
      setFinalizingSchedule(true);

      // Build lastServed updates
      const lastServedUpdates: Record<string, Record<string, number>> = {};

      for (const entry of currentSchedule.entries) {
        if (!lastServedUpdates[entry.servantId]) {
          lastServedUpdates[entry.servantId] = {};
        }
        lastServedUpdates[entry.servantId][entry.role] = Date.now();
      }

      // Update each man's lastServed in Firebase
      const updatePromises = Object.entries(lastServedUpdates).map(
        ([servantId, roles]) =>
          updateMan(servantId, { lastServed: roles }).catch((err) => {
            console.error(`Failed to update lastServed for ${servantId}:`, err);
          }),
      );

      await Promise.all(updatePromises);

      // Mark schedule as finalized in Firebase
      const finalizedSchedule = {
        ...currentSchedule,
        finalized: true,
        updatedAt: Date.now(),
      };

      const updated = await updateSchedule(viewedMonth, finalizedSchedule);
      setCurrentSchedule(updated);

      // Update cache
      const updatedSchedules = schedules.map((s) =>
        s.month === viewedMonth ? updated : s,
      );
      setSchedules(updatedSchedules);

      setAlertMessage("Schedule finalized and service history updated");
      setAlertSeverity("success");
      setAlertOpen(true);
    } catch (err) {
      setAlertMessage("Failed to finalize schedule");
      setAlertSeverity("error");
      setAlertOpen(true);
    } finally {
      setFinalizingSchedule(false);
    }
  }, [currentSchedule, schedules, setSchedules, viewedMonth]);

  // Navigate to previous month
  const handlePreviousMonth = () => {
    setViewedMonth((prev) => format(addMonths(parse(prev, "yyyy-MM", new Date()), -1), "yyyy-MM"));
  };

  // Navigate to next month
  const handleNextMonth = () => {
    setViewedMonth((prev) => format(addMonths(parse(prev, "yyyy-MM", new Date()), 1), "yyyy-MM"));
  };

  // Go back to today
  const handleGoToToday = () => {
    setViewedMonth(todayMonthStr);
  };

  // Get entries for a specific date
  const getEntriesForDate = (dateStr: string): TScheduleEntry[] => {
    if (!currentSchedule) return [];
    return currentSchedule.entries.filter((e) => e.date === dateStr);
  };

  // Get servants available for role
  const getServantsForRole = (roleValue: string): typeof allMen => {
    return allMen.filter((m) => m.roles?.includes(roleValue));
  };

  // Get servants with conflict checking
  const getAvailableServantsForOverride = (
    roleValue: string,
    dateStr: string,
  ): typeof allMen => {
    return getServantsForRole(roleValue).filter((m) => {
      if (!hasRoleConflict(m.id, roleValue, dateStr, currentSchedule?.entries ?? [])) {
        return true;
      }
      return false;
    });
  };

  // Open edit modal
  const handleOpenEditModal = (entry: TScheduleEntry) => {
    setEditModal({
      isOpen: true,
      entry,
      selectedServantId: entry.servantId,
    });
  };

  // Save edit modal
  const handleSaveEditModal = () => {
    if (editModal.entry && editModal.selectedServantId) {
      handleUpdateEntry(editModal.entry, editModal.selectedServantId);
      setEditModal({ isOpen: false, entry: null, selectedServantId: "" });
    }
  };

  // Open worship in song modal
  const handleOpenWorshipInSongModal = (dateStr: string, dayName: "Wednesday" | "Sunday") => {
    // Directly mark as Worship in Song without needing servant selection
    handleAddWorshipInSong(dateStr, "worship-in-song-marker");
  };

  // Filter monthly entries - only those marked as monthly roles
  const monthlyEntries = useMemo(() => {
    if (!currentSchedule) return [];
    return currentSchedule.entries.filter((e) =>
      ROLE_OPTIONS.find((r) => r.value === e.role && r.isMonthly),
    );
  }, [currentSchedule]);

  // Get Wed and Sun dates
  const allDates = getWednesdaysAndSundaysInMonth(viewedMonth);
  const isPastMonth = useMemo(() => {
    const now = new Date();
    const viewed = parse(viewedMonth, "yyyy-MM", new Date());
    const startOfViewed = new Date(viewed.getFullYear(), viewed.getMonth(), 1);
    const startOfCurrent = new Date(now.getFullYear(), now.getMonth(), 1);
    return startOfViewed < startOfCurrent;
  }, [viewedMonth]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Stack direction="row" alignItems="center" gap={2}>
          <Button
            size="small"
            onClick={handlePreviousMonth}
            startIcon={<ChevronLeftIcon />}
          >
            Previous
          </Button>
          <Stack alignItems="center" sx={{ minWidth: 200 }}>
            <Typography variant="h5" fontWeight={600}>
              {format(parse(viewedMonth, "yyyy-MM", new Date()), "MMMM yyyy")}
            </Typography>
            {viewedMonth !== todayMonthStr && (
              <Button
                size="small"
                variant="text"
                onClick={handleGoToToday}
              >
                Back to Today
              </Button>
            )}
          </Stack>
          <Button
            size="small"
            onClick={handleNextMonth}
            endIcon={<ChevronRightIcon />}
          >
            Next
          </Button>
        </Stack>
        {!currentSchedule ? (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleGenerateSchedule}
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
            <Button
              variant="outlined"
              onClick={handleGenerateSchedule}
              disabled={generatingSchedule}
            >
              Regenerate
            </Button>
            <Button
              variant="contained"
              startIcon={<CheckCircleIcon />}
              onClick={handleFinalizeSchedule}
              disabled={finalizingSchedule}
            >
              {finalizingSchedule ? "Finalizing..." : "Finalize"}
            </Button>
          </Stack>
        )}
      </Stack>

      <AlertSnackbar
        open={alertOpen}
        severity={alertSeverity}
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
      />

      {currentSchedule ? (
        <>
          {/* Monthly Roles Section */}
          {monthlyEntries.length > 0 && (
            <Box mb={4}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Monthly Roles
              </Typography>
              <Grid container spacing={2}>
                {monthlyEntries.map((entry, idx) => {
                  // Create unique key using entry position index
                  const uniqueKey = `monthly-${idx}`;
                  return (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={uniqueKey}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle2" color="textSecondary">
                            {getRoleLabel(entry.role)}
                          </Typography>
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            gap={1.5}
                            sx={{ mt: 0.5 }}
                          >
                            <Typography variant="h6">
                              {getServantName(entry.servantId)}
                            </Typography>
                            <Button
                              size="small"
                              startIcon={<EditIcon />}
                              onClick={() => handleOpenEditModal(entry)}
                              disabled={currentSchedule.finalized}
                            >
                              Change
                            </Button>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
              <Divider sx={{ my: 3 }} />
            </Box>
          )}

          {/* Wed/Sun Schedule */}
          <Typography variant="h6" fontWeight={600} mb={2}>
            Schedule
          </Typography>
          <Grid container spacing={2} mb={4}>
            {allDates.map((dateStr) => {
              const dayName = getDayNameFromDate(dateStr);
              const entries = getEntriesForDate(dateStr).filter(
                (e) => !ROLE_OPTIONS.find((r) => r.value === e.role && r.isMonthly),
              );
              const worshipInSong = currentSchedule.entries.find(
                (e) => e.date === dateStr && e.role === "worship_in_song",
              );

              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={dateStr}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2" color="textSecondary">
                        {dayName}, {format(new Date(dateStr), "MMM d")}
                      </Typography>

                      {worshipInSong ? (
                        // Show "Worship in Song" day
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
                            disabled={currentSchedule.finalized}
                            onClick={async () => {
                              try {
                                const updated = {
                                  ...currentSchedule,
                                  entries: currentSchedule.entries.filter(
                                    (e) => !(e.date === dateStr && e.role === "worship_in_song"),
                                  ),
                                };
                                await updateSchedule(viewedMonth, updated);
                                setCurrentSchedule(updated);
                                const updatedSchedules = schedules.map((s) =>
                                  s.month === viewedMonth ? updated : s,
                                );
                                setSchedules(updatedSchedules);
                                setAlertMessage("Worship in Song removed");
                                setAlertSeverity("info");
                                setAlertOpen(true);
                              } catch (err) {
                                setAlertMessage("Failed to remove Worship in Song");
                                setAlertSeverity("error");
                                setAlertOpen(true);
                              }
                            }}
                          >
                            Change
                          </Button>
                        </Stack>
                      ) : (
                        // Show normal schedule with roles
                        <Stack gap={1.5} mt={2}>
                          {entries.map((entry, idx) => (
                            <Box
                              key={`${entry.date}-${entry.role}-${idx}`}
                              p={1.5}
                              bgcolor="action.hover"
                              borderRadius={1}
                              sx={{
                                border: `1px solid ${currentSchedule.finalized ? "transparent" : "rgba(25, 118, 210, 0.12)"}`,
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
                            <Typography variant="body2" fontWeight={600}>
                              {getServantName(entry.servantId)}
                            </Typography>
                            <Button
                              size="small"
                              startIcon={<EditIcon />}
                              onClick={() => handleOpenEditModal(entry)}
                              disabled={currentSchedule.finalized}
                            >
                              Change
                            </Button>
                          </Stack>
                        </Box>
                      ))}
                          <Button
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() =>
                              handleOpenWorshipInSongModal(dateStr, dayName)
                            }
                            disabled={currentSchedule.finalized}
                            sx={{ mt: 1 }}
                          >
                            Mark as Worship in Song
                          </Button>
                        </Stack>
                      )}
                    </CardContent>
                  </Card>
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

      {/* Edit Modal */}
      <Dialog
        open={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, entry: null, selectedServantId: "" })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Edit {editModal.entry ? getRoleLabel(editModal.entry.role) : ""}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <Typography variant="subtitle2" mb={1}>
              Select Servant
            </Typography>
            <Select
              value={editModal.selectedServantId}
              onChange={(e: SelectChangeEvent) =>
                setEditModal({
                  ...editModal,
                  selectedServantId: e.target.value,
                })
              }
            >
              {getAvailableServantsForOverride(
                editModal.entry?.role || "",
                editModal.entry?.date || "",
              ).map((servant) => (
                <MenuItem key={servant.id} value={servant.id}>
                  {servant.firstName} {servant.lastName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setEditModal({ isOpen: false, entry: null, selectedServantId: "" })
            }
          >
            Cancel
          </Button>
          <Button onClick={handleSaveEditModal} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
