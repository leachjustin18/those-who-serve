"use client";

import {
  useCallback,
  useState,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import {
  TextField,
  Paper,
  Grid,
  Container,
  Stack,
  Box,
  Typography,
  Chip,
  Avatar,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  type AlertColor,
  type SnackbarCloseReason,
} from "@mui/material";
import { useParams } from "next/navigation";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  EventBusy as EventBusyIcon,
  AccountCircle as AccountCircleIcon,
  Camera as CameraIcon,
  PersonSearch as PersonSearchIcon,
  TaskAlt as TaskAltIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Restore as RestoreIcon,
  PhotoCamera as PhotoCameraIcon,
  RemoveCircleOutline as RemoveCircleOutlineIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { useCache } from "@/components/context/Cache";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { AlertSnackbar } from "@/components/ui/AlertSnackbar";
import { shouldDisableDate } from "@/lib/helpers/shouldDisableDate";
import { ROLE_OPTIONS } from "@/lib/constants/roles";
import { useRouter } from "next/navigation";
import { useFilePreview } from "@/lib/hooks/useFilePreview";
import { updateMan } from "@/lib/api/men/server";

type DateValue = Date | string;

const normalizeDateValue = (value: DateValue) =>
  value instanceof Date ? value : new Date(value);

const formatReadableDate = (value: DateValue) =>
  format(normalizeDateValue(value), "MMM d, yyyy");

const isSameDay = (a: DateValue, b: DateValue) =>
  format(normalizeDateValue(a), "yyyy-MM-dd") ===
  format(normalizeDateValue(b), "yyyy-MM-dd");

const toIsoDateString = (value: DateValue) =>
  normalizeDateValue(value).toISOString();

const normalizeDatesForPayload = (dates?: DateValue[]) =>
  dates?.map(toIsoDateString) ?? [];

const getRoleLabel = (roleValue: string) =>
  ROLE_OPTIONS.find((role) => role.value === roleValue)?.label || roleValue;

type SnackbarState = {
  key: number;
  severity: AlertColor;
  title?: string;
  message: ReactNode;
};

type TFormInputs = {
  name: string;
  email: string;
  roles: string[];
  unavailableDates?: DateValue[];
  photoFile?: string;
  notes?: string;
};

export default function EditMan() {
  const params = useParams<{ id: string }>();
  const { id } = params;
  const cachedMen = useCache()?.men;
  const router = useRouter();
  const [snackbar, setSnackbar] = useState<SnackbarState | null>(null);

  const manToEdit = cachedMen?.find((man) => man.id === id);

  const showSnackbar = useCallback(
    (payload: {
      severity?: AlertColor;
      title?: string;
      message: ReactNode;
    }) => {
      setSnackbar({
        key: Date.now(),
        severity: payload.severity ?? "info",
        title: payload.title,
        message: payload.message,
      });
    },
    [],
  );

  const handlePersistError = useCallback(
    (error: Error) => {
      console.error("Failed to persist servant update", error);
      showSnackbar({
        severity: "error",
        title: "Save failed",
        message:
          "Changes were saved locally, but syncing to the server failed. Please try saving again.",
      });
    },
    [showSnackbar],
  );

  const handleSnackbarClose = useCallback(
    (_?: unknown, reason?: SnackbarCloseReason) => {
      if (reason === "clickaway") {
        return;
      }
      setSnackbar(null);
    },
    [],
  );

  const handleRoleSelectionChange = useCallback(
    (previousRoles: string[] = [], nextRoles: string[] = []) => {
      const added = nextRoles.filter((role) => !previousRoles.includes(role));
      const removed = previousRoles.filter((role) => !nextRoles.includes(role));

      if (added.length) {
        const label = getRoleLabel(added[0]);
        showSnackbar({
          severity: "success",
          title: "Role enabled",
          message: `${label} role enabled.`,
        });
      } else if (removed.length) {
        const label = getRoleLabel(removed[0]);
        showSnackbar({
          severity: "warning",
          title: "Role disabled",
          message: `${label} role disabled.`,
        });
      }
    },
    [showSnackbar],
  );

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { isSubmitting, isDirty },
  } = useForm<TFormInputs>({
    defaultValues: {
      name: manToEdit?.name || "",
      email: manToEdit?.email || "",
      roles: manToEdit?.roles || [],
      unavailableDates: manToEdit?.unavailableDates || [],
      photoFile: manToEdit?.photoFile || "",
      notes: manToEdit?.notes || "",
    },
  });

  const onSubmit: SubmitHandler<TFormInputs> = async (data) => {
    try {
      const payload = {
        name: data.name,
        email: data.email,
        roles: data.roles,
        unavailableDates: normalizeDatesForPayload(data.unavailableDates),
        photoFile: data.photoFile || undefined,
        notes: data.notes || undefined,
      };

      const updatedMan = await updateMan(id, payload, {
        onPersistError: handlePersistError,
      });

      if (cachedMen) {
        const index = cachedMen.findIndex((man) => man.id === id);
        if (index !== -1) {
          cachedMen[index] = updatedMan;
        }
      }

      reset({
        name: updatedMan.name,
        email: updatedMan.email,
        roles: updatedMan.roles,
        unavailableDates: updatedMan.unavailableDates,
        photoFile: updatedMan.photoFile ?? "",
        notes: updatedMan.notes ?? "",
      });

      showSnackbar({
        severity: "success",
        title: "Changes saved",
        message: "Servant details updated successfully.",
      });
    } catch (error) {
      console.error("Failed to update servant", error);
      showSnackbar({
        severity: "error",
        title: "Save failed",
        message: "Unable to save servant details. Please try again.",
      });
    }
  };

  const { file, onFileChange, clearFile } = useFilePreview();
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  const handleResetForm = useCallback(() => {
    reset();
    clearFile();
    showSnackbar({
      severity: "info",
      title: "Form reset",
      message: "Changes were reverted to the last saved values.",
    });
  }, [reset, showSnackbar]);

  useEffect(() => {
    if (isDirty) {
      showSnackbar({
        severity: "warning",
        title: "Unsaved changes",
        message: "You have unsaved changes. Please save or discard them.",
      });
    }
  }, [isDirty, showSnackbar]);

  useEffect(() => {
    if (file) {
      setValue("photoFile", file);

      showSnackbar({
        severity: "success",
        title: "Preview Photo added",
        message: `${manToEdit?.name} preview photo added. Will be saved when you save the form.`,
      });
    }
  }, [setValue, file]);

  const removePhoto = () => {
    setValue("photoFile", "");
    clearFile();
    showSnackbar({
      severity: "warning",
      title: "Photo removed",
      message: `${manToEdit?.name} photo removed.`,
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={1} sx={{ mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            variant="contained"
            color="primary"
            sx={{
              alignSelf: { xs: "stretch", sm: "flex-start" },
              fontWeight: 600,
              px: 2,
            }}
            onClick={() => router.push("/manage-men")}
          >
            Back to Manage Men
          </Button>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h5">
              Edit Servant • {manToEdit?.name || ""}
            </Typography>
            {isDirty && (
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: "warning.main",
                }}
              />
            )}
          </Stack>
        </Stack>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Paper
            sx={{
              p: 3,
              mb: 3,
            }}
          >
            <SectionTitle icon={<AccountCircleIcon />}>Identity</SectionTitle>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: "First name is required" }}
                  render={({ field, fieldState }) => (
                    <TextField
                      label="First name"
                      {...field}
                      error={!!fieldState.error}
                      disabled={isSubmitting}
                      fullWidth
                      autoFocus
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField label="Last name" fullWidth />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: "Email is required",
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: "Invalid email format",
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <TextField
                      label="Email"
                      {...field}
                      error={!!fieldState.error}
                      disabled={isSubmitting}
                      fullWidth
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Paper>

          <Paper
            sx={{
              p: 3,
              mb: 3,
            }}
          >
            <SectionTitle icon={<CameraIcon />}>
              Photo &amp; Availability
            </SectionTitle>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 5 }}>
                <Controller
                  name="photoFile"
                  control={control}
                  render={({ field }) => {
                    return (
                      <Grid
                        container
                        alignItems="center"
                        flexDirection="column"
                      >
                        <Grid>
                          {field.value ? (
                            <Avatar
                              src={field.value as unknown as string}
                              sx={{ width: 128, height: 128 }}
                            />
                          ) : (
                            <Avatar
                              sx={{ width: 150, height: 150 }}
                              variant="square"
                            >
                              <PersonSearchIcon
                                sx={{ width: 120, height: 120 }}
                              />
                            </Avatar>
                          )}
                        </Grid>
                        <Grid>
                          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                            <Button
                              startIcon={<PhotoCameraIcon />}
                              color="info"
                              variant="outlined"
                              component="label"
                            >
                              Change Photo
                              <input
                                type="file"
                                hidden
                                accept="image/*"
                                ref={photoInputRef}
                                onChange={(e) => {
                                  onFileChange(e, photoInputRef);
                                  field.onChange(file);
                                }}
                              />
                            </Button>
                            {field.value && (
                              <Button
                                color="error"
                                variant="outlined"
                                onClick={removePhoto}
                                startIcon={<RemoveCircleOutlineIcon />}
                              >
                                Remove Photo
                              </Button>
                            )}
                          </Stack>
                        </Grid>
                      </Grid>
                    );
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 7 }}>
                <Controller
                  name="unavailableDates"
                  control={control}
                  render={({ field }) => (
                    <>
                      <DatePicker
                        label="Select an Unavailable Date"
                        value={null}
                        shouldDisableDate={shouldDisableDate}
                        sx={{ marginBottom: 2 }}
                        onChange={(newDate) => {
                          if (!newDate) {
                            return;
                          }

                          const currentDates = field.value ?? [];
                          const exists = currentDates.some((d) =>
                            isSameDay(d, newDate),
                          );

                          if (!exists) {
                            field.onChange([...currentDates, newDate]);
                            showSnackbar({
                              severity: "info",
                              title: "Unavailable date added",
                              message: `${formatReadableDate(
                                newDate,
                              )} marked as unavailable.`,
                            });
                          }
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                          },
                        }}
                      />

                      <Typography variant="subtitle2" gutterBottom>
                        Unavailable Dates
                      </Typography>

                      {field?.value?.length ? (
                        <Stack direction="row" flexWrap="wrap">
                          {field.value.map((date, idx) => (
                            <Chip
                              key={idx}
                              label={formatReadableDate(date)}
                              icon={<EventBusyIcon />}
                              color="info"
                              sx={{ mt: 1, mr: 1 }}
                              variant="outlined"
                              onDelete={() => {
                                const removedDate = field.value?.[idx];
                                const updatedDates =
                                  field.value?.filter((_, i) => i !== idx) ||
                                  [];
                                field.onChange(updatedDates);
                                if (removedDate) {
                                  showSnackbar({
                                    severity: "warning",
                                    title: "Unavailable date removed",
                                    message: `${formatReadableDate(
                                      removedDate,
                                    )} removed from the list.`,
                                  });
                                }
                              }}
                            />
                          ))}
                        </Stack>
                      ) : (
                        <Typography variant="body2">
                          No unavailable dates
                        </Typography>
                      )}
                    </>
                  )}
                />
              </Grid>
            </Grid>
          </Paper>

          <Paper
            sx={{
              p: 3,
              mb: 3,
            }}
          >
            <SectionTitle icon={<TaskAltIcon />}>
              Roles &amp; Notes
            </SectionTitle>

            <Controller
              name="roles"
              control={control}
              render={({ field }) => (
                <ToggleButtonGroup
                  {...field}
                  onChange={(_, newValue) => {
                    const previousRoles = field.value ?? [];
                    const updatedRoles = (newValue as string[]) ?? [];
                    handleRoleSelectionChange(previousRoles, updatedRoles);
                    field.onChange(updatedRoles);
                  }}
                  aria-label="role"
                  sx={{
                    mb: 2,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                    "& .MuiToggleButtonGroup-grouped": {
                      margin: 0,
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                      borderRadius: 1,
                      borderLeft: (theme) =>
                        `1px solid ${theme.palette.divider}`,
                      flex: { xs: "1 1 calc(50% - 8px)", sm: "0 0 auto" },
                    },
                    "& .MuiToggleButtonGroup-grouped:not(:first-of-type)": {
                      borderLeft: (theme) =>
                        `1px solid ${theme.palette.divider}`,
                    },
                  }}
                >
                  {ROLE_OPTIONS.map((role, index) => (
                    <ToggleButton
                      key={`${index}-${role.value}`}
                      value={role.value}
                      sx={{
                        justifyContent: "center",
                        "&.Mui-selected": {
                          boxShadow: 3,
                          borderColor: "primary.main",
                        },
                        "&.Mui-selected:hover": {
                          boxShadow: 4,
                        },
                      }}
                    >
                      {role.label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              )}
            />

            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Notes"
                  {...field}
                  fullWidth
                  multiline
                  rows={4}
                />
              )}
            />
          </Paper>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="flex-end"
          >
            <Button
              startIcon={<RestoreIcon />}
              variant="outlined"
              color="inherit"
              disabled={isSubmitting}
              onClick={handleResetForm}
              fullWidth
              sx={{ maxWidth: { sm: 160 } }}
            >
              Reset
            </Button>
            <Button
              type="submit"
              startIcon={<SaveIcon />}
              variant="contained"
              disabled={isSubmitting || !isDirty}
              fullWidth
              sx={{ maxWidth: { sm: 200 } }}
            >
              Save Changes
            </Button>
          </Stack>
        </form>
      </Container>
      <AlertSnackbar
        key={snackbar?.key}
        open={!!snackbar}
        severity={snackbar?.severity ?? "info"}
        title={snackbar?.title}
        message={snackbar?.message ?? ""}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        onClose={handleSnackbarClose}
      />
    </LocalizationProvider>
  );
}
