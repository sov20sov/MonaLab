import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Sparkles, Download, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  downloadEditorDocumentPdfWithOptions,
  downloadEditorDocumentWordWithOptions,
} from "@/lib/report-exporter";
import { cn } from "@/lib/utils";
import { ExportCoverDialog } from "@/components/ui/export-cover-dialog";

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("مستند بدون عنوان");
  const [isSaving, setIsSaving] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState<null | "pdf" | "word">(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>ابدأ كتابة بحثك هنا…</p>",
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none focus:outline-none dark:prose-invert sm:prose-base",
          "min-h-[min(500px,55vh)] sm:min-h-[min(520px,60vh)]"
        ),
      },
    },
  });

  useEffect(() => {
    if (!id || !editor) return;
    const loadDoc = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;
        const res = await fetch(`/api/documents/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (res.ok) {
          const doc = await res.json();
          setTitle(doc.title ?? "مستند بدون عنوان");
          if (doc.content) editor.commands.setContent(doc.content);
        }
      } catch (e) {
        console.error("Failed to load document", e);
      }
    };
    void loadDoc();
  }, [id, editor]);

  const handleSave = async () => {
    if (!id) return;
    setIsSaving(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      await fetch(`/api/documents/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ title, content: editor?.getHTML() ?? "" }),
      });
    } catch (e) {
      console.error("Failed to save", e);
    }
    setIsSaving(false);
  };

  const handleAIAssist = () => {
    editor?.chain().focus().insertContent("<p><em>[توليد محتوى بالذكاء الاصطناعي…]</em></p>").run();
  };

  const handleExportPDF = () => {
    if (!editor) return;
    setExportDialogOpen("pdf");
  };

  const handleExportWord = () => {
    if (!editor) return;
        // ✅ بعد الإصلاح:
    setExportDialogOpen("word");
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <ExportCoverDialog
        open={exportDialogOpen !== null}
        initial={{ title }}
        onClose={() => setExportDialogOpen(null)}
        onConfirm={(options) => {
          if (!editor) return;
          const kind = exportDialogOpen;
          setExportDialogOpen(null);
          if (!kind) return;
          const htmlBody = editor.getHTML();
          if (kind === "pdf") {
            void downloadEditorDocumentPdfWithOptions({ title, htmlBody, options }).catch((err) =>
              console.error(err)
            );
          } else {
            void downloadEditorDocumentWordWithOptions({ title, htmlBody, options }).catch((err) =>
              console.error(err)
            );
          }
        }}
      />
      <header className="flex shrink-0 flex-col gap-3 border-b border-border px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="icon" className="shrink-0" onClick={() => navigate("/dashboard")}>
            <ArrowRight className="h-4 w-4" />
            <span className="sr-only">العودة للمستندات</span>
          </Button>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="min-w-0 border-none bg-transparent text-base font-semibold shadow-none focus-visible:ring-0 sm:w-64 sm:text-lg"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <Button variant="outline" size="sm" className="text-xs sm:text-sm" onClick={handleAIAssist}>
            <Sparkles className="me-1.5 h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
            مساعد
          </Button>
          <Button variant="outline" size="sm" className="text-xs sm:text-sm" onClick={handleExportWord}>
            <Download className="me-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Word
          </Button>
          <Button variant="outline" size="sm" className="text-xs sm:text-sm" onClick={handleExportPDF}>
            <Download className="me-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            PDF
          </Button>
          <Button size="sm" className="text-xs sm:text-sm" onClick={() => void handleSave()} disabled={isSaving}>
            <Save className="me-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {isSaving ? "جاري الحفظ…" : "حفظ"}
          </Button>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 justify-center overflow-auto p-3 sm:p-6">
        <div className="w-full max-w-3xl rounded-xl border border-border bg-card p-4 shadow-sm sm:p-8">
          <EditorContent editor={editor} />
        </div>
      </main>
    </div>
  );
}
