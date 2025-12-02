// hooks/useSnackbarQueue.ts
import { useState, useCallback, useEffect, type ReactNode } from "react";
import type { AlertColor, SnackbarCloseReason } from "@mui/material";

export type SnackbarState = {
    key: number;
    severity: AlertColor;
    title?: string;
    message: ReactNode;
};

export function useSnackbarQueue() {
    const [snackbars, setSnackbars] = useState<SnackbarState[]>([]);
    const [open, setOpen] = useState(false);
    const [messageInfo, setMessageInfo] = useState<SnackbarState | undefined>();

    const showSnackbar = useCallback(
        (payload: {
            severity?: AlertColor;
            title?: string;
            message: ReactNode;
        }) => {
            const next: SnackbarState = {
                key: Date.now(),
                severity: payload.severity ?? "info",
                title: payload.title,
                message: payload.message,
            };
            setSnackbars((prev) => [...prev, next]);
        },
        [],
    );

    const handleClose = useCallback(
        (_?: unknown, reason?: SnackbarCloseReason) => {
            if (reason === "clickaway") return;
            setOpen(false);
        },
        [],
    );

    const handleExited = useCallback(() => {
        setMessageInfo(undefined);
    }, []);

    useEffect(() => {
        (() => {
            if (snackbars.length && !messageInfo) {
                // Display next snackbar when queue has items and nothing is showing
                setMessageInfo(snackbars[0]);
                setSnackbars((prev) => prev.slice(1));
                setOpen(true);
            } else if (snackbars.length && messageInfo && open) {
                // Close current snackbar to show next one
                setOpen(false);
            }
        })();
    }, [snackbars, messageInfo, open]);

    return {
        showSnackbar,
        open,
        messageInfo,
        handleClose,
        handleExited,
    };
}