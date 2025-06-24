import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Container,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Button,
  CircularProgress,
  LinearProgress,
  Box,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import ClearIcon from "@mui/icons-material/Clear";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import logo from "./logo.png"
import bgImage from "./bg.png";

const ColorButton = styled(Button)(({ theme }) => ({
  color: "#fff",
  backgroundColor: "#be6a77",
  borderRadius: "30px",
  padding: "10px 30px",
  fontWeight: "bold",
  marginTop: "15px",
  "&:hover": {
    backgroundColor: "#a34c5c",
  },
}));

const useStyles = (theme) => ({
  mainContainer: {
    backgroundImage: `url(${bgImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    minHeight: "100vh",
    paddingTop: "10px",
  },
  cardWrapper: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: "20px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
    padding: "30px",
    maxWidth: 500,
    margin: "auto",
  },
  dropBox: {
    border: "2px dashed #be6a77",
    backgroundColor: "#fff0f5",
    borderRadius: "12px",
    padding: "30px",
    textAlign: "center",
    cursor: "pointer",
    color: "#555",
    fontWeight: 500,
    transition: "background-color 0.3s ease",
  },
  loader: {
    color: "#be6a77",
  },
  resultText: {
    color: "#333",
    fontWeight: "bold",
    marginTop: "10px",
  },
});

export const ImageUpload = () => {
  const theme = useTheme();
  const classes = useStyles(theme);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [data, setData] = useState(null);
  const [image, setImage] = useState(false);
  const [isLoading, setIsloading] = useState(false);

  const sendFile = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append("file", selectedFile);
    setIsloading(true);
    try {
      const res = await axios.post(process.env.REACT_APP_API_URL, formData);
      if (res.status === 200) {
        setData(res.data);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    }
    setIsloading(false);
  };

  const clearData = () => {
    setData(null);
    setImage(false);
    setSelectedFile(null);
    setPreview(null);
  };

  const onDrop = (acceptedFiles) => {
    if (!acceptedFiles || acceptedFiles.length === 0) {
      setSelectedFile(null);
      setImage(false);
      setData(null);
      return;
    }
    setSelectedFile(acceptedFiles[0]);
    const objectUrl = URL.createObjectURL(acceptedFiles[0]);
    setPreview(objectUrl);
    setImage(true);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  const confidencePercent = data ? (data.confidence * 100).toFixed(2) : 0;

  return (
    <div style={classes.mainContainer}>
      <AppBar position="static" style={{ background: "#be6a77", boxShadow: "none" }}>
        <Toolbar>
          <Avatar src={logo} />
          <Typography variant="h6" style={{ marginLeft: 10 }}>
            Potato Disease Classifier
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" style={{ paddingTop: "2rem" }}>
        <Card style={classes.cardWrapper}>
          <CardContent style={{ textAlign: "center" }}>
            {!preview && (
              <div {...getRootProps()} style={classes.dropBox}>
                <input {...getInputProps()} />
                {isDragActive ? (
                  <Typography>Drop the image here...</Typography>
                ) : (
                  <Typography>Drag & drop an image, or click to select</Typography>
                )}
              </div>
            )}

            {preview && (
              <>
                <Typography variant="subtitle1" gutterBottom>
                  Preview:
                </Typography>
                <CardMedia
                  component="img"
                  height="250"
                  image={preview}
                  alt="Preview"
                  style={{ borderRadius: "10px", marginBottom: "15px" }}
                />
                <ColorButton onClick={sendFile}>Predict</ColorButton>
              </>
            )}

            {isLoading && (
              <Box mt={3}>
                <CircularProgress style={classes.loader} />
                <Typography style={{ marginTop: "10px" }}>Processing...</Typography>
              </Box>
            )}

            {data && !isLoading && (
              <Box mt={3}>
                <Typography className={classes.resultText}>
                  Prediction: <span style={{ color: "#be6a77" }}>{data.class}</span>
                </Typography>
                <Box mt={1}>
                  <LinearProgress
                    variant="determinate"
                    value={confidencePercent}
                    style={{ height: 10, borderRadius: 5 }}
                  />
                  <Typography variant="body2" color="textSecondary" style={{ marginTop: 5 }}>
                    Confidence: {confidencePercent}%
                  </Typography>
                </Box>
              </Box>
            )}

            {(preview || data) && (
              <ColorButton onClick={clearData} startIcon={<ClearIcon />}>
                Clear
              </ColorButton>
            )}
          </CardContent>
        </Card>
      </Container>
    </div>
  );
};
