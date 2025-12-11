'use client';

import {
  useCallback,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import { useCache } from "@/components/context/Cache";
import { updateMan } from "@/lib/api/men";
import { createSchedule, updateSchedule } from "@/lib/api/schedules";
import { generateScheduleForMonth } from "@/lib/helpers/scheduling";
import type { TSchedule, TScheduleEntry } from "@/types";

type AlertFn = (
  message: string,
  severity?: "success" | "error" | "info" | "warning",
) => void;

export function useScheduleActions(
  viewedMonth: string,
  currentSchedule: TSchedule | null,
  allSchedules: TSchedule[],
  showAlert?: AlertFn,
) {
  const { men: allMen, setMen, setSchedules } = useCache();
  const [generatingSchedule, setGeneratingSchedule] = useState(false);
  const [finalizingSchedule, setFinalizingSchedule] = useState(false);
  const [sendingNotifications, setSendingNotifications] = useState(false);

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

  const generateSchedule = useCallback(async () => {
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

      try {
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

      try {
        const updatedSchedule: TSchedule = {
          ...currentSchedule,
          entries: currentSchedule.entries.filter(
            (e) => !(e.date === dateStr && e.role === "worship_in_song"),
          ),
        };

        const saved = await updateSchedule(viewedMonth, updatedSchedule);


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

  const finalizeSchedule = useCallback(async () => {
    if (!currentSchedule) return;

    setFinalizingSchedule(true);
    setSendingNotifications(true);

    try {
      const lastServedUpdates: Record<string, Record<string, number>> = {};

      for (const entry of currentSchedule.entries) {
        if (!lastServedUpdates[entry.servantId]) {
          lastServedUpdates[entry.servantId] = {};
        }
        lastServedUpdates[entry.servantId][entry.role] = Date.now();
      }

      const updatePromises = Object.entries(lastServedUpdates).map(
        ([servantId, roles]) => updateMan(servantId, { lastServed: roles }),
      );

      await Promise.all(updatePromises);

      const finalizedSchedule = {
        ...currentSchedule,
        finalized: true,
        updatedAt: Date.now(),
      };

      const updated = await updateSchedule(viewedMonth, finalizedSchedule);

      const updatedSchedules = allSchedules.map((s) =>
        s.month === viewedMonth ? updated : s,
      );
      setSchedules(updatedSchedules);

      try {
        const res = await fetch("/api/notifications/schedule-finalized", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ month: viewedMonth }),
        });

        if (res.ok) {
          const data = await res.json();
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
    } catch (err) {
      console.error("Failed to finalize schedule", err);
      notify("Failed to finalize schedule", "error");
    } finally {
      setSendingNotifications(false);
      setFinalizingSchedule(false);
    }
  }, [currentSchedule, notify, allSchedules, setSchedules, viewedMonth]);

  return {
    generateSchedule,
    updateEntry,
    addWorshipInSong,
    removeWorshipInSong,
    finalizeSchedule,
    generatingSchedule,
    finalizingSchedule,
    sendingNotifications,
  };
}
