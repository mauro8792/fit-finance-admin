"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import Image from "next/image";
import { uploadImage } from "@/lib/api";
import { toast } from "sonner";

interface ImageUploaderProps {
  label: string;
  currentUrl?: string;
  onUploaded: (url: string) => void;
  folder?: string;
  variant?: "dark" | "light";
  requireSquare?: boolean;
  minSize?: number;
}

function validateDimensions(
  file: File,
  requireSquare: boolean,
  minSize: number
): Promise<{ valid: boolean; message?: string }> {
  return new Promise((resolve) => {
    if (file.type === "image/svg+xml") {
      resolve({ valid: true });
      return;
    }
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      if (requireSquare && Math.abs(img.width - img.height) > 10) {
        resolve({ valid: false, message: `La imagen debe ser cuadrada (recibida: ${img.width}×${img.height})` });
        return;
      }
      if (minSize && (img.width < minSize || img.height < minSize)) {
        resolve({ valid: false, message: `La imagen debe ser al menos ${minSize}×${minSize}px (recibida: ${img.width}×${img.height})` });
        return;
      }
      resolve({ valid: true });
    };
    img.onerror = () => resolve({ valid: true });
    img.src = URL.createObjectURL(file);
  });
}

export default function ImageUploader({
  label,
  currentUrl,
  onUploaded,
  folder = "fit-finance/organizations",
  variant = "dark",
  requireSquare = false,
  minSize = 0,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(
    async (file: File) => {
      // Validar tipo
      const allowed = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",
        "image/svg+xml",
      ];
      if (!allowed.includes(file.type)) {
        toast.error("Solo se permiten PNG, JPG, WEBP o SVG");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("El archivo no puede superar los 5MB");
        return;
      }

      if (requireSquare || minSize) {
        const check = await validateDimensions(file, requireSquare, minSize);
        if (!check.valid) {
          toast.error(check.message!);
          return;
        }
      }

      setUploading(true);
      try {
        const result = await uploadImage(file, folder);
        setPreview(result.url);
        onUploaded(result.url);
        toast.success("Imagen subida correctamente");
      } catch (err: any) {
        const msg =
          err.response?.data?.message || "Error subiendo la imagen";
        toast.error(typeof msg === "string" ? msg : msg[0]);
      } finally {
        setUploading(false);
      }
    },
    [folder, onUploaded]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    // Reset input para permitir re-subir el mismo archivo
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onUploaded("");
  };

  const bgPreview =
    variant === "light" ? "bg-white" : "bg-[#0a0a0f]";

  return (
    <div className="space-y-2">
      <label className="text-xs text-text-muted font-medium">{label}</label>

      {preview ? (
        <div className="relative group">
          <div
            className={`${bgPreview} rounded-lg border border-border p-4 flex items-center justify-center min-h-[100px]`}
          >
            <Image
              src={preview}
              alt={label}
              width={200}
              height={80}
              className="max-h-[80px] w-auto object-contain"
              unoptimized
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-red-500/90 hover:bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            title="Eliminar imagen"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
            ${
              dragOver
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50 hover:bg-surface/50"
            }
            ${uploading ? "pointer-events-none opacity-60" : ""}
          `}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <p className="text-xs text-text-muted">Subiendo...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="p-2 rounded-lg bg-surface">
                <Upload className="w-5 h-5 text-text-muted" />
              </div>
              <div>
                <p className="text-xs text-text-muted">
                  Arrastrá una imagen o{" "}
                  <span className="text-primary font-medium">
                    hacé click para elegir
                  </span>
                </p>
                <p className="text-[10px] text-text-dim mt-1">
                  PNG, JPG, WEBP o SVG - Máx 5MB
                  {requireSquare && ` — Cuadrada, mín ${minSize}×${minSize}px`}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
