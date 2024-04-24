import { useUploadNodeResources, useChangeResourceName, useDeleteResourceNode } from "@/mutation";
import useNodeResources from "@/hooks/useNodeResources";
import type { UserFile } from "@/types";

import FilesDialog from "@/ui/dialogs/files-dialog";

type Props = {
  isOpen: boolean;
  protocolId: string;
  nodeId: string;
  handleClose?: () => void;
}

export default function NodeResourcesDialog(
  { isOpen, protocolId, nodeId, handleClose }: Props
) {

  const resourceRequest = useNodeResources(protocolId, nodeId);
  const filesRequest = {
    ...resourceRequest,
    files: resourceRequest.nodeResources
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
      filesRequest={filesRequest}
      mutateFiles={{
        useUploadFiles, useChangeName, useDeleteFile
      }}
      dialogTitle="Node resources"
      acceptMime="image/*"
      fileImg={fileImg}
    />
  );
}