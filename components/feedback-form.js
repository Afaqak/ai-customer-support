import React, { useState } from "react";
import { Box, Typography, Stack, Button, TextField } from "@mui/material";
import { useSWRConfig } from "swr";

const FeedbackForm = ({ feedbacks, handleLoadMore, skip, setSkip }) => {
  const [feedback, setFeedback] = useState("");
  const { mutate } = useSWRConfig();
  const handleFeedbackSubmit = async () => {
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

  return (
    <Box marginTop={10}>
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

        <Stack paddingRight={1} overflow={"auto"} spacing={2}>
          {feedbacks?.map((feedback, index) => (
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
              bgcolor: "#6C63FF",
              color: "#FFF",
              "&:hover": {
                bgcolor: "#5a53d6",
              },
            }}
          >
            Load More
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default FeedbackForm;
