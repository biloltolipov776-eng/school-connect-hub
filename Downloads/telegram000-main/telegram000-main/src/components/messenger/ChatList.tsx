import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Menu, Search } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { ChatListItem } from "@/lib/chat-api";
import type { Profile } from "@/hooks/useAuth";
import { formatDistanceToNowStrict } from "date-fns";

export function ChatList({
  chats, activeId, onSelect, search, onSearchChange, onOpenSettings, myProfile,
}: {
  chats: ChatListItem[]; activeId: string | null; onSelect: (id: string) => void;
  search: string; onSearchChange: (s: string) => void; onOpenSettings: () => void;
  myProfile: Profile;
}) {
  const { t } = useI18n();
  return (
    <aside className="flex w-80 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 p-3">
        <Button size="icon" variant="ghost" onClick={onOpenSettings} aria-label={t("settings")}>
          <Menu className="h-5 w-5" />
        </Button>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("search")} className="pl-9 rounded-full bg-input border-0" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 && (
          <p className="p-6 text-center text-sm text-muted-foreground">
            Пусто. Начните с поиска: введите @никнейм или название.
          </p>
        )}
        {chats.map((c) => {
          const title = c.type === "group" ? (c.name ?? "Группа") : (c.other?.display_name ?? "?");
          const sub = c.type === "group" ? "Группа" : (c.other ? `@${c.other.username}` : "");
          const avatarUrl = c.type === "group" ? c.avatar_url : c.other?.avatar_url;
          const initials = (title.match(/\S/) ?? ["?"])[0].toUpperCase();
          const isActive = activeId === c.id;
          return (
            <button key={c.id} onClick={() => onSelect(c.id)}
              className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                isActive ? "bg-primary text-primary-foreground" : "hover:bg-sidebar-accent"
              }`}>
              <Avatar className="h-12 w-12">
                {avatarUrl && <AvatarImage src={avatarUrl} />}
                <AvatarFallback className={isActive ? "bg-primary-foreground/20" : "bg-primary text-primary-foreground"}>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate font-medium">{title}{c.other?.is_bot && " 🤖"}</span>
                  <span className={`shrink-0 text-xs ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    {timeShort(c.last_message_at)}
                  </span>
                </div>
                <div className={`truncate text-sm ${isActive ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
                  {c.last_text ?? sub}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-2 border-t p-2 text-xs text-muted-foreground">
        @{myProfile.username}
      </div>
    </aside>
  );
}

function timeShort(iso: string) {
  try {
    return formatDistanceToNowStrict(new Date(iso), { addSuffix: false })
      .replace(" minutes", "м").replace(" minute", "м")
      .replace(" hours", "ч").replace(" hour", "ч")
      .replace(" days", "д").replace(" day", "д")
      .replace(" seconds", "с").replace(" second", "с");
  } catch { return ""; }
}
