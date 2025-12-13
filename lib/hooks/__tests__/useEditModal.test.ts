import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { TScheduleEntry } from "@/types";
import { useEditModal } from "@/lib/hooks/useEditModal";

const entry: TScheduleEntry = {
  date: "2024-01-10",
  role: "speaker",
  servantId: "1",
};

describe("useEditModal", () => {
  it("opens and closes the modal with selected entry", () => {
    const { result } = renderHook(() => useEditModal(vi.fn()));

    act(() => {
      result.current.openEditModal(entry);
    });

    expect(result.current.editModal.isOpen).toBe(true);
    expect(result.current.editModal.entry).toEqual(entry);
    expect(result.current.editModal.selectedServantId).toBe("1");

    act(() => {
      result.current.closeEditModal();
    });

    expect(result.current.editModal.isOpen).toBe(false);
    expect(result.current.editModal.entry).toBeNull();
    expect(result.current.editModal.selectedServantId).toBe("");
  });

  it("saves with updated servant and closes", async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useEditModal(onUpdate));

    await act(async () => {
      result.current.openEditModal(entry);
      result.current.updateSelectedServant("2");
    });

    await act(async () => {
      await result.current.saveEditModal();
    });

    expect(onUpdate).toHaveBeenCalledWith(entry, "2");
    expect(result.current.editModal.isOpen).toBe(false);
    expect(result.current.editModal.entry).toBeNull();
  });
});
