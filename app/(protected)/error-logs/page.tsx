import {
  Alert,
  Box,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { ErrorOutline as ErrorOutlineIcon } from "@mui/icons-material";
import { db } from "@/lib/firebase/admin";
import { formatErrorLogValue } from "@/lib/helpers/formatErrorLogValue";

type ErrorLogRow = {
  id: string;
  createdAt: string;
  errorType: string;
  to: string;
  reason: string;
  subject: string;
  details: string;
  context: string;
};

async function getErrorLogs(): Promise<ErrorLogRow[]> {
  const snapshot = await db
    .collection("error_logs")
    .orderBy("createdAt", "desc")
    .limit(100)
    .get();

  return snapshot.docs.map((document) => {
    const entry = document.data();
    const createdAt = entry.createdAt?.toDate?.();

    return {
      id: document.id,
      createdAt:
        createdAt instanceof Date ? createdAt.toLocaleString() : "Unknown",
      errorType: formatErrorLogValue(entry.errorType, "email_failure"),
      to: formatErrorLogValue(entry.to, "Not provided"),
      reason: formatErrorLogValue(entry.reason, "Unknown"),
      subject: formatErrorLogValue(entry.subject),
      details: formatErrorLogValue(entry.details),
      context: formatErrorLogValue(entry.context),
    };
  });
}

export default async function ErrorLogsPage() {
  let errorLogs: ErrorLogRow[] = [];
  let loadError = false;

  try {
    errorLogs = await getErrorLogs();
  } catch (error) {
    console.error("Failed to load error logs", error);
    loadError = true;
  }

  return (
    <Stack spacing={3} sx={{ mt: 2, mb: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          color: "primary.contrastText",
          background: "linear-gradient(135deg, #0c4a6e, #0369a1)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ sm: "center" }}
          justifyContent="space-between"
          position="relative"
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                display: "grid",
                placeItems: "center",
                width: 48,
                height: 48,
                borderRadius: "50%",
                bgcolor: "rgba(255,255,255,0.14)",
              }}
            >
              <ErrorOutlineIcon />
            </Box>
            <Box>
              <Typography variant="h4" color="inherit">
                Error Logs
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.78)" }}>
                Recent notification delivery issues
              </Typography>
            </Box>
          </Stack>
          {!loadError && (
            <Chip
              label={`${errorLogs.length} ${errorLogs.length === 1 ? "record" : "records"}`}
              sx={{
                alignSelf: { xs: "flex-start", sm: "center" },
                bgcolor: "rgba(255,255,255,0.16)",
                color: "inherit",
                fontWeight: 700,
              }}
            />
          )}
        </Stack>
      </Paper>

      {loadError ? (
        <Alert severity="error">
          Error logs could not be loaded. Please try again later.
        </Alert>
      ) : (
        <TableContainer
          component={Paper}
          sx={{ overflowX: "auto", border: 1, borderColor: "divider" }}
        >
          <Table aria-label="Error logs" sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "background.default" }}>
                <TableCell sx={{ fontWeight: 700 }}>When</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Notification</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Error</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Context</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {errorLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <Stack spacing={1} alignItems="center">
                      <ErrorOutlineIcon
                        sx={{ fontSize: 40, color: "text.disabled" }}
                      />
                      <Typography fontWeight={600}>
                        No errors recorded
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Notification delivery issues will appear here.
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : (
                errorLogs.map((errorLog) => (
                  <TableRow
                    key={errorLog.id}
                    hover
                    sx={{ "&:last-child td": { borderBottom: 0 } }}
                  >
                    <TableCell
                      sx={{ whiteSpace: "nowrap", verticalAlign: "top" }}
                    >
                      {errorLog.createdAt}
                    </TableCell>
                    <TableCell sx={{ verticalAlign: "top" }}>
                      <Chip
                        label={errorLog.errorType.replaceAll("_", " ")}
                        size="small"
                        color="error"
                        variant="outlined"
                        sx={{ textTransform: "capitalize" }}
                      />
                    </TableCell>
                    <TableCell sx={{ verticalAlign: "top", maxWidth: 240 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {errorLog.to}
                      </Typography>
                      {errorLog.subject && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", mt: 0.5 }}
                        >
                          {errorLog.subject}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ verticalAlign: "top", maxWidth: 320 }}>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color="error.main"
                      >
                        {errorLog.reason}
                      </Typography>
                      {errorLog.details && (
                        <Box
                          component="pre"
                          sx={{
                            m: 0,
                            mt: 0.75,
                            whiteSpace: "pre-wrap",
                            overflowWrap: "anywhere",
                            fontFamily: "inherit",
                            fontSize: "0.75rem",
                            color: "text.secondary",
                          }}
                        >
                          {errorLog.details}
                        </Box>
                      )}
                    </TableCell>
                    <TableCell sx={{ verticalAlign: "top", width: 200 }}>
                      {errorLog.context ? (
                        <Box component="details">
                          <Typography
                            component="summary"
                            variant="body2"
                            sx={{
                              cursor: "pointer",
                              color: "primary.main",
                              fontWeight: 600,
                            }}
                          >
                            View details
                          </Typography>
                          <Box
                            component="pre"
                            sx={{
                              mt: 1,
                              mb: 0,
                              p: 1.25,
                              borderRadius: 1,
                              bgcolor: "background.default",
                              whiteSpace: "pre-wrap",
                              overflowWrap: "anywhere",
                              fontSize: "0.72rem",
                            }}
                          >
                            {errorLog.context}
                          </Box>
                        </Box>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Stack>
  );
}
