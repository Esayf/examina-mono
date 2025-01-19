import React, { forwardRef } from "react";
import {
  AdmonitionDirectiveDescriptor,
  BlockTypeSelect,
  CodeToggle,
  CreateLink,
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
}

export const MarkdownEditor = forwardRef<MDXEditorMethods, MarkdownEditorProps>(
  (
    { onChange, markdown, readOnly, className, contentEditableClassName = "contentEditable" },
    ref
  ) => {
    const uploadFile = async (file: File) => {
      if (!file) return Promise.reject("No file selected");

      const keyRequest = await fetch("/api/key");
      const keyData = (await keyRequest.json()) as KeyResponse | { message: string };

      if ("message" in keyData) return Promise.reject(keyData.message);

      const upload = await pinata.upload.file(file).key(keyData.JWT);
      // const ipfsUrl = await pinata.gateways.convert(upload.IpfsHash);

      return `/api/proxy?hash=${upload.IpfsHash}`;
    };

    const plugins = [
      headingsPlugin({
        allowedHeadingLevels: [1, 2, 3, 4, 5, 6],
      }),
      listsPlugin(),
      quotePlugin({
        allowedQuoteTypes: ["block", "inline"],
      }),
      thematicBreakPlugin(),
      markdownShortcutPlugin(),
      imagePlugin({
        imageUploadHandler: async (image: File) => {
          return await uploadFile(image);
        },
      }),
      linkPlugin(),
      codeBlockPlugin(),
      directivesPlugin({ directiveDescriptors: [AdmonitionDirectiveDescriptor] }),
      imagePlugin({
        imageUploadHandler: async (image: File) => {
          const options = {
            maxSizeMB: 1, // Maximum file size (MB)
            useWebWorker: true, // Use Web Worker to improve performance
          };
          const url = await toast.promise(uploadFile(image), {
            loading: "Uploading image...",
            success: "Image uploaded successfully",
            error: (error) => `Failed to upload image: ${error}`,
          });

          if (!url) {
            return Promise.reject();
          }
          return Promise.resolve(url);
        },
      }),
      tablePlugin({
        imageUploadHandler: async (image: File) => {
          const options = {
            maxSizeMB: 1, // Maximum file size (MB)
            maxWidthOrHeight: 400, // Maximum width or height (pixels)
            useWebWorker: true, // Use Web Worker to improve performance
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
              <InsertTable />
              <InsertThematicBreak />
              <ListsToggle />
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
