import { removeImage, uploadImage } from "@/api/storageApi";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation } from "@tanstack/react-query";
import { Edit, Save, Trash } from "lucide-react";
import Image from "next/image";
import React, { FC, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";

interface EditableImageProps {
  imageUrl?: string;
  setImageUrl: (url: string) => void;

  className?: string;
  borderRadiusClass?: string;
  username?: string;
  placeholderText?: string;
  imageWidth?: number;
  imageHeight?: number;
  onDeleteSuccessMsg?: string;
  onDeleteErrorMsg?: string;

  renderActions?: (params: {
    selectedFile: File | null;
    isUploading: boolean;
    isDeleting: boolean;
    handleSaveClick: () => void;
    handleEditClick: () => void;
    handleDeleteClick: () => void;
  }) => React.ReactNode;

  hideActions?: boolean;
  instantUpload?: boolean;

  muted?: boolean;
}

/**
 * EditableImage component:
 * 1) Displays a placeholder if there's no current or preview image.
 * 2) Clicking the placeholder or current image opens a file chooser.
 * 3) If a file is selected, user can "Save" to upload via React Query.
 * 4) If there's an existing image, user can "Delete" it (calls removeImage).
 */
const EditableImage: FC<EditableImageProps> = ({
  imageUrl,
  setImageUrl,
  className,
  username = "",
  borderRadiusClass = "rounded-full",
  placeholderText = username.charAt(0).toUpperCase() + username.charAt(1).toUpperCase(),
  imageWidth = 200,
  imageHeight = 200,
  onDeleteSuccessMsg = "Image removed",
  onDeleteErrorMsg = "Error removing image",
  renderActions,
  hideActions,
  instantUpload,
  muted,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    mutate: mutateUpload,
    isPending: isUploading,
    isError: uploadError,
  } = useMutation({
    mutationFn: (file: File) => uploadImage(file),
    onSuccess: (newUrl) => {
      setImageUrl(newUrl);
      setSelectedFile(null);
      setPreviewSrc(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (url?: string) => {
      if (url) {
        await removeImage(url);
        setImageUrl("");
        setSelectedFile(null);
        setPreviewSrc(null);
        return onDeleteSuccessMsg;
      } else {
        setSelectedFile(null);
        setPreviewSrc(null);
        return "No image to remove";
      }
    },
    onSuccess: (message) => {
      toast.success(message);
    },
    onError: (err) => {
      console.error(err);
      toast.error(onDeleteErrorMsg);
    },
  });

  const handleEditClick = () => {
    if (muted) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (instantUpload) {
        mutateUpload(file);
      }
      setPreviewSrc(URL.createObjectURL(file));
    }
  };

  const handleSaveClick = () => {
    if (selectedFile) {
      mutateUpload(selectedFile);
    }
  };

  const handleDeleteClick = () => {
    deleteMutation.mutate(imageUrl);
  };

  const hasPreviewOrUrl = previewSrc || imageUrl;
  const showError = uploadError; // or isError
  const isDeleting = deleteMutation.isPending;

  const renderDefaultActions = () => (
    <div className="flex w-full gap-2 absolute -bottom-6">
      {/* If a new file is selected, show Save button */}
      {selectedFile && !isUploading ? (
        <Button type="button" onClick={handleSaveClick} className="h-10 flex-1">
          <Save />
        </Button>
      ) : (
        // Otherwise show edit button
        <Button type="button" onClick={handleEditClick} className="h-10 flex-1">
          <Edit />
        </Button>
      )}

      {/* Delete button */}
      <Button
        type="button"
        variant="destructive"
        onClick={handleDeleteClick}
        disabled={isDeleting}
        className="h-10 flex-1"
      >
        <Trash />
      </Button>
    </div>
  );

  return (
    <div className={`relative ${className ?? ""}`}>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {isUploading && (
        <Skeleton className={`w-full h-full ${borderRadiusClass}`} />
      )}

      {!!hasPreviewOrUrl && !isUploading ? (
        <div
          className={`relative w-full h-full ${!muted && "cursor-pointer"} overflow-hidden ${borderRadiusClass}`}
          onClick={handleEditClick}
        >
          <Image
            src={hasPreviewOrUrl}
            alt="Editable"
            width={imageWidth}
            height={imageHeight}
            className={`object-cover w-full h-full ${borderRadiusClass}`}
          />
        </div>
      ) : null}

      {!hasPreviewOrUrl && !isUploading && (
        <div
          className={`flex items-center justify-center border border-black cursor-pointer hover:opacity-80 w-full h-full ${borderRadiusClass}`}
          onClick={handleEditClick}
        >
          <p className="text-center px-2 text-2xl">{placeholderText}</p>
        </div>
      )}

      {!hideActions
        ? renderActions
          ? renderActions({
              selectedFile,
              isUploading,
              isDeleting,
              handleSaveClick,
              handleEditClick,
              handleDeleteClick,
            })
          : renderDefaultActions()
        : null}

      {showError && (
        <div className="text-red-600 mt-2">Error uploading the image</div>
      )}
    </div>
  );
};

export default EditableImage;
