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
import CircularProgress from "@mui/material/CircularProgress";

import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

import { KeyboardEvent, useState } from "react";

import FileCard from "@/ui/protocols/file-card";
import VisuallyHiddenInput from "@/ui/visually-hidden-input";

import type { UserFile } from "@/types";
import { KeyedMutator } from "swr";
import ConfirmDialog from "@/ui/dialogs/confirm";

type MutateFiles = {
  useUploadFiles: () => {
    triggerUpload: (formaData: FormData) => Promise<UserFile[]>;
    isUploading: boolean;
  }
  useChangeName: () => {
    triggerChangeName: (fileId: string, name: string) => Promise<void>;
    isChangingName: boolean;
  }
  useDeleteFile: () => {
    triggerDeleteFile: (fileId: string) => Promise<void>;
    isDeletingFile: boolean;
  }
}

type FilesRequest = {
  files: UserFile[];
  mutate: KeyedMutator<UserFile[]>;
  isLoading: boolean;
  error: any;
}

type Props = {
  isOpen: boolean;
  handleClose?: () => void;

  filesRequest: FilesRequest;
  mutateFiles: MutateFiles;
  dialogTitle: string;
  acceptMime: string;
  fileImg: (file: UserFile) => string;
  onImgClick?: (file: UserFile) => void;
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
  file: UserFile;
  onModifyClick: (nodeResource: UserFile) => void;
}

function NormalHeader(
  { file, onModifyClick }: NormalHeaderProps
) {
  return (
    <>
      <Typography
        variant="h6"
        component="div"
        align="center"
        sx={{
          marginBottom: "5px",
          maxWidth: "150px",
          maxHeight: "90px",
          overflowY: "auto",
          flex: "1"
        }}>
        {file.name}
      </Typography>
      <IconButton onClick={() => onModifyClick(file)}>
        <EditIcon />
      </IconButton>
    </>
  );
}

type SelectedFile = {
  id: string;
  provisionalName: string;
}

export default function FilesDialog(
  { isOpen, handleClose, filesRequest, mutateFiles, dialogTitle, acceptMime, fileImg, onImgClick }: Props
) {

  const { files, mutate, isLoading, error } = filesRequest;
  const { useUploadFiles, useChangeName, useDeleteFile } = mutateFiles;

  const { triggerUpload, isUploading } = useUploadFiles();
  const { triggerChangeName } = useChangeName();
  const { triggerDeleteFile } = useDeleteFile();
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);

  const [confirmDeleteFile, setConfirmDeleteFile] = useState<UserFile | null>(null);

  function onConfirmDialogClose() {
    setConfirmDeleteFile(null);
  }

  async function onConfirmDelete() {
    if (confirmDeleteFile === null) {
      return;
    }

    setConfirmDeleteFile(null);
    await triggerDeleteFile(confirmDeleteFile.id);

    const remainingFiles = files.filter((remainingFile) => remainingFile.id !== confirmDeleteFile.id);
    mutate(remainingFiles, {
      revalidate: false
    })
  }


  async function onDelete(file: UserFile) {
    setConfirmDeleteFile(file);
  }

  async function onFilesUpload(files: File[]) {
    if (files.length === 0) {
      return;
    }
    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }

    mutate(triggerUpload(formData), {
      populateCache: (newFiles, currentFiles) => (
        currentFiles === undefined ? newFiles : [...currentFiles, ...newFiles]
      ),
      revalidate: false
    });

  }

  function onModifyClick(nodeResource: UserFile) {
    setSelectedFile({
      id: nodeResource.id,
      provisionalName: nodeResource.name
    });
  }

  function onNameChange(name: string) {
    if (selectedFile === null) {
      return;
    }

    setSelectedFile({
      ...selectedFile,
      provisionalName: name
    });
  }

  async function onSave() {
    if (selectedFile === null || selectedFile.provisionalName === "") {
      return;
    }

    await triggerChangeName(
      selectedFile.id,
      selectedFile.provisionalName
    );

    const newResources = files.map((file) => {
      if (file.id !== selectedFile.id) {
        return file;
      }
      return {
        ...file,
        name: selectedFile.provisionalName
      }
    });

    mutate(newResources, {
      revalidate: false
    })

    setSelectedFile(null);
  }

  function onCancel() {
    setSelectedFile(null);
  }

  return (
    <>
      <ConfirmDialog
        isOpen={confirmDeleteFile !== null}
        title="Confirm file deletion"
        contentText={`Are you sure you want to delete the file '${confirmDeleteFile?.name}'?`}
        action="Delete"
        onActionClick={onConfirmDelete}
        onCancelClick={onConfirmDialogClose}
      />
      <Dialog
        open={isOpen && confirmDeleteFile === null}
        fullWidth
        maxWidth="md"
        onClose={handleClose}
      >
        <DialogTitle>
          {dialogTitle}
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
              disabled={isUploading}
              size="large"
              startIcon={<CloudUploadIcon />}
              sx={{
                borderRadius: "30px"
              }}
            >
              Upload
              <VisuallyHiddenInput
                type="file"
                accept={acceptMime}
                multiple
                onChange={(e) => onFilesUpload(Array.from(e.target.files || []))}
              />
            </Button>
          </Box>
          {isUploading ?
            <Box sx={{
              width: "100%",
              marginTop: "10px",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <CircularProgress size={200} />
            </Box>
            :
            <ImageList
              sx={{
                width: "100%",
                height: "100%",
                padding: "0 20px"
              }}
              cols={3}
              gap={10}
            >
              {files.map((file) =>
                <FileCard
                  key={file.id}
                  file={file}
                  onDelete={onDelete}
                  img={fileImg(file)}
                  onImgClick={onImgClick}
                  header={
                    selectedFile?.id === file.id ? (
                      <ModifyingHeader
                        name={selectedFile.provisionalName}
                        onNameChange={onNameChange}
                        onSave={onSave}
                        onCancel={onCancel}
                      />
                    ) : (
                      <NormalHeader
                        file={file}
                        onModifyClick={onModifyClick}
                      />
                    )
                  }
                />
              )
              }
            </ImageList>}
        </DialogContent>
      </Dialog>
    </>
  );
}