import { alpha, createTheme } from "@mui/material/styles";
import { roboto } from "@/lib/theme/fonts";

const horizon = "#0c1a2f";
const electricBlue = "#4d7dff";
const electricBlueLight = "#7ea5ff";
const electricBlueDark = "#2f4dc9";
const ember = "#f98a5c";
const emberDark = "#c65a2d";
const ink = "#0f1c2e";
const dusk = "#4c5c74";
const cloud = "#f5f7fb";
const panel = "#ffffff";

export const backgroundGradient = `
  radial-gradient(circle at 20% 20%, rgba(95,146,255,.22), transparent 45%),
  radial-gradient(circle at 80% 0%, rgba(249,138,92,.22), transparent 55%),
  linear-gradient(135deg, #030915, ${horizon})
`;

export const gridOverlay = `
  linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
  linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
`;

export const theme = createTheme({
  typography: {
    fontFamily: roboto.style.fontFamily,
    button: {
      fontWeight: 600,
      textTransform: "none",
      letterSpacing: 0.3,
    },
  },
  shape: {
    borderRadius: 16,
  },
  palette: {
    mode: "light",
    background: {
      default: cloud,
      paper: panel,
    },
    primary: {
      main: electricBlue,
      light: electricBlueLight,
      dark: electricBlueDark,
      contrastText: "#ffffff",
    },
    secondary: {
      main: ember,
      light: "#ffc2a4",
      dark: emberDark,
      contrastText: "#3b190b",
    },
    text: {
      primary: ink,
      secondary: alpha(dusk, 0.9),
      disabled: alpha(dusk, 0.4),
    },
    divider: alpha("#9ba9c4", 0.4),
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: cloud,
          color: ink,
        },
        "::selection": {
          backgroundColor: alpha(electricBlue, 0.3),
          color: "#ffffff",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: panel,
          borderRadius: 20,
          border: `1px solid ${alpha("#cfd8ec", 0.8)}`,
          boxShadow: "0 14px 50px rgba(15,28,46,0.08)",
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
        color: "default",
      },
      styleOverrides: {
        colorDefault: {
          backgroundColor: alpha(panel, 0.95),
          borderBottom: `1px solid ${alpha("#d7e0f2", 0.9)}`,
          boxShadow: "0 15px 35px rgba(15,28,46,0.12)",
          backdropFilter: "blur(14px)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: "1.35rem",
          fontWeight: 600,
        },
        containedPrimary: {
          boxShadow: `0 12px 30px ${alpha(electricBlue, 0.35)}`,
        },
        outlinedPrimary: {
          borderColor: alpha(electricBlue, 0.45),
          "&:hover": {
            borderColor: electricBlue,
            backgroundColor: alpha(electricBlue, 0.08),
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          border: `1px solid ${alpha("#c9d5f0", 0.9)}`,
          boxShadow: "0 20px 60px rgba(15,28,46,0.15)",
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: ink,
          color: "#ffffff",
        },
      },
    },
  },
});
