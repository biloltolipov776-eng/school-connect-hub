import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Paperclip, Send, Smile, Square } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import type { Message } from "./ChatView";

const STICKERS = ["😀","😂","🥰","😎","🤔","😢","😡","🎉","🔥","👍","❤️","🚀","🎁","🙏","💯","🌹"];

export function MessageInput({
  onSend, botCommands,
}: {
  onSend: (m: Partial<Message>) => Promise<void>;
  botCommands: { command: string; description: string }[];
}) {
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const showSuggest = botCommands.length > 0 && text.startsWith("/") && !text.includes(" ");
  const filtered = botCommands.filter((c) => c.command.startsWith(text));

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const t = text.trim();
    if (!t) return;
    setText("");
    await onSend({ type: "text", content: t });
  };

  const sendSticker = async (s: string) => onSend({ type: "sticker", content: s });

  const onFile = async (file: File) => {
    const ext = file.name.split(".").pop() ?? "bin";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, file);
    if (error) { toast.error(error.message); return; }
    const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path);
    const isImg = file.type.startsWith("image/");
    await onSend({
      type: isImg ? "image" : "file", file_url: publicUrl, file_name: file.name,
    });
  };

  const startRecord = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const path = `voice-${crypto.randomUUID()}.webm`;
        const { error } = await supabase.storage.from("media").upload(path, blob);
        if (error) { toast.error(error.message); return; }
        const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path);
        await onSend({ type: "voice", file_url: publicUrl });
      };
      mr.start();
      recRef.current = mr;
      setRecording(true);
    } catch { toast.error("Нет доступа к микрофону"); }
  };
  const stopRecord = () => { recRef.current?.stop(); setRecording(false); };

  return (
    <div className="border-t bg-card">
      {showSuggest && filtered.length > 0 && (
        <div className="max-h-48 overflow-y-auto border-b">
          {filtered.map((c) => (
            <button key={c.command} onClick={() => setText(c.command + " ")}
              className="flex w-full items-baseline gap-2 px-4 py-2 text-left hover:bg-accent">
              <span className="font-mono text-link">{c.command}</span>
              <span className="text-sm text-muted-foreground truncate">{c.description}</span>
            </button>
          ))}
        </div>
      )}
      <form onSubmit={submit} className="flex items-end gap-1 p-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" size="icon" variant="ghost"><Smile className="h-5 w-5" /></Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2">
            <div className="grid grid-cols-6 gap-1">
              {STICKERS.map((s) => (
                <button key={s} type="button" onClick={() => sendSticker(s)}
                  className="rounded-md p-1 text-2xl hover:bg-accent">{s}</button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <Button type="button" size="icon" variant="ghost" onClick={() => fileRef.current?.click()}>
          <Paperclip className="h-5 w-5" />
        </Button>
        <input ref={fileRef} type="file" hidden
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
        <textarea
          value={text} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) submit(e as any); }}
          rows={1} placeholder="Сообщение..."
          className="max-h-32 flex-1 resize-none rounded-2xl bg-input px-3 py-2 outline-none"
        />
        {text.trim() ? (
          <Button type="submit" size="icon"><Send className="h-5 w-5" /></Button>
        ) : recording ? (
          <Button type="button" size="icon" variant="destructive" onClick={stopRecord}>
            <Square className="h-5 w-5" />
          </Button>
        ) : (
          <Button type="button" size="icon" variant="ghost" onClick={startRecord}>
            <Mic className="h-5 w-5" />
          </Button>
        )}
      </form>
    </div>
  );
}
