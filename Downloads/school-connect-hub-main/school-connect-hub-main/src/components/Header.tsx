// @ts-nocheck
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { 
  Code2, 
  Settings as SettingsIcon, 
  LogOut, 
  User, 
  Shield, 
  Users, 
  Menu, 
  X,
  Layers,
  BookOpen,
  Sparkles,
  ChevronDown,
  LayoutTemplate
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Header = () => {
  const { user, signOut } = useAuth();
  const { isAdmin, isTeacher } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  if (!user) return null;

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

  const NavBtn = ({ to, icon: Icon, label, color = "default" }: any) => {
    const active = isActive(to);
    const colorMap: Record<string, string> = {
      green: active
        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-[0_0_12px_hsl(142_71%_45%/0.2)]"
        : "text-emerald-400/70 border-transparent hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30",
      blue: active
        ? "bg-blue-500/15 text-blue-400 border-blue-500/40 shadow-[0_0_12px_hsl(217_91%_60%/0.2)]"
        : "text-blue-400/70 border-transparent hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/30",
      purple: active
        ? "bg-violet-500/15 text-violet-400 border-violet-500/40 shadow-[0_0_12px_hsl(252_87%_67%/0.2)]"
        : "text-violet-400/70 border-transparent hover:bg-violet-500/10 hover:text-violet-400 hover:border-violet-500/30",
      default: active
        ? "bg-primary/15 text-primary border-primary/40 shadow-[0_0_12px_hsl(var(--primary)/0.2)]"
        : "text-muted-foreground border-transparent hover:bg-primary/8 hover:text-foreground hover:border-primary/20",
    };
    return (
      <button
        onClick={() => navigate(to)}
        className={`flex items-center gap-1.5 px-3 h-8 rounded-lg border text-sm font-medium transition-all duration-200 ${colorMap[color]}`}
      >
        <Icon className="w-3.5 h-3.5 shrink-0" />
        <span>{label}</span>
      </button>
    );
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[hsl(var(--background)/0.85)] backdrop-blur-2xl border-b border-[hsl(var(--border)/0.6)] shadow-[0_4px_24px_hsl(0_0%_0%/0.2)]"
          : "bg-[hsl(var(--background)/0.6)] backdrop-blur-xl border-b border-[hsl(var(--border)/0.3)]"
      }`}
    >
      {/* Subtle top glow line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[hsl(var(--primary)/0.4)] to-transparent" />

      <div className="container flex items-center justify-between h-14 md:h-[58px] px-4 md:px-6">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="logo-3d relative w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:shadow-violet-500/50 group-hover:scale-105 transition-all duration-200">
            <Code2 className="w-4 h-4 text-white" />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-white/0 to-white/10" />
          </div>
          <span className="font-bold text-base hidden sm:block">
            <span className="text-foreground">Code</span>
            <span className="text-gradient ml-1">Alfacomp</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1.5">
          <NavBtn to="/lessons" icon={BookOpen} label="Уроки" color="green" />
          <NavBtn to="/templates" icon={LayoutTemplate} label="Шаблоны" color="purple" />
          {isAdmin && (
            <NavBtn to="/lesson-admin" icon={Sparkles} label="Редактор" color="purple" />
          )}
          <NavBtn to="/full-ide" icon={Layers} label="IDE" color="blue" />
          {isAdmin && (
            <NavBtn to="/admin" icon={Shield} label="Админ" color="purple" />
          )}
          {(isAdmin || isTeacher) && (
            <NavBtn to="/lobby" icon={Users} label="Лобби" color="default" />
          )}

          {/* Divider */}
          <div className="w-px h-5 bg-border/60 mx-1" />

          {/* Settings button */}
          <button
            onClick={() => navigate("/settings")}
            className={`flex items-center gap-1.5 px-3 h-8 rounded-lg border text-sm font-medium transition-all duration-200 ${
              isActive("/settings")
                ? "bg-primary/10 text-primary border-primary/30"
                : "text-muted-foreground border-transparent hover:bg-muted/60 hover:text-foreground"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Настройки</span>
          </button>

          {/* Sign out */}
          <button
            onClick={signOut}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-transparent text-muted-foreground hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all duration-200"
            title="Выйти"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </nav>

        {/* Mobile burger */}
        <button
          className="md:hidden relative w-9 h-9 flex items-center justify-center rounded-xl border border-border/50 bg-muted/40 hover:bg-muted/80 transition-all duration-200"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Меню"
        >
          <span className={`absolute transition-all duration-200 ${menuOpen ? "opacity-100 rotate-0" : "opacity-0 rotate-90"}`}>
            <X className="w-4 h-4" />
          </span>
          <span className={`absolute transition-all duration-200 ${menuOpen ? "opacity-0 -rotate-90" : "opacity-100 rotate-0"}`}>
            <Menu className="w-4 h-4" />
          </span>
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden animate-slide-down">
          <div className="border-t border-border/40 bg-[hsl(var(--background)/0.95)] backdrop-blur-2xl">
            <div className="container px-4 py-3 space-y-1">
              {[
                { to: "/lessons", icon: BookOpen, label: "Уроки", show: true, color: "text-emerald-400" },
                { to: "/templates", icon: LayoutTemplate, label: "Шаблоны", show: true, color: "text-violet-400" },
                { to: "/lesson-admin", icon: Sparkles, label: "Редактор уроков", show: isAdmin, color: "text-violet-400" },
                { to: "/full-ide", icon: Layers, label: "Всё сразу (IDE)", show: true, color: "text-blue-400" },
                { to: "/admin", icon: Shield, label: "Панель администратора", show: isAdmin, color: "text-primary" },
                { to: "/lobby", icon: Users, label: "Лобби", show: isAdmin || isTeacher, color: "text-primary" },
                { to: "/settings", icon: SettingsIcon, label: "Настройки", show: true, color: "text-muted-foreground" },
              ].filter(item => item.show).map(item => (
                <button
                  key={item.to}
                  className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl hover:bg-muted/60 text-sm font-medium transition-all duration-150 ${
                    isActive(item.to) ? `${item.color} bg-muted/40` : item.color
                  }`}
                  onClick={() => navigate(item.to)}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </button>
              ))}
              <div className="h-px bg-border/40 my-1" />
              <button
                className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-sm font-medium text-red-400 transition-all duration-150"
                onClick={signOut}
              >
                <LogOut className="w-4 h-4" />
                Выйти
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
