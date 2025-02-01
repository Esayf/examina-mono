// components/create-exam/media-upload.tsx

import { useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface MediaUploadProps {
  onMediaUpload: (media: File | string) => void; // <--- Dikkat: string olarak CID dönüyoruz
}

export const MediaUpload = ({ onMediaUpload }: MediaUploadProps) => {
  const [uploadedMedia, setUploadedMedia] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      // 1. Get one-time API key
      const keyResponse = await fetch("/api/key");
      const { pinata_api_key, JWT } = await keyResponse.json();

      // 2. Upload to Pinata
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${JWT}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) throw new Error("Upload failed");

      const result = await uploadResponse.json();
      const cid = result.IpfsHash;

      // 3. Update form and preview
      setPreviewUrl(`/api/proxy?hash=${cid}`);
      setUploadedMedia(file);
      onMediaUpload(cid); // <--- Önemli: Bunu dışarı iletiyoruz
    } catch (err) {
      setError("File upload failed. Please try again.");
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveMedia = () => {
    setUploadedMedia(null);
    setPreviewUrl(null);
    onMediaUpload(""); // <--- Kaldırırsak, üst bileşene boş string gönderiyoruz.
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileChange({
        target: { files },
      } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <div className="flex flex-col gap-4 items-center border border-dashed rounded-lg p-4">
      {isUploading ? (
        <div className="w-full h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : previewUrl ? (
        <div className="relative">
          <Image
            src={previewUrl}
            alt="Preview"
            className="object-cover rounded-lg max-h-64"
            width={300}
            height={200}
          />
          <button
            type="button"
            onClick={handleRemoveMedia}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
          >
            ✕
          </button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="w-full"
        >
          <label
            htmlFor="media-upload"
            className={cn(
              "cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-600 p-3 rounded-lg",
              "text-sm text-center w-full flex items-center justify-center",
              isDragging && "bg-brand-primary-100 border-2 border-brand-primary-500"
            )}
          >
            <input
              id="media-upload"
              type="file"
              className="hidden"
              accept="image/*,video/*"
              onChange={handleFileChange}
            />
            {isDragging ? "Drop here to upload" : "Drag & drop or click to upload"}
          </label>
        </div>
      )}
      {uploadedMedia && (
        <p className="text-sm text-gray-500">
          {uploadedMedia.name} ({(uploadedMedia.size / 1024).toFixed(2)} KB)
        </p>
      )}
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};
