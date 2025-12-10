import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, type Mock } from "vitest";

import type { TSchedule } from "@/types";
import { useScheduleData } from "@/lib/hooks/useScheduleData";

const mockSchedule: TSchedule = {
  id: "2024-01",
  month: "2024-01",
  entries: [],
};

vi.mock("@/lib/api/schedules", () => ({
  fetchSchedule: vi.fn(),
}));

const { fetchSchedule } = await import("@/lib/api/schedules");

describe("useScheduleData", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("loads a schedule for the month", async () => {
    (fetchSchedule as Mock).mockResolvedValue(mockSchedule);

    const { result } = renderHook(() => useScheduleData("2024-01"));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.currentSchedule).toEqual(mockSchedule);
  });

  it("calls showAlert on load failure", async () => {
    const showAlert = vi.fn();
    (fetchSchedule as Mock).mockRejectedValue(new Error("fail"));

    renderHook(() => useScheduleData("2024-01", showAlert));

    await waitFor(() => expect(showAlert).toHaveBeenCalled());
    expect(showAlert).toHaveBeenCalledWith("Failed to load schedule", "error");
  });
});
