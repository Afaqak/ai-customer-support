"use client";
import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
} from "@mui/material";
import Link from "next/link";
import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut } from "@/actions/logout";

const Navbar = ({ user }) => {
  const router = useRouter();

  const handleLogout = () => {
    signOut();
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: "#333", color: "#FFF" }}>
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: "#FFF",
            fontWeight: "bold",
            fontSize: "1.5rem",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
          onClick={() => router.push("/")}
        >
          Ninja Way
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          {user ? (
            <>
              <Typography
                variant="body2"
                sx={{ marginRight: "1rem", color: "#FFF" }}
              >
                {user.displayName}
              </Typography>
              <IconButton
                sx={{
                  boxShadow: "4px 4px 0 black",
                  "&:hover": {
                    boxShadow: "0px 0px 0 black",
                  },
                }}
                onClick={handleLogout}
              >
                <LogOutIcon size={24} color="#FFF" />
              </IconButton>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: "#333",
                    color: "#FFF",
                    marginRight: "1rem",
                  }}
                >
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  variant="contained"
                  sx={{ backgroundColor: "#6C63FF", color: "#FFF" }}
                >
                  Register
                </Button>
              </Link>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
