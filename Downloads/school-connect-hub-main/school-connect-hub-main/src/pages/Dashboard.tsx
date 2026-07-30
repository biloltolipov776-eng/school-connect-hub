// @ts-nocheck
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Code2, Plus, Globe, ExternalLink, Trash2, Copy,
  FileCode2, TerminalSquare, BookOpen, Layers,
  ChevronRight, Sparkles, TrendingUp, Clock
} from "lucide-react";
import { Header } from "@/components/Header";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const SITE_BASE_URL = `${window.location.origin}/site`;

interface Site {
  id: string;
  subdomain: string;
  title: string;
  description: string;
  keywords: string;
  created_at: string;
}

const getLangInfo = (keywords: string) => {
  if (keywords?.includes("_lang:python")) return { label: "Python", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", icon: TerminalSquare };
  if (keywords?.includes("_lang:javascript")) return { label: "JavaScript", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: FileCode2 };
  return { label: "HTML/CSS", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", icon: Globe };
};

export default function Dashboard() {
  const { user, signOut, loading: authLoading } = useAuth();
  const { isAdmin, isTeacher } = useAdmin();
  const navigate = useNavigate();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchSites();
  }, [user]);

  const fetchSites = async () => {
    const { data, error } = await supabase
      .from("sites").select("*").eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    if (!error && data) setSites(data);
    setLoading(false);
  };

  const deleteSite = async (id: string) => {
    setDeleting(id);
    const { error } = await supabase.from("sites").delete().eq("id", id);
    if (error) toast.error("Ошибка удаления");
    else { toast.success("Сайт удалён"); setSites(sites.filter(s => s.id !== id)); }
    setDeleting(null);
  };

  const copySiteLink = (subdomain: string) => {
    navigator.clipboard.writeText(`${SITE_BASE_URL}/${subdomain}`);
    toast.success("Ссылка скопирована!");
  };

  if (authLoading || !user) return null;

  const quickActions = [
    { label: "HTML / CSS / JS", desc: "Создать веб-сайт", icon: Globe, color: "from-orange-500 to-red-400", glow: "shadow-orange-500/20", path: "/editor" },
    { label: "Python проект", desc: "Запустить в терминале", icon: TerminalSquare, color: "from-blue-500 to-cyan-400", glow: "shadow-blue-500/20", path: "/editor?lang=python" },
    { label: "JavaScript", desc: "Node.js проект", icon: FileCode2, color: "from-yellow-500 to-amber-400", glow: "shadow-yellow-500/20", path: "/editor?lang=javascript" },
    { label: "Уроки", desc: "Продолжить обучение", icon: BookOpen, color: "from-emerald-500 to-green-400", glow: "shadow-emerald-500/20", path: "/lessons" },
  ];

  return (
    <div className="min-h-screen bg-background mesh-bg">
      <Header />

      <main className="container py-6 md:py-8 px-4 md:px-6">

        {/* Welcome banner */}
        <div className="relative rounded-2xl overflow-hidden mb-7 border border-border/40 p-6 md:p-7">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-blue-500/5" />
          <div className="absolute inset-0 dot-pattern opacity-30" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Добро пожаловать</p>
              <h1 className="text-2xl md:text-3xl font-black text-foreground">
                Привет, <span className="text-gradient">{user.email?.split("@")[0]}</span> 👋
              </h1>
              <p className="text-muted-foreground text-sm mt-1">Управляйте своими проектами и продолжайте обучение</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => navigate("/lessons")}
                className="flex items-center gap-2 px-4 h-9 rounded-xl text-sm font-medium text-emerald-400 border border-emerald-500/25 bg-emerald-500/8 hover:bg-emerald-500/15 transition-all"
              >
                <BookOpen className="w-4 h-4" /> Уроки
              </button>
              <button
                onClick={() => navigate("/full-ide")}
                className="flex items-center gap-2 px-4 h-9 rounded-xl text-sm font-medium text-blue-400 border border-blue-500/25 bg-blue-500/8 hover:bg-blue-500/15 transition-all"
              >
                <Layers className="w-4 h-4" /> IDE
              </button>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mb-7">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" /> Быстрый старт
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {quickActions.map((qa, i) => (
              <button
                key={i}
                onClick={() => navigate(qa.path)}
                className="group relative flex flex-col items-start gap-2.5 p-4 rounded-xl border border-border/50 bg-card/60 hover:bg-card hover:border-primary/25 hover:shadow-lg transition-all duration-200 text-left overflow-hidden"
              >
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${qa.color} flex items-center justify-center shadow-md ${qa.glow} group-hover:scale-110 transition-transform shrink-0`}>
                  <qa.icon className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground leading-tight">{qa.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{qa.desc}</div>
                </div>
                <ChevronRight className="absolute bottom-3 right-3 w-4 h-4 text-muted-foreground/30 group-hover:text-primary/50 group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>
        </div>

        {/* Sites section */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-3.5 h-3.5" /> Мои проекты
            {!loading && sites.length > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-bold">{sites.length}</span>
            )}
          </h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 px-3 h-8 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/25 hover:opacity-90 hover:scale-[1.02] transition-all btn-shine">
                <Plus className="w-3.5 h-3.5" /> Создать
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 border-border/60 bg-card/95 backdrop-blur-xl shadow-xl rounded-xl">
              <DropdownMenuItem onClick={() => navigate("/editor")} className="cursor-pointer py-2.5 rounded-lg focus:bg-muted/60">
                <Globe className="w-4 h-4 mr-2 text-orange-400" /> HTML / CSS / JS Сайт
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/editor?lang=python")} className="cursor-pointer py-2.5 rounded-lg focus:bg-muted/60">
                <TerminalSquare className="w-4 h-4 mr-2 text-blue-400" /> Python Проект
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/editor?lang=javascript")} className="cursor-pointer py-2.5 rounded-lg focus:bg-muted/60">
                <FileCode2 className="w-4 h-4 mr-2 text-yellow-400" /> JavaScript Проект
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Sites grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-2xl border border-border/40 bg-card/60 p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted animate-shimmer" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted animate-shimmer rounded-lg w-2/3" />
                    <div className="h-3 bg-muted animate-shimmer rounded-lg w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-muted animate-shimmer rounded-lg w-full" />
                <div className="h-3 bg-muted animate-shimmer rounded-lg w-4/5" />
                <div className="h-8 bg-muted animate-shimmer rounded-xl w-full" />
              </div>
            ))}
          </div>
        ) : sites.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/50 bg-card/30 py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Globe className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold mb-2">Пока нет проектов</h3>
            <p className="text-muted-foreground text-sm mb-6">Создайте свой первый проект прямо сейчас</p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="inline-flex items-center gap-2 px-5 h-10 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/25 hover:opacity-90 transition-all btn-shine">
                  <Plus className="w-4 h-4" /> Создать проект
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-52 border-border/60 bg-card/95 backdrop-blur-xl shadow-xl rounded-xl">
                <DropdownMenuItem onClick={() => navigate("/editor")} className="cursor-pointer py-2.5 rounded-lg focus:bg-muted/60">
                  <Globe className="w-4 h-4 mr-2 text-orange-400" /> HTML / CSS / JS Сайт
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/editor?lang=python")} className="cursor-pointer py-2.5 rounded-lg focus:bg-muted/60">
                  <TerminalSquare className="w-4 h-4 mr-2 text-blue-400" /> Python Проект
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/editor?lang=javascript")} className="cursor-pointer py-2.5 rounded-lg focus:bg-muted/60">
                  <FileCode2 className="w-4 h-4 mr-2 text-yellow-400" /> JavaScript Проект
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sites.map(site => {
              const lang = getLangInfo(site.keywords);
              const LangIcon = lang.icon;
              return (
                <div key={site.id} className="group card-premium rounded-2xl overflow-hidden">
                  {/* Top accent line */}
                  <div className={`h-0.5 bg-gradient-to-r ${lang.color === "text-blue-400" ? "from-blue-500 to-cyan-400" : lang.color === "text-yellow-400" ? "from-yellow-500 to-amber-400" : "from-orange-500 to-red-400"}`} />

                  <div className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl ${lang.bg} border ${lang.border} flex items-center justify-center shrink-0`}>
                        <LangIcon className={`w-4.5 h-4.5 ${lang.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-foreground truncate">{site.title || "Без названия"}</h3>
                        <code className="text-xs text-muted-foreground font-mono">/site/{site.subdomain}</code>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={() => copySiteLink(site.subdomain)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
                          title="Скопировать ссылку"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => window.open(`${SITE_BASE_URL}/${site.subdomain}`, "_blank")}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
                          title="Открыть сайт"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteSite(site.id)}
                          disabled={deleting === site.id}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all"
                          title="Удалить"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                      {site.description || "Без описания"}
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-xl text-xs font-semibold border border-border/60 bg-muted/30 hover:bg-muted/60 hover:border-border text-foreground transition-all"
                        onClick={() => {
                          let langParam = "";
                          if (site.keywords?.includes("_lang:python")) langParam = "?lang=python";
                          else if (site.keywords?.includes("_lang:javascript")) langParam = "?lang=javascript";
                          navigate(`/editor/${site.id}${langParam}`);
                        }}
                      >
                        <Code2 className="w-3.5 h-3.5" /> Редактировать
                      </button>
                      <button
                        className="w-8 h-8 flex items-center justify-center rounded-xl border border-border/60 bg-muted/30 hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-all"
                        onClick={() => window.open(`${SITE_BASE_URL}/${site.subdomain}`, "_blank")}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}