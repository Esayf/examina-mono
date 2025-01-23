import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useFormContext } from "react-hook-form";

interface MediaUploadProps {
  onMediaUpload: (media: File | string) => void;
}

export const MediaUpload = ({ onMediaUpload }: MediaUploadProps) => {
  const [uploadedMedia, setUploadedMedia] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { register, setValue } = useFormContext();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedMedia(file);
      setPreviewUrl(URL.createObjectURL(file));
      onMediaUpload(file);
    }
  };

  const handleRemoveMedia = () => {
    setUploadedMedia(null);
    setPreviewUrl(null);
    onMediaUpload("");
  };

  return (
    <div className="flex flex-col gap-4 items-center border border-dashed rounded-lg p-4">
      {!previewUrl ? (
        <label
          htmlFor="media-upload"
          className={cn(
            "cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-600 p-3 rounded-lg",
            "text-sm text-center w-full flex items-center justify-center"
          )}
        >
          <input
            id="media-upload"
            type="file"
            className="hidden"
            accept="image/*,video/*"
            onChange={handleFileChange}
          />
          Upload media by clicking or dragging and dropping.
        </label>
      ) : (
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
      )}
      {uploadedMedia && (
        <p className="text-sm text-gray-500">
          {uploadedMedia.name} ({(uploadedMedia.size / 1024).toFixed(2)} KB)
        </p>
      )}
    </div>
  );
};
