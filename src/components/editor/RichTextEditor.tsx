import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  FaBold,
  FaItalic,
  FaListUl,
  FaListOl,
  FaCode,
  FaQuoteLeft,
  FaUndo,
  FaRedo,
} from "react-icons/fa";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="editor-toolbar">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`toolbar-button ${
          editor.isActive("bold") ? "is-active" : ""
        }`}
        title="太字 (Ctrl+B)"
      >
        <FaBold />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`toolbar-button ${
          editor.isActive("italic") ? "is-active" : ""
        }`}
        title="斜体 (Ctrl+I)"
      >
        <FaItalic />
      </button>
      <div className="toolbar-divider" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`toolbar-button ${
          editor.isActive("bulletList") ? "is-active" : ""
        }`}
        title="箇条書き"
      >
        <FaListUl />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`toolbar-button ${
          editor.isActive("orderedList") ? "is-active" : ""
        }`}
        title="番号付きリスト"
      >
        <FaListOl />
      </button>
      <div className="toolbar-divider" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`toolbar-button ${
          editor.isActive("codeBlock") ? "is-active" : ""
        }`}
        title="コードブロック"
      >
        <FaCode />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`toolbar-button ${
          editor.isActive("blockquote") ? "is-active" : ""
        }`}
        title="引用"
      >
        <FaQuoteLeft />
      </button>
      <div className="toolbar-divider" />
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="toolbar-button"
        title="元に戻す (Ctrl+Z)"
      >
        <FaUndo />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="toolbar-button"
        title="やり直し (Ctrl+Shift+Z)"
      >
        <FaRedo />
      </button>
    </div>
  );
};

export default function RichTextEditor({
  content,
  onChange,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "説明を入力してください...",
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="rich-editor">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
}
