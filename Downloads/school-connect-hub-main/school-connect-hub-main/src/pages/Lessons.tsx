// @ts-nocheck
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, CheckCircle2, Circle, Play, Trophy, Lock, ChevronRight } from "lucide-react";
import { getCoursesWithCustom, findCourse } from "@/data/lessons";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const COURSE_VISUALS: Record<string, { gradient: string; glow: string; bg: string; accent: string }> = {
  python: { gradient: "from-blue-500 to-cyan-400", glow: "shadow-blue-500/30", bg: "bg-blue-500/10", accent: "text-blue-400" },
  html: { gradient: "from-orange-500 to-red-400", glow: "shadow-orange-500/30", bg: "bg-orange-500/10", accent: "text-orange-400" },
  css: { gradient: "from-violet-500 to-purple-400", glow: "shadow-violet-500/30", bg: "bg-violet-500/10", accent: "text-violet-400" },
  javascript: { gradient: "from-yellow-500 to-amber-400", glow: "shadow-yellow-500/30", bg: "bg-yellow-500/10", accent: "text-yellow-400" },
  node: { gradient: "from-emerald-500 to-green-400", glow: "shadow-emerald-500/30", bg: "bg-emerald-500/10", accent: "text-emerald-400" },
};

const getVisuals = (id: string) =>
  COURSE_VISUALS[id] || { gradient: "from-primary to-accent", glow: "shadow-primary/30", bg: "bg-primary/10", accent: "text-primary" };

