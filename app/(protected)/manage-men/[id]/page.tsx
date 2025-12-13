"use client";

import {
  useCallback,
  useRef,
  useEffect,
  type ChangeEvent,
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
  Save as SaveIcon,
  Restore as RestoreIcon,
  PhotoCamera as PhotoCameraIcon,
  RemoveCircleOutline as RemoveCircleOutlineIcon,
} from "@mui/icons-material";
import { useCache } from "@/components/context/Cache";
import { AlertSnackbar, SectionTitle, BackToManageMen } from "@/components/ui";
import {
  shouldDisableDate,
  isSameDay,
  normalizeDatesForPayload,
  formatReadableDate,
} from "@/lib/helpers/dates";
import { fileToBase64 } from "@/lib/helpers/fileToBase64";
import {
  ROLE_OPTIONS,
  ALLOWED_PHOTO_TYPES,
  MAX_PHOTO_SIZE_BYTES,
  EMAIL_REGEX,
} from "@/lib/constants";
import { useFilePreview } from "@/lib/hooks/useFilePreview";
import { updateMan } from "@/lib/api/men";
import { type TDateValue } from "@/types";
import { useSnackbarQueue } from "@/lib/hooks/useSnackbarQueue";
import { buildIdentityFieldValidations } from "@/lib/helpers/validateFields";

const getRoleLabel = (roleValue: string) =>
  ROLE_OPTIONS.find((role) => role.value === roleValue)?.label || roleValue;

type TFormInputs = {
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  unavailableDates?: TDateValue[];
  photoFile?: File | string;
  notes?: string;
};

