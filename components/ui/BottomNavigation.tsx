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
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        borderBottomRightRadius: 0,
        borderBottomLeftRadius: 0,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
        borderBottom: "none",
        boxShadow: "0 -15px 40px rgba(15,28,46,0.12)",
        backdropFilter: "blur(18px)",
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
            "& .MuiSvgIcon-root": {
              fontSize: 24,
            },
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
            backgroundColor: alpha(theme.palette.primary.main, 0.12),
            boxShadow: `0 8px 18px ${alpha(theme.palette.primary.main, 0.22)}`,
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
