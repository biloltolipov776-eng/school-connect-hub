
-- Profiles (also represents bots; bots have is_bot=true)
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text not null,
  avatar_url text,
  bio text,
  email text,
  is_bot boolean not null default false,
  bot_owner_id uuid references public.profiles(id) on delete cascade,
  bot_token text,
  bot_link text,
  created_at timestamptz not null default now()
);
create index on public.profiles (lower(username));
create index on public.profiles (bot_owner_id);

alter table public.profiles enable row level security;

create policy "profiles readable by all authenticated"
  on public.profiles for select to authenticated using (true);

create policy "users can insert own profile"
  on public.profiles for insert to authenticated
  with check (user_id = auth.uid() or (is_bot = true and bot_owner_id in (select id from public.profiles where user_id = auth.uid())));

create policy "users update own profile or own bots"
  on public.profiles for update to authenticated
  using (user_id = auth.uid() or bot_owner_id in (select id from public.profiles where user_id = auth.uid()));

create policy "users delete own bots"
  on public.profiles for delete to authenticated
  using (is_bot = true and bot_owner_id in (select id from public.profiles where user_id = auth.uid()));

-- Chats
create table public.chats (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('direct','group','bot')),
  name text,
  avatar_url text,
  created_by uuid references public.profiles(id) on delete set null,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.chat_members (
  chat_id uuid references public.chats(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (chat_id, profile_id)
);
create index on public.chat_members (profile_id);

alter table public.chats enable row level security;
alter table public.chat_members enable row level security;

-- Helper: is current user a member of chat?
create or replace function public.is_chat_member(_chat_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.chat_members cm
    join public.profiles p on p.id = cm.profile_id
    where cm.chat_id = _chat_id and p.user_id = auth.uid()
  );
$$;

create policy "members can read chats" on public.chats
  for select to authenticated using (public.is_chat_member(id));
create policy "auth can create chats" on public.chats
  for insert to authenticated with check (true);
create policy "members can update chats" on public.chats
  for update to authenticated using (public.is_chat_member(id));

create policy "members read members" on public.chat_members
  for select to authenticated using (public.is_chat_member(chat_id));
create policy "auth add members" on public.chat_members
  for insert to authenticated with check (true);
create policy "auth remove self" on public.chat_members
  for delete to authenticated using (
    profile_id in (select id from public.profiles where user_id = auth.uid())
  );

-- Messages
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text,
  type text not null default 'text' check (type in ('text','voice','sticker','file','image')),
  file_url text,
  file_name text,
  created_at timestamptz not null default now()
);
create index on public.messages (chat_id, created_at);

alter table public.messages enable row level security;

create policy "members read messages" on public.messages
  for select to authenticated using (public.is_chat_member(chat_id));
create policy "members send messages" on public.messages
  for insert to authenticated with check (
    public.is_chat_member(chat_id)
    and sender_id in (select id from public.profiles where user_id = auth.uid())
  );
create policy "sender deletes own" on public.messages
  for delete to authenticated using (
    sender_id in (select id from public.profiles where user_id = auth.uid())
  );

-- Bot commands
create table public.bot_commands (
  id uuid primary key default gen_random_uuid(),
  bot_id uuid not null references public.profiles(id) on delete cascade,
  command text not null,
  description text not null,
  created_at timestamptz not null default now(),
  unique (bot_id, command)
);
alter table public.bot_commands enable row level security;
create policy "anyone read bot commands" on public.bot_commands for select to authenticated using (true);
create policy "owner manages commands" on public.bot_commands for all to authenticated
  using (bot_id in (select id from public.profiles p where p.bot_owner_id in (select id from public.profiles where user_id = auth.uid())))
  with check (bot_id in (select id from public.profiles p where p.bot_owner_id in (select id from public.profiles where user_id = auth.uid())));

-- Update last_message_at on insert
create or replace function public.touch_chat_last_msg()
returns trigger language plpgsql as $$
begin
  update public.chats set last_message_at = new.created_at where id = new.chat_id;
  return new;
end $$;
create trigger trg_touch_chat_last_msg after insert on public.messages
  for each row execute function public.touch_chat_last_msg();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, username, display_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text,1,8)),
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'username', 'User'),
    new.email
  );
  return new;
end $$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Get email by username (for username-based login)
create or replace function public.get_email_by_username(_username text)
returns text language sql stable security definer set search_path = public as $$
  select email from public.profiles where lower(username) = lower(_username) and is_bot = false limit 1;
$$;

-- Realtime
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.chats;
alter table public.messages replica identity full;
alter table public.chats replica identity full;

-- Storage bucket for media (avatars, voice, files, images)
insert into storage.buckets (id, name, public) values ('media','media',true)
on conflict (id) do nothing;

create policy "public read media" on storage.objects for select using (bucket_id = 'media');
create policy "auth upload media" on storage.objects for insert to authenticated with check (bucket_id = 'media');
create policy "owner delete media" on storage.objects for delete to authenticated using (bucket_id = 'media' and owner = auth.uid());
