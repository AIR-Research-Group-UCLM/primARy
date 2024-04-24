import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import ListItemIcon  from "@mui/material/ListItemIcon";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArticleIcon from '@mui/icons-material/Article';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';


import { useRouter } from "next/navigation";
import Link from "next/link";

import { useState } from "react";

import type { ProtocolSummary } from "@/types";
import DocsDialog from "../dialogs/protocol-docs";

type Props = {
  protocol: ProtocolSummary;
  onDeleteClick?: (protocol: ProtocolSummary) => void;
}


export default function ProtocolCard({ protocol, onDeleteClick }: Props) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [docDialogOpen, setDocDialogOpen] = useState<boolean>(false);

  const isMoreMenuOpen = anchorEl !== null;
  const router = useRouter();

  function onMoreButtonClick(event: React.MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget);
  }

  function onListingClose() {
    setAnchorEl(null);
  }

  return (
    <>
      <Menu
        anchorEl={anchorEl}
        open={isMoreMenuOpen}
        onClose={onListingClose}
      >
        <MenuItem onClick={() => {
          setDocDialogOpen(true);
          onListingClose();
        }}>
          <ListItemIcon>
            <ArticleIcon />
          </ListItemIcon>
          Documents
        </MenuItem>
        <MenuItem onClick={() => router.push(`/llm?protocol=${protocol.id}`)}>
          <ListItemIcon>
            <SmartToyIcon />
          </ListItemIcon>
          Chat
        </MenuItem>
      </Menu>
      <Paper
        sx={{
          border: "solid 1px",
          display: "flex",
          flex: "1",
          flexDirection: "column",
          padding: "5px",
          borderRadius: "30px",
        }}>
        <Box sx={{
          display: "flex",
          justifyContent: "end",
        }}>
          <IconButton
            size="small"
            onClick={onMoreButtonClick}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>
        <Divider />
        <Box sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "2px",
          flex: "3"
        }}>
          <Typography
            variant="h5"
            component="div"
            sx={{
              display: "flex",
              justifyContent: "center",
              height: "100%",
              alignContent: "center",
              alignItems: "center",
            }}
          >
            {protocol.name}
          </Typography>
        </Box>
        <Divider />
        <Box sx={{
          display: "flex",
          justifyContent: "space-around",
          padding: "10px 5px",
          gap: "10px",
          flex: "1"
        }}>
          <Button
            onClick={() => onDeleteClick?.(protocol)}
            size="small"
            variant="outlined"
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
          <Button
            href={`/protocols/${protocol.id}`}
            component={Link}
            size="small"
            variant="contained"
            startIcon={<EditIcon />}
          >
            Edit
          </Button>
        </Box>
      </Paper>
      <DocsDialog 
        isOpen={docDialogOpen}
        protocolId={protocol.id}
        handleClose={() => setDocDialogOpen(false)}
      />
    </>
  );
}