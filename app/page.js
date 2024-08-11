"use client";
import { useState, useRef, useEffect } from "react";
import { Box, Stack, TextField, Button } from "@mui/material";
import { Bot, Loader2, User} from "lucide-react";
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
  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{
        bgcolor: "#F5F5F5",
        padding: "16px",
      }}
    >
      <Stack
        direction="column"
        width={{ xs: "90%", md: "600px" }}
        height={{ xs: "80%", md: "700px" }}
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
                <Bot size={26} style={{ marginRight: "8px",flexShrink:0 }} /> 
              ) : (
                <User size={26} style={{ marginRight: "8px",flexShrink:0 }} /> 
              )}
              <Box
                bgcolor={
                  message.role === "assistant"
                    ? "#FB6612"
                    : "#6C63FF" 
                }
                color="#fff"
                borderRadius="16px"
                p={3}
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
            placeholder="message"
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
    </Box>
  );
}
