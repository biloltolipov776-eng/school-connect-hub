// @ts-nocheck
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";
import { Code2, ArrowLeft, Sparkles, Lock, Mail, User as UserIcon, Eye, EyeOff } from "lucide-react";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ variant: "destructive", title: "Ошибка", description: error.message });
      } else {
        navigate("/dashboard");
      }
    } else {
      const { error } = await signUp(email, password, fullName);
      if (error) {
        toast({ variant: "destructive", title: "Ошибка", description: error.message });
      } else {
        toast({ title: "Успех", description: "Регистрация успешна!" });
        navigate("/dashboard");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: "#060912", fontFamily: "'Outfit', sans-serif" }}>

      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)" }} />
        <div className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)" }} />
        <div className="absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }} />
      </div>

      <div className="w-full max-w-[420px] relative z-10">

        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-white/30 hover:text-white/70 transition-colors mb-8 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          На главную
        </button>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 shadow-lg shadow-violet-500/30"
            style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
            <Code2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white mb-1">
            {isLogin ? "Добро пожаловать" : "Создать аккаунт"}
          </h1>
          <p className="text-white/35 text-sm">
            {isLogin ? "Войдите в свой аккаунт Code Alfacomp" : "Начните обучение программированию"}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.08] overflow-hidden"
          style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(24px)" }}>
          <div className="p-6 md:p-7">
            <form onSubmit={handleSubmit} className="space-y-4">

              {!isLogin && (
                <div className="space-y-1.5">
                  <Label className="text-white/60 text-sm font-medium">Имя</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ваше имя"
                      required={!isLogin}
                      className="w-full pl-10 pr-4 h-11 rounded-xl border text-sm text-white placeholder:text-white/20 bg-white/5 border-white/10 focus:border-violet-500/50 focus:bg-white/8 outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-white/60 text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-4 h-11 rounded-xl border text-sm text-white placeholder:text-white/20 bg-white/5 border-white/10 focus:border-violet-500/50 focus:bg-white/8 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-white/60 text-sm font-medium">Пароль</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-11 h-11 rounded-xl border text-sm text-white placeholder:text-white/20 bg-white/5 border-white/10 focus:border-violet-500/50 focus:bg-white/8 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl text-sm font-semibold text-white btn-shine transition-all hover:opacity-95 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", boxShadow: "0 4px 20px rgba(124,58,237,0.35)" }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Загрузка...
                  </span>
                ) : (
                  isLogin ? "Войти в аккаунт" : "Создать аккаунт"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-xs text-white/20 font-medium">или</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>

            {/* Toggle auth mode */}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="w-full h-10 rounded-xl border border-white/10 bg-white/[0.03] text-sm text-white/40 hover:text-white/70 hover:bg-white/[0.06] hover:border-white/20 transition-all"
            >
              {isLogin ? "Нет аккаунта? Зарегистрироваться" : "Уже есть аккаунт? Войти"}
            </button>
          </div>

          {/* Footer strip */}
          <div className="border-t border-white/[0.05] px-6 py-3 flex items-center justify-center gap-1.5"
            style={{ background: "rgba(255,255,255,0.01)" }}>
            <Sparkles className="w-3 h-3 text-violet-400/60" />
            <span className="text-xs text-white/20">Бесплатно для учеников и учителей</span>
          </div>
        </div>
      </div>
    </div>
  );
}
