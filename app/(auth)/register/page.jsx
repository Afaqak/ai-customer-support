"use client";
import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { register as registerAction } from "@/actions/register";
import { useRouter } from "next/navigation";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();
  const router = useRouter();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const onSubmit = async (data) => {
    try {
      await registerAction(data)
        .then(() => {
          setSnackbarMessage("Login successful!");
          setSnackbarSeverity("success");
          setOpenSnackbar(true);
          router.push("/");
        })
        .catch((err) => {
          setSnackbarMessage(
            err.message || "Registration failed. Please try again."
          );
          setSnackbarSeverity("error");
          setOpenSnackbar(true);
        });
    } catch (err) {
      setSnackbarMessage(
        err.message || "Registration failed. Please try again."
      );
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSnackbar(false);
  };

  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
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
        boxShadow="8px 8px 0 #000"
      >
        <Typography
          variant="h5"
          sx={{
            marginBottom: "2rem",
            color: "#6C63FF",
            fontWeight: "bold",
            textAlign: "left",
          }}
        >
          Register
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
            htmlFor="displayName"
            style={{
              textAlign: "left",
              fontWeight: "bold",

              display: "block", // Ensures label is above input
            }}
          >
            Display Name
          </label>
          <input
            id="displayName"
            type="text"
            {...register("displayName", {
              required: "Display Name is required",
            })}
            style={{
              padding: "0.75rem",
              border: "2px solid #333",
              borderRadius: "8px",
              fontSize: "1rem",
              outline: "none",
              boxShadow: "4px 4px 0 #000",
              width: "100%",
              boxSizing: "border-box",
              transition: "border-color 0.3s ease",
            }}
          />
          {errors.displayName && (
            <Typography
              variant="body2"
              color="error"
              sx={{ textAlign: "left" }}
            >
              {errors.displayName.message}
            </Typography>
          )}

          <label
            htmlFor="email"
            style={{
              textAlign: "left",
              fontWeight: "bold",

              display: "block",
            }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register("email", { required: "Email is required" })}
            style={{
              padding: "0.75rem",
              border: "2px solid #333",
              borderRadius: "8px",
              fontSize: "1rem",
              outline: "none",
              boxShadow: "4px 4px 0 #000",
              width: "100%",
              boxSizing: "border-box",
              transition: "border-color 0.3s ease",
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

              display: "block",
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
                boxSizing: "border-box",
                transition: "border-color 0.3s ease",
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
            sx={{
              backgroundColor: "#333",
              color: "#FFF",
              padding: "0.75rem 0",
              "&:hover": {
                backgroundColor: "#555",
              },
            }}
          >
            Register
          </Button>
        </Box>

        <Typography
          variant="body2"
          sx={{
            marginTop: "1rem",
            color: "#333",
          }}
        >
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#333", marginTop: "10px" }}>
            Log In
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

export default RegisterPage;
