import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { createGroupChat } from "@/lib/chat-api";
import { toast } from "sonner";

export function NewGroupDialog({ open, onOpenChange, myProfileId, onCreated }: {
  open: boolean; onOpenChange: (v: boolean) => void; myProfileId: string; onCreated: () => void;
}) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) { setName(""); setSearch(""); setSelected(new Set()); return; }
    const id = setTimeout(async () => {
      const { data } = await supabase.from("profiles").select("id,username,display_name,avatar_url")
        .eq("is_bot", false).neq("id", myProfileId)
        .ilike("username", `%${search.replace(/^@/, "")}%`).limit(30);
      setUsers(data ?? []);
    }, 200);
    return () => clearTimeout(id);
  }, [open, search, myProfileId]);

  const submit = async () => {
    if (!name.trim()) { toast.error("Введите название"); return; }
    try {
      await createGroupChat(myProfileId, name.trim(), Array.from(selected));
      onCreated(); onOpenChange(false);
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{t("newGroup")}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <Input placeholder={t("groupName")} value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder={t("search")} value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="max-h-64 overflow-y-auto rounded-lg border">
            {users.map((u) => (
              <label key={u.id} className="flex cursor-pointer items-center gap-3 p-2 hover:bg-accent">
                <Checkbox checked={selected.has(u.id)} onCheckedChange={(v) => {
                  setSelected((s) => { const n = new Set(s); v ? n.add(u.id) : n.delete(u.id); return n; });
                }} />
                <div>
                  <div className="font-medium">{u.display_name}</div>
                  <div className="text-xs text-muted-foreground">@{u.username}</div>
                </div>
              </label>
            ))}
            {users.length === 0 && <p className="p-4 text-center text-sm text-muted-foreground">{t("noResults")}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>{t("cancel")}</Button>
          <Button onClick={submit}>{t("create")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
