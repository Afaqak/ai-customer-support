"use client";
import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { login } from "@/actions/login";

const LoginPage = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const onSubmit = async (data) => {
    console.log(data, "DATA");
    setIsLoading(true);
    try {
      await login(data);
      setSnackbarMessage("Login successful!");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      router.push("/");
    } catch (err) {
      setSnackbarMessage(err.message || "Login failed.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <Box
      width="100%"
      height="90vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      bgcolor="background.default"
      sx={{ textAlign: "center" }}
    >
      <Box
        width="400px"
        padding="2rem"
        bgcolor="#f5f5f5"
        border="4px solid #333"
        borderRadius="12px"
        boxShadow="4px 4px 0 #000"
      >
        <Typography
          variant="h5"
          sx={{
            marginBottom: "2rem",
            color: "#6C63FF",
            fontWeight: "bold",
            textAlign:'left'
          }}
        >
          Login 
        </Typography>

  
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
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
              display: "block", 
            }}
          >
            Display Name or Email
          </label>
          <input
            id="email"
            type="text"
            {...register("email", {
              required: "Display Name or Email is required",
            })}
            style={{
              padding: "0.75rem",
              border: "2px solid #333",
              borderRadius: "8px",
              fontSize: "1rem",
              outline: "none",
              boxShadow: "4px 4px 0 #000",
              width: "100%",
            }}
          />
          {errors.email && (
            <Typography
              variant="body2"
              color="error"
              sx={{ textAlign: "left" }}
            >
              {errors.email.message}
            </Typography>
          )}

          <label
            htmlFor="password"
            style={{
              textAlign: "left",
              fontWeight: "bold",
              marginTop: "10px",
              display: "block", // Ensures label is above input
            }}
          >
            Password
          </label>
          <Box sx={{ position: "relative" }}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password", { required: "Password is required" })}
              style={{
                padding: "0.75rem",
                border: "2px solid #333",
                borderRadius: "8px",
                fontSize: "1rem",
                outline: "none",
                boxShadow: "4px 4px 0 #000",
                width: "100%",
              }}
            />
            <Button
              onClick={handleClickShowPassword}
              sx={{
                position: "absolute",
                top: "50%",
                right: "10px",
                transform: "translateY(-50%)",
                minWidth: "auto",
                padding: "0",
                background: "transparent",
                "&:hover": {
                  background: "transparent",
                },
              }}
            >
              {showPassword ? <EyeIcon /> : <EyeOffIcon />}
            </Button>
          </Box>
          {errors.password && (
            <Typography
              variant="body2"
              color="error"
              sx={{ textAlign: "left" }}
            >
              {errors.password.message}
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoading}
            sx={{
              backgroundColor: "#333",
              color: "#FFF",
              padding: "0.75rem 0",
              "&:hover": {
                backgroundColor: "#555",
              },
            }}
          >
            {isLoading ? <CircularProgress size={20} /> : "Login"}
          </Button>
        </Box>

        <Typography
          variant="body2"
          sx={{
            marginTop: "1rem",
            color: "#333",
          }}
        >
          Don t have an account?{" "}
          <Link href="/register" style={{ color: "#333", marginTop: "10px" }}>
            Register
          </Link>
        </Typography>
      </Box>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LoginPage;