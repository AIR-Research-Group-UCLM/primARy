import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import ImageList from "@mui/material/ImageList";
import Typography from "@mui/material/Typography";
import SaveIcon from '@mui/icons-material/SaveAlt';
import EditIcon from '@mui/icons-material/Edit';


import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

import { KeyboardEvent, useState } from "react";

import NodeResourcesCard from "@/ui/protocols/node-resources-card";
import VisuallyHiddenInput from "@/ui/visually-hidden-input";
import { stripExtension } from "@/utils";
import { uploadFiles } from "@/mutation";

type Props = {
  isOpen: boolean;
  protocolId: number;
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

type ProvisionalItem = {
  title: string;
  img: string;
}

type ModifyingHeaderProps = {
  name: string;
  onNameChange: (name: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

function ModifyingHeader(
  { name, onNameChange, onSave, onCancel }: ModifyingHeaderProps
) {

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      onSave();
    } else if (e.key === "Escape") {
      onCancel();
    }
  }

  return (
    <>
      <TextField
        margin="dense"
        error={name === ""}
        fullWidth
        value={name}
        inputProps={{
          style: {
            textAlign: "center"
          }
        }}
        onKeyDown={onKeyDown}
        onChange={(e) => onNameChange(e.target.value)}
        maxRows={2}
        multiline
        variant="standard"
      />
      <IconButton
        disabled={name === ""}
        onClick={() => onSave()}>
        <SaveIcon />
      </IconButton>
    </>
  );
}

type NormalHeaderProps = {
  item: ProvisionalItem;
  onModifyClick: (item: ProvisionalItem) => void;
}

function NormalHeader(
  { item, onModifyClick }: NormalHeaderProps
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
        {item.title}
      </Typography>
      <IconButton onClick={() => onModifyClick(item)}>
        <EditIcon />
      </IconButton>
    </>
  );
}

export default function NodeResourcesDialog(
  { isOpen, protocolId, nodeId, handleClose }: Props
) {

  // Actually, this will be handled by SWR
  const [resources, setResources] = useState<{ img: string; title: string; }[]>(itemData);
  const [selectedResource, setSelectedResource] = useState<{ id: string; provisionalName: string } | null>(null);

  async function onFilesUpload(files: File[]) {
    if (files.length === 0) {
      return;
    }
    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file, stripExtension(file.name));
    }

    await uploadFiles({ protocolId, nodeId, formData });
  }

  function onModifyClick(item: ProvisionalItem) {
    setSelectedResource({
      id: item.img,
      provisionalName: item.title
    })
  }

  function onNameChange(name: string) {
    if (selectedResource === null) {
      return;
    }

    setSelectedResource({
      ...selectedResource,
      provisionalName: name
    });
  }

  function onSave() {
    if (selectedResource === null || selectedResource.provisionalName === "") {
      return;
    }

    setResources(
      resources.map((resource) => {
        if (resource.img !== selectedResource.id) {
          return resource;
        }
        return {
          ...resource,
          title: selectedResource.provisionalName
        };
      })
    );
    setSelectedResource(null);
  }

  function onCancel() {
    setSelectedResource(null);
  }

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
            component="label"
            variant="contained"
            size="large"
            startIcon={<CloudUploadIcon />}
            sx={{
              borderRadius: "30px"
            }}
          >
            Upload
            <VisuallyHiddenInput
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => onFilesUpload(Array.from(e.target.files || []))}
            />
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
          {resources.map((item) =>
            <NodeResourcesCard
              key={item.img}
              img={item.img}
              alt={item.title}
              header={
                selectedResource?.id === item.img ? (
                  <ModifyingHeader
                    name={selectedResource.provisionalName}
                    onNameChange={onNameChange}
                    onSave={onSave}
                    onCancel={onCancel}
                  />
                ) : (
                  <NormalHeader
                    item={item}
                    onModifyClick={onModifyClick}
                  />
                )
              }
            />
          )
          }
        </ImageList>
      </DialogContent>
    </Dialog>
  );
}