// @ts-nocheck
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { COURSES } from "@/data/lessons";
import { toast } from "sonner";
import { ShieldAlert, Plus, Save, Trash2, ChevronDown, BookOpen, Code2 } from "lucide-react";

const ADMIN_EMAIL = "alfacompofficial@gmail.com";
const STORAGE_KEY = "admin_custom_lessons";

type CourseId = "html" | "css" | "javascript" | "python" | "node";

interface CustomLesson {
  id: string;
  courseId: CourseId;
  title: string;
  description: string;
  theory: string;
  starterCode: string;
  hint: string;
  createdAt: string;
}

const COURSE_OPTIONS: { id: CourseId; label: string; emoji: string; color: string }[] = [
  { id: "html",       label: "HTML",       emoji: "🌐", color: "from-orange-500/20 to-red-500/20 border-orange-500/30" },
  { id: "css",        label: "CSS",        emoji: "🎨", color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30" },
  { id: "javascript", label: "JavaScript", emoji: "⚡", color: "from-yellow-500/20 to-amber-500/20 border-yellow-500/30" },
  { id: "python",     label: "Python",     emoji: "🐍", color: "from-green-500/20 to-emerald-500/20 border-green-500/30" },
  { id: "node",       label: "Node.js",    emoji: "🛠️", color: "from-lime-500/20 to-green-500/20 border-lime-500/30" },
];

function loadCustomLessons(): CustomLesson[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveCustomLessons(lessons: CustomLesson[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lessons));
}

export default function LessonAdmin() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [selectedCourse, setSelectedCourse] = useState<CourseId | null>(null);
  const [lessons, setLessons] = useState<CustomLesson[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    theory: "",
    starterCode: "",
    hint: "",
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    setLessons(loadCustomLessons());
  }, []);

  if (loading || !user) return null;

  if (user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container py-16 flex flex-col items-center justify-center gap-4">
          <ShieldAlert className="w-16 h-16 text-destructive" />
          <h1 className="text-2xl font-bold">Доступ запрещён</h1>
          <p className="text-muted-foreground">Эта страница доступна только для администратора.</p>
          <Button onClick={() => navigate("/lessons")}>Перейти к урокам</Button>
        </main>
      </div>
    );
  }

  const handleSave = () => {
    if (!selectedCourse) { toast.error("Выбери курс!"); return; }
    if (!form.title.trim()) { toast.error("Напиши название урока!"); return; }
    if (!form.theory.trim()) { toast.error("Напиши теорию урока!"); return; }

    const newLesson: CustomLesson = {
      id: `custom-${selectedCourse}-${Date.now()}`,
      courseId: selectedCourse,
      title: form.title,
      description: form.description,
      theory: form.theory,
      starterCode: form.starterCode || (selectedCourse === "python" ? "# Напиши код здесь\n" : "// Напиши код здесь\n"),
      hint: form.hint,
      createdAt: new Date().toISOString(),
    };

    const updated = [...lessons, newLesson];
    setLessons(updated);
    saveCustomLessons(updated);
    setForm({ title: "", description: "", theory: "", starterCode: "", hint: "" });
    toast.success("✅ Урок добавлен! Он появится в списке уроков курса.");
  };

  const handleDelete = (id: string) => {
    const updated = lessons.filter(l => l.id !== id);
    setLessons(updated);
    saveCustomLessons(updated);
    toast.success("Урок удалён");
  };

  const selectedCourseInfo = COURSE_OPTIONS.find(c => c.id === selectedCourse);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Панель администратора — Уроки</h1>
            <p className="text-muted-foreground text-sm">Добавляй новые уроки в любой курс</p>
          </div>
          <Badge className="ml-auto bg-primary/20 text-primary border-primary/30">
            {user.email}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          {/* Form */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="w-4 h-4" /> Новый урок
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Course selector */}
              <div>
                <label className="text-sm font-medium mb-2 block">Выбери курс *</label>
                <div className="grid grid-cols-5 gap-2">
                  {COURSE_OPTIONS.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCourse(c.id)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all text-xs font-semibold
                        ${selectedCourse === c.id
                          ? `bg-gradient-to-br ${c.color} border-current scale-105 shadow-md`
                          : "border-border/40 hover:border-border hover:bg-muted/50"
                        }`}
                    >
                      <span className="text-xl">{c.emoji}</span>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Название урока *</label>
                <Input
                  placeholder='Например: "Урок 12. Работа с массивами"'
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Краткое описание</label>
                <Input
                  placeholder="Одна строка — что делаем на уроке"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Теория и задание *</label>
                <Textarea
                  placeholder="Объясни тему. В конце напиши: Задание: ..."
                  value={form.theory}
                  onChange={e => setForm(f => ({ ...f, theory: e.target.value }))}
                  className="min-h-[160px] font-mono text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  <Code2 className="w-3.5 h-3.5 inline mr-1" />
                  Стартовый код (необязательно)
                </label>
                <Textarea
                  placeholder="Код, который ученик увидит в редакторе с самого начала"
                  value={form.starterCode}
                  onChange={e => setForm(f => ({ ...f, starterCode: e.target.value }))}
                  className="min-h-[80px] font-mono text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Подсказка (необязательно)</label>
                <Textarea
                  placeholder="Подсказка, которая появится по кнопке «Показать подсказку»"
                  value={form.hint}
                  onChange={e => setForm(f => ({ ...f, hint: e.target.value }))}
                  className="min-h-[60px] font-mono text-sm"
                />
              </div>

              <Button onClick={handleSave} className="w-full" size="lg">
                <Save className="w-4 h-4 mr-2" /> Опубликовать урок
              </Button>
            </CardContent>
          </Card>

          {/* Published lessons sidebar */}
          <div className="space-y-3">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider px-1">
              Добавленные уроки ({lessons.length})
            </h2>

            {lessons.length === 0 && (
              <Card className="border-dashed border-border/40">
                <CardContent className="py-10 text-center text-muted-foreground text-sm">
                  Пока нет добавленных уроков
                </CardContent>
              </Card>
            )}

            {lessons.map(l => {
              const courseInfo = COURSE_OPTIONS.find(c => c.id === l.courseId);
              const isOpen = expandedId === l.id;
              return (
                <Card key={l.id} className={`border bg-gradient-to-br ${courseInfo?.color || ""} overflow-hidden`}>
                  <div
                    className="flex items-center gap-2 px-3 py-2.5 cursor-pointer"
                    onClick={() => setExpandedId(isOpen ? null : l.id)}
                  >
                    <span>{courseInfo?.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{l.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{l.description}</div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </div>
                  {isOpen && (
                    <div className="px-3 pb-3 space-y-2 border-t border-border/30 pt-2">
                      <p className="text-xs text-muted-foreground whitespace-pre-wrap">{l.theory.slice(0, 200)}...</p>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full h-7 text-xs"
                        onClick={() => handleDelete(l.id)}
                      >
                        <Trash2 className="w-3 h-3 mr-1" /> Удалить
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
