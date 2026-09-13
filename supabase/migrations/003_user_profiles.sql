create table if not exists public.profiles (
    id uuid references auth.users(id) on delete cascade primary key,
    
    -- Questionnaire Data
    gender text,
    motive text,
    goal text,
    focus_area text,
    equipment text,
    pushups text,
    experience text,
    weekly_goal text,
    weight text,
    target_weight text,
    height text,
    
    -- RPG Stats
    level integer default 1,
    exp integer default 0,
    rank text default 'E-Rank',
    workouts_completed integer default 0,
    
    -- Timestamps
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies
create policy "Users can view their own profile."
    on public.profiles for select
    using ( auth.uid() = id );

create policy "Users can update their own profile."
    on public.profiles for update
    using ( auth.uid() = id )
    with check ( auth.uid() = id );

create policy "Users can insert their own profile."
    on public.profiles for insert
    with check ( auth.uid() = id );

-- Auto-update updated_at timestamp trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row
  execute procedure public.handle_updated_at();

-- Auto-create profile on signup trigger function
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
