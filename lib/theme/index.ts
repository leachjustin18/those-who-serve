import { createTheme } from '@mui/material/styles';
import { roboto } from "@/lib/theme/fonts"

export const theme = createTheme({
  typography: {
    fontFamily: roboto.style.fontFamily,
  },
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    secondary: { main: '#9c27b0' },
  },
});
