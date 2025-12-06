import { alpha, createTheme } from "@mui/material/styles";
import { roboto } from "@/lib/theme/fonts";

// Minimal Soft Pastel Palette
const navy = "#0c4a6e"; // deep blue for primary text
const slate = "#334155"; // secondary text
const steel = "#64748b"; // muted text
const cloud = "#cbd5e1"; // borders/dividers
const sky = "#e0f2fe"; // soft blue surface
const skyLight = "#f0f9ff"; // lightest blue
const peach = "#fed7aa"; // warm accent surface
const peachDark = "#fb923c"; // vibrant peach for actions
const coral = "#f97316"; // bold accent for CTAs
const white = "#ffffff";
const offWhite = "#fafafa";

// Success, Warning, Error, Info - coordinated with palette
const success = "#059669"; // emerald green
const successLight = "#d1fae5";
const warning = "#d97706"; // amber
const warningLight = "#fef3c7";
const error = "#dc2626"; // red
const errorLight = "#fee2e2";
const info = "#0284c7"; // sky blue
const infoLight = "#e0f2fe";

// Minimal gradient - barely perceptible
export const backgroundGradient = `
  linear-gradient(180deg, ${white} 0%, ${offWhite} 100%)
`;

// Optional: very subtle grid if desired
export const gridOverlay = `
  linear-gradient(${alpha(cloud, 0.3)} 1px, transparent 1px),
  linear-gradient(90deg, ${alpha(cloud, 0.3)} 1px, transparent 1px)
`;

