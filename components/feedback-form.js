import React, { useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import { useSWRConfig } from "swr";

const FeedbackForm = ({
  feedbacks,
  handleLoadMore,
  skip,
  setSkip,
  isAuthenticated,
}) => {
  const [feedback, setFeedback] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const { mutate } = useSWRConfig();

  const handleFeedbackSubmit = async () => {
    if (!isAuthenticated) {
      setSnackbarMessage("You need to be logged in to submit feedback.");
      setSnackbarOpen(true);
      return;
    }

    try {
      const response = await fetch("/api/feedback/create-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: feedback }),
      });

      if (response.ok) {
        setFeedback("");
        const data = await response.json();
        setSkip((prev) => prev + 1);
        mutate(
          "/api/feedback?skip=0&take=6",
          (prevData) => {
            return [data?.feedback, ...feedbacks];
          },
          false
        );
      } else {
        console.error("Error submitting feedback:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box marginTop={4}>
      <Typography
        variant="h5"
        fontWeight={700}
        sx={{
          border: "4px solid black",
          boxShadow: "4px 4px 0 black",
          borderRadius: "8px",
          padding: "12px",
          marginBottom: 4,
        }}
      >
        Add Feedback
      </Typography>
      <Stack spacing={2}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          sx={{
            bgcolor: "#FFF",
            padding: "16px",
            borderRadius: "8px",
            border: "4px solid #000",
            boxShadow: "4px 4px 0 #000",
          }}
        >
          <TextField
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Leave your feedback..."
            variant="outlined"
            fullWidth
            sx={{
              mr: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                border: "2px solid #000",
                boxShadow: "4px 4px 0 #000",
              },
            }}
          />
          <Button
            variant="contained"
            onClick={handleFeedbackSubmit}
            sx={{
              bgcolor: "#FB6612",
              color: "#FFF",
              "&:hover": {
                bgcolor: "#E95A10",
              },
            }}
          >
            Submit
          </Button>
        </Box>

        <Stack spacing={2}>
          {Array.isArray(feedbacks) &&
            feedbacks?.map((feedback, index) => (
              <Box
                key={index}
                sx={{
                  bgcolor: "#FFF",
                  padding: "16px",
                  borderRadius: "8px",
                  border: "4px solid #000",
                  boxShadow: "4px 4px 0 #000",
                  fontSize: { xs: "14px", md: "15px" },
                  color: "#333",
                }}
              >
                <h4 style={{ marginBottom: "4px" }}>
                  {feedback?.user?.displayName}
                </h4>
                {feedback?.text}
              </Box>
            ))}
        </Stack>
        {feedbacks?.length >= skip && (
          <Button
            variant="contained"
            onClick={handleLoadMore}
            sx={{
              marginTop: 2,
            }}
          >
            Load More
          </Button>
        )}
      </Stack>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity="warning">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FeedbackForm;
