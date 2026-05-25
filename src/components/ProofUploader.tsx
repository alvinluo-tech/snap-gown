"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import COPY from "@/lib/constants/copy";

interface ProofUploaderProps {
  onUpload: (file: File) => Promise<void>;
  disabled?: boolean;
}

export function ProofUploader({ onUpload, disabled }: ProofUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile && droppedFile.type.startsWith("image/")) {
        setFile(droppedFile);
        setPreview(URL.createObjectURL(droppedFile));
      } else {
        toast.error(COPY.COMPONENTS.UPLOAD_IMAGE_ONLY);
      }
    },
    []
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setUploading(true);
    try {
      await onUpload(file);
      setUploaded(true);
      toast.success(COPY.COMPONENTS.PROOF_UPLOADED);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : COPY.COMPONENTS.PROOF_UPLOAD_FAILED
      );
    }
    setUploading(false);
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    setUploaded(false);
  };

  if (uploaded) {
    return (
      <Card className="border-primary/20 bg-primary/10">
        <CardContent className="flex items-center gap-3 p-4">
          <CheckCircle className="h-5 w-5 text-primary" />
          <span className="text-primary">
            {COPY.COMPONENTS.PROOF_UPLOADED_WAITING}
          </span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {!file ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
        >
          <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">
            {COPY.COMPONENTS.DRAG_DROP_HINT}
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            {COPY.COMPONENTS.OR_CLICK_SELECT}
          </p>
          <label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button variant="outline" size="sm">
              {COPY.COMPONENTS.SELECT_FILE}
            </Button>
          </label>
        </div>
      ) : (
        <div className="relative">
          {preview && (
            <img
              src={preview}
              alt={COPY.COMPONENTS.PROOF_PREVIEW_ALT}
              className="max-h-64 mx-auto rounded-lg object-contain"
            />
          )}
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {file && !uploaded && (
        <Button
          onClick={handleSubmit}
          disabled={uploading || disabled}
          className="w-full"
        >
          {uploading ? COPY.COMPONENTS.SUBMITTING_PROOF : COPY.COMPONENTS.SUBMIT_PROOF}
        </Button>
      )}
    </div>
  );
}
