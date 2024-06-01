"use client";

import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { JSONfetcher, noInitialSpace } from "@/utils";
import { useGenerateLLMResponse } from "@/mutation";

import type { GenerationMode } from "@/types";

import { useState, KeyboardEvent, useEffect } from "react";
import { LLMResponse, ProtocolSummary } from "@/types";
import { UnsuccessfulResponse } from "@/utils";
import CircularProgress from "@mui/material/CircularProgress";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import useToastMessageContext from "@/hooks/useToastMessageContext";
import LoadingSpinner from "@/ui/loading-spinner";

type Role = "You" | "LLM";

type MessageAreaProps = {
  role: Role;
  children: React.ReactNode;
}

type QAMessage = {
  role: Role;
  content: string;
}

const initialLLMMessage: QAMessage = {
  role: "LLM",
  content: ""
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

export default function Page({ searchParams }: { searchParams: { protocol?: string } }) {
  const [messages, setMessages] = useState<QAMessage[]>([]);
  const [prompt, setPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationMode, setGenerationMode] = useState<GenerationMode>("multistep");
  const { trigger: triggerGenerateResponse, isMutating: isProcessingPrompt } = useGenerateLLMResponse();

  const [protocol, setProtocol] = useState<ProtocolSummary | null>(null);
  const [protocolRequestState, setProtocolRequestState] = useState<"init" | "waiting" | "finished">("init");

  // TODO: think how this can be done in a more elegant way
  useEffect(() => {
    const abortController = new AbortController();
    async function fetchProtocols() {
      setProtocolRequestState("waiting");
      try {
        const protocols = await JSONfetcher<ProtocolSummary[]>(`${process.env.API_BASE}/protocols`, {
          method: "GET",
          signal: abortController.signal,
          headers: {
            "Accept": "application/json"
          },
        });
        setProtocol(protocols.find((protocol) => protocol.id === searchParams.protocol) ?? null);
        setProtocolRequestState("finished");
      } catch (e) {
        if (e instanceof Error && e.name === "AbortController") {
          return;
        }
        console.log(e);
      }
    }

    if (searchParams.protocol) {
      fetchProtocols();
    }

    return () => {
      if (searchParams.protocol) {
        setProtocolRequestState("finished");
        abortController.abort();
      }
    };
  }, []);

  const setToastMessage = useToastMessageContext();

  function handleSelectChange(event: SelectChangeEvent) {
    setGenerationMode(event.target.value as GenerationMode);
  }

  async function writeLLMResponse(reader: ReadableStreamDefaultReader<LLMResponse>) {
    setIsGenerating(true);
    setMessages((messages) => [initialLLMMessage, ...messages]);

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

      const partialMessage: QAMessage = {
        role: "LLM",
        content: text + "▐"
      }
      setMessages((messages) => [partialMessage, ...messages.slice(1)]);
    }
    const definitiveMessage: QAMessage = {
      role: "LLM",
      content: text
    }
    setMessages((messages) => [definitiveMessage, ...messages.slice(1)]);

  }

  async function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (prompt === "" || e.key !== "Enter") {
      return;
    }

    setPrompt("");
    const userMessage: QAMessage = {
      role: "You",
      content: prompt
    }
    setMessages([userMessage, ...messages]);

    try {
      const stream = await triggerGenerateResponse(
        { prompt, protocolId: searchParams.protocol, generationMode }
      );
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

  if (searchParams.protocol) {
    if (protocolRequestState === "waiting") {
      return <LoadingSpinner />
    }
    if (protocolRequestState === "finished" && protocol === null) {
      return (
        <Box sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <Typography variant="h1">
            There does not exist a protocol with id {searchParams.protocol}
          </Typography>
        </Box>
      );
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
              <CircularProgress size={25} />
            </Box>
          </MessageArea>}

        {messages.map((message) => (
          <MessageArea role={message.role} >
            {message.content}
          </MessageArea>
        ))}
      </Box>
      <Box sx={{
        display: "flex",
        gap: "5px"
      }}>
        <TextField
          fullWidth
          inputRef={(input) => input && input.focus()}
          disabled={isGenerating}
          label={protocol !== null ? `Prompt about '${protocol.name}'` : "Prompt"}
          value={prompt}
          onKeyDown={onKeyDown}
          onChange={(e) => setPrompt(noInitialSpace(e.target.value))}
          sx={{
            background: "white",
            marginBottom: "10px"
          }}
        />
        {searchParams.protocol && <Box sx={{
          width: "150px"
        }}>
          <FormControl fullWidth>
            <InputLabel id="generation-mode-select">Generation mode</InputLabel>
            <Select
              sx={{
                background: "white"
              }}
              labelId="generation-mode-select"
              value={generationMode}
              label="Generation Mode"
              onChange={handleSelectChange}
            >
              <MenuItem value={"multistep"}>Multistep</MenuItem>
              <MenuItem value={"concatenate"}>Concatenate</MenuItem>
            </Select>
          </FormControl>
        </Box>}
      </Box>
    </Box>
  );
}