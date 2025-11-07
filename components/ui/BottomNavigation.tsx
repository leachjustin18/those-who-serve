"use client";

import { useState } from "react";
import {
  BottomNavigation as MuiBottomNavigation,
  BottomNavigationAction,
  Paper,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  People as PeopleIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";

export const BottomNavigation = () => {
  const [navigationValue, setNavigationValue] = useState(0);

  return (
    <Paper
      sx={(theme) => ({
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        px: 2,
        pb: 1.5,
        pt: 0.5,
        backgroundColor: alpha(theme.palette.background.paper, 0.95),
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderBottomRightRadius: 0,
        borderBottomLeftRadius: 0,
      })}
      elevation={6}
    >
      <MuiBottomNavigation
        showLabels
        value={navigationValue}
        onChange={(_, newValue) => {
          setNavigationValue(newValue);
        }}
        sx={(theme) => ({
          backgroundColor: "transparent",
          "& .MuiBottomNavigationAction-root": {
            color: theme.palette.text.secondary,
            fontWeight: 500,
            borderRadius: 999,
            px: 2,
            transition: theme.transitions.create(["color", "background-color"]),
          },
          "& .MuiBottomNavigationAction-root .MuiBottomNavigationAction-label":
            {
              fontSize: 14,
              fontWeight: 600,
              lineHeight: 1.2,
              transition: theme.transitions.create("opacity"),
            },
          "& .MuiBottomNavigationAction-root.Mui-selected": {
            color: theme.palette.primary.main,
            backgroundColor: alpha(theme.palette.primary.main, 0.16),
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
          },
          "& .MuiBottomNavigationAction-root.Mui-selected .MuiBottomNavigationAction-label":
            {
              fontSize: 15,
              opacity: 1,
            },
        })}
      >
        <BottomNavigationAction label="Men" icon={<PeopleIcon />} />
        <BottomNavigationAction label="Logout" icon={<LogoutIcon />} />
      </MuiBottomNavigation>
    </Paper>
  );
};
