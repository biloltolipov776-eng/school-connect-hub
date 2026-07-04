import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export function ProfileDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { profile, refreshProfile } = useAuth();
  const { t } = useI18n();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && profile) {
      setDisplayName(profile.display_name);
      setUsername(profile.username);
      setBio(profile.bio ?? "");
      setAvatarUrl(profile.avatar_url);
    }
  }, [open, profile]);

  const uploadAvatar = async (f: File) => {
    const path = `avatar-${profile!.id}-${Date.now()}.${f.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("media").upload(path, f, { upsert: true });
    if (error) return toast.error(error.message);
    const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path);
    setAvatarUrl(publicUrl);
  };

  const save = async () => {
    if (!profile) return;
    const clean = username.replace(/^@/, "").trim();
    const { error } = await supabase.from("profiles")
      .update({ display_name: displayName, username: clean, bio, avatar_url: avatarUrl })
      .eq("id", profile.id);
    if (error) return toast.error(error.message);
    await refreshProfile();
    toast.success("Сохранено");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{t("myProfile")}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-2">
            <button onClick={() => fileRef.current?.click()} className="rounded-full">
              <Avatar className="h-24 w-24 cursor-pointer ring-2 ring-primary">
                {avatarUrl && <AvatarImage src={avatarUrl} />}
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {displayName?.[0]?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); }} />
            <span className="text-xs text-muted-foreground">{t("changePhoto")}</span>
          </div>
          <div><Label>{t("displayName")}</Label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} /></div>
          <div><Label>@{t("username")}</Label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} /></div>
          <div><Label>{t("bio")}</Label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>{t("cancel")}</Button>
          <Button onClick={save}>{t("save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
