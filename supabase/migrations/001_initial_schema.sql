-- ==============================================================================
-- BIDRANK PRODUCTION SUPABASE POSTGRESQL SCHEMA
-- Migration: 001_initial_schema.sql
-- ==============================================================================

-- 1. Enable Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. Projects Table
create table if not exists public.projects (
    id uuid primary key default uuid_generate_v4(),
    slug text unique not null,
    title text not null,
    tagline varchar(140) not null,
    description text default '',
    url text not null,
    favicon_url text,
    screenshot_url text,
    category text not null default 'SaaS',
    submitter_email text not null,
    total_amount_usd numeric(10, 2) not null default 0.00 check (total_amount_usd >= 0),
    current_rank integer,
    previous_rank integer,
    all_time_clicks integer not null default 0,
    is_verified boolean not null default true,
    is_active boolean not null default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Performance Indexes
create index if not exists idx_projects_leaderboard on public.projects (total_amount_usd desc, updated_at asc) where is_active = true;
create index if not exists idx_projects_slug on public.projects (slug);
create index if not exists idx_projects_category on public.projects (category) where is_active = true;

-- 3. Bids / Transactions Audit Table
create table if not exists public.bids (
    id uuid primary key default uuid_generate_v4(),
    project_id uuid references public.projects(id) on delete cascade not null,
    project_slug text not null,
    project_title text not null,
    amount_usd numeric(10, 2) not null check (amount_usd > 0),
    payment_gateway text not null default 'dodo_payments',
    gateway_payment_id text unique not null,
    customer_email text not null,
    metadata jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_bids_project_id on public.bids (project_id);
create index if not exists idx_bids_created_at on public.bids (created_at desc);

-- 4. Activity Events Table (For Realtime Streams)
create table if not exists public.activities (
    id uuid primary key default uuid_generate_v4(),
    type text not null check (type in ('new_project', 'boost_bid', 'outbid_crown', 'rank_jump')),
    project_title text not null,
    project_slug text not null,
    amount_usd numeric(10, 2) not null,
    old_rank integer,
    new_rank integer,
    outbid_project_title text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_activities_created on public.activities (created_at desc);

-- 5. Atomic Bid Processing Procedure
create or replace function public.process_bid_payment(
    p_slug text,
    p_title text,
    p_tagline text,
    p_description text,
    p_url text,
    p_category text,
    p_email text,
    p_amount numeric,
    p_gateway_payment_id text,
    p_gateway text default 'dodo_payments',
    p_favicon text default null,
    p_screenshot text default null
) returns jsonb as $$
declare
    v_project_id uuid;
    v_old_rank integer;
    v_new_rank integer;
    v_is_new boolean := false;
    v_prev_leader record;
    v_event_type text := 'boost_bid';
    v_outbid_title text := null;
begin
    -- Check if project exists
    select id, current_rank into v_project_id, v_old_rank 
    from public.projects 
    where slug = p_slug;

    if v_project_id is null then
        v_is_new := true;
        insert into public.projects (
            slug, title, tagline, description, url, category, submitter_email,
            total_amount_usd, favicon_url, screenshot_url, current_rank, previous_rank
        ) values (
            p_slug, p_title, p_tagline, coalesce(p_description, ''), p_url, p_category, p_email,
            p_amount, p_favicon, p_screenshot, 999, 999
        )
        returning id into v_project_id;
    else
        update public.projects set
            total_amount_usd = total_amount_usd + p_amount,
            title = coalesce(p_title, title),
            tagline = coalesce(p_tagline, tagline),
            description = coalesce(p_description, description),
            url = coalesce(p_url, url),
            category = coalesce(p_category, category),
            favicon_url = coalesce(p_favicon, favicon_url),
            screenshot_url = coalesce(p_screenshot, screenshot_url),
            updated_at = timezone('utc'::text, now())
        where id = v_project_id;
    end if;

    -- Record immutable bid
    insert into public.bids (
        project_id, project_slug, project_title, amount_usd, gateway_payment_id, payment_gateway, customer_email
    ) values (
        v_project_id, p_slug, p_title, p_amount, p_gateway_payment_id, p_gateway, p_email
    );

    -- Recalculate all active ranks
    with ranked as (
        select id, row_number() over (order by total_amount_usd desc, updated_at asc) as rank_no
        from public.projects
        where is_active = true
    )
    update public.projects p
    set previous_rank = p.current_rank,
        current_rank = r.rank_no
    from ranked r
    where p.id = r.id;

    -- Fetch newly assigned rank
    select current_rank into v_new_rank from public.projects where id = v_project_id;

    -- Determine Activity Event
    if v_is_new then
        v_event_type := 'new_project';
    elsif v_new_rank = 1 and (v_old_rank is null or v_old_rank > 1) then
        v_event_type := 'outbid_crown';
        select title into v_outbid_title from public.projects where current_rank = 2 and id != v_project_id limit 1;
    elsif v_old_rank is not null and v_new_rank < v_old_rank then
        v_event_type := 'rank_jump';
    end if;

    -- Insert activity stream item
    insert into public.activities (
        type, project_title, project_slug, amount_usd, old_rank, new_rank, outbid_project_title
    ) values (
        v_event_type, p_title, p_slug, p_amount, v_old_rank, v_new_rank, v_outbid_title
    );

    return json_build_object(
        'project_id', v_project_id,
        'new_rank', v_new_rank,
        'old_rank', v_old_rank,
        'event_type', v_event_type
    );
end;
$$ language plpgsql security definer;

-- 6. Row Level Security (RLS)
alter table public.projects enable row level security;
alter table public.bids enable row level security;
alter table public.activities enable row level security;

-- Public read access for leaderboard
create policy "Allow public read active projects" on public.projects for select using (is_active = true);
create policy "Allow public read activities" on public.activities for select using (true);
create policy "Allow public read bids" on public.bids for select using (true);
