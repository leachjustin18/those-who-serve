'use client';

import {
  useCallback,
  useState,
} from "react";

import { useCache } from "@/components/context/Cache";
import { updateMan } from "@/lib/api/men";
import { createSchedule, updateSchedule } from "@/lib/api/schedules";
import { generateScheduleForMonth } from "@/lib/helpers/scheduling";
import { isValidMonth, isValidScheduleResponse } from "@/lib/helpers/scheduleValidation";
import { WORSHIP_IN_SONG_MARKER } from "@/lib/constants";
import type { TSchedule, TScheduleEntry, TSchedulePrintExtras } from "@/types";

type AlertFn = (
  message: string,
  severity?: "success" | "error" | "info" | "warning",
) => void;

type FinalizeState = "idle" | "finalizing" | "notifying" | "done" | "error";

export function useScheduleActions(
  viewedMonth: string,
  currentSchedule: TSchedule | null,
  allSchedules: TSchedule[],
  showAlert?: AlertFn,
) {
  const { men: allMen, setMen, setSchedules } = useCache();
  const [generatingSchedule, setGeneratingSchedule] = useState(false);
  const [finalizeState, setFinalizeState] = useState<FinalizeState>("idle");

  const notify = useCallback(
    (
      message: string,
      severity: "success" | "error" | "info" | "warning" = "info",
    ) => {
      if (showAlert) {
        showAlert(message, severity);
      } else if (severity === "error") {
        console.error(message);
      }
    },
    [showAlert],
  );

  /**
   * Returns loading state flags for backward compatibility.
   * finalizingSchedule and sendingNotifications are now unified under finalizeState.
   */
  const finalizingSchedule = finalizeState === "finalizing" || finalizeState === "notifying";
  const sendingNotifications = finalizeState === "notifying";

  const generateSchedule = useCallback(async () => {
    // Validate month format
    if (!isValidMonth(viewedMonth)) {
      notify("Invalid month format. Use YYYY-MM format.", "error");
      return;
    }

    try {
      setGeneratingSchedule(true);
      const entries = generateScheduleForMonth(viewedMonth, allMen);
      const timestamp = Date.now();
      const newSchedule: TSchedule = {
        id: viewedMonth,
        month: viewedMonth,
        entries,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      const created = await createSchedule(newSchedule);

      // Validate API response
      if (!isValidScheduleResponse(created)) {
        throw new Error("Schedule API returned invalid response");
      }

      const updatedMen = allMen.map((man) => {
        let updated = { ...man };

        entries.forEach((entry) => {
          if (entry.servantId === man.id) {
            updated = {
              ...updated,
              lastServed: {
                ...(updated.lastServed ?? {}),
                [entry.role]: timestamp,
              },
            };
          }
        });

        return updated;
      });

      setMen(updatedMen);

      const updatedSchedules = allSchedules.filter((s) => s.month !== viewedMonth);
      setSchedules([...updatedSchedules, created]);

      notify("Schedule generated successfully", "success");
    } catch (err) {
      console.error("Failed to generate schedule", err);
      notify("Failed to generate schedule", "error");
    } finally {
      setGeneratingSchedule(false);
    }
  }, [allMen, notify, allSchedules, setMen, setSchedules, viewedMonth]);

  const updateEntry = useCallback(
    async (originalEntry: TScheduleEntry, newServantId: string) => {
      if (!currentSchedule) return;

      // Validate month format
      if (!isValidMonth(viewedMonth)) {
        notify("Invalid month format. Use YYYY-MM format.", "error");
        return;
      }

      // Validate inputs
      if (!newServantId || typeof newServantId !== "string") {
        notify("Invalid servant ID provided", "error");
        return;
      }

      try {
        // Find entry by index to avoid stale closure issues
        const entryIndex = currentSchedule.entries.findIndex(
          (e) =>
            e.date === originalEntry.date &&
            e.role === originalEntry.role &&
            e.servantId === originalEntry.servantId,
        );

        if (entryIndex === -1) {
          throw new Error("Entry not found in schedule");
        }

        const newEntries = [...currentSchedule.entries];
        newEntries[entryIndex] = { ...originalEntry, servantId: newServantId };

        const updated = await updateSchedule(viewedMonth, {
          entries: newEntries,
        });

        // Validate API response
        if (!isValidScheduleResponse(updated)) {
          throw new Error("Schedule API returned invalid response");
        }

        const updatedSchedules = allSchedules.map((s) =>
          s.month === viewedMonth ? updated : s,
        );
        setSchedules(updatedSchedules);

        notify("Assignment updated", "success");
      } catch (err) {
        console.error("Failed to update assignment", err);
        notify("Failed to update assignment", "error");
      }
    },
    [currentSchedule, notify, allSchedules, setSchedules, viewedMonth],
  );

  const addWorshipInSong = useCallback(
    async (dateStr: string, servantId: string) => {
      if (!currentSchedule) return;

      // Validate month format
      if (!isValidMonth(viewedMonth)) {
        notify("Invalid month format. Use YYYY-MM format.", "error");
        return;
      }

      // Validate inputs
      if (!dateStr || !servantId) {
        notify("Invalid date or servant ID provided", "error");
        return;
      }

      try {
        // Remove existing worship_in_song entry for this date if present, then add new one
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

        // Validate API response
        if (!isValidScheduleResponse(updated)) {
          throw new Error("Schedule API returned invalid response");
        }

        const updatedSchedules = allSchedules.map((s) =>
          s.month === viewedMonth ? updated : s,
        );
        setSchedules(updatedSchedules);

        notify("Worship in Song set", "success");
      } catch (err) {
        console.error("Failed to set Worship in Song", err);
        notify("Failed to set Worship in Song", "error");
      }
    },
    [allSchedules, currentSchedule, notify, setSchedules, viewedMonth],
  );

  const removeWorshipInSong = useCallback(
    async (dateStr: string) => {
      if (!currentSchedule) return;

      // Validate month format
      if (!isValidMonth(viewedMonth)) {
        notify("Invalid month format. Use YYYY-MM format.", "error");
        return;
      }

      // Validate inputs
      if (!dateStr) {
        notify("Invalid date provided", "error");
        return;
      }

      try {
        const updatedSchedule: TSchedule = {
          ...currentSchedule,
          entries: currentSchedule.entries.filter(
            (e) => !(e.date === dateStr && e.role === "worship_in_song"),
          ),
        };

        const saved = await updateSchedule(viewedMonth, updatedSchedule);

        // Validate API response
        if (!isValidScheduleResponse(saved)) {
          throw new Error("Schedule API returned invalid response");
        }

        const updatedSchedules = allSchedules.map((s) =>
          s.month === viewedMonth ? saved : s,
        );
        setSchedules(updatedSchedules);

        notify("Worship in Song removed", "info");
      } catch (err) {
        console.error("Failed to remove Worship in Song", err);
        notify("Failed to remove Worship in Song", "error");
      }
    },
    [currentSchedule, notify, allSchedules, setSchedules, viewedMonth],
  );

  const finalizeSchedule = useCallback(
    async (printExtras?: TSchedulePrintExtras) => {
      if (!currentSchedule) return;

      // Validate month format
      if (!isValidMonth(viewedMonth)) {
        notify("Invalid month format. Use YYYY-MM format.", "error");
        return;
      }

      setFinalizeState("finalizing");

      try {
        // Step 1: Update schedule first (critical operation)
        // If this fails, men's lastServed data remains unchanged
        const finalizedSchedule: TSchedule = {
          ...currentSchedule,
          finalized: true,
          updatedAt: Date.now(),
          printExtras: printExtras ?? currentSchedule.printExtras ?? null,
        };

        const updated = await updateSchedule(viewedMonth, finalizedSchedule);

        // Validate API response
        if (!isValidScheduleResponse(updated)) {
          throw new Error("Schedule API returned invalid response");
        }

        // Update local cache immediately after schedule is finalized
        const updatedSchedules = allSchedules.map((s) =>
          s.month === viewedMonth ? updated : s,
        );
        setSchedules(updatedSchedules);

        // Step 2: Update men's lastServed timestamps
        // Build updates from the schedule that was just finalized
        const lastServedUpdates: Record<string, Record<string, number>> = {};
        const timestamp = Date.now();

        for (const entry of updated.entries) {
          // Validate entry data
          if (!entry.servantId || !entry.role) {
            console.warn("Skipping invalid entry:", entry);
            continue;
          }

          // Skip special marker for worship in song (not a real man ID)
          if (entry.servantId === WORSHIP_IN_SONG_MARKER) {
            continue;
          }

          if (!lastServedUpdates[entry.servantId]) {
            lastServedUpdates[entry.servantId] = {};
          }
          lastServedUpdates[entry.servantId][entry.role] = timestamp;
        }

        // Update all men with their new lastServed timestamps
        const updatePromises = Object.entries(lastServedUpdates).map(
          ([servantId, roles]) => updateMan(servantId, { lastServed: roles }),
        );

        const updateResults = await Promise.all(updatePromises);

        // Validate that all updates succeeded
        if (updateResults.some((result) => !result.id)) {
          throw new Error("One or more man updates failed to return valid data");
        }

        // Step 3: Send notifications (non-blocking)
        setFinalizeState("notifying");

        try {
          const res = await fetch("/api/notifications/schedule-finalized", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ month: viewedMonth }),
          });

          if (res.ok) {
            const data = await res.json();

            // Validate notification response
            if (!data || typeof data !== "object") {
              throw new Error("Invalid notification response");
            }

            if (Array.isArray(data.failed) && data.failed.length > 0) {
              notify(
                `Schedule finalized; notifications sent to ${data.sent?.length ?? 0}. ${data.failed.length} failed.`,
                "warning",
              );
            } else {
              notify("Schedule finalized and notifications sent", "success");
            }
          } else {
            notify(
              "Schedule finalized, but notifications failed to send",
              "warning",
            );
          }
        } catch (notifyErr) {
          console.error("Failed to send schedule notifications", notifyErr);
          notify(
            "Schedule finalized, but notifications failed to send",
            "warning",
          );
        }

        setFinalizeState("done");
      } catch (err) {
        console.error("Failed to finalize schedule", err);
        notify("Failed to finalize schedule", "error");
        setFinalizeState("error");
      }
    },
    [currentSchedule, notify, allSchedules, setSchedules, viewedMonth],
  );

  const markRoleAsWorshipInSong = useCallback(
    async (entry: TScheduleEntry) => {
      if (!currentSchedule) return;

      // Validate month format
      if (!isValidMonth(viewedMonth)) {
        notify("Invalid month format. Use YYYY-MM format.", "error");
        return;
      }

      // Validate inputs
      if (!entry || !entry.date || !entry.role) {
        notify("Invalid entry provided", "error");
        return;
      }

      try {
        // Mark the role entry as worship by setting servantId to WORSHIP_IN_SONG_MARKER
        // Keep the original role so it displays correctly (not as a full-day event)
        const newEntries = currentSchedule.entries.map((e) =>
          e.date === entry.date && e.role === entry.role
            ? { date: entry.date, role: entry.role, servantId: WORSHIP_IN_SONG_MARKER }
            : e,
        );

        const updated = await updateSchedule(viewedMonth, {
          entries: newEntries,
        });

        // Validate API response
        if (!isValidScheduleResponse(updated)) {
          throw new Error("Schedule API returned invalid response");
        }

        const updatedSchedules = allSchedules.map((s) =>
          s.month === viewedMonth ? updated : s,
        );
        setSchedules(updatedSchedules);

        notify("Role marked as Worship in Song", "success");
      } catch (err) {
        console.error("Failed to mark role as Worship in Song", err);
        notify("Failed to mark role as Worship in Song", "error");
      }
    },
    [allSchedules, currentSchedule, notify, setSchedules, viewedMonth],
  );

  const unmarkRoleAsWorship = useCallback(
    async (entry: TScheduleEntry) => {
      if (!currentSchedule) return;

      // Validate month format
      if (!isValidMonth(viewedMonth)) {
        notify("Invalid month format. Use YYYY-MM format.", "error");
        return;
      }

      // Validate inputs
      if (!entry || !entry.date || entry.servantId !== WORSHIP_IN_SONG_MARKER) {
        notify("Invalid entry - not a worship entry", "error");
        return;
      }

      try {
        // Remove the worship marking by deleting the entry
        // The user can re-add the role assignment normally
        const newEntries = currentSchedule.entries.filter(
          (e) => !(e.date === entry.date && e.role === entry.role && e.servantId === WORSHIP_IN_SONG_MARKER),
        );

        const updated = await updateSchedule(viewedMonth, {
          entries: newEntries,
        });

        // Validate API response
        if (!isValidScheduleResponse(updated)) {
          throw new Error("Schedule API returned invalid response");
        }

        const updatedSchedules = allSchedules.map((s) =>
          s.month === viewedMonth ? updated : s,
        );
        setSchedules(updatedSchedules);

        notify("Worship marking removed", "success");
      } catch (err) {
        console.error("Failed to remove worship marking", err);
        notify("Failed to remove worship marking", "error");
      }
    },
    [allSchedules, currentSchedule, notify, setSchedules, viewedMonth],
  );

  return {
    generateSchedule,
    updateEntry,
    addWorshipInSong,
    removeWorshipInSong,
    markRoleAsWorshipInSong,
    unmarkRoleAsWorship,
    finalizeSchedule,
    generatingSchedule,
    finalizingSchedule,
    sendingNotifications,
  };
}
