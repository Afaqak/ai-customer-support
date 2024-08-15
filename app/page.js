"use client";
import { useState, useRef, useEffect } from "react";
import { Box, Stack, Button, TextField } from "@mui/material";
import { Bot, Loader2, User } from "lucide-react";
import FeedbackForm from "@/components/feedback-form";
import useSWR, { useSWRConfig } from "swr";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm the HeadStarter AI Customer Support Agent. How can I assist you today?",
    },
  ]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetcher = async (url) => {
    try {
      const response = await fetch(url);
      return await response.json();
    } catch (err) {
      console.log(err);
    }
  };

  const { data: feedbacks, error } = useSWR(
    "/api/feedback?skip=0&take=6",
    fetcher
  );
  const [skip, setSkip] = useState(0);
  const [take, setTake] = useState(6);

  const { mutate } = useSWRConfig();

  const sendMessage = async () => {
    setIsLoading(true);
    if (!message.trim()) return;

    setMessage("");
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([...messages, { role: "user", content: message }]),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ];
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((messages) => [
        ...messages,
        {
          role: "assistant",
          content:
            "I'm sorry, but I encountered an error. Please try again later.",
        },
      ]);
    }
    setIsLoading(false);
  };

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleLoadMore = async () => {
    try {
      const newSkip = skip + take;
      const response = await fetch(
        `/api/feedback?skip=${newSkip}&take=${take}`
      );

      if (response.ok) {
        const newFeedbacks = await response.json();
        console.log(newFeedbacks);
        setSkip(newSkip);

        await mutate(
          `/api/feedback?skip=0&take=6`,
          (prevData) => {
            return [...feedbacks, ...newFeedbacks];
          },
          false
        );
      } else {
        console.error("Error loading more feedbacks:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <Box
      width="100vw"
      minHeight={'100vh'}
      display="flex"
      justifyContent="center"
      gap={10}
      sx={{
        bgcolor: "#F5F5F5",
        padding: "10px",
      }}
    >
      <Stack
        marginTop={10}
        direction="column"
        width={{ xs: "100%", sm: "500px", md: "600px" }}
        height={{ xs: "90vh", md: "80vh" }}
        border="4px solid #000"
        padding={2}
        spacing={2}
        sx={{
          boxShadow: "4px 4px 0 #000",
          borderRadius: "12px",
        }}
      >
        <Stack
          direction="column"
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100vh"
          sx={{
            bgcolor: "#FFF",
            padding: "16px",
            borderRadius: "8px",
            border: "2px solid #000",
          }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === "assistant" ? "flex-start" : "flex-end"
              }
              alignItems="center"
            >
              {message.role === "assistant" ? (
                <Bot size={26} style={{ marginRight: "8px", flexShrink: 0 }} />
              ) : (
                <User size={26} style={{ marginRight: "8px", flexShrink: 0 }} />
              )}
              <Box
                bgcolor={message.role === "assistant" ? "#FB6612" : "#6C63FF"}
                color="#fff"
                borderRadius="16px"
                p={3}
                fontSize={{ xs: "15px", md: "16px" }}
                sx={{
                  boxShadow: "4px 4px 0 #000",
                  border: "2px solid #000",
                }}
              >
                {message.content}
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction="row" spacing={2}>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            placeholder="Type a message..."
            className="input_style"
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            disabled={isLoading}
            sx={{
              bgcolor: "#6C63FF",
              color: "#FFF",
              boxShadow: "4px 4px 0 #000",
              borderRadius: "8px",
              "&:hover": {
                bgcolor: "#5a53d6",
              },
            }}
          >
            {isLoading ? (
              <Loader2 size={24} className="spinning-loader" />
            ) : (
              "Send"
            )}
          </Button>
        </Stack>
      </Stack>
        
      <FeedbackForm skip={skip} setSkip={setSkip} feedbacks={feedbacks} handleLoadMore={handleLoadMore} />
    </Box>
  );
}
