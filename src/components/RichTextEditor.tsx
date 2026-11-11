import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Undo2, Redo2, Pilcrow } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function RichTextEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: { class: "prose-terms min-h-[320px] max-h-[60vh] overflow-y-auto px-4 py-3 text-sm focus:outline-none" },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML() && !editor.isFocused) editor.commands.setContent(value);
  }, [value, editor]);

  const Btn = ({ on, active, label, children }: { on: () => void; active?: boolean; label: string; children: ReactNode }) => (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={on}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground",
        active && "bg-secondary text-foreground",
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="rounded-lg border border-input bg-card">
      <div className="flex flex-wrap gap-1 border-b border-border p-1.5">
        {editor && (
          <>
            <Btn label="Heading" on={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}><Heading2 className="h-4 w-4" /></Btn>
            <Btn label="Sub-heading" on={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })}><Heading3 className="h-4 w-4" /></Btn>
            <Btn label="Paragraph" on={() => editor.chain().focus().setParagraph().run()} active={editor.isActive("paragraph")}><Pilcrow className="h-4 w-4" /></Btn>
            <Btn label="Bold" on={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}><Bold className="h-4 w-4" /></Btn>
            <Btn label="Italic" on={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}><Italic className="h-4 w-4" /></Btn>
            <Btn label="Bullet list" on={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}><List className="h-4 w-4" /></Btn>
            <Btn label="Numbered list" on={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}><ListOrdered className="h-4 w-4" /></Btn>
            <Btn label="Undo" on={() => editor.chain().focus().undo().run()}><Undo2 className="h-4 w-4" /></Btn>
            <Btn label="Redo" on={() => editor.chain().focus().redo().run()}><Redo2 className="h-4 w-4" /></Btn>
          </>
        )}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
