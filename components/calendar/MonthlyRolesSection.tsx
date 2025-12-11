'use client';

import { Edit as EditIcon } from "@mui/icons-material";
import { Box, Button, Card, CardContent, Stack, Typography, Grid } from "@mui/material";

import { ManAvatar } from "@/components/ui";
import { getRoleLabel } from "@/lib/helpers/getRoleLabel";
import type { TScheduleEntry } from "@/types";

interface MonthlyRolesSectionProps {
  entries: TScheduleEntry[];
  getServantName: (id: string) => string;
  getServant: (id: string) => any;
  onEdit: (entry: TScheduleEntry) => void;
  isFinalized: boolean;
}

export function MonthlyRolesSection({
  entries,
  getServantName,
  getServant,
  onEdit,
  isFinalized,
}: MonthlyRolesSectionProps) {
  return (
    <Box mb={4}>
      <Typography variant="h6" fontWeight={600} mb={2}>
        Monthly Roles
      </Typography>
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            {entries.map((entry, idx) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={`monthly-${idx}`}>
                <Card>
                  <CardContent sx={{ backgroundColor: "action.hover" }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      {getRoleLabel(entry.role)}
                    </Typography>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      gap={1.5}
                      sx={{ mt: 0.5 }}

                    >
                      <Stack direction="row" alignItems="center" gap={1}>
                        <ManAvatar
                          name={getServantName(entry.servantId)}
                          photo={getServant(entry.servantId)?.photoFile as string | undefined}
                        />
                        <Typography variant="h6">
                          {getServantName(entry.servantId)}
                        </Typography>
                      </Stack>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => onEdit(entry)}
                        disabled={isFinalized}
                      >
                        Change
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
