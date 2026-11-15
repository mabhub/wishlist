import { createTheme, responsiveFontSizes } from '@mui/material';

/**
 * Thème MUI de l'application : vert-olive en couleur principale, violet en secondaire.
 * Exposé par `wishlist/ui` : `CategoryChip` lit sa palette, il faut donc le fournir
 * par un `ThemeProvider` pour retrouver les couleurs de l'application.
 */
export const theme = responsiveFontSizes(
  createTheme({
    palette: {
      primary: {
        main: '#adb31b',
      },
      secondary: {
        main: '#8252e2',
      },
    },
  }),
);
