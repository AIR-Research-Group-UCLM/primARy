import { useUploadDocs, useChangeDocName, useDeleteDoc } from "@/mutation";
import useDocs from "@/hooks/useDocs";
import type { UserFile } from "@/types";

import FilesDialog from "@/ui/dialogs/files-dialog";

type Props = {
  isOpen: boolean;
  protocolId: number;
  handleClose?: () => void;
}

export default function DocsDialog(
  { isOpen, protocolId, handleClose }: Props
) {

  function getFiles() {
    const { docs, isLoading, mutate, error } = useDocs(protocolId);
    return {
      files: docs,
      isLoading,
      mutate,
      error
    }
  }

  function useUploadFiles() {
    const { trigger, isMutating } = useUploadDocs();
    return {
      triggerUpload: (formData: FormData) => trigger({ protocolId, formData }),
      isUploading: isMutating
    }
  }

  function useChangeName() {
    const { trigger, isMutating } = useChangeDocName();
    return {
      triggerChangeName: (fileId: string, name: string) => trigger({ protocolId, docId: fileId, name }),
      isChangingName: isMutating
    }
  }

  function useDeleteFile() {
    const { trigger, isMutating } = useDeleteDoc();
    return {
      triggerDeleteFile: (fileId: string) => trigger({ protocolId, docId: fileId }),
      isDeletingFile: isMutating
    }
  }

  function fileImg(file: UserFile) {
    const logoFile = file.filename.endsWith(".pdf") ? "pdf.png" : "txt.png";
    return `${process.env.API_BASE}/static/logos/${logoFile}`;
  }


  return (
    <FilesDialog
      isOpen={isOpen}
      handleClose={handleClose}
      useGetFiles={getFiles}
      mutateFiles={{
        useUploadFiles, useChangeName, useDeleteFile
      }}
      dialogTitle="Protocol's documents"
      acceptMime="text/plain, application/pdf"
      fileImg={fileImg}
    />
  );
}