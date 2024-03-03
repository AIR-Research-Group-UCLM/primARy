"use client";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import AddIcon from '@mui/icons-material/Add';

import ProtocolCard from "@/ui/protocols/protocol-card";
import CreateProtocolDialog from "@/ui/protocols/create-protocol-dialog";

import { useState } from "react";

const myProtocol = {
  id: 9,
  name: "Overweight diagnosis"
}

export default function Page() {
  const [isDialogOpen, setDialogOpen] = useState<boolean>(false);

  return (
    <Box sx={{
      display: "flex",
      flexDirection: "column",
      backgroundColor: "inherit",
      height: "91%",
      gap: "10px"
    }}>
      <Paper elevation={5} sx={{
        border: "solid 1px",
        borderRadius: "10px",
        display: "grid",
        // gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gridTemplateColumns: "repeat(3, 1fr)",
        gridAutoRows: "200px",
        gridGap: "30px 20px",
        backgroundColor: "inherit",
        flex: "12",
        padding: "10px",
        overflow: "scroll"
      }}>
        <ProtocolCard protocol={myProtocol} />
        <ProtocolCard protocol={myProtocol} />
      </Paper>
      <Box sx={{
        display: "flex",
        justifyContent: "center",
        flex: "1",
        paddingBottom: "10px"
      }}>
        <Button
          variant="contained"
          size="medium"
          onClick={() => setDialogOpen(true)}
          sx={{
            borderRadius: "30px"
          }}
          startIcon={<AddIcon />}
        >
          Create Protocol
        </Button>
      </Box>
      <CreateProtocolDialog
        isOpen={isDialogOpen}
        handleClose={() => setDialogOpen(false)}
        onCreateClick={(name) => console.log(`Creating ${name} ...`)}
      />
    </Box>
  );
}