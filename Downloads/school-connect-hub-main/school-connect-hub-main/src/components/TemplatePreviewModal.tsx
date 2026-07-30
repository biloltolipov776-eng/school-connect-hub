// @ts-nocheck
import { useEffect, useRef } from "react";
import { X, Maximize2 } from "lucide-react";

interface Template {
  id: string;
  title: string;
  type: string;
  preview_url?: string;
}

interface TemplatePreviewModalProps {
  template: Template;
  onClose: () => void;
}

export default function TemplatePreviewModal({ template, onClose }: TemplatePreviewModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const isHtml = template.type === "html";
  const src = template.preview_url;

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col"
      style={{ background: "rgba(0,0,0,0.97)" }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-5 h-14 border-b shrink-0"
        style={{
          background: "rgba(10,10,18,0.95)",
          borderColor: "rgba(255,255,255,0.07)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: "#7c3aed" }}
          />
          <span className="font-semibold text-white text-sm truncate max-w-xs">
            {template.title}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-mono"
            style={{
              background: isHtml ? "rgba(251,146,60,0.15)" : "rgba(96,165,250,0.15)",
              color: isHtml ? "#fb923c" : "#60a5fa",
              border: `1px solid ${isHtml ? "rgba(251,146,60,0.3)" : "rgba(96,165,250,0.3)"}`,
            }}
          >
            {isHtml ? "HTML/CSS/JS" : "React"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-white/30 hidden sm:block">
            Нажмите Esc для выхода
          </span>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200"
            style={{ background: "rgba(255,255,255,0.06)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.2)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
            title="Закрыть (Esc)"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* iframe */}
      <div className="flex-1 relative overflow-hidden bg-white">
        {src ? (
          <iframe
            ref={iframeRef}
            src={src}
            title={template.title}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups-to-escape-sandbox"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
            Нет ссылки на превью
          </div>
        )}
      </div>
    </div>
  );
}
