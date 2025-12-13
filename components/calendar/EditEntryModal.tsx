'use client';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Select,
  Typography,
  type SelectChangeEvent,
} from "@mui/material";

import { WORSHIP_IN_SONG_MARKER } from "@/lib/constants";
import { getRoleLabel } from "@/lib/helpers/getRoleLabel";
import type { TScheduleEntry } from "@/types";

interface ServantOption {
  id: string;
  firstName: string;
  lastName: string;
}

interface EditEntryModalProps {
  isOpen: boolean;
  entry: TScheduleEntry | null;
  selectedServantId: string;
  availableServants: ServantOption[];
  onClose: () => void;
  onSave: () => void;
  onServantChange: (servantId: string) => void;
  onMarkAsWorship?: (entry: TScheduleEntry) => void;
  onUnmarkAsWorship?: (entry: TScheduleEntry) => void;
}

export function EditEntryModal({
  isOpen,
  entry,
  selectedServantId,
  availableServants,
  onClose,
  onSave,
  onServantChange,
  onMarkAsWorship,
  onUnmarkAsWorship,
}: EditEntryModalProps) {
  const title = entry ? `Edit ${getRoleLabel(entry.role)}` : "Edit Assignment";
  const isWorshipEntry = entry?.servantId === WORSHIP_IN_SONG_MARKER;

  const handleMarkAsWorship = () => {
    if (entry && onMarkAsWorship) {
      onMarkAsWorship(entry);
      onClose();
    }
  };

  const handleUnmarkAsWorship = () => {
    if (entry && onUnmarkAsWorship) {
      onUnmarkAsWorship(entry);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <Typography variant="subtitle2" mb={1}>
            {isWorshipEntry ? "This role is marked as Worship in Song" : "Select Servant"}
          </Typography>
          <Select
            value={selectedServantId}
            onChange={(e: SelectChangeEvent) => onServantChange(e.target.value)}
            disabled={isWorshipEntry}
          >
            {availableServants.map((servant) => (
              <MenuItem key={servant.id} value={servant.id}>
                {servant.firstName} {servant.lastName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {isWorshipEntry ? (
          <Button
            onClick={handleUnmarkAsWorship}
            disabled={!entry || !onUnmarkAsWorship}
            sx={{ mr: "auto" }}
            color="warning"
          >
            Remove Worship Marking
          </Button>
        ) : (
          <Button
            onClick={handleMarkAsWorship}
            disabled={!entry || !onMarkAsWorship}
            sx={{ mr: "auto" }}
          >
            Mark as Worship
          </Button>
        )}
        <Button onClick={onSave} variant="contained" disabled={isWorshipEntry || !selectedServantId}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
