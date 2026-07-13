import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { flagEmoji } from "@/lib/countries";

interface FoundPlayer {
  id: string;
  nickname: string;
  display_name: string | null;
  country_code: string | null;
  avatar_url: string | null;
  rating_blitz: number;
}

export function PlayerSearch({ currentUserId, currentNickname, currentCountry }: {
  currentUserId: string;
  currentNickname: string;
  currentCountry: string | null;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<FoundPlayer[]>([]);
  const [sent, setSent] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, nickname, display_name, country_code, avatar_url, rating_blitz")
        .ilike("nickname", `%${q.trim()}%`)
        .neq("id", currentUserId)
        .limit(8);
      setResults(((data as unknown) as FoundPlayer[]) ?? []);
    }, 250);
    return () => clearTimeout(timer);
  }, [q, currentUserId]);

  const sendRequest = async (target: FoundPlayer) => {
    const { data: existing } = await supabase
      .from("friendships")
      .select("id")
      .or(
        `and(requester_id.eq.${currentUserId},addressee_id.eq.${target.id}),and(requester_id.eq.${target.id},addressee_id.eq.${currentUserId})`,
      )
      .maybeSingle();
    if (existing) {
      setSent((s) => new Set(s).add(target.id));
      return;
    }
    const { data: fr } = await supabase
      .from("friendships")
      .insert({ requester_id: currentUserId, addressee_id: target.id })
      .select("id")
      .single();
    if (fr) {
      await supabase.from("notifications").insert({
        user_id: target.id,
        type: "friend_request",
        payload: {
          friendship_id: fr.id,
          from_nickname: currentNickname,
          from_country: currentCountry,
        },
      });
    }
    setSent((s) => new Set(s).add(target.id));
  };

  return (
    <div className="relative w-full">
      <input
        className="input-base w-full"
        placeholder="Поиск игроков…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {results.length > 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 card-panel p-2 z-30 max-h-72 overflow-auto">
          {results.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40"
            >
              <div className="text-xl flex-shrink-0">{flagEmoji(p.country_code)}</div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">@{p.nickname}</div>
                <div className="text-xs text-muted-foreground">Блиц {p.rating_blitz}</div>
              </div>
              <button
                className="btn-ghost py-1 px-2 text-xs flex-shrink-0"
                disabled={sent.has(p.id)}
                onClick={() => sendRequest(p)}
              >
                {sent.has(p.id) ? "✓" : "+ Дружить"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
