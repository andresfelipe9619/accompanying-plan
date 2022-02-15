import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { useHistory } from 'react-router-dom';
import useStyles from './styles';

export default function Navbar() {
  const classes = useStyles();
  const history = useHistory();

  return (
    <div className={classes.grow}>
      <AppBar position="static" color="secondary">
        <Toolbar>
          <Typography
            className={classes.title}
            onClick={() => history.push('/')}
            variant="h6"
            noWrap
          >
            Acompañamiento
          </Typography>
          <div className={classes.grow} />
        </Toolbar>
      </AppBar>
    </div>
  );
}
