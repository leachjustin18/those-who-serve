'use client';

import { Backdrop, Box, CircularProgress, Typography } from "@mui/material";

interface FinalizingBackdropProps {
  open: boolean;
}

export function FinalizingBackdrop({ open }: FinalizingBackdropProps) {
  return (
    <Backdrop
      open={open}
      sx={{
        color: "#fff",
        zIndex: (theme) => theme.zIndex.drawer + 1,
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          border: "2px solid #000",
          boxShadow: 24,
          p: 4,
        }}
      >
        <Box textAlign="center" mb={2}>
          <CircularProgress />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600 }} gutterBottom>
          Finalizing & Sending Schedule Emails…
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.85 }}>
          We&apos;re notifying everyone on this month&apos;s schedule.
        </Typography>
      </Box>
    </Backdrop>
  );
}
