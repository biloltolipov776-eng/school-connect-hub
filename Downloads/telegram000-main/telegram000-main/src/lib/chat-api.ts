import { supabase } from "@/integrations/supabase/client";

export type ChatRow = {
  id: string; type: "direct" | "group" | "bot"; name: string | null;
  avatar_url: string | null; last_message_at: string;
};
export type ChatListItem = ChatRow & {
  other?: { id: string; username: string; display_name: string; avatar_url: string | null; is_bot: boolean } | null;
  last_text?: string | null;
};

export async function loadChatsForProfile(profileId: string): Promise<ChatListItem[]> {
  const { data: memberships } = await supabase
    .from("chat_members").select("chat_id").eq("profile_id", profileId);
  const ids = (memberships ?? []).map((m: any) => m.chat_id);
  if (!ids.length) return [];
  const { data: chats } = await supabase.from("chats").select("*")
    .in("id", ids).order("last_message_at", { ascending: false });
  // For direct/bot chats, find the other member
  const result: ChatListItem[] = [];
  for (const c of chats ?? []) {
    let other = null;
    if (c.type === "direct" || c.type === "bot") {
      const { data: members } = await supabase.from("chat_members")
        .select("profile_id").eq("chat_id", c.id);
      const otherId = members?.find((m: any) => m.profile_id !== profileId)?.profile_id;
      if (otherId) {
        const { data: p } = await supabase.from("profiles")
          .select("id,username,display_name,avatar_url,is_bot").eq("id", otherId).maybeSingle();
        other = p as any;
      }
    }
    const { data: lastMsg } = await supabase.from("messages")
      .select("content,type").eq("chat_id", c.id)
      .order("created_at", { ascending: false }).limit(1).maybeSingle();
    result.push({ ...c, other, last_text: lastMsg?.content ?? (lastMsg?.type ? `[${lastMsg.type}]` : null) } as any);
  }
  return result;
}

export async function findOrCreateDirectChat(myProfileId: string, otherProfileId: string, isBot: boolean): Promise<string> {
  // Find existing chats where both are members
  const { data: mine } = await supabase.from("chat_members").select("chat_id").eq("profile_id", myProfileId);
  const { data: theirs } = await supabase.from("chat_members").select("chat_id").eq("profile_id", otherProfileId);
  const mineIds = new Set((mine ?? []).map((m: any) => m.chat_id));
  const shared = (theirs ?? []).map((m: any) => m.chat_id).filter((id: string) => mineIds.has(id));
  if (shared.length) {
    const { data: chat } = await supabase.from("chats").select("*")
      .in("id", shared).in("type", isBot ? ["bot"] : ["direct"]).limit(1).maybeSingle();
    if (chat) return chat.id;
  }
  const { data: created, error } = await supabase.from("chats")
    .insert({ type: isBot ? "bot" : "direct", created_by: myProfileId })
    .select().single();
  if (error) throw error;
  await supabase.from("chat_members").insert([
    { chat_id: created.id, profile_id: myProfileId },
    { chat_id: created.id, profile_id: otherProfileId },
  ]);
  return created.id;
}

export async function createGroupChat(myProfileId: string, name: string, memberIds: string[]) {
  const { data: chat, error } = await supabase.from("chats")
    .insert({ type: "group", name, created_by: myProfileId }).select().single();
  if (error) throw error;
  const all = Array.from(new Set([myProfileId, ...memberIds]));
  await supabase.from("chat_members").insert(all.map((pid) => ({ chat_id: chat.id, profile_id: pid })));
  return chat.id;
}

export async function searchAll(query: string) {
  const q = query.trim();
  if (!q) return { users: [], groups: [], bots: [] };
  const isAt = q.startsWith("@");
  const term = q.replace(/^@/, "");
  const { data: profiles } = await supabase.from("profiles").select("*")
    .ilike("username", `%${term}%`).limit(20);
  const users = (profiles ?? []).filter((p: any) => !p.is_bot);
  const bots = (profiles ?? []).filter((p: any) => p.is_bot && p.username.toLowerCase().endsWith("bot"));
  let groups: any[] = [];
  if (!isAt) {
    const { data: g } = await supabase.from("chats").select("*")
      .eq("type", "group").ilike("name", `%${q}%`).limit(20);
    groups = g ?? [];
  }
  return { users, groups, bots };
}
