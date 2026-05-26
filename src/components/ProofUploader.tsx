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
      if (disabled) return;
      e.preventDefault();
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile && droppedFile.type.startsWith("image/")) {
        setFile(droppedFile);
        setPreview(URL.createObjectURL(droppedFile));
      } else {
        toast.error(COPY.COMPONENTS.UPLOAD_IMAGE_ONLY);
      }
    },
    [disabled]
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
      <Card className="border-brand/20 bg-brand-light/20 rounded-xl overflow-hidden shadow-sm">
        <CardContent className="flex items-center gap-3 p-4">
          <CheckCircle className="h-5 w-5 text-brand" strokeWidth={1.5} />
          <span className="text-sm font-semibold text-brand-foreground">
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
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
            disabled 
              ? "opacity-50 cursor-not-allowed border-border" 
              : "border-border/80 hover:border-brand/60 hover:bg-brand-light/10"
          }`}
        >
          <div className="mx-auto w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <Upload className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <p className="text-xs font-semibold text-foreground mb-1 leading-relaxed">
            {COPY.COMPONENTS.DRAG_DROP_HINT}
          </p>
          <p className="text-[10px] text-muted-foreground mb-4">
            {COPY.COMPONENTS.OR_CLICK_SELECT}
          </p>
          <label className={disabled ? "pointer-events-none" : "cursor-pointer"}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={disabled}
            />
            <Button variant="outline" size="sm" className="tactile-btn text-xs font-semibold" disabled={disabled}>
              {COPY.COMPONENTS.SELECT_FILE}
            </Button>
          </label>
        </div>
      ) : (
        <div className="relative border border-border/80 rounded-2xl overflow-hidden bg-muted/30 p-2">
          {preview && (
            <img
              src={preview}
              alt={COPY.COMPONENTS.PROOF_PREVIEW_ALT}
              className="max-h-56 mx-auto rounded-xl object-contain shadow-xs bg-white"
            />
          )}
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-4 right-4 h-7 w-7 rounded-lg shadow-sm tactile-btn bg-destructive hover:bg-destructive/90"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </Button>
        </div>
      )}

      {file && !uploaded && (
        <Button
          onClick={handleSubmit}
          disabled={uploading || disabled}
          className="w-full h-10 tactile-btn bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm text-xs font-semibold pt-2.5 mt-2"
        >
          {uploading ? COPY.COMPONENTS.SUBMITTING_PROOF : COPY.COMPONENTS.SUBMIT_PROOF}
        </Button>
      )}
    </div>
  );
}
