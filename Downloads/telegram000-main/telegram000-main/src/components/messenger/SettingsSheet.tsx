import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useI18n, LANGS, type Lang } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Users, UsersRound, Sun, Moon, Languages, Type } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function SettingsSheet({ open, onOpenChange, onOpenProfile, onOpenNewGroup, onOpenContacts }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  onOpenProfile: () => void; onOpenNewGroup: () => void; onOpenContacts: () => void;
}) {
  const { t, lang, setLang } = useI18n();
  const { theme, setTheme, size, setSize } = useTheme();
  const { profile } = useAuth();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="border-b p-4">
          <SheetTitle>{t("settings")}</SheetTitle>
        </SheetHeader>
        <div className="space-y-1 p-2">
          <button onClick={onOpenProfile}
            className="flex w-full items-center gap-3 rounded-lg p-3 hover:bg-accent">
            <Avatar className="h-14 w-14">
              {profile?.avatar_url && <AvatarImage src={profile.avatar_url} />}
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {profile?.display_name?.[0]?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 text-left">
              <div className="truncate font-semibold">{profile?.display_name}</div>
              <div className="truncate text-sm text-muted-foreground">@{profile?.username}</div>
            </div>
          </button>

          <MenuItem icon={<User className="h-4 w-4" />} label={t("myProfile")} onClick={onOpenProfile} />
          <MenuItem icon={<UsersRound className="h-4 w-4" />} label={t("newGroup")} onClick={onOpenNewGroup} />
          <MenuItem icon={<Users className="h-4 w-4" />} label={t("contacts")} onClick={onOpenContacts} />

          <div className="my-2 border-t" />
          <div className="px-3 pt-2 text-xs font-semibold uppercase text-muted-foreground">{t("display")}</div>

          <div className="space-y-2 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-sm">
                {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                {t("theme")}
              </span>
              <Select value={theme} onValueChange={(v) => setTheme(v as any)}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">{t("themeDark")}</SelectItem>
                  <SelectItem value="light">{t("themeLight")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-sm"><Type className="h-4 w-4" />{t("size")}</span>
              <Select value={size} onValueChange={(v) => setSize(v as any)}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sm">{t("small")}</SelectItem>
                  <SelectItem value="md">{t("medium")}</SelectItem>
                  <SelectItem value="lg">{t("large")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-sm"><Languages className="h-4 w-4" />{t("language")}</span>
              <Select value={lang} onValueChange={(v) => setLang(v as Lang)}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LANGS.map((l) => <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="my-2 border-t" />
          <Button variant="ghost" className="w-full justify-start gap-2 text-destructive"
            onClick={() => supabase.auth.signOut()}>
            <LogOut className="h-4 w-4" /> {t("logout")}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MenuItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-accent">
      <span className="text-muted-foreground">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
