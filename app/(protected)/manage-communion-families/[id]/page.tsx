"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from "@mui/icons-material";
import { Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { useCache } from "@/components/context/Cache";
import { AlertSnackbar } from "@/components/ui";
import { updateCommunionFamily } from "@/lib/api/communionFamilies";

export default function EditCommunionFamily() {
  const { id } = useParams<{ id: string }>();
  const { communionFamilies, setCommunionFamilies } = useCache();
  const family = communionFamilies.find((item) => item.id === id);
  const [familyName, setFamilyName] = useState(family?.familyName ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; severity: "success" | "error" } | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedName = familyName.trim();
    if (normalizedName.length < 2) {
      setMessage({ text: "Family name must be at least 2 characters.", severity: "error" });
      return;
    }
    setSaving(true);
    try {
      const updated = await updateCommunionFamily(id, { familyName: normalizedName });
      setCommunionFamilies(communionFamilies.map((item) => item.id === id ? updated : item));
      setMessage({ text: "Communion family updated.", severity: "success" });
    } catch (error) {
      console.error("Failed to update communion family", error);
      setMessage({ text: "Unable to update the communion family.", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (!family) return <Typography>Communion family not found.</Typography>;

  return (
    <Stack spacing={2} sx={{ mt: 2 }}>
      <Button component={Link} href="/manage-communion-families" startIcon={<ArrowBackIcon />} sx={{ alignSelf: "flex-start" }}>Back to Communion Families</Button>
      <Typography variant="h4" fontWeight={200}>Edit Communion Family</Typography>
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
        <Stack spacing={3}>
          <TextField label="Family name" value={familyName} onChange={(event) => setFamilyName(event.target.value)} disabled={saving} autoFocus fullWidth />
          <Button type="submit" variant="contained" startIcon={<SaveIcon />} loading={saving} disabled={familyName.trim() === family.familyName} sx={{ alignSelf: { sm: "flex-end" } }}>Save Changes</Button>
        </Stack>
      </Paper>
      <AlertSnackbar open={Boolean(message)} severity={message?.severity} message={message?.text ?? ""} onClose={() => setMessage(null)} />
    </Stack>
  );
}
