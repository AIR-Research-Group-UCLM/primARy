import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import ImageList from "@mui/material/ImageList";
import Typography from "@mui/material/Typography";
import SaveIcon from '@mui/icons-material/SaveAlt';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

import { useState } from "react";

import NodeResourcesCard from "@/ui/protocols/node-resources-card";

type Props = {
  isOpen: boolean;
  nodeId: string;
  handleClose?: () => void;
}

const itemData = [
  {
    img: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e',
    title: 'Breakfast',
  },
  {
    img: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d',
    title: 'Burger',
  },
  {
    img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
    title: 'Camera',
  },
  {
    img: 'https://images.unsplash.com/photo-1444418776041-9c7e33cc5a9c',
    title: 'Coffee',
  },
  {
    img: 'https://images.unsplash.com/photo-1533827432537-70133748f5c8',
    title: 'Hats',
  },
  {
    img: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62',
    title: 'Honey',
  },
  {
    img: 'https://images.unsplash.com/photo-1516802273409-68526ee1bdd6',
    title: 'Basketball',
  },
  {
    img: 'https://images.unsplash.com/photo-1518756131217-31eb79b20e8f',
    title: 'Fern',
  },
  {
    img: 'https://images.unsplash.com/photo-1597645587822-e99fa5d45d25',
    title: 'Mushrooms',
  },
  {
    img: 'https://images.unsplash.com/photo-1567306301408-9b74779a11af',
    title: 'Tomato basil',
  },
  {
    img: 'https://images.unsplash.com/photo-1471357674240-e1a485acb3e1',
    title: 'Sea star',
  },
  {
    img: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Tux.png',
    title: 'Bike',
  },
];

type ModifyingHeaderProps = {
  name: string;
  onNameChange: (name: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

function ModifyingHeader(
  { name, onNameChange, onSave, onCancel }: ModifyingHeaderProps
) {
  return (
    <>
      <TextField
        margin="dense"
        fullWidth
        value={name}
        inputProps={{
          style: {
            textAlign: "center"
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSave();
          } else if (e.key === "Escape") {
            onCancel();
          }
        }}
        onChange={(e) => onNameChange(e.target.value)}
        maxRows={2}
        multiline
        variant="standard"
      />
      <IconButton onClick={() => onSave()}>
        <SaveIcon />
      </IconButton>
    </>
  );
}

type NormalHeaderProps = {
  // TODO: these two attributes can be changed by the type which represents
  // the response from the backend
  name: string;
  resourceId: string;
  onModifyClick: (resourceId: string) => void;
}

function NormalHeader(
  { name, resourceId, onModifyClick }: NormalHeaderProps
) {
  return (
    <>
      <Typography
        variant="h6"
        component="div"
        sx={{
          marginBottom: "5px",
          maxHeight: "90px",
          display: "flex",
          justifyContent: "center",
          overflowY: "auto",
          flex: "1"
        }}>
        {name}
      </Typography>
      <IconButton onClick={() => onModifyClick(resourceId)}>
        <SaveIcon />
      </IconButton>
    </>
  );
}

export default function NodeResourcesDialog(
  { isOpen, nodeId, handleClose }: Props
) {

  // Actually, this will be handled by SWR
  const [resources, setResources] = useState<{ img: string; title: string; }[]>(itemData);
  const [selectedResource, setSelectedResource] = useState<{ id: string; provisionalName: string } | null>(null);

  return (
    <Dialog
      open={isOpen}
      fullWidth
      maxWidth="md"
      onClose={handleClose}
    >
      <DialogTitle>
        Node Resources
      </DialogTitle>
      <IconButton
        size="large"
        onClick={handleClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8
        }}>
        <CloseIcon />
      </IconButton>
      <DialogContent dividers>
        <Box sx={{
          display: "flex",
          justifyContent: "center",
          marginRight: "20px"
        }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<CloudUploadIcon />}
            sx={{
              borderRadius: "30px"
            }}
          >
            Upload
          </Button>
        </Box>
        <ImageList
          sx={{
            width: "100%",
            height: "100%",
            padding: "0 20px"
          }}
          cols={3}
          gap={10}
        >
          {itemData.map((item) =>
            <NodeResourcesCard
              key={item.img}
              item={item}
              provisionalName={selectedResource?.provisionalName}
              onSaveName={() => console.log("Se ha guardado")}
              onNameChange={(name) => console.log(`Cambiando a ${name}`)}
              onModifyName={(resourceId) => console.log(`Se está modificando ${resourceId}`)}
              onCancelName={() => console.log("Se ha cancelado")}
            />
          )
          }
        </ImageList>
      </DialogContent>
    </Dialog>
  );
}