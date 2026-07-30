// @ts-nocheck
import { useState, useRef } from "react";
import { X, Send, Globe, Code2, Link, AlertCircle, CheckCircle2, UploadCloud, FolderUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { toast } from "sonner";
import JSZip from "jszip";

interface TemplateSubmitModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function TemplateSubmitModal({ onClose, onSuccess }: TemplateSubmitModalProps) {
  const { user } = useAuth();
  const { isOwner, isAdmin } = useAdmin();

  const [type, setType] = useState<"html" | "react">("html");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  
  // File upload state
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploadMode, setUploadMode] = useState<"zip" | "folder">("zip");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Auto-approve for owner/admin
  const isPrivileged = isOwner || isAdmin;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files);
    }
  };

  const createZipFromFiles = async (fileList: FileList): Promise<Blob> => {
    const zip = new JSZip();
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      // Webkit directory gives us the relative path
      const path = file.webkitRelativePath || file.name;
      zip.file(path, file);
    }
    return await zip.generateAsync({ type: "blob" });
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!title.trim()) { toast.error("Введите название"); return; }
    if (!previewUrl.trim()) { toast.error("Укажите ссылку на превью сайта"); return; }
    if (!files || files.length === 0) { toast.error("Пожалуйста, прикрепите файлы проекта"); return; }

    setSubmitting(true);
    try {
      // 1. Prepare ZIP
      let zipBlob: Blob;
      let fileName = "";
      
      if (uploadMode === "zip") {
        zipBlob = files[0];
        const safeName = files[0].name.replace(/[^a-zA-Z0-9.-]/g, '_');
        fileName = `${user.id}_${Date.now()}_${safeName}`;
      } else {
        toast.info("Упаковываем папку...");
        zipBlob = await createZipFromFiles(files);
        fileName = `${user.id}_${Date.now()}_project.zip`;
      }

      // 2. Upload to Supabase Storage
      toast.info("Загружаем код на сервер...");
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("templates-code")
        .upload(`code/${fileName}`, zipBlob, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // 2. Upload thumbnail if exists
      let uploadedThumbnailUrl = "";
      if (thumbnailFile) {
        toast.info("Загружаем обложку...");
        const safeThumbName = thumbnailFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const thumbName = `thumbnails/${user.id}_${Date.now()}_${safeThumbName}`;
        const { error: thumbError } = await supabase.storage
          .from("templates-code")
          .upload(thumbName, thumbnailFile, { cacheControl: "3600", upsert: false });
        
        if (thumbError) throw thumbError;

        const { data: { publicUrl } } = supabase.storage
          .from("templates-code")
          .getPublicUrl(thumbName);
        
        uploadedThumbnailUrl = publicUrl;
      }

      // 3. Save to database
      toast.info("Сохраняем шаблон...");
      const payload = {
        user_id: user.id,
        title: title.trim(),
        description: description.trim(),
        type,
        thumbnail_url: uploadedThumbnailUrl,
        preview_url: previewUrl.trim(),
        file_path: uploadData.path,
        author_name: user.email?.split("@")[0] || "Пользователь",
        status: isPrivileged ? "approved" : "pending",
      };

      const { error: dbError } = await supabase.from("templates").insert(payload);

      if (dbError) throw dbError;

      if (isPrivileged) {
        toast.success("Шаблон опубликован!", { description: "Он сразу появился в галерее" });
      } else {
        toast.success("Заявка отправлена!", {
          description: "Администратор рассмотрит её в ближайшее время",
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error("Ошибка при отправке: " + (err.message || "Неизвестная ошибка"));
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-xl px-4 py-3 text-sm font-mono text-white/85 outline-none transition-all duration-200 resize-none";
  const inputStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: "rgba(10,10,20,0.98)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 h-14 border-b shrink-0"
          style={{ borderColor: "rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(124,58,237,0.25)" }}>
              <Send className="w-4 h-4 text-violet-400" />
            </div>
            <span className="text-white font-semibold text-sm">Отправить проект в Шаблоны</span>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-all"
            style={{ background: "rgba(255,255,255,0.06)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.2)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Notice */}
        <div
          className="mx-6 mt-4 flex items-start gap-3 px-4 py-3 rounded-xl"
          style={{
            background: isPrivileged ? "rgba(34,197,94,0.08)" : "rgba(251,146,60,0.08)",
            border: `1px solid ${isPrivileged ? "rgba(34,197,94,0.2)" : "rgba(251,146,60,0.2)"}`,
          }}
        >
          {isPrivileged ? (
            <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
          )}
          <p className="text-xs leading-relaxed" style={{ color: isPrivileged ? "#4ade80" : "#fb923c" }}>
            {isPrivileged
              ? "Вы администратор — шаблон будет сразу опубликован без ожидания."
              : "Ваш проект будет отправлен на проверку администратору. После одобрения он появится в галерее шаблонов."}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* Type selector */}
          <div>
            <label className="block text-xs text-white/40 font-medium mb-2 uppercase tracking-wider">Платформа</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "html", label: "HTML / CSS / JS", icon: Globe, color: "#fb923c" },
                { value: "react", label: "React", icon: Code2, color: "#60a5fa" },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setType(opt.value as "html" | "react")}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left"
                  style={{
                    background: type === opt.value ? `${opt.color}14` : "rgba(255,255,255,0.03)",
                    border: `1px solid ${type === opt.value ? `${opt.color}40` : "rgba(255,255,255,0.08)"}`,
                  }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${opt.color}18` }}>
                    <opt.icon className="w-4 h-4" style={{ color: opt.color }} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: type === opt.value ? opt.color : "rgba(255,255,255,0.5)" }}>
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Title */}
            <div>
              <label className="block text-xs text-white/40 font-medium mb-2 uppercase tracking-wider">Название *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Например: Крутое Портфолио"
                required
                className={inputClass}
                style={inputStyle}
              />
            </div>

            {/* Thumbnail */}
            <div>
              <label className="block text-xs text-white/40 font-medium mb-2 uppercase tracking-wider">
                Обложка (изображение, не обяз.)
              </label>
              <div 
                className="relative flex items-center justify-center border border-dashed rounded-xl overflow-hidden cursor-pointer transition-all h-[46px]"
                style={{
                  borderColor: thumbnailPreview ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.1)",
                  background: thumbnailPreview ? "rgba(10,10,20,0.8)" : "rgba(255,255,255,0.02)",
                }}
                onClick={() => document.getElementById("thumbnail-upload")?.click()}
              >
                {thumbnailPreview ? (
                  <div className="absolute inset-0 w-full h-full">
                    <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <span className="text-xs font-semibold text-white">Изменить</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-white/50">Выбрать файл</span>
                )}
                <input
                  id="thumbnail-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleThumbnailChange}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-white/40 font-medium mb-2 uppercase tracking-wider">Описание</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Расскажите о своём проекте..."
              rows={2}
              className={inputClass}
              style={inputStyle}
            />
          </div>

          {/* Preview URL */}
          <div>
            <label className="block text-xs text-white/40 font-medium mb-2 uppercase tracking-wider">
              <span style={{ color: type === "html" ? "#fb923c" : "#60a5fa" }}>Ссылка на задеплоенный сайт</span> *
            </label>
            <p className="text-xs text-white/30 mb-2">
              Эта ссылка используется для отображения сайта при нажатии кнопки "Вид сайта". Она не будет видна другим пользователям.
            </p>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
              <input
                type="url"
                value={previewUrl}
                onChange={e => setPreviewUrl(e.target.value)}
                placeholder="https://my-app.vercel.app"
                required
                className={inputClass + " pl-9"}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Code Upload */}
          <div className="pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            <label className="block text-xs text-white/40 font-medium mb-3 uppercase tracking-wider">
              Исходный код проекта *
            </label>
            
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setUploadMode("zip")}
                className="flex-1 flex items-center justify-center gap-2 h-9 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: uploadMode === "zip" ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.03)",
                  color: uploadMode === "zip" ? "#a78bfa" : "rgba(255,255,255,0.5)",
                  border: `1px solid ${uploadMode === "zip" ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.08)"}`,
                }}
              >
                <UploadCloud className="w-3.5 h-3.5" /> Загрузить .ZIP архив
              </button>
              <button
                type="button"
                onClick={() => setUploadMode("folder")}
                className="flex-1 flex items-center justify-center gap-2 h-9 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: uploadMode === "folder" ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.03)",
                  color: uploadMode === "folder" ? "#a78bfa" : "rgba(255,255,255,0.5)",
                  border: `1px solid ${uploadMode === "folder" ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.08)"}`,
                }}
              >
                <FolderUp className="w-3.5 h-3.5" /> Выбрать папку проекта
              </button>
            </div>

            <div
              className="flex flex-col items-center justify-center border border-dashed rounded-xl py-8 px-4 text-center cursor-pointer transition-all"
              style={{
                borderColor: files ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.1)",
                background: files ? "rgba(124,58,237,0.05)" : "rgba(255,255,255,0.02)",
              }}
              onClick={() => {
                if (uploadMode === "zip") fileInputRef.current?.click();
                else folderInputRef.current?.click();
              }}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".zip"
                onChange={handleFileChange}
              />
              {/* @ts-ignore */}
              <input
                type="file"
                ref={folderInputRef}
                className="hidden"
                webkitdirectory=""
                directory=""
                multiple
                onChange={handleFileChange}
              />

              {files ? (
                <>
                  <CheckCircle2 className="w-8 h-8 text-violet-400 mb-2" />
                  <p className="text-sm text-white font-medium">
                    Выбрано файлов: {files.length}
                  </p>
                  <p className="text-xs text-white/40 mt-1">
                    {uploadMode === "zip" ? files[0].name : "Папка с исходным кодом"}
                  </p>
                </>
              ) : (
                <>
                  {uploadMode === "zip" ? (
                    <UploadCloud className="w-8 h-8 text-white/30 mb-2" />
                  ) : (
                    <FolderUp className="w-8 h-8 text-white/30 mb-2" />
                  )}
                  <p className="text-sm text-white/60 font-medium">
                    Нажмите, чтобы выбрать {uploadMode === "zip" ? "ZIP-архив" : "папку"}
                  </p>
                  <p className="text-xs text-white/30 mt-1">
                    {uploadMode === "folder" ? "Все файлы будут упакованы в ZIP автоматически" : "Файл не более 50 МБ"}
                  </p>
                </>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 h-16 border-t shrink-0"
          style={{ borderColor: "rgba(255,255,255,0.07)" }}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-4 h-9 rounded-xl text-sm font-medium transition-all"
            style={{ color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.05)" }}
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-5 h-9 rounded-xl text-sm font-semibold transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
              color: "white",
              boxShadow: "0 4px 20px rgba(124,58,237,0.35)",
              opacity: submitting ? 0.7 : 1,
            }}
          >
            <Send className="w-4 h-4" />
            {submitting ? "Отправка..." : isPrivileged ? "Опубликовать" : "Отправить на проверку"}
          </button>
        </div>
      </div>
    </div>
  );
}
