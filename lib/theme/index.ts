import { alpha, createTheme } from "@mui/material/styles";
import { amber, blueGrey, deepOrange, teal } from "@mui/material/colors";
import { roboto } from "@/lib/theme/fonts";

const dreamyPastels = {
  porcelain: "#fffef9",
  glow: "#fff6e9",
  butter: "#ffefd7",
  mist: "#e3f0ff",
  powder: "#d2e7ff",
};

const primaryMain = "#5f7ecf";
const secondaryMain = "#f4b69c";

export const theme = createTheme({
  typography: {
    fontFamily: roboto.style.fontFamily,
    button: {
      fontWeight: 600,
      textTransform: "none",
    },
  },
  shape: {
    borderRadius: 12,
  },
  palette: {
    mode: "light",
    background: {
      default: dreamyPastels.porcelain,
      paper: dreamyPastels.glow,
    },
    primary: {
      main: primaryMain,
      light: "#8ea4e5",
      dark: "#3c528c",
      contrastText: "#f6fbff",
    },
    secondary: {
      main: secondaryMain,
      light: "#ffd9c7",
      dark: "#cc8c73",
      contrastText: "#3e1d16",
    },
    info: {
      main: "#82b3ff",
      light: dreamyPastels.powder,
      dark: "#4c7dd7",
      contrastText: "#0f172a",
    },
    success: {
      main: teal[400],
      light: teal[200],
      dark: teal[700],
      contrastText: dreamyPastels.porcelain,
    },
    warning: {
      main: amber[500],
      light: amber[200],
      dark: amber[700],
      contrastText: "#3e2600",
    },
    error: {
      main: deepOrange[400],
      light: deepOrange[200],
      dark: deepOrange[700],
      contrastText: dreamyPastels.porcelain,
    },
    divider: alpha(blueGrey[200], 0.6),
    text: {
      primary: blueGrey[900],
      secondary: blueGrey[600],
      disabled: alpha(blueGrey[600], 0.4),
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: dreamyPastels.porcelain,
          color: blueGrey[900],
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          borderRadius: 20,
          border: `1px solid ${alpha(blueGrey[100], 0.8)}`,
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
          backgroundColor: alpha(dreamyPastels.glow, 0.85),
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${alpha(blueGrey[100], 0.6)}`,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
        },
        colorPrimary: {
          color: "#f6fbff",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: "1.25rem",
        },
        outlined: {
          borderColor: alpha(primaryMain, 0.4),
        },
        containedSecondary: {
          color: secondaryMain,
          backgroundColor: alpha(dreamyPastels.porcelain, 0.9),
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 500,
        },
      },
    },
  },
});
