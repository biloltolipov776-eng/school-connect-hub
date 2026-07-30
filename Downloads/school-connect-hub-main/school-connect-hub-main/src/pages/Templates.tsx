// @ts-nocheck
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import TemplatePreviewModal from "@/components/TemplatePreviewModal";
import TemplateCodeModal from "@/components/TemplateCodeModal";
import TemplateSubmitModal from "@/components/TemplateSubmitModal";
import {
  LayoutTemplate, Plus, Eye, Code2, Globe, Layers,
  CheckCircle2, XCircle, Clock, Trash2, Search,
  Sparkles, Filter
} from "lucide-react";
import { toast } from "sonner";

interface Template {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: string;
  file_path?: string;
  preview_url?: string;
  thumbnail_url?: string;
  status: string;
  author_name?: string;
  tags?: string[];
  created_at: string;
}

const PLACEHOLDER_GRADIENTS = [
  "from-violet-600 to-indigo-600",
  "from-pink-600 to-rose-600",
  "from-orange-500 to-amber-500",
  "from-emerald-500 to-teal-500",
  "from-blue-600 to-cyan-500",
  "from-fuchsia-600 to-purple-600",
];

export default function Templates() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isOwner } = useAdmin();
  const navigate = useNavigate();

  const [templates, setTemplates] = useState<Template[]>([]);
  const [pendingTemplates, setPendingTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"gallery" | "pending">("gallery");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "html" | "react">("all");

  // Modals
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [codeTemplate, setCodeTemplate] = useState<Template | null>(null);
  const [showSubmit, setShowSubmit] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadTemplates();
    }
  }, [user, isAdmin]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      // Load approved templates
      const { data: approved, error: approvedError } = await supabase
        .from("templates")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (approvedError) {
        // If table doesn't exist yet, just show empty state
        if (approvedError.message?.includes("schema cache") || approvedError.code === "PGRST204") {
          console.warn("Таблица templates ещё не создана в Supabase.");
          setTemplates([]);
          setPendingTemplates([]);
          setLoading(false);
          return;
        }
        throw approvedError;
      }
      setTemplates(approved || []);

      // Load pending templates (admin only)
      if (isAdmin) {
        const { data: pending, error: pendingError } = await supabase
          .from("templates")
          .select("*")
          .eq("status", "pending")
          .order("created_at", { ascending: false });

        if (pendingError && !pendingError.message?.includes("schema cache")) throw pendingError;
        setPendingTemplates(pending || []);
      }
    } catch (err: any) {
      toast.error("Ошибка загрузки шаблонов: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from("templates")
      .update({ status: "approved" })
      .eq("id", id);

    if (error) {
      toast.error("Ошибка при одобрении");
      return;
    }
    toast.success("Шаблон одобрен и опубликован!");
    setPendingTemplates(prev => prev.filter(t => t.id !== id));
    loadTemplates();
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase
      .from("templates")
      .update({ status: "rejected" })
      .eq("id", id);

    if (error) {
      toast.error("Ошибка при отклонении");
      return;
    }
    toast.success("Шаблон отклонён");
    setPendingTemplates(prev => prev.filter(t => t.id !== id));
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Удалить этот шаблон?")) return;
    const { error } = await supabase.from("templates").delete().eq("id", id);
    if (error) { toast.error("Ошибка удаления"); return; }
    toast.success("Шаблон удалён");
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const filteredTemplates = templates.filter(t => {
    const matchSearch = !searchQuery ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = filterType === "all" || t.type === filterType;
    return matchSearch && matchType;
  });

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <Header />

      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-40"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-40"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)" }} />
      </div>

      <main className="relative z-10 container px-4 md:px-6 py-8">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", boxShadow: "0 4px 20px rgba(124,58,237,0.35)" }}>
                <LayoutTemplate className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-foreground">Шаблоны</h1>
            </div>
            <p className="text-muted-foreground text-sm">
              Готовые проекты от участников сообщества · {templates.length} шаблонов
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && pendingTemplates.length > 0 && (
              <button
                onClick={() => setActiveTab("pending")}
                className="flex items-center gap-2 px-4 h-9 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: "rgba(251,146,60,0.15)",
                  color: "#fb923c",
                  border: "1px solid rgba(251,146,60,0.3)",
                }}
              >
                <Clock className="w-4 h-4" />
                Заявки ({pendingTemplates.length})
              </button>
            )}
            <button
              onClick={() => setShowSubmit(true)}
              className="flex items-center gap-2 px-5 h-9 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                boxShadow: "0 4px 20px rgba(124,58,237,0.35)",
              }}
            >
              <Plus className="w-4 h-4" />
              Отправить проект
            </button>
          </div>
        </div>

        {/* Tabs */}
        {isAdmin && (
          <div className="flex items-center gap-1 mb-6 p-1 rounded-xl w-fit"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            {[
              { key: "gallery", label: "Галерея" },
              { key: "pending", label: `Заявки${pendingTemplates.length ? ` (${pendingTemplates.length})` : ""}` },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className="px-4 h-8 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: activeTab === tab.key ? "rgba(124,58,237,0.25)" : "transparent",
                  color: activeTab === tab.key ? "#a78bfa" : "rgba(255,255,255,0.4)",
                  border: activeTab === tab.key ? "1px solid rgba(124,58,237,0.4)" : "1px solid transparent",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Gallery Tab */}
        {activeTab === "gallery" && (
          <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Поиск шаблонов..."
                  className="w-full pl-10 pr-4 h-10 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    color: "hsl(var(--foreground))",
                  }}
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                {[
                  { key: "all", label: "Все" },
                  { key: "html", label: "HTML/CSS/JS" },
                  { key: "react", label: "React" },
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => setFilterType(f.key as any)}
                    className="px-3 h-9 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: filterType === f.key ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.04)",
                      color: filterType === f.key ? "#a78bfa" : "rgba(255,255,255,0.4)",
                      border: `1px solid ${filterType === f.key ? "rgba(124,58,237,0.35)" : "rgba(255,255,255,0.08)"}`,
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[1,2,3,4,5,6,7,8].map(i => (
                  <div key={i} className="rounded-2xl overflow-hidden border border-border/30"
                    style={{ background: "rgba(255,255,255,0.02)" }}>
                    <div className="h-48 animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
                    <div className="p-4 space-y-2">
                      <div className="h-4 rounded-lg animate-pulse w-3/4" style={{ background: "rgba(255,255,255,0.06)" }} />
                      <div className="h-3 rounded-lg animate-pulse w-1/2" style={{ background: "rgba(255,255,255,0.04)" }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: "rgba(124,58,237,0.1)" }}>
                  <LayoutTemplate className="w-8 h-8 text-violet-400/40" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {searchQuery ? "Ничего не найдено" : "Шаблонов пока нет"}
                </h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-xs">
                  {searchQuery
                    ? "Попробуйте изменить запрос"
                    : "Станьте первым! Отправьте свой проект в галерею."}
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => setShowSubmit(true)}
                    className="flex items-center gap-2 px-5 h-9 rounded-xl text-sm font-semibold text-white"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
                  >
                    <Plus className="w-4 h-4" /> Отправить проект
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredTemplates.map((template, idx) => {
                  const gradient = PLACEHOLDER_GRADIENTS[idx % PLACEHOLDER_GRADIENTS.length];
                  const isHtml = template.type === "html";

                  return (
                    <div
                      key={template.id}
                      className="group rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.07)",
                      }}
                    >
                      {/* Thumbnail */}
                      <div className={`relative h-44 overflow-hidden`}>
                        {template.thumbnail_url ? (
                          <img
                            src={template.thumbnail_url}
                            alt={template.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={e => { e.currentTarget.style.display = "none"; }}
                          />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                            <div className="text-center">
                              {isHtml
                                ? <Globe className="w-10 h-10 text-white/40 mx-auto mb-2" />
                                : <Layers className="w-10 h-10 text-white/40 mx-auto mb-2" />
                              }
                              <span className="text-white/30 text-xs font-mono">
                                {isHtml ? "HTML/CSS/JS" : "React"}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Overlay on hover — action buttons */}
                        <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-200"
                          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
                          <button
                            onClick={() => setPreviewTemplate(template)}
                            className="flex items-center gap-2 px-4 h-9 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
                            style={{ background: "rgba(124,58,237,0.9)", boxShadow: "0 4px 15px rgba(124,58,237,0.5)" }}
                          >
                            <Eye className="w-4 h-4" />
                            Вид сайта
                          </button>
                          <button
                            onClick={() => setCodeTemplate(template)}
                            className="flex items-center gap-2 px-4 h-9 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
                            style={{ background: "rgba(30,30,50,0.95)", border: "1px solid rgba(255,255,255,0.2)" }}
                          >
                            <Code2 className="w-4 h-4" />
                            Код
                          </button>
                        </div>

                        {/* Type badge */}
                        <div className="absolute top-2 left-2">
                          <span className="text-xs px-2 py-0.5 rounded-full font-mono"
                            style={{
                              background: isHtml ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.7)",
                              color: isHtml ? "#fb923c" : "#60a5fa",
                              border: `1px solid ${isHtml ? "rgba(251,146,60,0.4)" : "rgba(96,165,250,0.4)"}`,
                              backdropFilter: "blur(4px)",
                            }}>
                            {isHtml ? "HTML" : "React"}
                          </span>
                        </div>

                        {/* Admin delete */}
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(template.id)}
                            className="absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                            style={{ background: "rgba(239,68,68,0.8)", backdropFilter: "blur(4px)" }}
                            title="Удалить"
                          >
                            <Trash2 className="w-3 h-3 text-white" />
                          </button>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <h3 className="font-bold text-sm text-foreground truncate mb-1">{template.title}</h3>
                        {template.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                            {template.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground/60">
                            {template.author_name || "Аноним"}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setPreviewTemplate(template)}
                              className="flex items-center gap-1 px-2.5 h-7 rounded-lg text-xs font-medium transition-all"
                              style={{
                                background: "rgba(124,58,237,0.15)",
                                color: "#a78bfa",
                                border: "1px solid rgba(124,58,237,0.25)",
                              }}
                            >
                              <Eye className="w-3 h-3" /> Вид
                            </button>
                            <button
                              onClick={() => setCodeTemplate(template)}
                              className="flex items-center gap-1 px-2.5 h-7 rounded-lg text-xs font-medium transition-all"
                              style={{
                                background: "rgba(255,255,255,0.05)",
                                color: "rgba(255,255,255,0.5)",
                                border: "1px solid rgba(255,255,255,0.09)",
                              }}
                            >
                              <Code2 className="w-3 h-3" /> Код
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Pending Tab (Admin only) */}
        {activeTab === "pending" && isAdmin && (
          <div className="space-y-4">
            {pendingTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-400/30 mb-3" />
                <h3 className="text-lg font-semibold text-foreground mb-1">Всё проверено!</h3>
                <p className="text-muted-foreground text-sm">Нет заявок на модерацию</p>
              </div>
            ) : (
              pendingTemplates.map(template => {
                const isHtml = template.type === "html";
                return (
                  <div
                    key={template.id}
                    className="rounded-2xl p-5 transition-all"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm text-foreground">{template.title}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-mono"
                            style={{
                              background: isHtml ? "rgba(251,146,60,0.1)" : "rgba(96,165,250,0.1)",
                              color: isHtml ? "#fb923c" : "#60a5fa",
                              border: `1px solid ${isHtml ? "rgba(251,146,60,0.25)" : "rgba(96,165,250,0.25)"}`,
                            }}>
                            {isHtml ? "HTML/CSS/JS" : "React"}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: "rgba(251,146,60,0.1)", color: "#fb923c", border: "1px solid rgba(251,146,60,0.2)" }}>
                            ⏳ Ожидает
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1 truncate max-w-lg">
                          {template.description || "Без описания"}
                        </p>
                        <p className="text-xs text-muted-foreground/50">
                          От: {template.author_name || "Аноним"} ·{" "}
                          {new Date(template.created_at).toLocaleDateString("ru-RU")}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setPreviewTemplate(template)}
                          className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-medium transition-all"
                          style={{
                            background: "rgba(255,255,255,0.05)",
                            color: "rgba(255,255,255,0.5)",
                            border: "1px solid rgba(255,255,255,0.09)",
                          }}
                        >
                          <Eye className="w-3.5 h-3.5" /> Превью
                        </button>
                        <button
                          onClick={() => setCodeTemplate(template)}
                          className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-medium transition-all"
                          style={{
                            background: "rgba(255,255,255,0.05)",
                            color: "rgba(255,255,255,0.5)",
                            border: "1px solid rgba(255,255,255,0.09)",
                          }}
                        >
                          <Code2 className="w-3.5 h-3.5" /> Код
                        </button>
                        <button
                          onClick={() => handleApprove(template.id)}
                          className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-medium transition-all"
                          style={{
                            background: "rgba(34,197,94,0.15)",
                            color: "#4ade80",
                            border: "1px solid rgba(34,197,94,0.3)",
                          }}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Принять
                        </button>
                        <button
                          onClick={() => handleReject(template.id)}
                          className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-medium transition-all"
                          style={{
                            background: "rgba(239,68,68,0.1)",
                            color: "#f87171",
                            border: "1px solid rgba(239,68,68,0.25)",
                          }}
                        >
                          <XCircle className="w-3.5 h-3.5" /> Отклонить
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      {previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
        />
      )}
      {codeTemplate && (
        <TemplateCodeModal
          template={codeTemplate}
          onClose={() => setCodeTemplate(null)}
        />
      )}
      {showSubmit && (
        <TemplateSubmitModal
          onClose={() => setShowSubmit(false)}
          onSuccess={loadTemplates}
        />
      )}
    </div>
  );
}
