import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Настройки — Шахматы онлайн" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { profile, refreshProfile } = useAuth();
  const [form, setForm] = useState({
    language: "ru",
    board_theme: "classic",
    premoves_enabled: true,
    sounds_enabled: true,
    show_legal_moves: true,
    auto_queen: true,
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        language: profile.language ?? "ru",
        board_theme: profile.board_theme ?? "classic",
        premoves_enabled: profile.premoves_enabled ?? true,
        sounds_enabled: profile.sounds_enabled ?? true,
        show_legal_moves: profile.show_legal_moves ?? true,
        auto_queen: profile.auto_queen ?? true,
      });
    }
  }, [profile]);

  const save = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        language: form.language,
        board_theme: form.board_theme,
        premoves_enabled: form.premoves_enabled,
        sounds_enabled: form.sounds_enabled,
        show_legal_moves: form.show_legal_moves,
        auto_queen: form.auto_queen,
      })
      .eq("id", profile.id);
    setSaving(false);
    if (!error) {
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  if (!profile) return <div className="min-h-screen grid place-items-center text-muted-foreground">…</div>;

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between p-4 md:p-6">
        <Link to="/home" className="text-xl text-primary">← Назад</Link>
        <h1 className="text-2xl md:text-3xl font-bold">⚙ Настройки</h1>
        <div className="w-16" />
      </header>
      <div className="max-w-xl mx-auto px-4 pb-16">
        <div className="card-panel p-6 space-y-5">
          <Field label="Язык интерфейса">
            <select
              className="input-base"
              value={form.language}
              onChange={(e) => setForm({ ...form, language: e.target.value })}
            >
              <option value="ru">Русский</option>
              <option value="en">English</option>
            </select>
          </Field>
          <Field label="Тема доски">
            <select
              className="input-base"
              value={form.board_theme}
              onChange={(e) => setForm({ ...form, board_theme: e.target.value })}
            >
              <option value="classic">Классика</option>
              <option value="wood">Дерево</option>
              <option value="green">Зелёная</option>
              <option value="neon">Неон</option>
            </select>
          </Field>
          <Toggle
            label="Премувы (ходить заранее)"
            value={form.premoves_enabled}
            onChange={(v) => setForm({ ...form, premoves_enabled: v })}
          />
          <Toggle
            label="Звуки ходов"
            value={form.sounds_enabled}
            onChange={(v) => setForm({ ...form, sounds_enabled: v })}
          />
          <Toggle
            label="Показывать легальные ходы"
            value={form.show_legal_moves}
            onChange={(v) => setForm({ ...form, show_legal_moves: v })}
          />
          <Toggle
            label="Авто-превращение в ферзя"
            value={form.auto_queen}
            onChange={(v) => setForm({ ...form, auto_queen: v })}
          />
          <button onClick={save} disabled={saving} className="btn-primary w-full">
            {saving ? "Сохраняем…" : saved ? "✓ Сохранено" : "Сохранить"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer">
      <span className="text-sm">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${value ? "bg-primary" : "bg-muted"}`}
        role="switch"
        aria-checked={value}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all duration-200 ${value ? "left-[22px]" : "left-0.5"}`}
        />
      </button>
    </label>
  );
}
