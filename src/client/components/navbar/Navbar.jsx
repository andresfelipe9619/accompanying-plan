import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import useStyles from './styles';

// const banner = 'https://gospelgeek.com.co/scriptsuv/banner_siac.jpg';

export default function Navbar() {
  const classes = useStyles();

  return (
    <div className={classes.grow}>
      <AppBar position="static" color="secondary" className={classes.banner}>
        <Toolbar className={classes.banner}>
          {/* <img className={classes.banner} src={banner} alt="Logo Ministerio" /> */}
        </Toolbar>
      </AppBar>
    </div>
  );
}
