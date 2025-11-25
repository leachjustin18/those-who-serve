import * as React from "react";
import {
  Snackbar,
  Alert,
  AlertTitle,
  type SnackbarOrigin,
  type SnackbarCloseReason,
  type AlertColor,
  type SxProps,
  type SnackbarProps,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import {
  CheckCircleOutline as CheckCircleOutlineIcon,
  InfoOutlined as InfoOutlinedIcon,
  WarningAmber as WarningAmberIcon,
  ReportProblemOutlined as ReportProblemOutlinedIcon,
} from "@mui/icons-material";

const severityIcons: Record<AlertColor, React.ReactNode> = {
  success: <CheckCircleOutlineIcon fontSize="inherit" />,
  info: <InfoOutlinedIcon fontSize="inherit" />,
  warning: <WarningAmberIcon fontSize="inherit" />,
  error: <ReportProblemOutlinedIcon fontSize="inherit" />,
};

export type AlertSnackbarProps = {
  open: boolean;
  severity?: AlertColor;
  title?: string;
  message?: React.ReactNode;
  autoHideDuration?: number;
  onClose?: (
    event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => void;
  anchorOrigin?: SnackbarOrigin;
  action?: React.ReactNode;
  variant?: "standard" | "filled" | "outlined";
  snackbarSx?: SxProps<Theme>;
  slotProps?: SnackbarProps["slotProps"];
};

/**
 * AlertSnackbar component displays a snackbar with an alert message.
 * @param {boolean} open - Whether the snackbar is open or not.
 * @param {AlertColor} severity - The severity of the alert message.
 * @param {string} title - The title of the alert message.
 * @param {React.ReactNode} message - The message to display in the alert.
 * @param {number} autoHideDuration - The duration in milliseconds for the snackbar to auto-hide.
 * @param {function} onClose - Callback function to handle closing the snackbar.
 * @param {SnackbarOrigin} anchorOrigin - The origin point for the snackbar.
 * @param {React.ReactNode} action - Additional actions to display in the snackbar.
 * @param {string} variant - The variant of the alert message.
 */
export const AlertSnackbar = ({
  open,
  severity = "info",
  title,
  message,
  autoHideDuration = 4000,
  onClose,
  anchorOrigin = { vertical: "top", horizontal: "right" },
  action,
  variant = "filled",
  slotProps,
}: AlertSnackbarProps) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
      slotProps={slotProps}
    >
      <Alert
        severity={severity}
        variant={variant}
        icon={severityIcons[severity]}
        action={action}
        sx={{ minWidth: { xs: 280, sm: 360 } }}
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </Alert>
    </Snackbar>
  );
};
