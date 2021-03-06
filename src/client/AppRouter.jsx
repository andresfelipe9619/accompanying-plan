import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import { HashRouter, Route, Switch } from 'react-router-dom';
import Alert from './components/alert/Alert';
import Dashboard from './components/dashboard/Dashboard';
import Home from './components/home/Home';

export default function AppRouter() {
  return (
    <HashRouter>
      <CssBaseline />
      <Container maxWidth="lg" style={{ marginTop: 16 }}>
        <Alert />
        <Switch>
          <Route exact strict path="/" render={props => <Home {...props} />} />
          <Route
            exact
            strict
            path="/dashboard"
            render={props => <Dashboard {...props} />}
          />
        </Switch>
      </Container>
    </HashRouter>
  );
}
