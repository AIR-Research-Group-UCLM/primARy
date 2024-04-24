import { useUploadNodeResources, useChangeResourceName, useDeleteResourceNode } from "@/mutation";
import useNodeResources from "@/hooks/useNodeResources";
import type { UserFile } from "@/types";

import FilesDialog from "@/ui/dialogs/files-dialog";

type Props = {
  isOpen: boolean;
  protocolId: number;
  nodeId: string;
  handleClose?: () => void;
}

export default function NodeResourcesDialog(
  { isOpen, protocolId, nodeId, handleClose }: Props
) {

  function getFiles() {
    const { nodeResources, isLoading, mutate, error } = useNodeResources(protocolId, nodeId);
    return {
      files: nodeResources,
      isLoading,
      mutate,
      error
    }
  }

  function useUploadFiles() {
    const { trigger, isMutating } = useUploadNodeResources();
    return {
      triggerUpload: (formData: FormData) => trigger({ protocolId, nodeId, formData }),
      isUploading: isMutating
    }
  }

  function useChangeName() {
    const { trigger, isMutating } = useChangeResourceName();
    return {
      triggerChangeName: (fileId: string, name: string) => trigger({ protocolId, nodeId, resourceId: fileId, name }),
      isChangingName: isMutating
    }
  }

  function useDeleteFile() {
    const { trigger, isMutating } = useDeleteResourceNode();
    return {
      triggerDeleteFile: (fileId: string) => trigger({protocolId, nodeId, resourceId: fileId}),
      isDeletingFile: isMutating
    }
  }

  function fileImg(file: UserFile) {
    return `${process.env.API_BASE}/static/nodes/${file.filename}`;
  }


  return (
    <FilesDialog
      isOpen={isOpen}
      handleClose={handleClose}
      useGetFiles={getFiles}
      mutateFiles={{
        useUploadFiles, useChangeName, useDeleteFile
      }}
      dialogTitle="Node resources"
      acceptMime="image/*"
      fileImg={fileImg}
    />
  );
}