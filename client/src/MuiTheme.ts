import { createTheme } from '@mui/material/styles';

const muiTheme = createTheme({
  typography: {
    fontFamily: 'Heming, Arial, sans-serif', // Add your custom font here
  },
  palette: {
    mode: 'dark',
    primary: {
      main: '#8c51fe',
    },
    secondary: {
      main: '#ffffff',
    },
    
  },
});

export default muiTheme;
