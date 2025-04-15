"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { ArrowUpCircle } from "lucide-react";

interface Props {
  onUploadComplete: () => Promise<void>;
}

export default function ReplayUpload({
  onUploadComplete,
}: Props): React.ReactElement {
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      setUploading(true);
      setError(null);

      const duplicates: string[] = [];

      try {
        for (const file of acceptedFiles) {
          const formData = new FormData();
          formData.append("file", file);

          try {
            const response = await fetch("/api/replays", {
              method: "POST",
              body: formData,
            });

            if (!response.ok) {
              const errorData = await response.json();
              console.error(
                `Failed to upload ${file.name}:`,
                errorData.message,
              );
              continue;
            }

            const replay = await response.json();

            if (replay.isDuplicate) {
              duplicates.push(file.name);
            }
          } catch (err) {
            console.error(`Error uploading ${file.name}:`, err);
          }
        }

        if (duplicates.length > 0) {
          const pluralText =
            duplicates.length === 1 ? "file has" : "files have";
          setError(
            `${duplicates.length} ${pluralText} already been processed: ${duplicates.join(", ")}`,
          );
        }

        await onUploadComplete();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to upload replays",
        );
      } finally {
        setUploading(false);
      }
    },
    [onUploadComplete],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/octet-stream": [".replay"],
    },
    maxFiles: 10,
    disabled: uploading,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-purple-500 bg-purple-900/20"
            : "border-zinc-700 hover:border-zinc-500"
        }`}
      >
        <input {...getInputProps()} />
        <ArrowUpCircle className="w-12 h-12 mx-auto mb-3 text-zinc-500" />
        <p className="text-base mb-2">
          {isDragActive
            ? "Drop the replay files here"
            : "Drag & drop replay files here, or click to select"}
        </p>
        <p className="text-xs text-zinc-500">
          Upload up to 10 .replay files at once
        </p>
        {uploading && (
          <div className="mt-4">
            <div className="w-full bg-zinc-800 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full animate-pulse w-full"></div>
            </div>
            <p className="mt-2 text-xs text-zinc-500">Uploading...</p>
          </div>
        )}
        {error && <p className="mt-4 text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
}
