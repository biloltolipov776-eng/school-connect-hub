import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/hooks/use-auth";
import { flagEmoji, countryName } from "@/lib/countries";

export function ProfileModal({
  profile,
  onClose,
  onSaved,
}: {
  profile: Profile;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [displayName, setDisplayName] = useState(profile.display_name ?? profile.nickname);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const save = async () => {
    setSaving(true);
    await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim() || profile.nickname,
        avatar_url: avatarUrl.trim() || null,
        // country_code is NOT updated here — it is set automatically on registration
      })
      .eq("id", profile.id);
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="card-panel w-full max-w-md p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4">
          <div
            className="h-20 w-20 rounded-full border-2 border-primary/40 bg-cover bg-center bg-muted grid place-items-center text-2xl flex-shrink-0"
            style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined}
          >
            {!avatarUrl && (displayName?.[0] ?? profile.nickname[0])?.toUpperCase()}
          </div>
          <div>
            <div className="text-xs uppercase text-muted-foreground">Ник (неизменяем)</div>
            <div className="text-lg font-medium">@{profile.nickname}</div>
            {/* Country: display only, cannot be changed */}
            <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <span className="text-base">{flagEmoji(profile.country_code)}</span>
              <span>{countryName(profile.country_code)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <RatingCell label="Пуля" value={profile.rating_bullet} />
          <RatingCell label="Блиц" value={profile.rating_blitz} />
          <RatingCell label="Рапид" value={profile.rating_rapid} />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wider text-muted-foreground">
            Отображаемое имя
          </label>
          <input
            className="input-base"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wider text-muted-foreground">
            Ссылка на аватарку
          </label>
          <input
            className="input-base"
            placeholder="https://..."
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
          />
        </div>

        {/* Country is auto-detected, not editable */}
        <div className="rounded-lg border border-border bg-muted/20 px-3 py-2 flex items-center gap-2">
          <span className="text-lg">{flagEmoji(profile.country_code)}</span>
          <div className="flex-1">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Регион (определяется автоматически)</div>
            <div className="text-sm font-medium">{countryName(profile.country_code)}</div>
          </div>
          <span className="text-xs text-muted-foreground">🔒</span>
        </div>

        <div className="flex gap-2 pt-2">
          <button className="btn-ghost flex-1" onClick={onClose}>
            Отмена
          </button>
          <button className="btn-primary flex-1" onClick={save} disabled={saving}>
            {saving ? "…" : "Сохранить"}
          </button>
        </div>
      </div>
    </div>
  );
}

function RatingCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-muted/40 border border-border p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-xl font-bold text-primary">{value}</div>
    </div>
  );
}
