import React, { Fragment, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Container from "@material-ui/core/Container";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import Alert from "@material-ui/lab/Alert";
import GetAppIcon from "@material-ui/icons/GetApp";
import MenuIcon from "@material-ui/icons/Menu";
import "fontsource-roboto";
import "./App.css";
import CircularProgress from "@material-ui/core/CircularProgress";

const useStyles = makeStyles((theme) => ({
  progress: {
    display: "flex",
    paddingLeft: theme.spacing(5),
  },
  root: {
    "& > *": {
      margin: theme.spacing(1),
      marginLeft: "30%",
      textAlign: "center",
    },
  },
  input: {
    display: "none",
  },
  paper: {
    padding: theme.spacing(5),
    margin: "auto",
    maxWidth: 500,
  },

  allert: {
    textAlign: "center",
    marginTop: 20,
  },
  download: {
    marginLeft: "40%",
    fontSize: "large",
    color: "inherit",
  },
}));

const UploadFile = () => {
  const [isLoading, setisLoading] = useState(false);
  const [message, setMessages] = useState({ type: "", text: "" });
  const classes = useStyles();
  const [presignedUrl, setPresignedUrl] = useState({ text: "" });
  const [isFinished, setIsFinished] = useState(false);

  const uploadFile = async (formData) => {
    try {
      setisLoading(true);

      const res = await fetch("http://localhost:3001/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setisLoading(false);
      console.log(data, "data");
      if (!res.ok) {
        throw new Error(data.message);
      }
      setMessages({ type: "success", text: data.message });
      setPresignedUrl({ text: data.presignedUrl });
      setIsFinished(true);
    } catch (e) {
      setMessages({ type: "error", text: e.message });
    }
  };
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
            Convert document to PDF
          </Typography>
        </Toolbar>
      </AppBar>
      <Paper elevation={12} className={classes.paper} square>
        <div className={classes.root}>
          <input
            accept="*/*"
            className={classes.input}
            id="contained-button-file"
            multiple
            type="file"
            onChange={(e) => {
              const formData = new FormData();
              formData.append("file", e.target.files[0]);

              uploadFile(formData);
            }}
          />
          <label htmlFor="contained-button-file">
            {!isLoading && !isFinished ? (
              <Button
                variant="contained"
                color="primary"
                component="span"
                startIcon={<CloudUploadIcon />}
              >
                Upload
              </Button>
            ) : (
              ""
            )}
            {isFinished ? (
              <a href={presignedUrl.text}>
                <Button
                  variant="contained"
                  color="primary"
                  component="href"
                  startIcon={<GetAppIcon />}
                >
                  Download
                  <br />
                  PDF
                </Button>
              </a>
            ) : (
              ""
            )}
          </label>
          {isLoading ? <CircularIndeterminate /> : ""}
        </div>
      </Paper>
      {message.text !== "" ? (
        <div>
          <Alert severity={message.type}>{message.text}</Alert>
        </div>
      ) : (
        ""
      )}
    </Container>
  );
};
const CircularIndeterminate = () => {
  const classes = useStyles();

  return (
    <div className={classes.progress}>
      <CircularProgress />
    </div>
  );
};

export default UploadFile;
