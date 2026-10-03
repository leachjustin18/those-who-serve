"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from "@mui/icons-material";
import { Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { useCache } from "@/components/context/Cache";
import { AlertSnackbar } from "@/components/ui";
import { addCommunionFamily } from "@/lib/api/communionFamilies";

export default function AddCommunionFamily() {
  const { communionFamilies, setCommunionFamilies } = useCache();
  const [familyName, setFamilyName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedName = familyName.trim();
    if (normalizedName.length < 2) {
      setError("Family name must be at least 2 characters");
      return;
    }
    setSaving(true);
    try {
      const created = await addCommunionFamily(normalizedName);
      setCommunionFamilies([...communionFamilies, created]);
      setSaved(true);
    } catch (submitError) {
      console.error("Failed to add communion family", submitError);
      setError("Unable to add the communion family");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={2} sx={{ mt: 2 }}>
      <Button component={Link} href="/manage-communion-families" startIcon={<ArrowBackIcon />} sx={{ alignSelf: "flex-start" }}>Back to Communion Families</Button>
      <Typography variant="h4" fontWeight={200}>Add Communion Family</Typography>
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
        <Stack spacing={3}>
          <TextField label="Family name" value={familyName} onChange={(event) => { setFamilyName(event.target.value); setError(""); }} error={Boolean(error)} helperText={error || "Enter the family name shown on the schedule"} disabled={saving || saved} autoFocus fullWidth />
          <Button type="submit" variant="contained" startIcon={<SaveIcon />} loading={saving} disabled={saved} sx={{ alignSelf: { sm: "flex-end" } }}>Save Family</Button>
        </Stack>
      </Paper>
      {saved && <Button component={Link} href="/manage-communion-families" variant="outlined">Back to Communion Families</Button>}
      <AlertSnackbar open={saved} severity="success" title="Family added" message={`${familyName.trim()} is now available for scheduling.`} onClose={() => setSaved(false)} />
    </Stack>
  );
}
