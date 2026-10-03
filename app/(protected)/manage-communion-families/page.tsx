"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Groups as GroupsIcon,
} from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useCache } from "@/components/context/Cache";
import { AlertSnackbar } from "@/components/ui";
import { deleteCommunionFamily } from "@/lib/api/communionFamilies";
import type { TCommunionFamily } from "@/types";

export default function ManageCommunionFamilies() {
  const { communionFamilies, setCommunionFamilies } = useCache();
  const [deleteTarget, setDeleteTarget] = useState<TCommunionFamily | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ text: string; severity: "success" | "error" } | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCommunionFamily(deleteTarget.id);
      setCommunionFamilies(communionFamilies.filter((family) => family.id !== deleteTarget.id));
      setMessage({ text: `${deleteTarget.familyName} was removed.`, severity: "success" });
      setDeleteTarget(null);
    } catch (error) {
      console.error("Failed to delete communion family", error);
      setMessage({ text: "Unable to remove the communion family.", severity: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const sortedFamilies = [...communionFamilies].sort((a, b) =>
    a.familyName.localeCompare(b.familyName),
  );

  return (
    <>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }} justifyContent="space-between" sx={{ mt: 2, mb: 3 }}>
        <Typography variant="h4" fontWeight={200}>Manage Communion Families</Typography>
        <Button component={Link} href="/manage-communion-families/add" variant="contained" startIcon={<AddIcon />}>
          Add New Family
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {sortedFamilies.length === 0 && (
          <Grid size={12}>
            <Typography color="text.secondary">No communion families have been added.</Typography>
          </Grid>
        )}
        {sortedFamilies.map((family) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={family.id}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <GroupsIcon color="primary" />
                  <Typography variant="h6">{family.familyName}</Typography>
                </Stack>
              </CardContent>
              <CardActions>
                <Button component={Link} href={`/manage-communion-families/${family.id}`} startIcon={<EditIcon />}>Edit</Button>
                <Button color="error" startIcon={<DeleteIcon />} onClick={() => setDeleteTarget(family)}>Delete</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={Boolean(deleteTarget)} onClose={() => !deleting && setDeleteTarget(null)}>
        <DialogTitle>Remove {deleteTarget?.familyName}?</DialogTitle>
        <DialogContent>
          <DialogContentText>This family will no longer be available when planning schedules.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete} loading={deleting}>Yes, delete</Button>
        </DialogActions>
      </Dialog>
      <AlertSnackbar open={Boolean(message)} message={message?.text ?? ""} severity={message?.severity} onClose={() => setMessage(null)} />
    </>
  );
}
