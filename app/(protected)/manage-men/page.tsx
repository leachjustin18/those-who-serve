"use client";

import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  CardActions,
  Grid,
  CircularProgress,
  Chip,
  Stack,
  Box,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  type SnackbarCloseReason,
  type AlertColor,
} from "@mui/material";
import {
  ModeEdit as ModeEditIcon,
  DeleteForever as DeleteForeverIcon,
  EventBusy as EventBusyIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { useCache } from "@/components/context/Cache";
import { getRoleLabel } from "@/lib/helpers/getRoleLabel";
import { AlertSnackbar, ManAvatar } from "@/components/ui";
import Link from "next/link";
import { format } from "date-fns";
import type { TMan } from "@/types";
import { useCallback, useMemo, useState } from "react";
import { deleteMan } from "@/lib/api/men";

const getManDisplayName = (man: TMan) =>
  [man.firstName, man.lastName].filter(Boolean).join(" ").trim() ||
  "Unnamed Servant";

const getManPhotoUrl = (man: TMan) =>
  typeof man.photoFile === "string" ? man.photoFile : undefined;

export default function ManageMen() {
  const { men: cachedMen, setMen } = useCache();
  const [deleteTarget, setDeleteTarget] = useState<TMan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [snackbarState, setSnackbarState] = useState<{
    open: boolean;
    severity: AlertColor;
    message: string;
  }>({
    open: false,
    severity: "success",
    message: "",
  });

  const deleteTargetName = useMemo(() => {
    if (!deleteTarget) return "";
    return getManDisplayName(deleteTarget);
  }, [deleteTarget]);

  const showSnackbar = useCallback(
    (payload: { severity?: AlertColor; message: string }) => {
      setSnackbarState({
        open: true,
        severity: payload.severity ?? "info",
        message: payload.message,
      });
    },
    [],
  );

  const handleSnackbarClose = useCallback(
    (_?: unknown, reason?: SnackbarCloseReason) => {
      if (reason === "clickaway") return;
      setSnackbarState((prev) => ({ ...prev, open: false }));
    },
    [],
  );

  const handleRequestDelete = useCallback((man: TMan) => {
    setDeleteTarget(man);
  }, []);

  const handleDialogClose = useCallback(() => {
    if (isDeleting) return;
    setDeleteTarget(null);
  }, [isDeleting]);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      await deleteMan(deleteTarget.id);
      setMen(cachedMen.filter((man) => man.id !== deleteTarget.id));
      setDeleteTarget(null);
      showSnackbar({
        severity: "success",
        message: `${deleteTargetName || "Servant"} was removed.`,
      });
    } catch (error) {
      console.error("Failed to delete servant", error);
      showSnackbar({
        severity: "error",
        message: "Unable to delete servant. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  }, [cachedMen, deleteTarget, deleteTargetName, setMen, showSnackbar]);

  if (!cachedMen)
    return <CircularProgress sx={{ display: "block", margin: "20px auto" }} />;

  return (
    <>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ sm: "center" }}
        justifyContent="space-between"
        sx={{ mt: 2, mb: 2 }}
      >
        <Typography variant="h4" fontWeight={200}>
          Manage Servants
        </Typography>
        <Button
          component={Link}
          href="/manage-men/add"
          variant="contained"
          color="primary"
          startIcon={<PersonAddIcon />}
          sx={{ alignSelf: { xs: "stretch", sm: "flex-end" } }}
        >
          Add New Servant
        </Button>
      </Stack>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {cachedMen.map((man) => {
          const displayName = getManDisplayName(man);
          const avatarPhoto = getManPhotoUrl(man);

          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={man.id}>
              <Card>
                <CardHeader
                  title={displayName}
                  avatar={<ManAvatar name={displayName} photo={avatarPhoto} />}
                />
                <CardContent>
                  {man?.roles?.length ? (
                    <>
                      <Typography variant="body2" color="text.secondary">
                        Roles:
                      </Typography>
                      <Box sx={{ position: "relative", pb: 1 }}>
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{
                            overflow: "hidden",
                            pr: 4,
                            flexWrap: "nowrap",
                          }}
                        >
                          {man.roles.map((role, index) => (
                            <Chip
                              key={`${role}-${index}`}
                              label={getRoleLabel(role)}
                              color="info"
                            />
                          ))}
                        </Stack>
                        <Box
                          sx={(theme) => ({
                            pointerEvents: "none",
                            position: "absolute",
                            right: 0,
                            top: 0,
                            bottom: 0,
                            width: 40,
                            background: `linear-gradient(270deg, ${theme.palette.background.paper} 0%, ${alpha(
                              theme.palette.background.paper,
                              0.85,
                            )} 35%, ${alpha(theme.palette.background.paper, 0)} 70%), linear-gradient(270deg, ${alpha(
                              theme.palette.common.black,
                              0.2,
                            )} 0%, transparent 60%)`,
                          })}
                        />
                      </Box>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No roles assigned
                    </Typography>
                  )}
                  <Box py={2}>
                    <Divider />
                  </Box>
                  {man?.unavailableDates?.length ? (
                    <>
                      <Typography variant="body2" color="text.secondary">
                        Unavailable Dates:
                      </Typography>
                      <Box sx={{ position: "relative", pb: 1 }}>
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{
                            overflow: "hidden",
                            pr: 4,
                            flexWrap: "nowrap",
                          }}
                        >
                          {man.unavailableDates.map((dateStr) => (
                            <Chip
                              key={dateStr}
                              label={format(dateStr, "MMM d, yyyy")}
                              color="info"
                              icon={<EventBusyIcon />}
                              variant="outlined"
                            />
                          ))}
                        </Stack>
                        <Box
                          sx={(theme) => ({
                            pointerEvents: "none",
                            position: "absolute",
                            right: 0,
                            top: 0,
                            bottom: 0,
                            width: 40,
                            background: `linear-gradient(270deg, ${theme.palette.background.paper} 0%, ${alpha(
                              theme.palette.background.paper,
                              0.85,
                            )} 35%, ${alpha(theme.palette.background.paper, 0)} 70%), linear-gradient(270deg, ${alpha(
                              theme.palette.common.black,
                              0.2,
                            )} 0%, transparent 60%)`,
                          })}
                        />
                      </Box>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No unavailable dates
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<ModeEditIcon />}
                    component={Link}
                    href={`/manage-men/${man.id}`}
                  >
                    Edit
                  </Button>

                  <Button
                    size="small"
                    startIcon={<DeleteIcon />}
                    color="error"
                    onClick={() => handleRequestDelete(man)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={handleDialogClose}
        aria-labelledby="delete-servant-title"
      >
        <DialogTitle id="delete-servant-title">
          Remove {deleteTargetName || "this servant"}?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove servant{" "}
            {deleteTargetName || "this servant"}? This data will be gone
            forever.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDialogClose}
            startIcon={<CancelIcon />}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmDelete}
            startIcon={<DeleteForeverIcon />}
            disabled={isDeleting}
            loading={isDeleting}
            loadingPosition="end"
          >
            Yes, delete

          </Button>
        </DialogActions>
      </Dialog>
      <AlertSnackbar
        open={snackbarState.open}
        onClose={handleSnackbarClose}
        severity={snackbarState.severity}
        message={snackbarState.message}
        autoHideDuration={4000}
      />
    </>
  );
}
