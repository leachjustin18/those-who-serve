import { act, renderHook } from "@testing-library/react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import { useScheduleActions } from "@/lib/hooks/useScheduleActions";
import type { TMan, TSchedule, TScheduleEntry } from "@/types";

let menMock: TMan[] = [];
let schedulesMock: TSchedule[] = [];
const setMen = vi.fn((next: TMan[]) => {
  menMock = next;
});
const setSchedules = vi.fn((next: TSchedule[]) => {
  schedulesMock = next;
});

vi.mock("@/components/context/Cache", () => ({
  useCache: () => ({
    men: menMock,
    setMen,
    schedules: schedulesMock,
    setSchedules,
  }),
}));

vi.mock("@/lib/helpers/scheduling", () => ({
  generateScheduleForMonth: vi.fn(),
}));

vi.mock("@/lib/api/schedules", () => ({
  createSchedule: vi.fn(),
  updateSchedule: vi.fn(),
}));

vi.mock("@/lib/api/men", () => ({
  updateMan: vi.fn(),
}));

const { generateScheduleForMonth } = await import("@/lib/helpers/scheduling");
const { createSchedule, updateSchedule } = await import("@/lib/api/schedules");
const { updateMan } = await import("@/lib/api/men");

const baseMan: TMan = {
  id: "1",
  firstName: "John",
  lastName: "Doe",
  email: "a@b.com",
  roles: ["speaker", "worship_in_song"],
  unavailableDates: [],
};

const baseEntry: TScheduleEntry = {
  date: "2024-01-10",
  role: "speaker",
  servantId: "1",
};

const schedule: TSchedule = {
  id: "2024-01",
  month: "2024-01",
  entries: [baseEntry],
};

describe("useScheduleActions", () => {
  beforeEach(() => {
    menMock = [baseMan];
    schedulesMock = [schedule];
    vi.resetAllMocks();
    (generateScheduleForMonth as Mock).mockReturnValue([baseEntry]);
    (createSchedule as Mock).mockResolvedValue(schedule);
    (updateSchedule as Mock).mockResolvedValue(schedule);
    (updateMan as Mock).mockResolvedValue({});
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ sent: [], failed: [] }),
    } as Response);
  });

  it("generates a schedule and updates cache", async () => {
    const { result } = renderHook(() => {
      const [currentSchedule, setCurrentSchedule] = useState<TSchedule | null>(null);
      const actions = useScheduleActions(
        "2024-01",
        currentSchedule,
        schedulesMock,
        vi.fn(),
      );
      return { actions, currentSchedule };
    });

    await act(async () => {
      await result.current.actions.generateSchedule();
    });

    expect(createSchedule).toHaveBeenCalled();
    expect(result.current.actions.generatingSchedule).toBe(false);
    expect(setMen).toHaveBeenCalled();
    expect(setSchedules).toHaveBeenCalled();
  });

  it("updates an entry", async () => {
    const updatedEntry = { ...baseEntry, servantId: "2" };
    (updateSchedule as Mock).mockResolvedValue({
      ...schedule,
      entries: [updatedEntry],
    });

    const { result } = renderHook(() => {
      const [currentSchedule, setCurrentSchedule] = useState<TSchedule | null>(schedule);
      const actions = useScheduleActions(
        "2024-01",
        currentSchedule,
        schedulesMock,
        vi.fn(),
      );
      return { actions, get schedule() { return currentSchedule; } };
    });

    await act(async () => {
      await result.current.actions.updateEntry(baseEntry, "2");
    });

    expect(updateSchedule).toHaveBeenCalledWith("2024-01", {
      entries: [updatedEntry],
    });
  });

  it("adds and removes worship in song", async () => {
    (updateSchedule as Mock).mockResolvedValue({
      ...schedule,
      entries: [baseEntry, { date: baseEntry.date, role: "worship_in_song", servantId: "worship" }],
    });

    const { result } = renderHook(() => {
      const [currentSchedule, setCurrentSchedule] = useState<TSchedule | null>(schedule);
      const actions = useScheduleActions(
        "2024-01",
        currentSchedule,
        schedulesMock,
        vi.fn(),
      );
      return { actions };
    });

    await act(async () => {
      await result.current.actions.addWorshipInSong(baseEntry.date, "worship");
    });

    expect(updateSchedule).toHaveBeenCalled();

    await act(async () => {
      await result.current.actions.removeWorshipInSong(baseEntry.date);
    });

    expect(updateSchedule).toHaveBeenCalledTimes(2);
  });

  it("finalizes schedule and triggers notifications", async () => {
    const finalized = { ...schedule, finalized: true };
    (updateSchedule as Mock).mockResolvedValue(finalized);
    // Mock updateMan to return valid response with id
    (updateMan as Mock).mockResolvedValue({ id: "1", lastServed: {} });

    const { result } = renderHook(() => {
      const [currentSchedule, setCurrentSchedule] = useState<TSchedule | null>(schedule);
      const actions = useScheduleActions(
        "2024-01",
        currentSchedule,
        schedulesMock,
        vi.fn(),
      );
      return { actions };
    });

    await act(async () => {
      await result.current.actions.finalizeSchedule();
    });

    expect(updateMan).toHaveBeenCalled();
    expect(updateSchedule).toHaveBeenCalledWith("2024-01", expect.objectContaining({ finalized: true }));
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/notifications/schedule-finalized",
      expect.any(Object),
    );
  });
});
