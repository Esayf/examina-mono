import {
  FaImages as FaImage
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Modal } from "../ui/modal";
import { useState } from "react";
import { pinata } from "@/utils/config";
import { KeyResponse } from "pinata-web3";

// TODO: bu fonksiyonu başka bir yerde de kullanıyoruz, bunu bir utils klasörüne taşıyabiliriz
const uploadFile = async (file: File) => {
  if (!file) return Promise.reject("No file selected");
  const keyRequest = await fetch("/api/key");
  const keyData = (await keyRequest.json()) as KeyResponse | { message: string };

  if ("message" in keyData) return Promise.reject(keyData.message);

  const upload = await pinata.upload.file(file).key(keyData.JWT);

  return `/api/proxy?hash=${upload.IpfsHash}`;
};

// TODO: bu componentın bir form field olacak şekilde düzenlenmesi gerekiyor
const BackGroundImageUploader = () => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<String | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleCancel = () => {
    setIsImageModalOpen(false);
    setSelectedImage(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file: File | undefined = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => setSelectedImage(file);
    reader.readAsDataURL(file);
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
    const file: File | undefined = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onloadend = () => setSelectedImage(file);
    reader.readAsDataURL(file);
  };

  const handleSaveAsBackground = async () => {
    console.log("save as background");
    setIsImageModalOpen(false);
    if (!selectedImage) return;
    
    const imageUrl = await uploadFile(selectedImage);
    console.log("imageUrl", imageUrl);
    setUploadedImageUrl(imageUrl);
  }
  
  // TODO: remove image from pinata
  // only if there are no other exams using this image
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setUploadedImageUrl(null);
  }

  return (
    <>
      <p className="text-lg font-bold text-brand-primary-950">4. Background image</p>
      <Button
        onClick={()=>{setIsImageModalOpen(true)}}
        disabled={false}
        // TODO: className is too long and repetitive, we can store it in a variable
        className={`
        group
        relative inline-flex items-center justify-center
        px-5 py-3
        font-medium text-brand-secondary-200
        rounded-full
        bg-brand-primary-900

        transform-gpu
        transition-all duration-300 ease-out

        /* Hover/Active tepkileri */
        hover:-translate-y-0.5
        hover:scale-105
        active:scale-95
        active:translate-y-0

        /* Gölge */
        shadow-sm
        hover:shadow-md
        active:shadow-sm

        focus:outline-none
        focus-visible:ring-2
        focus-visible:ring-offset-2
        focus-visible:ring-brand-primary-800
      `}
      >
        <span className="hidden sm:inline">Upload</span>
        <FaImage className={`w-6 h-6 sm:ml-2`}/>
      </Button>

      {/* TODO: Insert !mt-0 to modal className */}
      <Modal isOpen={isImageModalOpen} onClose={handleCancel} title="Upload background image">
        <div className="text-brand-primary-950 font-normal">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
              isDragging ? 'border-brand-primary-600 bg-brand-primary-50' : 'border-gray-300'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {selectedImage ? (
              <div className="space-y-4">
                <img
                  src={URL.createObjectURL(selectedImage)}
                  alt="Preview"
                  className="max-h-64 mx-auto rounded-lg"
                />
                <Button
                  variant="outline"
                  onClick={handleRemoveImage}
                  className="mt-2"
                >
                  Remove Image
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <FaImage className="w-12 h-12 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">
                    Drag and drop your image here, or click to select
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    Select Image
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4">
            <Button
              variant="default"
              onClick={handleSaveAsBackground}
              disabled={!selectedImage}
            >
              Save As Background
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default BackGroundImageUploader;