"use client";
import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { LogIn } from "lucide-react";

const LoginPage = () => {
  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      bgcolor="background.default"
      sx={{ textAlign: "center" }}
    >
      <Box
        width="350px"
        padding="2rem"
        bgcolor="background.paper"
        border="4px solid #000"
        borderRadius="12px"
        boxShadow="4px 4px 0 #000"
      >
        <Typography
          variant="h5"
          sx={{
            marginBottom: "2rem",
            color: "primary.main",
            fontWeight: "bold",
          }}
        >
          ShopEase
        </Typography>

        <Box
          component="form"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <label
            htmlFor="email"
            style={{
              textAlign: "left",
              fontWeight: "bold",
              marginBottom: "0.5rem",
            }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            style={{
              padding: "0.75rem",
              border: "2px solid #000",
              borderRadius: "8px",
              fontSize: "1rem",
              outline: "none",
              boxShadow: "4px 4px 0 #000",
            }}
          />

          <label
            htmlFor="password"
            style={{
              textAlign: "left",
              fontWeight: "bold",
              marginBottom: "0.5rem",
            }}
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            style={{
              padding: "0.75rem",
              border: "2px solid #000",
              borderRadius: "8px",
              fontSize: "1rem",
              outline: "none",
              boxShadow: "4px 4px 0 #000",
            }}
          />
        </Box>

        <Button
          variant="contained"
          fullWidth
          sx={{
            backgroundColor: "primary.main",
            color: "#FFF",
            padding: "0.5rem 0",
            "&:hover": {
              backgroundColor: "secondary.main",
            },
          }}
        >
          Log In
        </Button>
      </Box>
    </Box>
  );
};

export default LoginPage;
