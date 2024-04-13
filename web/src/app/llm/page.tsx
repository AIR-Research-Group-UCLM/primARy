"use client";

import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { noInitialSpace } from "@/utils";

import { useState, KeyboardEvent } from "react";

export default function Page({ searchParams }: { searchParams: { protocol: string } }) {
  const [messages, setMessages] = useState<string[]>([]);
  const [prompt, setPrompt] = useState<string>("");

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (prompt !== "" && e.key === "Enter") {
      setMessages([...messages, prompt]);
      setPrompt("");
    }
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
        flexDirection: "column",
        overflow: "auto",
      }}>
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              padding: "15px 10px 15px 10px",
              background: index % 2 === 0 ? "#ECEFF1" : "#CFD8DC",
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
                {index % 2 === 0 ? "You:" : "LLM:"}
              </Typography>
              <Typography
                paragraph
                sx={{
                  fontSize: "20px",
                  margin: 0
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