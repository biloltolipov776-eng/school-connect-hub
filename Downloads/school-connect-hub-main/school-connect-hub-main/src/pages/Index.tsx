// @ts-nocheck
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Code2, Globe, Zap, ArrowRight, Terminal, Sparkles, Users, Shield, BookOpen, Layers, Star, CheckCircle } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Code2,
      title: "Мощный редактор",
      description: "HTML, CSS, JavaScript и Python с подсветкой синтаксиса и ИИ‑автодополнением прямо в браузере",
      gradient: "from-blue-500 to-cyan-400",
      glow: "shadow-blue-500/25",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      icon: Globe,
      title: "Мгновенная публикация",
      description: "Ваш сайт становится доступен по уникальной ссылке в одно нажатие — без серверов и настроек",
      gradient: "from-violet-500 to-purple-400",
      glow: "shadow-violet-500/25",
      bg: "bg-violet-500/10",
      border: "border-violet-500/20",
    },
    {
      icon: Sparkles,
      title: "ИИ Помощник",
      description: "Нажмите Ctrl+Shift+H — и ИИ напишет, исправит или улучшит ваш код по вашему описанию",
      gradient: "from-pink-500 to-rose-400",
      glow: "shadow-pink-500/25",
      bg: "bg-pink-500/10",
      border: "border-pink-500/20",
    },
    {
      icon: Users,
      title: "Класс‑лобби",
      description: "Учитель видит код каждого студента в реальном времени — как в настоящей профессиональной IDE",
      gradient: "from-amber-500 to-orange-400",
      glow: "shadow-amber-500/25",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      icon: BookOpen,
      title: "Интерактивные уроки",
      description: "Обучайся по структурированным урокам с теорией, задачами и проверкой через ИИ",
      gradient: "from-emerald-500 to-green-400",
      glow: "shadow-emerald-500/25",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      icon: Layers,
      title: "Полноценная IDE",
      description: "Работайте с файлами, запускайте Python и Node.js в изолированной среде с терминалом",
      gradient: "from-sky-500 to-indigo-400",
      glow: "shadow-sky-500/25",
      bg: "bg-sky-500/10",
      border: "border-sky-500/20",
    },
  ];

  const codeLines = [
    { text: "def greet(name: str) -> str:", color: "text-violet-300" },
    { text: '    return f"Привет, {name}! 👋"', color: "text-emerald-300" },
    { text: "", color: "" },
    { text: "students = [\"Алия\", \"Тимур\", \"Саида\"]", color: "text-blue-300" },
    { text: "for s in students:", color: "text-violet-300" },
    { text: "    print(greet(s))", color: "text-amber-300" },
    { text: "", color: "" },
    { text: "# ✨ ИИ-помощник готов помочь!", color: "text-white/25" },
  ];

  const stats = [
    { value: "5+", label: "Языков", icon: Code2 },
    { value: "100+", label: "Уроков", icon: BookOpen },
    { value: "∞", label: "Проектов", icon: Globe },
    { value: "ИИ", label: "Проверка", icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-[#060912] text-white overflow-x-hidden" style={{ fontFamily: "'Outfit', sans-serif" }}>

      {/* ── Animated Background ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Orbs */}
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)", animation: "float 8s ease-in-out infinite" }} />
        <div className="absolute top-1/2 -right-48 w-[700px] h-[700px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.09) 0%, transparent 70%)", animation: "float 10s ease-in-out infinite reverse" }} />
        <div className="absolute -bottom-32 left-1/4 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(236,72,153,0.07) 0%, transparent 70%)", animation: "float 12s ease-in-out infinite" }} />
        {/* Grid pattern */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }} />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#060912]/80" />
      </div>

      {/* ── Navbar ── */}
      <header className="relative z-20 border-b border-white/[0.05]"
        style={{ background: "rgba(6,9,18,0.7)", backdropFilter: "blur(24px)" }}>
        <div className="container flex items-center justify-between h-16 px-4 md:px-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30"
              style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              <span className="text-white">Code</span>
              <span style={{ background: "linear-gradient(135deg, #a78bfa, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}> Alfacomp</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-4 h-9 rounded-xl text-sm font-medium text-white/50 hover:text-white transition-colors"
              onClick={() => navigate("/auth")}
            >
              Войти
            </button>
            <button
              className="px-4 h-9 rounded-xl text-sm font-semibold text-white btn-shine transition-all hover:opacity-90 hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", boxShadow: "0 4px 20px rgba(124,58,237,0.35)" }}
              onClick={() => navigate("/auth")}
            >
              Начать бесплатно
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative z-10 container px-4 md:px-6 pt-24 pb-20 md:pt-36 md:pb-28">
        <div className="max-w-5xl mx-auto text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-8 border border-violet-500/25"
            style={{ background: "rgba(124,58,237,0.1)", backdropFilter: "blur(8px)" }}>
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-violet-300">Платформа для обучения программированию</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-[78px] font-black tracking-tight mb-6 leading-[1.02]">
            <span className="text-white">Пишите код.</span>
            <br />
            <span className="animated-gradient-text">Публикуйте мгновенно.</span>
          </h1>

          <p className="text-lg md:text-xl text-white/40 mb-10 max-w-2xl mx-auto leading-relaxed">
            HTML, CSS, JavaScript и Python прямо в браузере. ИИ‑помощник, онлайн‑терминал и система классов для учителей и учеников.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <button
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 h-12 rounded-2xl text-base font-semibold text-white btn-shine transition-all hover:opacity-95 hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", boxShadow: "0 8px 32px rgba(124,58,237,0.4)" }}
              onClick={() => navigate("/auth")}
            >
              Создать проект
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 h-12 rounded-2xl text-base font-medium text-white/70 border border-white/10 hover:bg-white/5 hover:text-white hover:border-white/20 transition-all"
              onClick={() => navigate("/auth")}
            >
              Посмотреть уроки
              <BookOpen className="w-4 h-4" />
            </button>
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-8 md:gap-16 mb-20">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl md:text-3xl font-black text-white mb-0.5">{stat.value}</div>
                <div className="text-xs text-white/30 font-medium uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Code card */}
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute -inset-px rounded-2xl blur-xl" style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(59,130,246,0.2), rgba(236,72,153,0.2))" }} />
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.08]" style={{ background: "rgba(13,17,26,0.9)", backdropFilter: "blur(12px)" }}>
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]" style={{ background: "rgba(255,255,255,0.02)" }}>
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-3 text-xs text-white/25 font-mono">main.py — Code Alfacomp</span>
              </div>
              {/* Code */}
              <div className="p-5 font-mono text-sm leading-7 text-left">
                {codeLines.map((line, i) => (
                  <div key={i} className={line.color || "text-white/15"}>
                    <span className="text-white/15 select-none mr-5 text-xs w-4 inline-block text-right">{i + 1}</span>
                    {line.text || " "}
                  </div>
                ))}
              </div>
              {/* Terminal output */}
              <div className="border-t border-white/[0.06] px-5 py-4" style={{ background: "rgba(0,0,0,0.5)" }}>
                <div className="flex items-center gap-2 text-xs text-white/25 mb-2">
                  <Terminal className="w-3 h-3" />
                  <span>Terminal</span>
                </div>
                <div className="font-mono text-sm space-y-0.5">
                  <p className="text-emerald-400">Привет, Алия! 👋</p>
                  <p className="text-emerald-400">Привет, Тимур! 👋</p>
                  <p className="text-emerald-400">Привет, Саида! 👋</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative z-10 container px-4 md:px-6 py-24">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-4 border border-blue-500/20"
            style={{ background: "rgba(59,130,246,0.08)" }}>
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-blue-300">Всё в одном месте</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black mb-4">
            Всё что нужно для{" "}
            <span style={{ background: "linear-gradient(135deg, #a78bfa, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              разработки
            </span>
          </h2>
          <p className="text-white/35 text-lg max-w-xl mx-auto">Профессиональные инструменты, доступные прямо в браузере</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {features.map((f, i) => (
            <div
              key={i}
              className={`group relative rounded-2xl p-6 border ${f.border} hover:border-opacity-60 transition-all duration-300 overflow-hidden cursor-default`}
              style={{ background: "rgba(255,255,255,0.02)", backdropFilter: "blur(8px)" }}
            >
              {/* Hover glow */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`}
                style={{ background: `linear-gradient(135deg, ${f.bg.includes("blue") ? "rgba(59,130,246,0.06)" : f.bg.includes("violet") ? "rgba(124,58,237,0.06)" : f.bg.includes("pink") ? "rgba(236,72,153,0.06)" : f.bg.includes("amber") ? "rgba(245,158,11,0.06)" : f.bg.includes("emerald") ? "rgba(16,185,129,0.06)" : "rgba(14,165,233,0.06)"}, transparent)` }} />

              <div className="relative z-10">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4 shadow-lg ${f.glow} group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-base text-white mb-2">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="relative z-10 container px-4 md:px-6 pb-28">
        <div className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden">
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.35), rgba(79,70,229,0.35), rgba(236,72,153,0.2))" }} />
          <div className="absolute inset-0 border border-white/10 rounded-3xl" />
          <div className="absolute inset-0" style={{ background: "rgba(6,9,18,0.55)", backdropFilter: "blur(12px)" }} />
          {/* Stars decoration */}
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute w-1 h-1 rounded-full bg-white/40"
              style={{ top: `${15 + i * 12}%`, left: `${5 + i * 15}%`, animation: `blink ${1.5 + i * 0.4}s step-end infinite` }} />
          ))}
          <div className="relative z-10 text-center py-16 px-6">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm mb-6 border border-white/15"
              style={{ background: "rgba(255,255,255,0.08)" }}>
              <Shield className="w-3.5 h-3.5 text-white/60" />
              <span className="text-white/60">Бесплатно для учеников и учителей</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black mb-4 text-white">Готовы начать?</h2>
            <p className="text-white/45 mb-8 max-w-md mx-auto text-base">
              Регистрация занимает 30 секунд. Никаких платёжных данных не нужно.
            </p>
            <div className="flex items-center justify-center gap-2 mb-4">
              {["HTML", "CSS", "JS", "Python", "ИИ"].map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-lg text-xs font-semibold text-white/50 border border-white/10 bg-white/5">{tag}</span>
              ))}
            </div>
            <button
              className="flex items-center gap-2 mx-auto px-10 h-12 rounded-2xl text-base font-semibold text-white btn-shine transition-all hover:opacity-95 hover:scale-[1.02] mt-6"
              style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", boxShadow: "0 8px 32px rgba(124,58,237,0.45)" }}
              onClick={() => navigate("/auth")}
            >
              Зарегистрироваться бесплатно
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/[0.05] py-8">
        <div className="container px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-white/20">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
              <Code2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-medium">Code Alfacomp</span>
          </div>
          <span>© 2026 Code Alfacomp — Платформа для обучения и разработки</span>
        </div>
      </footer>
    </div>
  );
}