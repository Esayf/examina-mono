import React, { forwardRef } from "react";
import { CodeToggle, MDXEditor, MDXEditorMethods } from "@mdxeditor/editor";
import {
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  imagePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  InsertImage,
} from "@mdxeditor/editor";
import imageCompression from "browser-image-compression";

import "@mdxeditor/editor/style.css";

import toast from "react-hot-toast";
import { pinata } from "@/utils/config";
import { KeyResponse } from "pinata-web3";

interface MarkdownEditorProps {
  onChange: (markdown: string) => void;
  markdown: string;
}

export const MarkdownEditor = forwardRef<MDXEditorMethods, MarkdownEditorProps>(
  ({ onChange, markdown }, ref) => {
    const uploadFile = async (file: File) => {
      if (!file) return Promise.reject("No file selected");

      const keyRequest = await fetch("/api/key");
      const keyData = (await keyRequest.json()) as KeyResponse | { message: string };

      if ("message" in keyData) return Promise.reject(keyData.message);

      const upload = await pinata.upload.file(file).key(keyData.JWT);
      // const ipfsUrl = await pinata.gateways.convert(upload.IpfsHash);

      return `/api/proxy?hash=${upload.IpfsHash}`;
    };

    return (
      <MDXEditor
        ref={ref}
        markdown={markdown}
        onChange={onChange}
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          markdownShortcutPlugin(),
          imagePlugin({
            imageUploadHandler: async (image) => {
              const options = {
                maxSizeMB: 1, // Maksimum dosya boyutu (MB)
                maxWidthOrHeight: 400, // Maksimum genişlik veya yükseklik (piksel)
                useWebWorker: true, // Web Worker kullanarak performansı artırma
              };
              const compressedFile = await toast.promise(imageCompression(image, options), {
                loading: "Compressing image...",
                success: "Image compressed successfully",
                error: (error) => `Failed to compress image: ${error}`,
              });
              const url = await toast.promise(uploadFile(compressedFile), {
                loading: "Uploading image...",
                success: "Image uploaded successfully",
                error: (error) => `Failed to upload image: ${error}`,
              });

              if (!url) {
                return Promise.reject();
              }
              return Promise.resolve(url);
            },
            disableImageResize: true,
          }),
          toolbarPlugin({
            toolbarContents: () => (
              <>
                <UndoRedo />
                <BoldItalicUnderlineToggles />
                <CodeToggle />
                <InsertImage />
              </>
            ),
          }),
        ]}
      />
    );
  }
);

MarkdownEditor.displayName = "MarkdownEditor";
