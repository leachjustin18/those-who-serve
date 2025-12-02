"use client";

import {
  useState,
  useCallback,
  useRef,
  useMemo,
  cloneElement,
  isValidElement,
  type ChangeEvent,
  type ReactNode,
  type ReactElement,
} from "react";
import {
  Box,
  MobileStepper,
  Button,
  useMediaQuery,
  NoSsr,
  Stepper,
  Step,
  StepLabel,
  Container,
  Typography,
  Collapse,
  Stack,
  Paper,
  Grid,
  TextField,
  Chip,
  Avatar,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  FormHelperText,
  Slide
} from "@mui/material";
import StepConnector, {
  stepConnectorClasses,
} from "@mui/material/StepConnector";
import { useTheme, styled } from "@mui/material/styles";
import type { StepIconProps } from "@mui/material/StepIcon";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  AccountCircle as AccountCircleIcon,
  Camera as CameraIcon,
  TaskAlt as TaskAltIcon,
  Save as SaveIcon,
  PhotoCamera as PhotoCameraIcon,
  RemoveCircleOutline as RemoveCircleOutlineIcon,
  EventBusy as EventBusyIcon,
  PersonSearch as PersonSearchIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  ArrowForwardIos as ArrowForwardIosIcon,
  ArrowBackIos as ArrowBackIosIcon,
} from "@mui/icons-material";
import {
  useForm,
  Controller,
  type SubmitHandler,
  type FieldErrors,
  type FieldPath,
} from "react-hook-form";
import { AlertSnackbar, BackToManageMen, SectionTitle } from "@/components/ui";
import { useFilePreview } from "@/lib/hooks/useFilePreview";
import { useSnackbarQueue } from "@/lib/hooks/useSnackbarQueue";
import {
  ROLE_OPTIONS,
  ALLOWED_PHOTO_TYPES,
  MAX_PHOTO_SIZE_BYTES,
  EMAIL_REGEX,
} from "@/lib/constants";
import {
  shouldDisableDate,
  isSameDay,
  normalizeDatesForPayload,
  formatReadableDate,
} from "@/lib/helpers/dates";
import { fileToBase64 } from "@/lib/helpers/fileToBase64";
import { getRoleLabel } from "@/lib/helpers/getRoleLabel";
import {
  buildIdentityFieldValidations,
} from "@/lib/helpers/validateFields";
import type { TFormInputs } from "@/types";
import { addMan } from "@/lib/api/men";
import { useCache } from "@/components/context/Cache";

type TStepField = FieldPath<TFormInputs>;

type TStepConfig = {
  label: string;
  description: string;
  icon: ReactNode;
  fields: TStepField[];
};

const STEP_CONFIGS: TStepConfig[] = [
  {
    label: "Identity",
    description: "Contact details",
    icon: <AccountCircleIcon />,
    fields: ["firstName", "lastName", "email"],
  },
  {
    label: "Photo & Availability",
    description: "Optional scheduling context",
    icon: <CameraIcon />,
    fields: ["photoFile", "unavailableDates"],
  },
  {
    label: "Roles & Notes",
    description: "Service responsibilities",
    icon: <TaskAltIcon />,
    fields: ["roles", "notes"],
  },
];

const StepperConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses}`]: {
    transition: "all 0.9s ease-in-out",
  },
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 16,
    left: "calc(-50% + 25px)",
    right: "calc(50% + 25px)",
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: theme.palette.primary.main,
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: theme.palette.success.main,
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: theme.palette.divider,
    borderTopWidth: 2,
    borderRadius: 2,
  },
}));

const StepIconRoot = styled("div")<{ ownerState: { active?: boolean } }>(
  ({ theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    borderRadius: "50%",
    color: theme.palette.common.white,
    backgroundColor: theme.palette.grey[400],
    transition: "all 0.2s ease",
    ...theme.applyStyles("dark", {
      backgroundColor: theme.palette.grey[700],
    }),
    variants: [
      {
        props: ({ ownerState }) => ownerState.active,
        style: {
          backgroundColor: theme.palette.primary.main,
        },
      },
    ],
  }),
);

const StepStatusIcon = (props: StepIconProps) => {
  const { active, completed, className, icon } = props;
  const stepIndex =
    typeof icon === "number" ? icon - 1 : Number(icon ?? 1) - 1;
  const configIcon = STEP_CONFIGS[stepIndex]?.icon;
  const renderedIcon = isValidElement(configIcon)
    ? cloneElement(
      configIcon as ReactElement<{ fontSize?: string }>,
      { fontSize: "inherit" },
    )
    : configIcon;

  return (
    <StepIconRoot
      className={className}
      ownerState={{ active }}
      sx={{
        backgroundColor: completed ? "success.main" : undefined,
      }}
    >
      {renderedIcon ?? icon}
    </StepIconRoot>
  );
};

export default function AddMan() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"), {
    noSsr: true,
    defaultMatches: false,
  });
  const [activeStep, setActiveStep] = useState(0);
  const [stepErrors, setStepErrors] = useState<Record<number, boolean>>({});
  const { men, setMen } = useCache();

  const { showSnackbar, open, messageInfo, handleClose, handleExited } = useSnackbarQueue();

  const {
    control,
    handleSubmit,
    trigger,
    setValue,
    clearErrors,
    setError,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<TFormInputs>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      roles: [],
      unavailableDates: [],
      photoFile: undefined,
      notes: "",
    },
    mode: "onChange"
  });

  const { file: selectedFile, previewFile, onFileChange, clearFile } = useFilePreview();
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  const ensureFormValidBeforeSubmit = useCallback(
    (formValues: TFormInputs) => {
      const identityValidations = buildIdentityFieldValidations(formValues);
      type ValidationField = (typeof identityValidations)[number]["field"];
      let hasError = false;
      let firstInvalidField: ValidationField | null = null;

      identityValidations.forEach(({ field, result }) => {
        if (result !== true) {
          hasError = true;
          if (!firstInvalidField) {
            firstInvalidField = field;
          }
          setError(field, { type: "manual", message: result });
        } else {
          clearErrors(field);
        }
      });

      if (hasError) {
        if (firstInvalidField) {
          const invalidStep = STEP_CONFIGS.findIndex((step) =>
            step.fields.includes(firstInvalidField as TStepField),
          );
          if (invalidStep >= 0) {
            setActiveStep(invalidStep);
            setStepErrors((prev) => ({ ...prev, [invalidStep]: true }));
          }
        }

        showSnackbar({
          severity: "error",
          title: "Validation error",
          message: "Please resolve the highlighted fields before submitting.",
        });
        return false;
      }

      return true;
    },
    [clearErrors, setError, setActiveStep, setStepErrors, showSnackbar],
  );

  const handleRoleSelectionChange = useCallback(
    (previousRoles: string[] = [], nextRoles: string[] = [], isAll: boolean = false) => {
      const added = nextRoles.filter((role) => !previousRoles.includes(role));
      const removed = previousRoles.filter((role) => !nextRoles.includes(role));

      if (added.length) {
        const label = isAll ? 'All' : getRoleLabel(added[0]);
        showSnackbar({
          severity: "success",
          title: `Role${isAll ? 's' : ''} enabled`,
          message: `${label} role${isAll ? 's' : ''} enabled.`,
        });
      } else if (removed.length) {
        const label = isAll ? 'All' : getRoleLabel(removed[0]);
        showSnackbar({
          severity: "warning",
          title: `Role${isAll ? 's' : ''} removed`,
          message: `${label} role${isAll ? 's' : ''}  removed.`,
        });
      }
    },
    [showSnackbar],
  );

  const removePhoto = useCallback(() => {
    setValue("photoFile", "", { shouldDirty: true });
    clearFile();
    showSnackbar({
      severity: "warning",
      title: "Photo removed",
      message: "Preview photo removed from this servant.",
    });
  }, [clearFile, setValue, showSnackbar]);

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
          message: "A preview photo was attached and will upload when you save.",
        });
      }
    },
    [onFileChange, showSnackbar],
  );


  const handleNextStep = async () => {
    const fields = STEP_CONFIGS[activeStep]?.fields ?? [];
    const isValid = await trigger(fields, { shouldFocus: true });

    if (!isValid) {
      setStepErrors(prev => ({ ...prev, [activeStep]: true }));
      showSnackbar({
        severity: "error",
        title: `${STEP_CONFIGS[activeStep].label} incomplete`,
        message: "Please correct the highlighted fields before continuing.",
      });
      return false;
    }

    setStepErrors(prev => {
      const next = { ...prev };
      delete next[activeStep];
      return next;
    });

    setActiveStep(prev => Math.min(prev + 1, STEP_CONFIGS.length - 1));

  }

  const handleBackStep = useCallback(() => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleSubmitError =
    (formErrors: FieldErrors<TFormInputs>) => {
      const errorBag = formErrors as Record<string, unknown>;
      const firstInvalidStep = STEP_CONFIGS.findIndex((step) =>
        step.fields.some((field) => !!errorBag[field]),
      );
      if (firstInvalidStep >= 0) {
        setActiveStep(firstInvalidStep);
        setStepErrors((prev) => ({
          ...prev,
          [firstInvalidStep]: true,
        }));
        showSnackbar({
          severity: "error",
          title: `${STEP_CONFIGS[firstInvalidStep].label} needs attention`,
          message: "Please resolve the required fields before saving.",
        });
      }
    };

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

      const manAdded = await addMan(payload);

      showSnackbar({
        severity: "success",
        title: "Servant added",
        message: `Servant ${manAdded.firstName} ${manAdded.lastName} added successfully.`,
      })

      setMen(
        [...men, manAdded]
      );


    } catch (error) {
      console.error("Failed to prepare servant payload", error);
      showSnackbar({
        severity: "error",
        title: "Unable to save",
        message: "We could not prepare the servant details. Please retry.",
      });
    }
  }

  const shouldDisableBtnsFields = isSubmitting || isSubmitSuccessful;
  const allRoleValues = useMemo(
    () => ROLE_OPTIONS.map((role) => role.value),
    [],
  );

  const stepSections = useMemo(() => [
    (
      <Paper sx={{ p: { xs: 2, md: 3 } }} key="identity">
        <SectionTitle icon={<AccountCircleIcon />}>
          Identity
        </SectionTitle>
        <Grid container spacing={2} sx={{ mt: 1 }}>
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
                  helperText={fieldState.error?.message}
                  fullWidth
                  disabled={shouldDisableBtnsFields}
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
                  helperText={fieldState.error?.message}
                  fullWidth
                  disabled={shouldDisableBtnsFields}
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
                  helperText={fieldState.error?.message}
                  fullWidth
                  disabled={shouldDisableBtnsFields}
                />
              )}
            />
          </Grid>
        </Grid>
      </Paper>
    ),
    (
      <Paper sx={{ p: { xs: 2, md: 3 } }} key="photo">
        <SectionTitle icon={<CameraIcon />}>
          Photo &amp; Availability
        </SectionTitle>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Controller
              name="photoFile"
              control={control}
              render={({ field }) => {
                const avatarSrc =
                  previewFile ??
                  (typeof field.value === "string" ? field.value : undefined);
                return (
                  <Stack alignItems="center" spacing={2}>
                    {avatarSrc ? (
                      <Avatar src={avatarSrc} sx={{ width: 140, height: 140 }} />
                    ) : (
                      <Avatar
                        sx={{ width: 150, height: 150 }}
                        variant="square"
                      >
                        <PersonSearchIcon sx={{ width: 120, height: 120 }} />
                      </Avatar>
                    )}
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                      <Button
                        startIcon={<PhotoCameraIcon />}
                        color="info"
                        variant="outlined"
                        component="label"
                        disabled={shouldDisableBtnsFields}
                      >
                        Upload Photo
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          ref={photoInputRef}
                          onChange={(event) =>
                            handlePhotoSelection(event, field.onChange)
                          }
                          disabled={shouldDisableBtnsFields}
                        />
                      </Button>
                      {field.value && (
                        <Button
                          color="error"
                          variant="outlined"
                          onClick={removePhoto}
                          startIcon={<RemoveCircleOutlineIcon />}
                          disabled={shouldDisableBtnsFields}
                        >
                          Remove Photo
                        </Button>
                      )}
                    </Stack>
                  </Stack>
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
                    sx={{ mb: 2, width: "100%" }}
                    onChange={(newDate) => {
                      if (!newDate) return;
                      const currentDates = field.value ?? [];
                      const exists = currentDates.some((d) => isSameDay(d, newDate));
                      if (!exists) {
                        field.onChange([...(field.value ?? []), newDate]);
                        showSnackbar({
                          severity: "info",
                          title: "Unavailable date added",
                          message: `${formatReadableDate(
                            newDate,
                          )} marked as unavailable.`,
                        });
                      }
                    }}
                    slotProps={{ textField: { fullWidth: true } }}
                    disabled={shouldDisableBtnsFields}
                  />
                  <Typography variant="subtitle2" gutterBottom>
                    Unavailable Dates
                  </Typography>
                  {field?.value?.length ? (
                    <Stack direction="row" flexWrap="wrap">
                      {field.value.map((date, idx) => (
                        <Chip
                          key={`${idx}-${String(date)}`}
                          label={formatReadableDate(date)}
                          icon={<EventBusyIcon />}
                          color="info"
                          sx={{ mt: 1, mr: 1 }}
                          variant="outlined"
                          onDelete={() => {
                            const removedDate = field.value?.[idx];
                            const updated =
                              field.value?.filter((_, i) => i !== idx) ?? [];
                            field.onChange(updated);
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
                      No unavailable dates selected
                    </Typography>
                  )}
                </>
              )}
            />
          </Grid>
        </Grid>
      </Paper>
    ),
    (
      <Paper sx={{ p: { xs: 2, md: 3 } }} key="roles">
        <SectionTitle icon={<TaskAltIcon />}>
          Roles &amp; Notes
        </SectionTitle>
        <Controller
          name="roles"
          control={control}
          rules={{
            validate: (value) => value && value.length > 0
              ? true
              : "Select at least one role"
          }}
          render={({ field, fieldState }) => {
            const currentRoles = field.value ?? [];
            const areAllSelected =
              allRoleValues.length > 0
              && allRoleValues.every((role) =>
                currentRoles.includes(role),
              );
            const hasSelections = currentRoles.length > 0;

            const updateRoles = ({ nextRoles, isAll }: { nextRoles: string[], isAll?: boolean }) => {
              handleRoleSelectionChange(currentRoles, nextRoles, isAll);
              field.onChange(nextRoles);
            };

            const handleSelectAllRoles = () => {
              updateRoles({ nextRoles: [...allRoleValues], isAll: true });
            };

            const handleClearRoles = () => {
              updateRoles({ nextRoles: [], isAll: true });
            };

            return (
              <FormControl fullWidth sx={{ mt: 2 }}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  sx={{ mb: 2 }}
                >
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={handleSelectAllRoles}
                    disabled={shouldDisableBtnsFields || areAllSelected}
                  >
                    Select All
                  </Button>
                  <Button
                    type="button"
                    variant="text"
                    color="warning"
                    onClick={handleClearRoles}
                    disabled={shouldDisableBtnsFields || !hasSelections}
                  >
                    Deselect All
                  </Button>
                </Stack>
                <ToggleButtonGroup
                  {...field}
                  onChange={(_, newValue) => {
                    const updatedRoles = (newValue as string[]) ?? [];
                    updateRoles({ nextRoles: updatedRoles });
                  }}
                  aria-label="roles"
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                    "& .MuiToggleButtonGroup-grouped": {
                      margin: 0,
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                      borderRadius: 1,
                      flex: { xs: "1 1 calc(50% - 8px)", sm: "0 0 auto" },
                    },
                  }}
                >
                  {ROLE_OPTIONS.map((role) => (
                    <ToggleButton
                      key={role.value}
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
                      disabled={shouldDisableBtnsFields}
                    >
                      {role.label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
                {fieldState.error && (
                  <FormHelperText error>{fieldState.error.message}</FormHelperText>
                )}
              </FormControl>
            );
          }}
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
              sx={{ mt: 3 }}
              disabled={shouldDisableBtnsFields}
            />
          )}
        />
      </Paper>
    ),
  ], [allRoleValues, control, shouldDisableBtnsFields, handlePhotoSelection, handleRoleSelectionChange, previewFile, removePhoto, showSnackbar]);

  const totalSteps = STEP_CONFIGS.length;
  const isLastStep = activeStep === totalSteps - 1;

  const addAnotherServant = () => {
    reset();
    clearFile();
    setActiveStep(0);
  };

  return (
    <NoSsr>
      <BackToManageMen />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <form onSubmit={handleSubmit(onSubmit, handleSubmitError)}>
            {stepSections.map((section, index) => (
              <Collapse
                key={STEP_CONFIGS[index].label}
                in={activeStep === index}
                timeout="auto"
                unmountOnExit
              >
                <Box sx={{ mb: 3 }}>{section}</Box>
              </Collapse>
            ))}

            {isDesktop ? (
              <Box>
                <Stepper
                  activeStep={activeStep}
                  connector={<StepperConnector />}
                  alternativeLabel
                >
                  {STEP_CONFIGS.map((step, index) => {
                    const errorBag = errors as Record<string, unknown>;
                    const hasError =
                      !!(
                        stepErrors[index] &&
                        step.fields.some((field) => !!errorBag[field])
                      );
                    return (
                      <Step key={step.label} disabled={shouldDisableBtnsFields}>
                        <StepLabel
                          slots={{ stepIcon: StepStatusIcon }}
                          error={hasError}
                          optional={
                            <Typography variant="caption">
                              {step.description}
                            </Typography>
                          }
                        >
                          {step.label}
                        </StepLabel>
                      </Step>
                    );
                  })}
                </Stepper>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  sx={{ mt: 2, justifyContent: "flex-end" }}
                >
                  <Button
                    size="small"
                    onClick={handleBackStep}
                    startIcon={<ArrowBackIosIcon />}
                    disabled={activeStep === 0 || shouldDisableBtnsFields}
                  >
                    Back
                  </Button>

                  <Button
                    size="small"
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={shouldDisableBtnsFields}
                    loadingPosition="end"
                    loading={isSubmitting}
                    sx={{ display: isLastStep ? "inline-flex" : "none" }}
                  >
                    Save Servant
                  </Button>

                  <Button
                    size="small"
                    onClick={handleNextStep}
                    endIcon={<ArrowForwardIosIcon />}
                    disabled={shouldDisableBtnsFields}
                    sx={{ display: isLastStep ? "none" : "inline-flex" }}
                  >
                    Next
                  </Button>

                </Stack>
              </Box>
            ) : (
              <Stack
                direction="row"
                spacing={1}
                sx={{ justifyContent: "center" }}
              >
                <MobileStepper
                  variant="dots"
                  steps={totalSteps}
                  position="static"
                  activeStep={activeStep}
                  sx={{ mt: 2, maxWidth: 400, flexGrow: 1 }}
                  nextButton={
                    <>
                      <Button
                        size="small"
                        type="submit"
                        variant="contained"
                        startIcon={<SaveIcon />}
                        disabled={shouldDisableBtnsFields}
                        loadingPosition="end"
                        loading={isSubmitting}
                        sx={{ display: isLastStep ? "inline-flex" : "none" }}
                      >
                        Save
                      </Button>
                      <Button
                        size="small"
                        onClick={handleNextStep}
                        endIcon={<ArrowForwardIosIcon />}
                        disabled={shouldDisableBtnsFields}
                        sx={{ display: isLastStep ? "none" : "inline-flex" }}
                      >
                        Next
                      </Button>

                    </>
                  }
                  backButton={
                    <Button
                      size="small"
                      onClick={handleBackStep}
                      startIcon={<ArrowBackIosIcon />}
                      disabled={activeStep === 0 || shouldDisableBtnsFields}
                    >
                      Back
                    </Button>
                  }
                />
              </Stack>
            )}
          </form>
          <Slide direction="up" in={isSubmitSuccessful} mountOnEnter unmountOnExit>
            <Paper sx={{ p: { xs: 2, md: 3 }, mt: 3 }} key="servantAddedSuccess">
              <SectionTitle icon={<CheckCircleOutlineIcon />}>
                Success! A New Servant Has Joined the Team
              </SectionTitle>

              <Typography sx={{ mt: 2 }}>
                Your newest servant is officially part of the roster. You can jump back to
                Manage Men whenever you&apos;re ready.
              </Typography>


              <BackToManageMen />

              <Typography sx={{ mt: 3 }}>
                Still have momentum? Keep it rolling and add another servant.
              </Typography>

              <Button
                type="button"
                variant="outlined"
                onClick={addAnotherServant}
                startIcon={<AddCircleOutlineIcon />}
                sx={{ mt: 1 }}
              >
                Add Another Servant
              </Button>
            </Paper>
          </Slide>
        </Container>
        <AlertSnackbar
          key={messageInfo ? messageInfo.key : undefined}
          open={open}
          severity={messageInfo?.severity ?? "info"}
          title={messageInfo?.title}
          message={messageInfo?.message ?? ""}
          slotProps={{ transition: { onExited: handleExited } }}
          onClose={handleClose}
        />
      </LocalizationProvider>
    </NoSsr>
  );
}
