"use client";

import { useState, type MouseEvent } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Box,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  Stack,
  Chip,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import GroupsIcon from "@mui/icons-material/Groups";
import { signOut } from "next-auth/react";

type AppHeaderProps = {
  userName?: string | null;
  userImage?: string | null;
};

export const AppHeader = ({ userName, userImage }: AppHeaderProps) => {
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const hasDisplayName = Boolean(userName?.trim().length);
  const displayName = hasDisplayName ? userName : "Member";
  const avatarSrc = userImage ?? undefined;

  const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = async () => {
    handleCloseUserMenu();
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <AppBar
      position="fixed"
      sx={(theme) => ({
        left: 0,
        right: 0,
        top: 0,
        px: { xs: 2, md: 4 },
        backgroundColor: alpha(theme.palette.background.paper, 0.95),
        color: theme.palette.text.primary,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
        borderTop: "none",
        boxShadow: "0 20px 45px rgba(15,28,46,0.15)",
        backdropFilter: "blur(14px)",
      })}
    >
      <Toolbar
        sx={{
          justifyContent: "space-between",
          gap: 2,
          minHeight: { xs: 72, md: 80 },
          px: 0,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={(theme) => ({
              width: 48,
              height: 48,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              background: alpha(theme.palette.primary.main, 0.12),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
            })}
          >
            <GroupsIcon sx={{ color: "primary.main" }} />
          </Box>
          <Box>
            <Typography variant="h6" noWrap>
              39 COFC Those Who Serve
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: (theme) => theme.palette.text.secondary }}
            >
              Mission access hub
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center">
          <Tooltip title="Open menu">
            <IconButton
              onClick={handleOpenUserMenu}
              sx={(theme) => ({
                p: 0,
                color: theme.palette.text.primary,
                border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              })}
            >
              <Avatar
                src={avatarSrc}
                sx={(theme) => ({
                  width: 44,
                  height: 44,
                  border: `2px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                })}
              />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorElUser}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
          >
            <MenuItem disabled>
              <Typography textAlign="center"> Hello, {displayName}</Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Typography textAlign="center">Log out</Typography>
            </MenuItem>
          </Menu>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};
