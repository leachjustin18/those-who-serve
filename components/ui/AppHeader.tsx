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
} from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import { signOut } from "next-auth/react";

type AppHeaderProps = {
  userName?: string | null;
  userImage?: string | null;
};

export const AppHeader = ({ userName, userImage }: AppHeaderProps) => {
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const displayName = userName?.trim().length ? userName : "Member";

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
      sx={{
        backgroundColor: "primary.main",
        color: "primary.contrastText",
      }}
      elevation={0}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box display="flex" alignItems="center">
          <GroupsIcon sx={{ mr: 1, color: "inherit" }} />
          <Typography variant="h6" noWrap color="inherit">
            39 COFC Those Who Serve
          </Typography>
        </Box>

        <Box>
          <Tooltip title="Open menu">
            <IconButton
              onClick={handleOpenUserMenu}
              sx={{ p: 0, color: "inherit" }}
            >
              <Avatar alt={displayName} src={userImage ?? undefined} />
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
            <MenuItem onClick={handleCloseUserMenu} disabled>
              <Typography textAlign="center">Hello {displayName}</Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <Typography textAlign="center">Log out</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
