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
} from "@mui/material";
import {
  ModeEdit as ModeEditIcon,
  DeleteForever as DeleteForeverIcon,
  EventBusy as EventBusyIcon,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { useCache } from "@/components/context/Cache";
import { getRoleLabel } from "@/lib/helpers/getRoleLabel";
import { ManAvatar } from "@/components/ui/ManAvatar";
import Link from "next/link";
import { format } from "date-fns";
import type { Man } from "@/types/man";

const getManDisplayName = (man: Man) =>
  [man.firstName, man.lastName].filter(Boolean).join(" ").trim() ||
  "Unnamed Servant";

const getManPhotoUrl = (man: Man) =>
  typeof man.photoFile === "string" ? man.photoFile : undefined;

export default function ManageMen() {
  const cachedMen = useCache()?.men;

  if (!cachedMen)
    return <CircularProgress sx={{ display: "block", margin: "20px auto" }} />;

  return (
    <>
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
                    startIcon={<DeleteForeverIcon />}
                    color="error"
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </>
  );
}
