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
}

export function EditEntryModal({
  isOpen,
  entry,
  selectedServantId,
  availableServants,
  onClose,
  onSave,
  onServantChange,
}: EditEntryModalProps) {
  const title = entry ? `Edit ${getRoleLabel(entry.role)}` : "Edit Assignment";

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <Typography variant="subtitle2" mb={1}>
            Select Servant
          </Typography>
          <Select
            value={selectedServantId}
            onChange={(e: SelectChangeEvent) => onServantChange(e.target.value)}
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
        <Button onClick={onSave} variant="contained" disabled={!selectedServantId}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
