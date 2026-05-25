"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Upload, X, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import COPY from "@/lib/constants/copy";

interface ImageUploaderProps {
  currentUrl?: string | null;
  onUpload: (file: File) => Promise<void>;
  accept?: string;
  maxSizeMB?: number;
  shape?: "circle" | "square";
  placeholder?: string;
  disabled?: boolean;
}

export function ImageUploader({
  currentUrl,
  onUpload,
  accept = "image/*",
  maxSizeMB = 2,
  shape = "circle",
  placeholder,
  disabled = false,
}: ImageUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isCircle = shape === "circle";

  const validateFile = useCallback(
    (f: File): boolean => {
      if (!f.type.startsWith("image/")) {
        toast.error(COPY.COMPONENTS.UPLOAD_IMAGE_ONLY);
        return false;
      }
      if (f.size > maxSizeMB * 1024 * 1024) {
        toast.error(COPY.PROFILE.AVATAR_HINT);
        return false;
      }
      return true;
    },
    [maxSizeMB],
  );

  const handleFile = useCallback(
    (f: File) => {
      if (validateFile(f)) {
        if (preview) URL.revokeObjectURL(preview);
        setFile(f);
        setPreview(URL.createObjectURL(f));
      }
    },
    [validateFile, preview],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFile(droppedFile);
    },
    [handleFile],
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) handleFile(selectedFile);
    e.target.value = "";
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      await onUpload(file);
      if (preview) URL.revokeObjectURL(preview);
      setFile(null);
      setPreview(null);
      toast.success(COPY.PROFILE.AVATAR_UPLOAD_SUCCESS);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : COPY.PROFILE.AVATAR_UPLOAD_FAILED,
      );
    }
    setUploading(false);
  };

  const handleCancel = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
  };

  const triggerFileInput = () => {
    inputRef.current?.click();
  };

  const renderImage = (url: string, alt: string) => {
    if (isCircle) {
      return (
        <Avatar className="size-24">
          <AvatarImage src={url} alt={alt} />
          <AvatarFallback>
            <ImageIcon className="size-8 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
      );
    }
    return (
      <img src={url} alt={alt} className="max-h-48 rounded-lg object-contain" />
    );
  };

  // State 1: File selected, showing preview with upload/cancel buttons
  if (preview) {
    return (
      <div className="space-y-3">
        <div className="relative inline-block">
          {renderImage(preview, COPY.PROFILE.AVATAR_LABEL)}
          <Button
            variant="destructive"
            size="icon-xs"
            className="absolute top-1 right-1"
            onClick={handleCancel}
            disabled={uploading}
          >
            <X className="size-3" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleUpload}
            disabled={uploading || disabled}
            className="flex-1"
          >
            {uploading ? COPY.COMMON.UPDATING : COPY.COMMON.SUBMIT}
          </Button>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={uploading}
          >
            {COPY.COMMON.CANCEL}
          </Button>
        </div>
      </div>
    );
  }

  // State 2: Current image exists, show with change overlay
  if (currentUrl) {
    return (
      <div className="space-y-3">
        <div className="relative inline-block group/image">
          {renderImage(currentUrl, COPY.PROFILE.AVATAR_LABEL)}
          <div
            className={`absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover/image:opacity-100 transition-opacity cursor-pointer ${
              isCircle ? "rounded-full" : "rounded-lg"
            }`}
            onClick={triggerFileInput}
          >
            <span className="text-white text-sm font-medium">
              {COPY.PROFILE.EDIT_PROFILE}
            </span>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
      </div>
    );
  }

  // State 3: No image, show dashed drop zone
  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`border-2 border-dashed text-center cursor-pointer hover:border-primary/50 transition-colors ${
          isCircle
            ? "rounded-full aspect-square flex flex-col items-center justify-center p-4"
            : "rounded-lg p-6"
        }`}
      >
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground mb-1">
          {placeholder || COPY.PROFILE.AVATAR_LABEL}
        </p>
        <p className="text-xs text-muted-foreground">
          {COPY.PROFILE.AVATAR_HINT}
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}
