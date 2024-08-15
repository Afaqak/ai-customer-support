'use client'
import { createTheme } from "@mui/material";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#333",
    },
    secondary: {
      main: "#008000",
    },
    background: {
      default: "#F9F9F9",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#000000",
    },
  },
  typography: {
    fontFamily: "Arial, sans-serif",
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          backgroundColor: "#FFF",
          margin:'10px',
          boxShadow: "4px 4px 0 #000",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          boxShadow: "4px 4px 0 #000",
          "&:hover": {
            boxShadow: "4px 4px 0 #000",
          },
        },
      },
    },
  },
});
