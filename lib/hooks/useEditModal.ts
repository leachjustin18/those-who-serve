'use client';

import { useCallback, useState } from "react";

import type { TScheduleEntry } from "@/types";

export function useEditModal(
  onUpdateEntry: (entry: TScheduleEntry, newServantId: string) => Promise<void>,
) {
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    entry: TScheduleEntry | null;
    selectedServantId: string;
  }>({
    isOpen: false,
    entry: null,
    selectedServantId: "",
  });

  const openEditModal = useCallback((entry: TScheduleEntry) => {
    setEditModal({
      isOpen: true,
      entry,
      selectedServantId: entry.servantId,
    });
  }, []);

  const closeEditModal = useCallback(() => {
    setEditModal({ isOpen: false, entry: null, selectedServantId: "" });
  }, []);

  const saveEditModal = useCallback(async () => {
    if (editModal.entry && editModal.selectedServantId) {
      await onUpdateEntry(editModal.entry, editModal.selectedServantId);
      closeEditModal();
    }
  }, [editModal, onUpdateEntry, closeEditModal]);

  const updateSelectedServant = useCallback((servantId: string) => {
    setEditModal((prev) => ({ ...prev, selectedServantId: servantId }));
  }, []);

  return {
    editModal,
    openEditModal,
    closeEditModal,
    saveEditModal,
    updateSelectedServant,
  };
}
