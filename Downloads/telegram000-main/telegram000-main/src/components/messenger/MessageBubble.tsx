import type { Message } from "./ChatView";
import type { Profile } from "@/hooks/useAuth";
import { FileText, Play } from "lucide-react";

const URL_RE = /\b((?:https?:\/\/|www\.)[^\s<]+|[a-z0-9-]+\.(?:com|uz|ru|ai|net|org|io|dev|app|co|me|info|xyz|tv|us|uk|de|fr|es|it|cn|jp)(?:\/[^\s<]*)?)/gi;

function renderText(text: string) {
  const parts: (string | { url: string; label: string })[] = [];
  let last = 0;
  text.replace(URL_RE, (match, _g, offset: number) => {
    if (offset > last) parts.push(text.slice(last, offset));
    const url = match.startsWith("http") ? match : (match.startsWith("www.") ? `https://${match}` : `https://${match}`);
    parts.push({ url, label: match });
    last = offset + match.length;
    return match;
  });
  if (last < text.length) parts.push(text.slice(last));
  return parts.map((p, i) =>
    typeof p === "string"
      ? <span key={i}>{p}</span>
      : <a key={i} href={p.url} target="_blank" rel="noreferrer" className="text-link underline">{p.label}</a>
  );
}

export function MessageBubble({ m, mine, sender, showSender }: {
  m: Message; mine: boolean; sender?: Profile; showSender: boolean;
}) {
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`relative max-w-[75%] rounded-2xl px-3 py-2 shadow-sm ${
        mine ? "bg-bubble-out text-bubble-out-foreground rounded-br-sm" : "bg-bubble-in text-bubble-in-foreground rounded-bl-sm"
      }`} style={{ fontSize: `calc(15px * var(--ui-scale))` }}>
        {showSender && !mine && sender && (
          <div className="mb-0.5 text-xs font-semibold text-link">{sender.display_name}</div>
        )}
        {m.type === "text" && (
          <div className="whitespace-pre-wrap break-words leading-snug">{renderText(m.content ?? "")}</div>
        )}
        {m.type === "sticker" && (
          <div style={{ fontSize: `calc(64px * var(--ui-scale))`, lineHeight: 1 }}>{m.content}</div>
        )}
        {m.type === "image" && m.file_url && (
          <a href={m.file_url} target="_blank" rel="noreferrer">
            <img src={m.file_url} alt="" className="max-h-80 rounded-lg" />
          </a>
        )}
        {m.type === "voice" && m.file_url && (
          <audio controls src={m.file_url} className="max-w-[260px]" />
        )}
        {m.type === "file" && m.file_url && (
          <a href={m.file_url} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 rounded-lg bg-background/30 px-2 py-1.5">
            <FileText className="h-5 w-5" />
            <span className="truncate text-sm">{m.file_name ?? "Файл"}</span>
          </a>
        )}
        <div className={`mt-0.5 text-right text-[10px] opacity-70`}>
          {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}
