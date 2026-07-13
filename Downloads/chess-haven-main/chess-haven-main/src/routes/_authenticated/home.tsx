import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { flagEmoji, countryName } from "@/lib/countries";
import { ProfileModal } from "@/components/profile-modal";
import { NotificationsPanel } from "@/components/notifications-panel";
import { PlayerSearch } from "@/components/player-search";
import { PlayModal } from "@/components/play-modal";

export const Route = createFileRoute("/_authenticated/home")({
  head: () => ({
    meta: [
      { title: "Шахматы онлайн — главная" },
      { name: "description", content: "Играть, турниры, топ лидеров, друзья." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [playOpen, setPlayOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("read", false);
      setUnread(count ?? 0);
    };
    void load();
    const channel = supabase
      .channel("notif-" + user.id)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => void load(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user]);

  if (!user || !profile) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">…</div>;
  }

  return (
    <div className="min-h-screen relative flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-3 gap-3 flex-wrap">
        <Link to="/home" className="text-xl md:text-2xl font-bold text-primary whitespace-nowrap">
          ♞ Шахматы
        </Link>
        <div className="flex-1 min-w-0">
          <PlayerSearch
            currentUserId={user.id}
            currentNickname={profile.nickname}
            currentCountry={profile.country_code}
          />
        </div>
        <button
          onClick={async () => {
            await signOut();
            navigate({ to: "/auth" });
          }}
          className="btn-ghost text-xs px-3 py-1.5"
        >
          Выйти
        </button>
      </header>

      {/* Hero */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 pt-6 pb-28 flex flex-col">
        <div>
          <h1 className="text-4xl md:text-6xl font-bold leading-[0.95]">
            Добро пожаловать,<br />
            <span className="text-primary">@{profile.nickname}</span>
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            {flagEmoji(profile.country_code)} {countryName(profile.country_code)} · Ваш путь к вершине шахматного рейтинга.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-2">
            <RatingChip label="Пуля" value={profile.rating_bullet} />
            <RatingChip label="Блиц" value={profile.rating_blitz} />
            <RatingChip label="Рапид" value={profile.rating_rapid} />
          </div>
        </div>

        {/* Action buttons — full width on mobile */}
        <div className="mt-8 flex flex-col gap-3 w-full">
          <button className="btn-primary w-full py-4 text-base" onClick={() => setPlayOpen(true)}>
            ♟ Играть
          </button>
          <Link to="/tournaments" className="btn-ghost w-full py-4 text-center">🏆 Турниры</Link>
          <Link to="/settings" className="btn-ghost w-full py-4 text-center">⚙ Настройки</Link>
          <Link to="/leaderboard" className="btn-ghost w-full py-4 text-center">👑 Топ лидеров</Link>
        </div>
      </main>

      {/* Bottom-right profile circle + bell */}
      <div className="fixed bottom-6 right-4 flex flex-col items-end gap-3 z-30">
        <div className="relative">
          <button
            className="btn-icon h-11 w-11 relative"
            onClick={() => setNotifOpen((v) => !v)}
            aria-label="Уведомления"
          >
            🔔
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] rounded-full h-5 min-w-5 px-1 grid place-items-center">
                {unread}
              </span>
            )}
          </button>
          {notifOpen && <NotificationsPanel userId={user.id} onClose={() => setNotifOpen(false)} />}
        </div>
        <button
          onClick={() => setProfileOpen(true)}
          className="h-14 w-14 rounded-full border-2 border-primary/60 bg-card bg-cover bg-center shadow-lg shadow-primary/20 grid place-items-center text-xl font-bold hover:scale-105 transition"
          style={profile.avatar_url ? { backgroundImage: `url(${profile.avatar_url})` } : undefined}
          aria-label="Профиль"
        >
          {!profile.avatar_url && (profile.display_name || profile.nickname)[0]?.toUpperCase()}
        </button>
      </div>

      {profileOpen && (
        <ProfileModal profile={profile} onClose={() => setProfileOpen(false)} onSaved={refreshProfile} />
      )}
      {playOpen && <PlayModal onClose={() => setPlayOpen(false)} />}
    </div>
  );
}

function RatingChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-card/70 border border-border p-3 text-center">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold text-primary">{value}</div>
    </div>
  );
}