export default function Lessons() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [showCourseCompletedModal, setShowCourseCompletedModal] = useState(false);

  const COURSES = getCoursesWithCustom();

  useEffect(() => {
    const totalLessonsAllCourses = COURSES.reduce((acc, c) => acc + c.lessons.length, 0);
    const lastSeen = localStorage.getItem("last_seen_total_lessons");
    if (lastSeen && parseInt(lastSeen) < totalLessonsAllCourses) {
      setTimeout(() => {
        toast.info("🎉 Добавлены новые уроки! Зайди в курсы и проверь новинки.", { duration: 6000 });
      }, 1000);
    }
    localStorage.setItem("last_seen_total_lessons", totalLessonsAllCourses.toString());
  }, []);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("lesson_progress")
      .select("course_id,lesson_id,completed")
      .eq("user_id", user.id)
      .then(({ data }) => {
        const map: Record<string, boolean> = {};
        (data || []).forEach((r: any) => {
          map[`${r.course_id}/${r.lesson_id}`] = r.completed;
        });
        COURSES.forEach(c => {
          c.lessons.forEach(l => {
            const local = localStorage.getItem(`progress_${user.id}_${c.id}_${l.id}`);
            if (local) {
              try {
                const parsed = JSON.parse(local);
                if (parsed.completed) map[`${c.id}/${l.id}`] = true;
              } catch(e) {}
            }
          });
        });
        setProgress(map);
      });
  }, [user]);

  const course = courseId ? findCourse(courseId) : null;
  const total = course ? course.lessons.length : 0;
  const done = course ? course.lessons.filter((l) => progress[`${course.id}/${l.id}`]).length : 0;

  useEffect(() => {
    if (course && done === total && total > 0 && user) {
      const shownKey = `course_completed_shown_${user.id}_${course.id}`;
      if (!localStorage.getItem(shownKey)) {
        setShowCourseCompletedModal(true);
        localStorage.setItem(shownKey, "true");
      }
    }
  }, [done, total, course, user]);

  if (loading || !user) return null;

  // ── Course detail view ──
  if (courseId) {
    if (!course) {
      return (
        <div className="min-h-screen bg-background">
          <Header />
          <main className="container py-8">
            <p className="text-muted-foreground">Курс не найден.</p>
            <Button variant="outline" onClick={() => navigate("/lessons")} className="mt-4">Назад</Button>
          </main>
        </div>
      );
    }

    const v = getVisuals(course.id);
    const progressPct = total > 0 ? Math.round((done / total) * 100) : 0;

    return (
      <div className="min-h-screen bg-background mesh-bg">
        <Header />
        <main className="container py-6 md:py-8 max-w-3xl">

          {/* Back */}
          <Button variant="ghost" size="sm" onClick={() => navigate("/lessons")} className="mb-5 -ml-1 text-muted-foreground hover:text-foreground gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Все курсы
          </Button>

          {/* Course hero */}
          <div className={`relative rounded-2xl p-6 md:p-8 mb-6 overflow-hidden border border-border/40`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${v.gradient} opacity-10`} />
            <div className="absolute inset-0 bg-background/50" />
            <div className="relative z-10">
              <div className="flex items-start gap-4 mb-5">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${v.gradient} flex items-center justify-center shadow-lg ${v.glow} text-3xl shrink-0`}>
                  {course.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl md:text-3xl font-black text-foreground mb-1">{course.title}</h1>
                  <p className="text-muted-foreground text-sm leading-relaxed">{course.description}</p>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Прогресс</span>
                  <span className={`font-bold ${v.accent}`}>{done} / {total} уроков</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${progressPct}%`, background: `linear-gradient(90deg, ${v.gradient.replace("from-", "").replace(" to-", ", ")})` }} />
                </div>
                {progressPct === 100 && (
                  <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium">
                    <Trophy className="w-4 h-4" /> Курс завершён!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lessons list */}
          <div className="space-y-2">
            {course.lessons.map((l, idx) => {
              const isDone = !!progress[`${course.id}/${l.id}`];
              return (
                <div
                  key={l.id}
                  className={`group relative flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                    isDone
                      ? "border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/35"
                      : "border-border/50 bg-card/60 hover:bg-card hover:border-primary/30 hover:shadow-md"
                  }`}
                  onClick={() => navigate(`/lessons/${course.id}/${l.id}`)}
                >
                  {/* Number / check */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold transition-all ${
                    isDone
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-muted/60 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                  }`}>
                    {isDone ? <CheckCircle2 className="w-4.5 h-4.5" /> : <span>{idx + 1}</span>}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold text-sm truncate ${isDone ? "text-emerald-300" : "text-foreground"}`}>
                      {l.title}
                    </div>
                    <div className="text-xs text-muted-foreground truncate mt-0.5">{l.description}</div>
                  </div>

                  <div className={`flex items-center gap-1.5 text-xs font-medium px-3 h-7 rounded-lg transition-all shrink-0 ${
                    isDone
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-primary/8 text-primary opacity-0 group-hover:opacity-100"
                  }`}>
                    {isDone ? "Пройдено" : <><Play className="w-3 h-3" /> Начать</>}
                  </div>

                  <ChevronRight className={`w-4 h-4 shrink-0 transition-all ${isDone ? "text-emerald-500/40" : "text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5"}`} />
                </div>
              );
            })}
          </div>

          {/* Completion Modal */}
          <Dialog open={showCourseCompletedModal} onOpenChange={setShowCourseCompletedModal}>
            <DialogContent className="sm:max-w-md border-emerald-500/20 bg-card/95 backdrop-blur-xl">
              <DialogHeader>
                <div className="text-center mb-2">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/15 text-4xl mb-4">🏆</div>
                  <DialogTitle className="text-2xl font-black">Поздравляем!</DialogTitle>
                </div>
                <DialogDescription className="text-center text-base mt-2">
                  Ты успешно прошел все уроки по <b className="text-foreground">{course.title}</b>!<br /><br />
                  Это отличный результат, но впереди еще много интересного. Попробуй изучить <b className="text-foreground">{course.id === 'python' ? 'HTML и CSS' : course.id === 'html' ? 'JavaScript' : 'Python'}</b>!
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="sm:justify-center mt-4">
                <Button className="glow-success" onClick={() => { setShowCourseCompletedModal(false); navigate("/lessons"); }}>
                  Выбрать другой курс
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    );
  }

  // ── Courses list ──
  return (
    <div className="min-h-screen bg-background mesh-bg">
      <Header />
      <main className="container py-6 md:py-10">

        {/* Page header */}
        <div className="mb-8 md:mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black">Уроки программирования</h1>
          </div>
          <p className="text-muted-foreground text-sm ml-[52px]">
            Изучай HTML, CSS, JavaScript, Python и Node.js прямо в браузере
          </p>
        </div>

        {/* Total progress summary */}
        {COURSES.length > 0 && (() => {
          const totalAll = COURSES.reduce((a, c) => a + c.lessons.length, 0);
          const doneAll = COURSES.reduce((a, c) => a + c.lessons.filter(l => progress[`${c.id}/${l.id}`]).length, 0);
          const pct = totalAll > 0 ? Math.round((doneAll / totalAll) * 100) : 0;
          return (
            <div className="card-premium rounded-2xl p-4 mb-6 flex items-center gap-4">
              <div className="text-3xl font-black text-gradient">{pct}%</div>
              <div className="flex-1">
                <div className="text-sm font-semibold mb-1.5">Общий прогресс</div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
              <div className="text-sm text-muted-foreground text-right">
                <div className="font-bold text-foreground">{doneAll}</div>
                <div>из {totalAll}</div>
              </div>
            </div>
          );
        })()}

        {/* Courses grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {getCoursesWithCustom().map((c) => {
            const total = c.lessons.length;
            const done = c.lessons.filter((l) => progress[`${c.id}/${l.id}`]).length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            const v = getVisuals(c.id);
            const isComplete = done === total && total > 0;

            return (
              <div
                key={c.id}
                className="group relative card-premium rounded-2xl overflow-hidden cursor-pointer"
                onClick={() => navigate(`/lessons/${c.id}`)}
              >
                {/* Top gradient bar */}
                <div className={`h-1 w-full bg-gradient-to-r ${v.gradient}`} style={{ width: `${pct}%`, transition: "width 0.5s ease" }} />
                <div className={`h-1 w-full bg-gradient-to-r ${v.gradient} opacity-15 absolute top-0 left-0`} />

                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${v.gradient} flex items-center justify-center text-2xl shadow-lg ${v.glow} group-hover:scale-110 transition-transform duration-300 shrink-0`}>
                      {c.emoji}
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      isComplete
                        ? "bg-emerald-500/15 text-emerald-400"
                        : `${v.bg} ${v.accent}`
                    }`}>
                      {isComplete ? <><Trophy className="w-3 h-3" /> Завершён</> : <>{done}/{total}</>}
                    </div>
                  </div>

                  <h2 className="font-black text-base text-foreground mb-1 group-hover:text-gradient transition-all">{c.title}</h2>
                  <p className="text-muted-foreground text-xs leading-relaxed mb-4 line-clamp-2">{c.description}</p>

                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{total} {total === 1 ? "урок" : total < 5 ? "урока" : "уроков"}</span>
                      <span className={`font-semibold ${v.accent}`}>{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted/60 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${v.gradient} transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Hover arrow */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0 -translate-x-1">
                  <ChevronRight className={`w-4 h-4 ${v.accent}`} />
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
