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
import { useUploadFiles, useChangeResourceName } from "@/mutation";

// TODO: these imports are not necessary if we create a custom hook for the resources
import type { NodeResource } from "@/types";
import useNodeResources from "@/hooks/useNodeResources";

type Props = {
  isOpen: boolean;
  protocolId: number;
  nodeId: string;
  handleClose?: () => void;
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
  nodeResource: NodeResource;
  onModifyClick: (nodeResource: NodeResource) => void;
}

function NormalHeader(
  { nodeResource, onModifyClick }: NormalHeaderProps
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
        {nodeResource.name}
      </Typography>
      <IconButton onClick={() => onModifyClick(nodeResource)}>
        <EditIcon />
      </IconButton>
    </>
  );
}

type SelectedResource = {
  id: number;
  provisionalName: string;
}

export default function NodeResourcesDialog(
  { isOpen, protocolId, nodeId, handleClose }: Props
) {

  const { nodeResources, mutate } = useNodeResources(protocolId, nodeId);
  const {triggerUploadFiles, isUploadingFiles} = useUploadFiles();
  const {triggerChangeResourceName, isChangingResourceName} = useChangeResourceName();
  const [selectedResource, setSelectedResource] = useState<SelectedResource | null>(null);

  const showProgressBar = isUploadingFiles || isChangingResourceName;


  async function onFilesUpload(files: File[]) {
    if (files.length === 0) {
      return;
    }
    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }

    mutate(triggerUploadFiles({ protocolId, nodeId, formData }), {
      populateCache: (newResources, currentResources) => (
        currentResources === undefined ? newResources : [...currentResources, ...newResources]
      ),
      revalidate: false
    });

  }

  function onModifyClick(nodeResource: NodeResource) {
    setSelectedResource({
      id: nodeResource.id,
      provisionalName: nodeResource.name
    });
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

  async function onSave() {
    if (selectedResource === null || selectedResource.provisionalName === "") {
      return;
    }

    await triggerChangeResourceName(
      {
        protocolId,
        nodeId,
        resourceId: selectedResource.id,
        name: selectedResource.provisionalName
      }
    );

    const newResources = nodeResources.map((nodeResource) => {
      if (nodeResource.id !== selectedResource.id) {
        return nodeResource;
      }
      return {
        ...nodeResource,
        name: selectedResource.provisionalName
      }
    });

    mutate(newResources, {
      revalidate: false
    })

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
          {nodeResources.map((nodeResource) =>
            <NodeResourcesCard
              key={nodeResource.id}
              // TODO: use ENV VAR for this
              img={`${process.env.API_BASE}/static/${nodeResource.filename}`}
              alt={nodeResource.name}
              header={
                selectedResource?.id === nodeResource.id ? (
                  <ModifyingHeader
                    name={selectedResource.provisionalName}
                    onNameChange={onNameChange}
                    onSave={onSave}
                    onCancel={onCancel}
                  />
                ) : (
                  <NormalHeader
                    nodeResource={nodeResource}
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