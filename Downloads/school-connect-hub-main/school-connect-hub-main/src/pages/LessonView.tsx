// @ts-nocheck
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, CheckCircle2, Play, Lightbulb, RotateCcw,
  ExternalLink, BookOpen, Terminal, ChevronRight, Sparkles,
  Save, Eye, EyeOff, Trophy
} from "lucide-react";
import CodeEditor from "@/components/CodeEditor";
import TerminalApp from "@/components/TerminalApp";
import { findLesson } from "@/data/lessons";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getOrchestratorResponse } from "@/lib/gemini";

const LANG_COLORS: Record<string, { gradient: string; accent: string; bg: string; border: string }> = {
  python:     { gradient: "from-blue-500 to-cyan-400",    accent: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20" },
  html:       { gradient: "from-orange-500 to-red-400",   accent: "text-orange-400",  bg: "bg-orange-500/10",  border: "border-orange-500/20" },
  css:        { gradient: "from-violet-500 to-purple-400", accent: "text-violet-400", bg: "bg-violet-500/10",  border: "border-violet-500/20" },
  javascript: { gradient: "from-yellow-500 to-amber-400", accent: "text-yellow-400",  bg: "bg-yellow-500/10",  border: "border-yellow-500/20" },
  node:       { gradient: "from-emerald-500 to-green-400", accent: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
};
const getLang = (id: string) => LANG_COLORS[id] || { gradient: "from-primary to-accent", accent: "text-primary", bg: "bg-primary/10", border: "border-primary/20" };

export default function LessonView() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const { course, lesson } = useMemo(() => findLesson(courseId, lessonId), [courseId, lessonId]);

  const [code, setCode] = useState(lesson?.starterCode || "");
  const [output, setOutput] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user || !course || !lesson) return;
    const key = `progress_${user.id}_${course.id}_${lesson.id}`;
    const local = localStorage.getItem(key);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed.last_code) setCode(parsed.last_code);
        if (parsed.completed) setCompleted(true);
      } catch(e) {}
    }
    supabase
      .from("lesson_progress")
      .select("last_code,completed")
      .eq("user_id", user.id)
      .eq("course_id", course.id)
      .eq("lesson_id", lesson.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.last_code) setCode(data.last_code);
        if (data?.completed) setCompleted(true);
      });
  }, [user, course, lesson]);

  if (loading || !user) return null;
  if (!course || !lesson) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <p className="text-muted-foreground">Урок не найден.</p>
          <Button variant="outline" onClick={() => navigate("/lessons")} className="mt-4">Назад</Button>
        </main>
      </div>
    );
  }

  const v = getLang(course.language);
  const editorLang = course.language === "html" ? "html" : course.language === "node" ? "javascript" : course.language;
  const isWebPreview = course.language === "html";
  const isJsConsole = course.language === "javascript";
  const isPython = course.language === "python";
  const isNode = course.language === "node";

  const runJsConsole = () => {
    try {
      const fn = new Function(`
        const __logs = [];
        const console = {
          log: (...args) => __logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '))
        };
        try { ${code} } catch (e) { __logs.push('Ошибка: ' + (e && e.message || e)); }
        return __logs.join('\\n');
      `);
      const result = fn();
      setOutput(result || "(нет вывода)");
    } catch (e: any) {
      setOutput("Ошибка: " + (e?.message || e));
    }
  };

  const openInEditor = () => {
    const lang = isPython ? "python" : isNode ? "javascript" : course.language;
    sessionStorage.setItem("__lesson_code__", code);
    sessionStorage.setItem("__lesson_lang__", lang);
    navigate(`/editor?lang=${lang}&fromLesson=1`);
  };

  const saveProgress = async (markCompleted: boolean) => {
    if (!user) return;
    if (markCompleted && !completed) {
      if (!code.trim() || code.trim() === lesson.starterCode?.trim()) {
        toast.error("Напиши свой код перед тем, как сдавать урок!");
        return;
      }
      setIsValidating(true);
      const toastId = toast.loading("🤖 AI проверяет твой код...");
      try {
        const langKey = isPython ? "python" : (isJsConsole || isNode) ? "js" : "html";
        const files: any = {};
        files[langKey] = code;
        const command = `You are a strict but helpful programming teacher validating a student's code.
Task description: ${lesson.description}
Task theory: ${lesson.theory}
Analyze the student's code carefully. Did they accomplish what was asked?
If the code is CORRECT and fulfills the task, your explanation MUST start exactly with the word "VALID".
If the code is INCORRECT or missing something, your explanation MUST start exactly with the word "INVALID" followed by a short hint in Russian on how to fix it (max 2 sentences). Do not give the direct answer, just a hint.`;
        const res = await getOrchestratorResponse(files, command, langKey);
        if (res?.explanation) {
          const exp = res.explanation.trim();
          if (exp.toUpperCase().startsWith("INVALID")) {
            toast.dismiss(toastId);
            toast.error(exp.replace(/^INVALID[:,\-\s]*/i, "").trim() || "Код пока не выполняет задание. Попробуй ещё!");
            setIsValidating(false);
            return;
          }
        }
        toast.dismiss(toastId);
        toast.success("✅ Код прошел проверку!");
      } catch (err) {
        toast.dismiss(toastId);
        console.error("AI check error", err);
      }
      setIsValidating(false);
    }
    const key = `progress_${user.id}_${course.id}_${lesson.id}`;
    localStorage.setItem(key, JSON.stringify({ completed: markCompleted, last_code: code }));
    setCompleted(markCompleted);
    try {
      const { error } = await supabase.from("lesson_progress").upsert(
        { user_id: user.id, course_id: course.id, lesson_id: lesson.id, completed: markCompleted, last_code: code, updated_at: new Date().toISOString() },
        { onConflict: "user_id,course_id,lesson_id" }
      );
      if (error) throw error;
      toast.success(markCompleted ? "🏆 Урок засчитан!" : "💾 Сохранено");
    } catch (err) {
      toast.success(markCompleted ? "🏆 Урок засчитан! (локально)" : "💾 Сохранено (локально)");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Top bar */}
      <div className="border-b border-border/40 bg-card/60 backdrop-blur-sm sticky top-[57px] z-40">
        <div className="container px-4 md:px-6 py-2.5 flex items-center justify-between gap-3">
          <button
            onClick={() => navigate(`/lessons/${course.id}`)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">К урокам</span>
            <span className={`hidden sm:inline font-semibold ${v.accent}`}>{course.title}</span>
          </button>

          {/* Breadcrumb pill */}
          <div className={`hidden md:flex items-center gap-1.5 px-3 h-7 rounded-lg text-xs font-medium ${v.bg} ${v.border} border ${v.accent}`}>
            <span>{course.emoji}</span>
            <span>{lesson.title}</span>
          </div>

          <div className="flex items-center gap-2">
            {completed && (
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold px-2.5 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" /> Пройдено
              </div>
            )}
            <button
              onClick={() => setCode(lesson.starterCode)}
              disabled={isValidating}
              className="flex items-center gap-1.5 px-3 h-8 rounded-xl text-xs font-medium border border-border/60 bg-muted/30 hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Сброс
            </button>
            <button
              onClick={() => saveProgress(false)}
              disabled={isValidating}
              className="flex items-center gap-1.5 px-3 h-8 rounded-xl text-xs font-medium border border-border/60 bg-muted/30 hover:bg-muted/60 text-foreground transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" /> Сохранить
            </button>
            <button
              onClick={() => saveProgress(true)}
              disabled={isValidating || completed}
              className={`flex items-center gap-1.5 px-4 h-8 rounded-xl text-xs font-semibold text-white transition-all disabled:opacity-50 btn-shine ${
                completed ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-gradient-to-r from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/20"
              }`}
            >
              {isValidating ? (
                <><svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Проверка...</>
              ) : completed ? (
                <><Trophy className="w-3.5 h-3.5" /> Засчитано</>
              ) : (
                <><CheckCircle2 className="w-3.5 h-3.5" /> Зачесть урок</>
              )}
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 container py-4 md:py-5 px-4 md:px-6 max-w-[1600px]">
        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] xl:grid-cols-[460px_1fr] gap-4 h-full">

          {/* ── Theory panel ── */}
          <div className="flex flex-col gap-3">
            {/* Course info */}
            <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border ${v.border} ${v.bg}`}>
              <span className="text-2xl">{course.emoji}</span>
              <div className="min-w-0">
                <div className={`text-xs font-semibold ${v.accent} uppercase tracking-wider`}>{course.title}</div>
                <div className="text-sm font-bold text-foreground truncate">{lesson.title}</div>
              </div>
            </div>

            {/* Theory card */}
            <div className="flex-1 rounded-2xl border border-border/50 bg-card/70 backdrop-blur-sm overflow-hidden flex flex-col" style={{ maxHeight: "calc(100vh - 220px)" }}>
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-muted/20 shrink-0">
                <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Теория</span>
              </div>
              <div className="flex-1 overflow-auto p-4 md:p-5">
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{lesson.description}</p>
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90">{lesson.theory}</pre>

                {lesson.hint && (
                  <div className="mt-5">
                    <button
                      onClick={() => setShowHint(s => !s)}
                      className="flex items-center gap-2 px-3 h-8 rounded-xl text-xs font-medium border border-yellow-500/25 bg-yellow-500/8 text-yellow-400 hover:bg-yellow-500/15 transition-all"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      {showHint ? "Скрыть подсказку" : "Показать подсказку"}
                    </button>
                    {showHint && (
                      <div className="mt-3 p-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
                        <pre className="text-xs text-yellow-200/80 whitespace-pre-wrap overflow-auto font-mono">{lesson.hint}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Editor panel ── */}
          <div className="flex flex-col gap-3">
            {/* Run buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {isWebPreview && (
                <button
                  onClick={() => setShowPreview(v => !v)}
                  className={`flex items-center gap-1.5 px-4 h-9 rounded-xl text-sm font-semibold text-white btn-shine transition-all hover:opacity-90 ${showPreview ? "bg-gradient-to-r from-emerald-500 to-green-500 shadow-md shadow-emerald-500/25" : "bg-gradient-to-r from-violet-500 to-indigo-600 shadow-md shadow-violet-500/25"}`}
                >
                  <Play className="w-4 h-4" /> {showPreview ? "Обновить" : "Запустить"}
                </button>
              )}
              {isJsConsole && (
                <button
                  onClick={runJsConsole}
                  className="flex items-center gap-1.5 px-4 h-9 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-yellow-500 to-amber-500 shadow-md shadow-yellow-500/25 btn-shine transition-all hover:opacity-90"
                >
                  <Play className="w-4 h-4" /> Запустить JS
                </button>
              )}
              {isPython && (
                <button
                  onClick={() => setShowTerminal(v => !v)}
                  className="flex items-center gap-1.5 px-4 h-9 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-500 shadow-md shadow-blue-500/25 btn-shine transition-all hover:opacity-90"
                >
                  <Terminal className="w-4 h-4" /> {showTerminal ? "Скрыть" : "Запустить Python"}
                </button>
              )}
              {isNode && (
                <button
                  onClick={openInEditor}
                  className="flex items-center gap-1.5 px-4 h-9 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-green-500 shadow-md shadow-emerald-500/25 btn-shine transition-all hover:opacity-90"
                >
                  <ExternalLink className="w-4 h-4" /> Открыть в IDE
                </button>
              )}

              {/* Lang badge */}
              <div className={`ml-auto flex items-center gap-1.5 px-3 h-7 rounded-lg text-xs font-semibold ${v.bg} ${v.border} border ${v.accent}`}>
                {editorLang.toUpperCase()}
              </div>
            </div>

            {/* Code editor */}
            <div className="rounded-2xl border border-border/50 overflow-hidden shadow-lg" style={{ height: showPreview || showTerminal || (isJsConsole && output) ? "360px" : "calc(100vh - 230px)", minHeight: "280px", transition: "height 0.3s ease" }}>
              <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border/40 bg-muted/20 shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                <span className="ml-2 text-xs text-muted-foreground font-mono">
                  {isPython ? "main.py" : isNode ? "index.js" : isJsConsole ? "script.js" : "index.html"}
                </span>
              </div>
              <div className="h-[calc(100%-36px)]">
                <CodeEditor language={editorLang as any} value={code} onChange={setCode} />
              </div>
            </div>

            {/* Web preview */}
            {isWebPreview && showPreview && (
              <div className="rounded-2xl border border-emerald-500/20 bg-card overflow-hidden" style={{ height: "280px" }}>
                <div className="flex items-center justify-between px-4 py-2 border-b border-border/40 bg-muted/20">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Eye className="w-3.5 h-3.5" /> <span>Предпросмотр</span>
                  </div>
                  <button onClick={() => setShowPreview(false)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    Закрыть
                  </button>
                </div>
                <iframe
                  title="preview"
                  srcDoc={`<base target="_blank"><script>
document.addEventListener('click', e => {
  const a = e.target.closest('a');
  if (a) {
    let href = a.getAttribute('href');
    if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('/')) {
      a.setAttribute('href', 'https://' + href);
    }
  }
});
</script>${code}`}
                  sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-same-origin"
                  className="w-full bg-white"
                  style={{ height: "calc(100% - 36px)" }}
                />
              </div>
            )}

            {/* Python terminal */}
            {isPython && showTerminal && (
              <div className="rounded-2xl border border-blue-500/20 bg-card overflow-hidden" style={{ height: "280px" }}>
                <div className="flex items-center justify-between px-4 py-2 border-b border-border/40 bg-muted/20">
                  <div className="flex items-center gap-2 text-xs text-blue-400">
                    <Terminal className="w-3.5 h-3.5" /> <span>Python Terminal</span>
                  </div>
                  <button onClick={() => setShowTerminal(false)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Закрыть</button>
                </div>
                <div className="relative overflow-hidden" style={{ height: "calc(100% - 36px)" }}>
                  <TerminalApp code={code} onCodeFix={setCode} />
                </div>
              </div>
            )}

            {/* JS console output */}
            {isJsConsole && output && (
              <div className="rounded-2xl border border-yellow-500/20 bg-card overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-border/40 bg-muted/20">
                  <div className="flex items-center gap-2 text-xs text-yellow-400">
                    <Terminal className="w-3.5 h-3.5" /> <span>Консоль</span>
                  </div>
                  <button onClick={() => setOutput("")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Очистить</button>
                </div>
                <pre className="p-4 text-xs text-emerald-300 font-mono whitespace-pre-wrap max-h-[200px] overflow-auto leading-relaxed">{output}</pre>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
