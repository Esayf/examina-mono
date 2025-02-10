import React, { forwardRef } from "react";
import {
  AdmonitionDirectiveDescriptor,
  BlockTypeSelect,
  CodeToggle,
  CreateLink,
  DirectiveDescriptor,
  InsertAdmonition,
  InsertCodeBlock,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  MDXEditor,
  MDXEditorMethods,
  tablePlugin,
} from "@mdxeditor/editor";
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
  directivesPlugin,
  linkPlugin,
  codeBlockPlugin,
} from "@mdxeditor/editor";
import imageCompression from "browser-image-compression";
import { PinataSDK } from "pinata-web3";

/*import "@mdxeditor/editor/style.css";*/
import "@/styles/mdxeditor.css";

import toast from "react-hot-toast";
import { pinata } from "@/utils/config";
import { KeyResponse } from "pinata-web3";
import { ListBulletIcon } from "@heroicons/react/24/outline";

interface MarkdownEditorProps {
  onChange?: (markdown: string) => void;
  markdown: string;
  readOnly?: boolean;
  className?: string;
  contentEditableClassName?: string;
  placeholder?: string;
  maxWidthOrHeight?: number;
  options?: {
    maxSizeMB?: number;
    useWebWorker?: boolean;
    initialQuality?: number;
  };
  spellCheck?: boolean;
  spellCheckOptions?: {
    language: string;
  };
  spellCheckLanguage?: string;
  spellCheckIgnoreWords?: string[];
  spellCheckIgnoreUrls?: string[];
  directiveDescriptors?: DirectiveDescriptor[];
  minLength?: number;
  maxLength?: number;
  onImageUpload?: (file: File) => Promise<string>;
  parserOptions?: {
    remarkPlugins?: any[];
    rehypePlugins?: any[];
  };
  [key: string]: any;
}

export const MarkdownEditor = forwardRef<MDXEditorMethods, MarkdownEditorProps>(
  (
    {
      onChange,
      markdown,
      readOnly,
      className,
      contentEditableClassName,
      placeholder = "contentEditable",
      spellCheck = false,
      spellCheckOptions,
      directiveDescriptors,
      minLength,
      maxLength,
      onImageUpload,
      parserOptions,
      ...props
    },
    ref
  ) => {
    const uploadFile = async (file: File) => {
      if (!file) return Promise.reject("No file selected");

      const keyRequest = await fetch("/api/key");
      const keyData = (await keyRequest.json()) as
        | { pinata_api_key: string; pinata_api_secret: string }
        | { message: string };

      if ("message" in keyData) return Promise.reject(keyData.message);

      // Create form data for the file
      const formData = new FormData();
      formData.append("file", file);

      // Upload directly to Pinata API
      const upload = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          pinata_api_key: keyData.pinata_api_key,
          pinata_secret_api_key: keyData.pinata_api_secret,
        },
        body: formData,
      });

      if (!upload.ok) {
        throw new Error("Failed to upload to Pinata");
      }

      const result = await upload.json();
      return `/api/proxy?hash=${result.IpfsHash}`;
    };

    // Ortak görsel işleme fonksiyonu
    const handleImageUpload = async (image: File) => {
      try {
        const compressionOptions = {
          maxSizeMB: 5,
          maxWidthOrHeight: 800,
          useWebWorker: true,
        };

        // Sıkıştırma ve yükleme işlemleri tek toast içinde
        const url = await toast.promise(
          imageCompression(image, compressionOptions).then((compressedFile) =>
            uploadFile(compressedFile)
          ),
          {
            loading: "Compressing image...",
            success: "Image compressed successfully",
            error: (error) => `Failed to compress image: ${error}`,
          }
        );

        return url;
      } catch (error) {
        console.error("Image upload error:", error);
        return Promise.reject(error);
      }
    };

    const plugins = [
      headingsPlugin({
        allowedHeadingLevels: [1, 2, 3, 4, 5, 6],
      }),
      listsPlugin({
        disableAutoToggle: true,
      }),
      quotePlugin({
        allowedQuoteTypes: ["block", "inline"],
      }),
      thematicBreakPlugin(),
      markdownShortcutPlugin({
        disableListAutoToggle: true, // Liste otomatik toggle özelliği devre dışı bırakıldı
      }),
      imagePlugin({
        imageUploadHandler: handleImageUpload,
      }),
      linkPlugin(),
      codeBlockPlugin(),
      directivesPlugin({ directiveDescriptors: [AdmonitionDirectiveDescriptor] }),
      tablePlugin({
        imageUploadHandler: handleImageUpload,
        disableImageResize: true,
        tableCellCustomMetadataInputs: () => [{ type: "url", label: "URL", required: true }],
      }),
    ];

    if (!readOnly)
      plugins.push(
        toolbarPlugin({
          toolbarContents: () => (
            <>
              <UndoRedo />
              <BlockTypeSelect />
              <BoldItalicUnderlineToggles />
              <CodeToggle />
              <InsertThematicBreak />
              <InsertImage />
            </>
          ),
        })
      );

    return (
      <MDXEditor
        ref={ref}
        markdown={markdown}
        onChange={onChange}
        // ideally we should not use this editor to show preview
        readOnly={readOnly}
        plugins={plugins}
        className={className ?? "mdxeditor"}
        contentEditableClassName={contentEditableClassName}
      />
    );
  }
);
