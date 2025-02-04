import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  typography: {
    fontFamily: 'var(--font-vazir), system-ui, sans-serif',
    button: {
      fontFamily: 'var(--font-vazir), system-ui, sans-serif',
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: 'var(--font-vazir), system-ui, sans-serif',
        },
      },
    },
  },
}); 