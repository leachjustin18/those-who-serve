import { alpha, createTheme } from "@mui/material/styles";
import { roboto } from "@/lib/theme/fonts";

const pineShadow = "#0f1b14";
const evergreen = "#1f2a24";
const moss = "#3e5b4a";
const fern = "#4d8f73";
const fernLight = "#7fb598";
const fernDark = "#2f6448";
const meadow = "#d3eedd"; // requested base color
const mist = "#f1f8f4";
const blush = "#f5cdbd";
const blushDark = "#d29a84";
const canvas = "#ffffff";

export const backgroundGradient = `
  radial-gradient(circle at 18% 25%, rgba(127,181,152,.28), transparent 45%),
  radial-gradient(circle at 82% 8%, rgba(245,205,189,.28), transparent 55%),
  linear-gradient(135deg, ${pineShadow}, ${evergreen})
`;

export const gridOverlay = `
  linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
  linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
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
      default: canvas,
      paper: mist,
    },
    primary: {
      main: fern,
      light: fernLight,
      dark: fernDark,
      contrastText: "#ffffff",
    },
    secondary: {
      main: blush,
      light: "#ffe1d7",
      dark: blushDark,
      contrastText: "#41241a",
    },
    text: {
      primary: evergreen,
      secondary: alpha(moss, 0.9),
      disabled: alpha(moss, 0.4),
    },
    divider: alpha(moss, 0.3),
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: canvas,
          color: evergreen,
        },
        "::selection": {
          backgroundColor: alpha(fern, 0.35),
          color: "#ffffff",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: mist,
          borderRadius: 20,
          border: `1px solid ${alpha(fernDark, 0.2)}`,
          boxShadow: "0 14px 50px rgba(15,27,20,0.08)",
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
          backgroundColor: alpha(mist, 0.92),
          borderBottom: `1px solid ${alpha(moss, 0.18)}`,
          boxShadow: "0 15px 35px rgba(15,27,20,0.12)",
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
          boxShadow: `0 12px 30px ${alpha(fern, 0.35)}`,
        },
        outlinedPrimary: {
          borderColor: alpha(fern, 0.45),
          "&:hover": {
            borderColor: fern,
            backgroundColor: alpha(fern, 0.08),
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          border: `1px solid ${alpha(moss, 0.2)}`,
          boxShadow: "0 20px 60px rgba(15,27,20,0.12)",
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: evergreen,
          color: "#ffffff",
        },
      },
    },
  },
});
