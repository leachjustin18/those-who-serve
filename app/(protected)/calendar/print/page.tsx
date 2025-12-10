"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Print as PrintIcon, ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { format, parse } from "date-fns";
import { useForm, Controller } from "react-hook-form";
import { useReactToPrint } from "react-to-print";

import { useCache } from "@/components/context/Cache";
import { AlertSnackbar } from "@/components/ui";
import { PrintableSchedule } from "@/components/calendar/PrintableSchedule";
import { EMPTY_PRINT_EXTRAS } from "@/lib/constants";
import { fetchSchedule } from "@/lib/api/schedules";
import type { TSchedule, TSchedulePrintExtras } from "@/types";

const PRINT_EXTRAS_FIELDS = [
  { name: "cards" as const, label: "Cards", required: true },
  { name: "communionFamily" as const, label: "Communion Family", required: true },
  { name: "deaconInCharge1Name" as const, label: "Deacon in Charge Name 1", required: true },
  { name: "deaconInCharge1Phone" as const, label: "Deacon in Charge Phone 1", required: true },
  { name: "deaconInCharge2Name" as const, label: "Deacon in Charge Name 2", required: true },
  { name: "deaconInCharge2Phone" as const, label: "Deacon in Charge Phone 2", required: true },
] as const;

export default function PrintableCalendarPage() {
  const searchParams = useSearchParams();
  const monthParam = searchParams.get("month") || format(new Date(), "yyyy-MM");

  const { men: allMen } = useCache();

  const contentRef = useRef(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TSchedulePrintExtras>({
    defaultValues: EMPTY_PRINT_EXTRAS,
    mode: "onBlur",
  });

  const [schedule, setSchedule] = useState<TSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error" | "info" | "warning">("info");
  const [printExtras, setPrintExtras] = useState<TSchedulePrintExtras | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const fetched = await fetchSchedule(monthParam);
        setSchedule(fetched);
        const nextExtras = fetched?.printExtras ?? EMPTY_PRINT_EXTRAS;
        setPrintExtras(nextExtras);
        reset(nextExtras);
      } catch (err) {
        setAlertMessage("Failed to load schedule for this month.");
        setAlertSeverity("error");
        setAlertOpen(true);
        setSchedule(null);
        setPrintExtras(EMPTY_PRINT_EXTRAS);
        reset(EMPTY_PRINT_EXTRAS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [monthParam, reset]);

  const monthLabel = schedule
    ? format(parse(schedule.month, "yyyy-MM", new Date()), "MMMM yyyy")
    : format(parse(monthParam, "yyyy-MM", new Date()), "MMMM yyyy");

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `Those Who Serve ${monthLabel}`,
  });

  const onSubmit = (data: TSchedulePrintExtras) => {
    if (!schedule) {
      setAlertMessage("No schedule available to print.");
      setAlertSeverity("warning");
      setAlertOpen(true);
      return;
    }
    setPrintExtras(data);
    // Use setTimeout to ensure state update completes before printing
    setTimeout(() => handlePrint(), 0);
  };

  const onError = () => {
    setAlertMessage("Please fill all required fields before printing.");
    setAlertSeverity("warning");
    setAlertOpen(true);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <AlertSnackbar
        open={alertOpen}
        severity={alertSeverity}
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
      />

      <Stack direction={{ xs: "column", sm: "row" }} alignItems="center" justifyContent="space-between" gap={2} mb={3}>
        <Stack spacing={0.5}>
          <Typography variant="h5" fontWeight={700}>
            Printable Schedule
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Month: {monthLabel}
          </Typography>
        </Stack>
        <Stack direction="row" gap={1}>
          <Button
            component={Link}
            href="/calendar"
            startIcon={<ArrowBackIcon />}
            variant="outlined"
          >
            Back to Calendar
          </Button>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handleSubmit(onSubmit, onError)}
            disabled={loading || !schedule}
          >
            Print
          </Button>
        </Stack>
      </Stack>

      <Card>
        <CardContent>
          {loading ? (
            <Box py={8} display="flex" justifyContent="center">
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Fill details for printout
              </Typography>
              <Grid container spacing={2} mb={3}>
                {PRINT_EXTRAS_FIELDS.map((field) => (
                  <Grid key={field.name} size={{ xs: 12, md: 4 }}>
                    <Controller
                      name={field.name}
                      control={control}
                      rules={{
                        required: field.required ? `${field.label} is required` : false,
                      }}
                      render={({ field: { onChange, onBlur, value, ref } }) => (
                        <TextField
                          label={field.label}
                          fullWidth
                          value={value}
                          onChange={onChange}
                          onBlur={onBlur}
                          inputRef={ref}
                          error={!!errors[field.name]}
                          helperText={errors[field.name]?.message}
                        />
                      )}
                    />
                  </Grid>
                ))}
              </Grid>

              <Box
                ref={contentRef}
                sx={{
                  p: { xs: 1, md: 2.5 },
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  bgcolor: "background.paper",
                  overflowX: "auto",
                }}
              >
                {schedule && (
                  <PrintableSchedule
                    schedule={schedule}
                    men={allMen}
                    extras={printExtras || EMPTY_PRINT_EXTRAS}
                    monthLabel={monthLabel}
                  />
                )}
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