export const theme = createTheme({
  typography: {
    fontFamily: roboto.style.fontFamily,
    h1: {
      fontWeight: 700,
      color: navy,
    },
    h2: {
      fontWeight: 700,
      color: navy,
    },
    h3: {
      fontWeight: 600,
      color: navy,
    },
    h4: {
      fontWeight: 600,
      color: navy,
    },
    h5: {
      fontWeight: 600,
      color: navy,
    },
    h6: {
      fontWeight: 600,
      color: navy,
    },
    button: {
      fontWeight: 600,
      textTransform: "none",
      letterSpacing: 0.2,
    },
    body1: {
      color: slate,
    },
    body2: {
      color: steel,
    },
  },
  shape: {
    borderRadius: 12, // softer, minimal
  },
  palette: {
    background: {
      default: offWhite,
      paper: white,
    },
    primary: {
      main: navy,
      light: "#0369a1",
      dark: "#082f49",
      contrastText: white,
    },
    secondary: {
      main: peachDark,
      light: peach,
      dark: coral,
      contrastText: white,
    },
    success: {
      main: success,
      light: successLight,
      dark: "#047857",
      contrastText: white,
    },
    warning: {
      main: warning,
      light: warningLight,
      dark: "#b45309",
      contrastText: white,
    },
    error: {
      main: error,
      light: errorLight,
      dark: "#b91c1c",
      contrastText: white,
    },
    info: {
      main: info,
      light: infoLight,
      dark: "#0369a1",
      contrastText: white,
    },
    text: {
      primary: navy,
      secondary: slate,
      disabled: steel,
    },
    divider: alpha(cloud, 0.6),
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: offWhite,
          color: slate,
          backgroundImage: backgroundGradient,
          backgroundAttachment: "fixed",
        },
        "::selection": {
          backgroundColor: alpha(sky, 0.8),
          color: navy,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: white,
          borderRadius: 12,
          border: `1px solid ${alpha(cloud, 0.5)}`,
          // Minimal shadow - barely there
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
        },
        elevation1: {
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
        },
        elevation2: {
          boxShadow: "0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.03)",
        },
        elevation3: {
          boxShadow: "0 10px 15px rgba(0,0,0,0.06), 0 4px 6px rgba(0,0,0,0.04)",
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
        color: "default",
      },
      styleOverrides: {
        root: {
          backgroundColor: alpha(white, 0.8),
          borderBottom: `1px solid ${alpha(cloud, 0.5)}`,
          boxShadow: "none",
          backdropFilter: "blur(12px)",
        },
        colorDefault: {
          backgroundColor: alpha(white, 0.8),
          color: navy,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          paddingInline: "1.25rem",
          paddingBlock: "0.5rem",
          fontWeight: 600,
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
          },
        },
        containedPrimary: {
          backgroundColor: navy,
          color: white,
          "&:hover": {
            backgroundColor: "#0369a1",
          },
        },
        containedSecondary: {
          backgroundColor: peachDark,
          color: white,
          "&:hover": {
            backgroundColor: coral,
          },
        },
        outlined: {
          borderWidth: "1.5px",
          "&:hover": {
            borderWidth: "1.5px",
          },
        },
        outlinedPrimary: {
          borderColor: alpha(navy, 0.5),
          color: navy,
          "&:hover": {
            borderColor: navy,
            backgroundColor: alpha(sky, 0.3),
          },
        },
        outlinedSecondary: {
          borderColor: alpha(peachDark, 0.5),
          color: peachDark,
          "&:hover": {
            borderColor: peachDark,
            backgroundColor: alpha(peach, 0.3),
          },
        },
        text: {
          "&:hover": {
            backgroundColor: alpha(sky, 0.2),
          },
        },
        textPrimary: {
          color: navy,
        },
        textSecondary: {
          color: peachDark,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
        filled: {
          backgroundColor: sky,
          color: navy,
        },
        outlined: {
          borderColor: alpha(cloud, 0.8),
          color: slate,
        },
        colorPrimary: {
          backgroundColor: sky,
          color: navy,
        },
        colorSecondary: {
          backgroundColor: peach,
          color: "#7c2d12", // dark brown for contrast
        },
        colorSuccess: {
          backgroundColor: successLight,
          color: success,
        },
        colorWarning: {
          backgroundColor: warningLight,
          color: warning,
        },
        colorError: {
          backgroundColor: errorLight,
          color: error,
        },
        colorInfo: {
          backgroundColor: infoLight,
          color: info,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: sky,
          color: navy,
          fontWeight: 600,
        },
        colorDefault: {
          backgroundColor: sky,
          color: navy,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: `1px solid ${alpha(cloud, 0.5)}`,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: white,
            "& fieldset": {
              borderColor: alpha(cloud, 0.6),
            },
            "&:hover fieldset": {
              borderColor: alpha(navy, 0.4),
            },
            "&.Mui-focused fieldset": {
              borderColor: navy,
              borderWidth: "2px",
            },
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: white,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: alpha(cloud, 0.6),
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: alpha(navy, 0.4),
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: navy,
            borderWidth: "2px",
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          fontSize: "0.9375rem",
          color: steel,
          "&.Mui-selected": {
            color: navy,
            fontWeight: 600,
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: navy,
          height: 3,
          borderRadius: "3px 3px 0 0",
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: white,
          borderTop: `1px solid ${alpha(cloud, 0.5)}`,
          boxShadow: "0 -2px 8px rgba(0,0,0,0.04)",
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          color: steel,
          "&.Mui-selected": {
            color: navy,
          },
          minWidth: "auto",
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          border: `1px solid ${alpha(cloud, 0.5)}`,
          backgroundColor: white,
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          backdropFilter: "blur(12px)",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: alpha(sky, 0.4),
          },
          "&.Mui-selected": {
            backgroundColor: alpha(sky, 0.5),
            "&:hover": {
              backgroundColor: alpha(sky, 0.6),
            },
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: navy,
          color: white,
          fontSize: "0.75rem",
          borderRadius: 6,
          padding: "0.375rem 0.75rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        },
        arrow: {
          color: navy,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        standardSuccess: {
          backgroundColor: successLight,
          color: success,
        },
        standardWarning: {
          backgroundColor: warningLight,
          color: warning,
        },
        standardError: {
          backgroundColor: errorLight,
          color: error,
        },
        standardInfo: {
          backgroundColor: infoLight,
          color: info,
        },
        filledSuccess: {
          backgroundColor: success,
        },
        filledWarning: {
          backgroundColor: warning,
        },
        filledError: {
          backgroundColor: error,
        },
        filledInfo: {
          backgroundColor: info,
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          "& .MuiSwitch-switchBase.Mui-checked": {
            color: navy,
            "& + .MuiSwitch-track": {
              backgroundColor: navy,
            },
          },
        },
        track: {
          backgroundColor: cloud,
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: steel,
          "&.Mui-checked": {
            color: navy,
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: steel,
          "&.Mui-checked": {
            color: navy,
          },
        },
      },
    },
  },
});