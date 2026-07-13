import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { flagEmoji } from "@/lib/countries";

const OPTIONS: { label: string; category: "bullet" | "blitz" | "rapid"; init: number; inc: number }[] = [
  { label: "1+0", category: "bullet", init: 60, inc: 0 },
  { label: "2+1", category: "bullet", init: 120, inc: 1 },
  { label: "3+0", category: "blitz", init: 180, inc: 0 },
  { label: "5+0", category: "blitz", init: 300, inc: 0 },
  { label: "5+3", category: "blitz", init: 300, inc: 3 },
  { label: "10+0", category: "rapid", init: 600, inc: 0 },
  { label: "15+10", category: "rapid", init: 900, inc: 10 },
];

interface Friend {
  id: string;
  nickname: string;
  display_name: string | null;
  avatar_url: string | null;
  country_code: string | null;
  rating_blitz: number;
}

interface SearchResult {
  id: string;
  nickname: string;
  display_name: string | null;
  avatar_url: string | null;
  country_code: string | null;
  rating_blitz: number;
}

export function PlayModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [opponent, setOpponent] = useState<"ai" | "friend" | null>(null);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [friendSearch, setFriendSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const navigate = useNavigate();

  // Load accepted friends list
  useEffect(() => {
    if (!user || opponent !== "friend") return;
    const load = async () => {
      const { data } = await supabase
        .from("friendships")
        .select("requester_id, addressee_id")
        .eq("status", "accepted")
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      if (!data) return;

      const otherIds = data.map((f) =>
        f.requester_id === user.id ? f.addressee_id : f.requester_id,
      );
      if (otherIds.length === 0) {
        setFriends([]);
        return;
      }
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, nickname, display_name, avatar_url, country_code, rating_blitz")
        .in("id", otherIds);
      setFriends((profiles as Friend[]) ?? []);
    };
    void load();
  }, [user, opponent]);

  // Search for players
  useEffect(() => {
    if (!user || friendSearch.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, nickname, display_name, avatar_url, country_code, rating_blitz")
        .ilike("nickname", `%${friendSearch.trim()}%`)
        .neq("id", user.id)
        .limit(8);
      setSearchResults((data as SearchResult[]) ?? []);
    }, 250);
    return () => clearTimeout(timer);
  }, [friendSearch, user]);

  const start = (init: number, inc: number, cat: string) => {
    if (opponent === "ai") {
      const params = new URLSearchParams({
        init: String(init),
        inc: String(inc),
        cat,
        diff: difficulty,
      });
      navigate({ to: "/play/ai", search: Object.fromEntries(params) as never });
    } else if (opponent === "friend" && selectedFriend) {
      // Friend online matches coming soon — for now alert
      alert(`Матч с @${selectedFriend.nickname} скоро будет доступен! Пока играйте с ИИ.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-3" onClick={onClose}>
      <div className="card-panel w-full max-w-lg p-5 space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-semibold">Играть</h2>

        {/* Step 1: choose opponent type */}
        {!opponent && (
          <div className="grid grid-cols-2 gap-3">
            <button className="btn-ghost h-28 flex-col gap-2" onClick={() => setOpponent("friend")}>
              <span className="text-3xl">👥</span>
              <span>С другом онлайн</span>
              <span className="text-xs text-muted-foreground">Пригласить из друзей</span>
            </button>
            <button className="btn-ghost h-28 flex-col gap-2" onClick={() => setOpponent("ai")}>
              <span className="text-3xl">🤖</span>
              <span>Против ИИ</span>
              <span className="text-xs text-muted-foreground">Gemini 2.5 Flash</span>
            </button>
          </div>
        )}

        {/* Step 2a: Friend mode */}
        {opponent === "friend" && !selectedFriend && (
          <div className="space-y-3">
            {/* Search bar */}
            <input
              className="input-base w-full"
              placeholder="Поиск игроков по нику…"
              value={friendSearch}
              onChange={(e) => setFriendSearch(e.target.value)}
              autoFocus
            />

            {/* Search results */}
            {searchResults.length > 0 && (
              <div className="card-panel p-2 space-y-1 max-h-40 overflow-y-auto">
                {searchResults.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedFriend(p); setFriendSearch(""); setSearchResults([]); }}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40 text-left"
                  >
                    <div className="text-xl">{flagEmoji(p.country_code)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">@{p.nickname}</div>
                      <div className="text-xs text-muted-foreground">Блиц {p.rating_blitz}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Friends list */}
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Мои друзья</div>
              {friends.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Нет принятых друзей. Найдите игроков через поиск.</p>
              ) : (
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {friends.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFriend(f)}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40 text-left"
                    >
                      <div
                        className="h-9 w-9 rounded-full border border-border bg-muted flex-shrink-0 grid place-items-center text-sm font-bold bg-cover bg-center"
                        style={f.avatar_url ? { backgroundImage: `url(${f.avatar_url})` } : undefined}
                      >
                        {!f.avatar_url && (f.display_name || f.nickname)[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">@{f.nickname}</div>
                        <div className="text-xs text-muted-foreground">Блиц {f.rating_blitz}</div>
                      </div>
                      <span className="text-xs text-muted-foreground">{flagEmoji(f.country_code)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button className="btn-ghost w-full" onClick={() => setOpponent(null)}>
              Назад
            </button>
          </div>
        )}

        {/* Step 2b: Friend selected — choose time control */}
        {opponent === "friend" && selectedFriend && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border">
              <div
                className="h-10 w-10 rounded-full border border-border bg-muted flex-shrink-0 grid place-items-center text-sm font-bold bg-cover bg-center"
                style={selectedFriend.avatar_url ? { backgroundImage: `url(${selectedFriend.avatar_url})` } : undefined}
              >
                {!selectedFriend.avatar_url && (selectedFriend.display_name || selectedFriend.nickname)[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium">@{selectedFriend.nickname}</div>
                <div className="text-xs text-muted-foreground">{flagEmoji(selectedFriend.country_code)} Блиц {selectedFriend.rating_blitz}</div>
              </div>
              <button className="text-xs text-muted-foreground hover:text-foreground" onClick={() => setSelectedFriend(null)}>✕</button>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Контроль времени</div>
              <div className="grid grid-cols-3 gap-2">
                {OPTIONS.map((o) => (
                  <button
                    key={o.label}
                    onClick={() => start(o.init, o.inc, o.category)}
                    className="btn-ghost flex-col py-3"
                  >
                    <span className="text-lg font-bold">{o.label}</span>
                    <span className="text-[10px] uppercase text-muted-foreground">
                      {o.category === "bullet" ? "Пуля" : o.category === "blitz" ? "Блиц" : "Рапид"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <button className="btn-ghost w-full" onClick={() => setSelectedFriend(null)}>
              Назад
            </button>
          </div>
        )}

        {/* Step 2c: AI mode */}
        {opponent === "ai" && (
          <>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Сложность ИИ</div>
              <div className="flex gap-2">
                {(["easy", "medium", "hard"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 py-2 rounded-lg border text-sm ${difficulty === d ? "bg-primary text-primary-foreground border-primary" : "border-border bg-muted/40"}`}
                  >
                    {d === "easy" ? "Лёгкий" : d === "medium" ? "Средний" : "Сложный"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Контроль времени</div>
              <div className="grid grid-cols-3 gap-2">
                {OPTIONS.map((o) => (
                  <button
                    key={o.label}
                    onClick={() => start(o.init, o.inc, o.category)}
                    className="btn-ghost flex-col py-3"
                  >
                    <span className="text-lg font-bold">{o.label}</span>
                    <span className="text-[10px] uppercase text-muted-foreground">
                      {o.category === "bullet" ? "Пуля" : o.category === "blitz" ? "Блиц" : "Рапид"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <button className="btn-ghost w-full" onClick={() => setOpponent(null)}>
              Назад
            </button>
          </>
        )}

        <button className="text-xs text-muted-foreground w-full text-center" onClick={onClose}>
          Закрыть
        </button>
      </div>
    </div>
  );
}
