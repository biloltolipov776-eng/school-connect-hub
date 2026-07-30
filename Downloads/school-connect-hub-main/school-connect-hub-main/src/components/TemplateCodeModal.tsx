// @ts-nocheck
import { useState } from "react";
import { X, Download, FileArchive, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Template {
  id: string;
  title: string;
  type: string;
  file_path?: string;
}

interface TemplateCodeModalProps {
  template: Template;
  onClose: () => void;
}

export default function TemplateCodeModal({ template, onClose }: TemplateCodeModalProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!template.file_path) {
      toast.error("Код для этого шаблона не найден.");
      return;
    }

    setDownloading(true);
    try {
      const { data, error } = await supabase.storage
        .from("avatars")
        .download(template.file_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      // Get filename from path or fallback
      const filename = template.file_path.split('/').pop() || `${template.title.replace(/\s+/g, "_")}.zip`;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success("Файл успешно скачан!");
    } catch (err: any) {
      toast.error("Ошибка при скачивании файла: " + err.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-md flex flex-col rounded-2xl overflow-hidden shadow-2xl p-6 text-center"
        style={{
          background: "rgba(10,10,18,0.98)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200"
          style={{ background: "rgba(255,255,255,0.06)" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.2)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
        >
          <X className="w-4 h-4 text-white" />
        </button>

        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "rgba(124,58,237,0.15)" }}>
          <FileArchive className="w-8 h-8 text-violet-400" />
        </div>

        <h3 className="text-xl font-bold text-white mb-2">{template.title}</h3>
        <p className="text-sm text-white/50 mb-6 px-4">
          Исходный код этого проекта запакован в ZIP-архив. Вы можете скачать его на свой компьютер.
        </p>

        <button
          onClick={handleDownload}
          disabled={downloading || !template.file_path}
          className="flex items-center justify-center w-full gap-2 px-6 h-12 rounded-xl text-sm font-semibold transition-all duration-200"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
            color: "white",
            boxShadow: "0 4px 20px rgba(124,58,237,0.35)",
            opacity: downloading || !template.file_path ? 0.6 : 1,
          }}
        >
          {downloading ? (
            "Скачивание..."
          ) : (
            <>
              <Download className="w-4 h-4" />
              Скачать ZIP архив
            </>
          )}
        </button>
        
        {!template.file_path && (
          <p className="text-xs text-red-400 mt-4">Файл с кодом отсутствует.</p>
        )}
      </div>
    </div>
  );
}
