'use client';

import { useEffect, useState } from "react";

import { fetchSchedule } from "@/lib/api/schedules";
import type { TSchedule } from "@/types";

type AlertFn = (
  message: string,
  severity?: "success" | "error" | "info" | "warning",
) => void;

export function useScheduleData(
  viewedMonth: string,
  showAlert?: AlertFn,
) {
  const [currentSchedule, setCurrentSchedule] = useState<TSchedule | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSchedule = async () => {
      try {
        setLoading(true);
        const schedule = await fetchSchedule(viewedMonth);
        setCurrentSchedule(schedule || null);
      } catch (err) {
        console.error("Failed to load schedule", err);
        showAlert?.("Failed to load schedule", "error");
      } finally {
        setLoading(false);
      }
    };

    loadSchedule();
  }, [viewedMonth, showAlert]);

  return { currentSchedule, setCurrentSchedule, loading };
}
