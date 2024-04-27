"use client";

import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { noInitialSpace } from "@/utils";
import { useGenerateLLMResponse } from "@/mutation";

import { useState, KeyboardEvent } from "react";
import { LLMResponse } from "@/types";
import { UnsuccessfulResponse } from "@/utils";
import { CircularProgress } from "@mui/material";
import useToastMessageContext from "@/hooks/useToastMessageContext";

type MessageAreaProps = {
  role: "You" | "LLM";
  children: React.ReactNode;
}

function MessageArea({ role, children }: MessageAreaProps) {
  return (
    <Box
      sx={{
        padding: "15px 10px",
        background: role == "You" ? "#edf8fc" : "#CFD8DC",
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
          {role}
        </Typography>
        <Typography
          paragraph
          sx={{
            fontSize: "20px",
            flex: 1,
            margin: 0,
            whiteSpace: "pre-wrap"
          }}>
          {children}
        </Typography>
      </Box>
    </Box>);
}

export default function Page({ searchParams }: { searchParams: { protocol?: number } }) {
  const [messages, setMessages] = useState<string[]>([]);
  const [prompt, setPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const { trigger: triggerGenerateResponse, isMutating: isProcessingPrompt } = useGenerateLLMResponse();

  const setToastMessage = useToastMessageContext();

  async function writeLLMResponse(reader: ReadableStreamDefaultReader<LLMResponse>) {
    setIsGenerating(true);
    setMessages(["", prompt, ...messages]);

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

  async function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (prompt === "" || e.key !== "Enter") {
      return;
    }

    setPrompt("");

    try {
      const stream = await triggerGenerateResponse({ prompt, protocolId: searchParams.protocol });
      const reader = stream.getReader();
      await writeLLMResponse(reader);
    } catch (e) {
      if (!(e instanceof UnsuccessfulResponse)) {
        setToastMessage({
          type: "error",
          text: String(e)
        })
        return;
      }
      const error = e as UnsuccessfulResponse;
      setToastMessage({
        type: "error",
        text: error.status === 503 ? "The LLM is not available right now" : error.message
      });
    } finally {
      setIsGenerating(false);
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
        flexDirection: "column-reverse",
        overflow: "auto",
      }}>

        {isProcessingPrompt &&
          <MessageArea role="LLM">
            <Box sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <CircularProgress size={50} />
            </Box>
          </MessageArea>}

        {messages.map((message, index) => (
            <MessageArea role={index % 2 === 1 ? "You" : "LLM"}>
              {message}
            </MessageArea>
          ))}
      </Box>
      <TextField
        fullWidth
        inputRef={(input) => input && input.focus()}
        disabled={isGenerating}
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