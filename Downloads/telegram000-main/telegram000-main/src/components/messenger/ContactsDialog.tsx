import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { findOrCreateDirectChat } from "@/lib/chat-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ContactsDialog({ open, onOpenChange, myProfileId, onPickChat }: {
  open: boolean; onOpenChange: (v: boolean) => void; myProfileId: string;
  onPickChat: (chatId: string) => void;
}) {
  const { t } = useI18n();
  const [contacts, setContacts] = useState<any[]>([]);

  useEffect(() => {
    if (!open) return;
    (async () => {
      // contacts = unique other profiles from any direct/bot chat the user is in
      const { data: mine } = await supabase.from("chat_members").select("chat_id").eq("profile_id", myProfileId);
      const ids = (mine ?? []).map((m: any) => m.chat_id);
      if (!ids.length) { setContacts([]); return; }
      const { data: members } = await supabase.from("chat_members").select("profile_id,chat_id")
        .in("chat_id", ids).neq("profile_id", myProfileId);
      const otherIds = Array.from(new Set((members ?? []).map((m: any) => m.profile_id)));
      if (!otherIds.length) { setContacts([]); return; }
      const { data: profs } = await supabase.from("profiles").select("*").in("id", otherIds);
      setContacts(profs ?? []);
    })();
  }, [open, myProfileId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{t("contacts")}</DialogTitle></DialogHeader>
        <div className="max-h-96 overflow-y-auto">
          {contacts.length === 0 && <p className="p-4 text-center text-muted-foreground">{t("noResults")}</p>}
          {contacts.map((p) => (
            <button key={p.id} onClick={async () => {
                const id = await findOrCreateDirectChat(myProfileId, p.id, p.is_bot);
                onPickChat(id);
              }}
              className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-accent">
              <Avatar className="h-11 w-11">
                {p.avatar_url && <AvatarImage src={p.avatar_url} />}
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {p.display_name[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{p.display_name}{p.is_bot && " 🤖"}</div>
                <div className="text-xs text-muted-foreground">@{p.username}</div>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
