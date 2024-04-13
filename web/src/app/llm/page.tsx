"use client";

import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { noInitialSpace } from "@/utils";
import { generateLLMResponse } from "@/mutation";

import { useState, KeyboardEvent } from "react";

export default function Page({ searchParams }: { searchParams: { protocol?: number } }) {
  const [messages, setMessages] = useState<string[]>([]);
  const [prompt, setPrompt] = useState<string>("");

  async function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (prompt === "" || e.key !== "Enter") {
      return;
    }

    setMessages(["", prompt, ...messages]);
    setPrompt("");

    const stream = await generateLLMResponse({ prompt, protocolId: searchParams.protocol });
    const reader = stream.getReader();
    let text = "";

    while (true) {
      const { done, value: response } = await reader.read();
      if (done) {
        break;
      }

      if (text === "") {
        text += response.text.trim();
      } else {
        text += response.text;
      }

      setMessages((messages) => [text + "▐", ...messages.slice(1)]);
    }
    setMessages((messages) => [text, ...messages.slice(1)]);
  }

  return (
    <Box sx={{
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      height: "91%",
      padding: "0 25px",
      minWidth: "400px"
    }}>
      <Box sx={{
        display: "flex",
        border: "solid 1px",
        flex: "1",
        borderRadius: "10px",
        background: "#ECEFF1",
        flexDirection: "column-reverse",
        overflow: "auto",
      }}>
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              padding: "15px 10px 15px 10px",
              background: index % 2 === 1 ? "#edf8fc" : "#CFD8DC",
            }}>
            <Box sx={{
              display: "flex",
              gap: "15px"
            }}>
              <Typography
                component="div"
                sx={{
                  fontSize: "20px"
                }}
              >
                {index % 2 === 1 ? "You:" : "LLM:"}
              </Typography>
              <Typography
                paragraph
                sx={{
                  fontSize: "20px",
                  margin: 0,
                  whiteSpace: "pre-wrap"
                }}>
                {message}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
      <TextField
        fullWidth
        label="Prompt"
        value={prompt}
        onKeyDown={onKeyDown}
        onChange={(e) => setPrompt(noInitialSpace(e.target.value))}
        sx={{
          background: "white",
          marginBottom: "10px"
        }}
      />
    </Box>
  );
}