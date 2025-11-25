import { alpha, createTheme } from "@mui/material/styles";
import { roboto } from "@/lib/theme/fonts";

// Existing palette, but we’ll use it more gently
const evergreen = "#1f2a24"; // deep text
const moss = "#3e5b4a"; // muted text
const fern = "#4d8f73"; // medium green
const fernLight = "#7fb598"; // soft green
const fernDark = "#2f6448"; // deeper accent
const mist = "#f1f8f4"; // soft surface
const blush = "#f5cdbd";
const blushDark = "#d29a84";
const canvas = "#ffffff";

// Slightly gentler gradient, more "calm" than dramatic
export const backgroundGradient = `
  radial-gradient(circle at 18% 25%, rgba(127,181,152,.18), transparent 45%),
  radial-gradient(circle at 82% 8%, rgba(245,205,189,.18), transparent 55%),
  linear-gradient(135deg, #eef6f1, #dde9e2)
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
    background: {
      // page background behind your main card
      default: "#edf5f1", // soft mint/gray wash
      // general paper surfaces (cards etc.)
      paper: mist,
    },
    primary: {
      // calmer, mid-tone green
      main: fern,
      light: "#9ccab0",
      dark: fern,
      contrastText: "#ffffff",
    },
    secondary: {
      main: blush,
      light: "#ffe1d7",
      dark: blushDark,
      contrastText: "#41241a",
    },
    text: {
      primary: evergreen, // deep but not black
      secondary: alpha(moss, 0.85), // calm muted body/support text
      disabled: alpha(moss, 0.4),
    },
    divider: alpha(moss, 0.22),
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#edf5f1",
          color: evergreen,
          backgroundImage: backgroundGradient,
          backgroundAttachment: "fixed",
        },
        "::selection": {
          backgroundColor: alpha(fernLight, 0.35),
          color: "#ffffff",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: canvas,
          borderRadius: 20,
          border: `1px solid ${alpha(fernDark, 0.12)}`,
          // Softer shadow than your main <main> shadow
          boxShadow: "0 10px 28px rgba(15,27,20,0.06)",
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
          backgroundColor: alpha(mist, 0.95),
          borderBottom: `1px solid ${alpha(moss, 0.16)}`,
          boxShadow: "0 12px 28px rgba(15,27,20,0.08)",
          backdropFilter: "blur(16px)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: "1.3rem",
          fontWeight: 600,
        },
        outlinedPrimary: {
          borderColor: alpha(fernDark, 0.6),
          "&:hover": {
            borderColor: fernDark,
            backgroundColor: alpha(fern, 0.08),
          },
        },
        containedPrimary: {
          borderColor: alpha(fernDark, 0.6),
          "&:hover": {
            borderColor: fernDark,
            backgroundColor: alpha(fern, 0.75),
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          border: `1px solid ${alpha(moss, 0.18)}`,
          backgroundColor: alpha(canvas, 0.96),
          boxShadow: "0 20px 50px rgba(15,27,20,0.12)",
          backdropFilter: "blur(16px)",
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: evergreen,
          color: "#ffffff",
          fontSize: "0.72rem",
          borderRadius: 999,
          padding: "0.28rem 0.6rem",
        },
        arrow: {
          color: evergreen,
        },
      },
    },
  },
});
