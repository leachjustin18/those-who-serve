"use client";

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
} from "@mui/material";
import { useParams } from "next/navigation";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  EventBusy as EventBusyIcon,
  AccountCircle as AccountCircleIcon,
  Camera as CameraIcon,
  PersonSearch as PersonSearchIcon,
} from "@mui/icons-material";
import { format, parseISO } from "date-fns";
import { useCache } from "@/components/context/Cache";
import { SectionTitle } from "@/components/ui/SectionTitle";

type TFormInputs = {
  name: string;
  email: string;
  roles: { label: string; value: string }[];
  unavailableDates?: string[];
  photoFile?: File;
};

export default function EditMan() {
  const params = useParams<{ id: string }>();
  const { id } = params;
  const cachedMen = useCache()?.men;

  const manToEdit = cachedMen?.find((man) => man.id === id);
  console.log("manToEdit", manToEdit);

  const {
    handleSubmit,
    control,
    reset,
    getValues,
    watch,
    formState: { isSubmitting, isDirty },
  } = useForm<TFormInputs>({
    defaultValues: {
      name: manToEdit?.name || "",
      roles: [],
      unavailableDates: manToEdit?.unavailableDates || [],
      photoFile: undefined,
    },
  });
  const onSubmit: SubmitHandler<TFormInputs> = (data) => console.log(data);

  const watchUnavailableDates = watch("unavailableDates");

  console.log("values", getValues());

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Typography variant="h5">
            Edit Person • {manToEdit?.name || ""}
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
        <Paper
          sx={(t) => ({
            p: 3,
            boxShadow: t.shadows[3],
            background: "linear-gradient(180deg,#fff,#f9fafb)",
          })}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <SectionTitle icon={<AccountCircleIcon />}>Identity</SectionTitle>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
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

              <Grid size={{ xs: 12 }}>
                <SectionTitle icon={<CameraIcon />}>
                  Availability and Photo
                </SectionTitle>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller
                      name="unavailableDates"
                      control={control}
                      render={({ field }) => (
                        <>
                          <DatePicker
                            label="Select an Unavailable Date"
                            value={null}
                            sx={{ marginBottom: 2 }}
                            onChange={(newDate) => {
                              if (newDate && field.value) {
                                const exists = field.value.some(
                                  (d) =>
                                    format(d, "yyyy-MM-dd") ===
                                    format(newDate, "yyyy-MM-dd"),
                                );

                                if (!exists) {
                                  field.onChange([...field.value, newDate]);
                                }
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
                            <Stack
                              direction="column-reverse"
                              spacing={2}
                              flexWrap="wrap"
                            >
                              {field.value.map((date, idx) => (
                                <Chip
                                  key={idx}
                                  label={format(date, "MMM d, yyyy")}
                                  icon={<EventBusyIcon />}
                                  color="info"
                                  variant="outlined"
                                  onDelete={() =>
                                    field.onChange(
                                      field.value?.length &&
                                        field.value.filter((_, i) => i !== idx),
                                    )
                                  }
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
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller
                      name="photoFile"
                      control={control}
                      render={({ field }) => {
                        return (
                          <>
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
                          </>
                        );
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
}
