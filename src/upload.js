import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import PhotoCamera from '@material-ui/icons/PhotoCamera';
import Container from "@material-ui/core/Container";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";

import MenuIcon from "@material-ui/icons/Menu";

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
      marginLeft: 100,

    },
  },
  input: {
    display: 'none',
  },
  paper: {
    padding: theme.spacing(5),
    margin: "auto",
    maxWidth: 500,
  },
}));

export default function UploadButtons() {
  const classes = useStyles();

  return (
    <Container maxWidth="xs">
        <AppBar position="static">
          <Toolbar variant="dense">
            <IconButton
              edge="start"
              className={classes.menuButton}
              color="inherit"
              aria-label="menu"
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" color="inherit">
              convert document to pdf
            </Typography>
          </Toolbar>
        </AppBar>
        <Paper elevation={12} className={classes.paper} square>
    <div className={classes.root}>
      <input
        accept="image/*"
        className={classes.input}
        id="contained-button-file"
        multiple
        type="file"
      />
      <label htmlFor="contained-button-file">
        <Button variant="contained" color="primary" component="span" startIcon={<CloudUploadIcon />}>
          Upload
        </Button>
      </label>
     
      
    </div>
    </Paper>
    </Container>
  );
}