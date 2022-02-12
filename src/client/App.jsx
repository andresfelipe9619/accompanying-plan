import React from 'react';
import { MuiThemeProvider, createTheme } from '@material-ui/core/styles';
import GlobalState from './context/GlobalState';
import AppRouter from './AppRouter';

const theme = createTheme({
  palette: {
    primary: {
      main: '#eb1e01',
    },
    secondary: {
      main: '#a9a9a9',
    },
  },
  typography: {
    fontSize: 18,
  },
});

const App = () => (
  <GlobalState>
    <MuiThemeProvider theme={theme}>
      <AppRouter />
    </MuiThemeProvider>
  </GlobalState>
);

export default App;