export default function EditMan() {
  const params = useParams<{ id: string }>();
  const { id } = params;
  const { men, setMen } = useCache();

  const manToEdit = men?.find((man) => man.id === id);
  const manName = manToEdit?.firstName;

  const { showSnackbar, open, messageInfo, handleClose, handleExited } = useSnackbarQueue();

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
    setError,
    clearErrors,
    formState: { isSubmitting, isDirty, isSubmitSuccessful },
  } = useForm<TFormInputs>({
    defaultValues: {
      firstName: manToEdit?.firstName || "",
      lastName: manToEdit?.lastName || "",
      email: manToEdit?.email || "",
      roles: manToEdit?.roles || [],
      unavailableDates: manToEdit?.unavailableDates || [],
      photoFile: manToEdit?.photoFile || undefined,
      notes: manToEdit?.notes || "",
    },
  });

  const ensureFormValidBeforeSubmit = useCallback(
    (formValues: TFormInputs) => {
      const validations = buildIdentityFieldValidations(formValues);

      let hasError = false;

      validations.forEach(({ field, result }) => {
        if (result !== true) {
          hasError = true;
          setError(field, { type: "manual", message: result });
        } else {
          clearErrors(field);
        }
      });

      if (hasError) {
        showSnackbar({
          severity: "error",
          title: "Validation error",
          message: "Please resolve the highlighted fields before submitting.",
        });
        return false;
      }

      return true;
    },
    [clearErrors, setError, showSnackbar],
  );

  const onSubmit: SubmitHandler<TFormInputs> = async (data) => {
    const isValid = ensureFormValidBeforeSubmit(data);
    if (!isValid) {
      return;
    }

    try {
      const payload = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim(),
        roles: data.roles,
        unavailableDates: normalizeDatesForPayload(data.unavailableDates),
        photoFile: selectedFile
          ? await fileToBase64(selectedFile)
          : typeof data.photoFile === "string"
            ? data.photoFile
            : undefined,
        notes: data.notes?.trim() || undefined,
      };

      const updatedMan = await updateMan(id, payload);

      setMen(
        men.map((m) =>
          m.id === updatedMan.id ? ({ ...m, ...updatedMan }) : m,
        ),
      );

      reset({
        firstName: updatedMan.firstName,
        lastName: updatedMan.lastName,
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
        message: `Unable to save servant details with error ${error} Please try again.`,
      });
    }
  };

  const {
    file: selectedFile,
    previewFile,
    onFileChange,
    clearFile,
  } = useFilePreview();



  const photoInputRef = useRef<HTMLInputElement | null>(null);

  const handleResetForm = useCallback(() => {
    reset();
    clearFile();
    showSnackbar({
      severity: "info",
      title: "Form reset",
      message: "Changes were reverted to the last saved values.",
    });
  }, [reset, clearFile, showSnackbar]);

  useEffect(() => {
    if (!isDirty) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      showSnackbar({
        severity: "warning",
        title: "Unsaved changes",
        message: "You have unsaved changes. Please save or discard them.",
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [isDirty, showSnackbar]);

  const removePhoto = () => {
    setValue("photoFile", "", { shouldDirty: true });
    clearFile();
    showSnackbar({
      severity: "warning",
      title: "Photo removed",
      message: `${manToEdit?.firstName} photo removed.`,
    });
  };
  const handlePhotoSelection = useCallback(
    (
      event: ChangeEvent<HTMLInputElement>,
      onChange: (value: string | undefined) => void,
    ) => {
      const selected = event.target.files?.[0];

      if (!selected) {
        const nextPreview = onFileChange(event, photoInputRef);
        onChange(nextPreview);
        return;
      }

      if (!ALLOWED_PHOTO_TYPES.includes(selected.type)) {
        event.target.value = "";
        showSnackbar({
          severity: "error",
          title: "Unsupported file",
          message: "Please choose a JPG, PNG, or WebP image.",
        });
        return;
      }

      if (selected.size > MAX_PHOTO_SIZE_BYTES) {
        event.target.value = "";
        showSnackbar({
          severity: "error",
          title: "File too large",
          message: "Photo uploads must be 5MB or smaller.",
        });
        return;
      }

      const nextPreview = onFileChange(event, photoInputRef);
      onChange(nextPreview);
      if (nextPreview) {
        showSnackbar({
          severity: "success",
          title: "Preview photo added",
          message: `${manName ?? "Servant"} preview photo added. Will be saved when you save the form.`,
        });
      }
    },
    [manName, onFileChange, showSnackbar]
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={1} sx={{ mb: 2 }}>
          <BackToManageMen />
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h5">
              Edit Servant • {manToEdit?.firstName || ""}
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
                  name="firstName"
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
                <Controller
                  name="lastName"
                  control={control}
                  rules={{ required: "Last name is required" }}
                  render={({ field, fieldState }) => (
                    <TextField
                      label="Last name"
                      {...field}
                      error={!!fieldState.error}
                      disabled={isSubmitting}
                      fullWidth
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: "Email is required",
                    pattern: {
                      value: EMAIL_REGEX,
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
                    const avatarSrc =
                      previewFile ??
                      (typeof field.value === "string"
                        ? field.value
                        : undefined);
                    return (
                      <Grid
                        container
                        alignItems="center"
                        flexDirection="column"
                      >
                        <Grid>
                          {avatarSrc ? (
                            <Avatar
                              src={avatarSrc}
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
                                onChange={(event) =>
                                  handlePhotoSelection(event, field.onChange)
                                }
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
              render={({ field, fieldState }) => (
                <TextField
                  label="Notes"
                  {...field}
                  fullWidth
                  multiline
                  rows={4}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
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
              loadingPosition="end"
              loading={isSubmitting}
              disabled={isSubmitting || !isDirty}
              fullWidth
              sx={{ maxWidth: { sm: 200 } }}
            >
              Save Changes
            </Button>
            {isSubmitSuccessful && (
              <BackToManageMen />
            )}
          </Stack>
        </form>
      </Container>
      <AlertSnackbar
        key={messageInfo ? messageInfo.key : undefined}
        open={open}
        severity={messageInfo?.severity ?? "info"}
        title={messageInfo?.title}
        message={messageInfo?.message ?? ""}
        onClose={handleClose}
        slotProps={{ transition: { onExited: handleExited } }}
      />
    </LocalizationProvider>
  );
}
