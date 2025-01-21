import React from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface TiptapEditorProps {
  /** Form’dan gelen değer (HTML vb.) */
  value?: string;
  /** Form’un onChange fonksiyonu */
  onChange: (val: string) => void;
}

export const TiptapEditor: React.FC<TiptapEditorProps> = ({
  value = "",
  onChange,
}) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-greyscale-light-200 rounded-lg p-2 min-h-[120px]">
      <EditorContent editor={editor} />
    </div>
  );
};
