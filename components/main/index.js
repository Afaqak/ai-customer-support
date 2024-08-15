"use client";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Box, Stack, Button, TextField } from "@mui/material";
import { Bot, Loader2, User } from "lucide-react";
import FeedbackForm from "@/components/feedback-form";
import useSWR, { useSWRConfig } from "swr";
import { pusherClient } from "@/utils/pusher-client";

export default function Home({ auth }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hey there! I'm the Naruto AI Support Ninja. How can I help you on your ninja journey today?",
    },
  ]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [skip, setSkip] = useState(0);
  useEffect(() => {
    const generateSessionId = () =>
      "session-" + Math.random().toString(36).substr(2, 9);

    const sessionId = localStorage.getItem("sessionId") || generateSessionId();

    localStorage.setItem("sessionId", sessionId);
  }, []);

  const handleStatus = useCallback((data) => {
    console.log("STATUS");
    setMessages((messages) => {
      const lastMessage = messages[messages.length - 1];
      const otherMessages = messages.slice(0, messages.length - 1);
      return data.removePrev
        ? [...otherMessages, { ...lastMessage, content: "" }]
        : [...otherMessages, { ...lastMessage, content: data?.status }];
    });
  }, []);

  const handleContent = useCallback((data) => {
    console.log(data, "CHUNKS");
    setMessages((messages) => {
      const updatedMessages = [...messages];
      const lastMessage = updatedMessages[updatedMessages.length - 1];
      const otherMessages = messages.slice(0, messages.length - 1);

      if (lastMessage?.content?.includes(data?.chunk)) return updatedMessages;
      lastMessage.content =
        (lastMessage.content || "") + " " + (data?.chunk || "");
      return [...otherMessages, { ...lastMessage }];
    });
  }, []);

  useEffect(() => {
    let channel;
    const sessionId = localStorage.getItem("sessionId");
    if (auth.user) {
      channel = pusherClient.subscribe(`user-${auth?.user?.id}`);
    } else {
      channel = pusherClient.subscribe(sessionId);
    }

    channel.bind("status", handleStatus);
    channel.bind("content", handleContent);

    return () => {
      channel.unbind("status", handleStatus);
      channel.unbind("content", handleContent);
      if (auth?.user?.id) {
        pusherClient.unsubscribe(`user-${auth?.user?.id}`);
      } else {
        pusherClient.unsubscribe(sessionId);
      }
    };
  }, [auth?.user?.id, handleStatus, handleContent]);

  const fetcher = useCallback(async (url) => {
    try {
      const response = await fetch(url);
      return (await response.json()) || [];
    } catch (err) {
      console.log(err);
    }
  }, []);

  const { data: feedbacks, error } = useSWR(
    "/api/feedback?skip=0&take=6",
    fetcher
  );

  const { mutate } = useSWRConfig();

  const sendMessage = useCallback(async () => {
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
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: message }],
          sessionId: localStorage.getItem("sessionId"),
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((messages) => {
        const otherMessages = messages.slice(0, messages.length - 1);

        return [
          ...otherMessages,
          {
            role: "assistant",
            content:
              "I'm sorry, but I encountered an error. Please try again later.",
          },
        ];
      });
    } finally {
      setIsLoading(false);
    }
  }, [message, messages]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleKeyPress = useCallback(
    (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleLoadMore = useCallback(async () => {
    try {
      const newSkip = skip + 6;
      const response = await fetch(`/api/feedback?skip=${newSkip}&take=${6}`);

      if (response.ok) {
        const newFeedbacks = await response.json();
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
  }, [feedbacks, mutate, skip]);

  return (
    <Box
      width="100%"
      minHeight={"100vh"}
      display="flex"
      flexDirection={{ xs: "column", sm: "row" }}
      justifyContent="center"
      gap={5}
      sx={{
        bgcolor: "#F5F5F5",
        padding: "10px",
      }}
    >
      <Stack
        marginTop={4}
        // position={"sticky"}
        position={{ xs: "relative", md: "relative" }}
        top={4}
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
          <TextField
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            placeholder="Type a message..."
            fullWidth
            sx={{ border: "black 2px solid" }}
            variant="outlined"
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            disabled={isLoading}
            sx={{
              boxShadow: "4px 4px 0 #000",
              borderRadius: "8px",
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

      <FeedbackForm
        isAuthenticated={!!auth?.session}
        skip={skip}
        setSkip={setSkip}
        feedbacks={feedbacks || []}
        handleLoadMore={handleLoadMore}
      />
    </Box>
  );
}
