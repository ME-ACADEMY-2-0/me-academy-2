-- =====================================================================================================================
-- SCOLAR database schema (single file). Run once on a NEW, empty Supabase project:
--   Supabase dashboard > SQL Editor > New query > paste this whole file > Run.
-- Then run supabase/seed.sql (starter course categories) and, once the site is live, supabase/cron.sql.
-- Client-specific changes go in new numbered files under supabase/migrations/, never edits to this file.
-- =====================================================================================================================

--
-- PostgreSQL database dump
--


-- Dumped from database version 16.14 (Homebrew)
-- Dumped by pg_dump version 16.14 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: account_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.account_status AS ENUM (
    'active',
    'suspended'
);


--
-- Name: announcement_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.announcement_status AS ENUM (
    'draft',
    'scheduled',
    'published',
    'archived'
);


--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'super_admin',
    'editor',
    'accountant',
    'tutor',
    'student'
);


--
-- Name: course_level; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.course_level AS ENUM (
    'beginner',
    'intermediate',
    'advanced'
);


--
-- Name: course_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.course_status AS ENUM (
    'draft',
    'pending',
    'published',
    'rejected',
    'archived'
);


--
-- Name: document_visibility; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.document_visibility AS ENUM (
    'public',
    'enrolled',
    'private'
);


--
-- Name: payment_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_status AS ENUM (
    'pending',
    'success',
    'failed',
    'refunded'
);


--
-- Name: post_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.post_status AS ENUM (
    'draft',
    'published',
    'scheduled'
);


--
-- Name: thread_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.thread_status AS ENUM (
    'open',
    'pending',
    'closed'
);


--
-- Name: admin_active_users(integer, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_active_users(p_days integer DEFAULT 30, p_end date DEFAULT CURRENT_DATE) RETURNS integer
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
  select count(distinct e.user_id)::integer
  from public.activity_events e
  where e.user_id is not null and e.created_at >= p_end - (p_days - 1) and e.created_at < p_end + 1;
$$;


--
-- Name: admin_daily_activity(integer, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_daily_activity(p_days integer DEFAULT 30, p_end date DEFAULT CURRENT_DATE) RETURNS TABLE(day date, signups integer, enrollments integer, completions integer, page_views integer, active_users integer)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
  with days as (
    select generate_series(p_end - (p_days - 1), p_end, interval '1 day')::date as day
  )
  select
    d.day,
    count(*) filter (where e.type = 'signup')::integer,
    count(*) filter (where e.type = 'enroll')::integer,
    count(*) filter (where e.type = 'lesson_complete')::integer,
    count(*) filter (where e.type = 'page_view')::integer,
    count(distinct e.user_id)::integer
  from days d
  left join public.activity_events e on e.created_at::date = d.day
  group by d.day
  order by d.day;
$$;


--
-- Name: admin_list_users(text, public.app_role, boolean, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_list_users(p_search text DEFAULT NULL::text, p_role public.app_role DEFAULT NULL::public.app_role, p_deleted boolean DEFAULT false, p_limit integer DEFAULT 50, p_offset integer DEFAULT 0) RETURNS TABLE(id uuid, email text, full_name text, avatar_url text, roles public.app_role[], status public.account_status, created_at timestamp with time zone, last_sign_in_at timestamp with time zone, email_confirmed boolean, deleted_at timestamp with time zone, enrollment_count integer, course_count integer, total_count bigint)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
  with base as (
    select p.*, u.email::text as email, u.last_sign_in_at, u.email_confirmed_at is not null as email_confirmed,
      coalesce((select array_agg(r.role order by r.role) from public.user_roles r where r.user_id = p.id), '{}') as roles
    from public.profiles p
    join auth.users u on u.id = p.id
    where (p_deleted and p.deleted_at is not null or not p_deleted and p.deleted_at is null)
      and (p_role is null or exists (select 1 from public.user_roles r where r.user_id = p.id and r.role = p_role))
      and (
        p_search is null or p_search = ''
        or u.email ilike '%' || p_search || '%'
        or p.full_name ilike '%' || p_search || '%'
      )
  )
  select
    b.id, b.email, b.full_name, b.avatar_url, b.roles, b.status, b.created_at, b.last_sign_in_at, b.email_confirmed, b.deleted_at,
    (select count(*)::integer from public.enrollments e where e.user_id = b.id),
    (select count(*)::integer from public.courses c where c.instructor_id = b.id),
    count(*) over ()
  from base b
  order by b.created_at desc
  limit p_limit offset p_offset;
$$;


--
-- Name: admin_monthly_revenue(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_monthly_revenue(p_months integer DEFAULT 12) RETURNS TABLE(month date, gross_minor bigint, discount_minor bigint, sales integer)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
  with months as (
    select generate_series(date_trunc('month', current_date) - make_interval(months => p_months - 1), date_trunc('month', current_date), interval '1 month')::date as month
  )
  select m.month, coalesce(sum(p.amount_minor), 0)::bigint, coalesce(sum(p.discount_minor), 0)::bigint, count(p.id)::integer
  from months m
  left join public.payments p on p.status = 'success' and date_trunc('month', p.paid_at)::date = m.month
  group by m.month order by m.month;
$$;


--
-- Name: admin_top_courses(integer, integer, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_top_courses(p_days integer DEFAULT 30, p_limit integer DEFAULT 10, p_end date DEFAULT CURRENT_DATE) RETURNS TABLE(course_id uuid, title text, enrollments integer, completions integer, learners integer)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
  select c.id, c.title,
    count(*) filter (where e.type = 'enroll')::integer,
    count(*) filter (where e.type = 'lesson_complete')::integer,
    count(distinct e.user_id)::integer
  from public.activity_events e
  join public.courses c on c.id = e.course_id
  where e.type in ('enroll', 'lesson_complete') and e.created_at >= p_end - (p_days - 1) and e.created_at < p_end + 1
  group by c.id, c.title
  order by 3 desc, 4 desc
  limit p_limit;
$$;


--
-- Name: admin_top_pages(integer, integer, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_top_pages(p_days integer DEFAULT 30, p_limit integer DEFAULT 10, p_end date DEFAULT CURRENT_DATE) RETURNS TABLE(path text, views integer, visitors integer)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
  select e.path, count(*)::integer, count(distinct e.user_id)::integer
  from public.activity_events e
  where e.type = 'page_view' and e.path is not null and e.created_at >= p_end - (p_days - 1) and e.created_at < p_end + 1
  group by e.path
  order by 2 desc
  limit p_limit;
$$;


--
-- Name: admin_traffic_report(integer, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_traffic_report(p_days integer DEFAULT 30, p_end date DEFAULT CURRENT_DATE) RETURNS jsonb
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
  with v as (
    select * from public.visits where created_at >= p_end - (p_days - 1) and created_at < p_end + 1
  ),
  linked as (
    select distinct visitor_id, user_id from public.visits where user_id is not null
  ),
  first_touch as (
    select distinct on (p.id) p.id as user_id, f.landing_path, f.channel, f.country, f.device,
           coalesce(f.utm_source, f.referrer_host) as source
    from public.profiles p
    join linked l on l.user_id = p.id
    join public.visits f on f.visitor_id = l.visitor_id
    where p.created_at >= p_end - (p_days - 1) and p.created_at < p_end + 1
    order by p.id, f.created_at
  ),
  days as (
    select generate_series(p_end - (p_days - 1), p_end, interval '1 day')::date as day
  )
  select jsonb_build_object(
    'totals', (
      select jsonb_build_object(
        'visits', count(*),
        'visitors', count(distinct visitor_id),
        'pages', coalesce(sum(pages), 0),
        'bounces', count(*) filter (where pages = 1),
        'signups', (select count(*) from first_touch)
      ) from v
    ),
    'daily', (
      select coalesce(jsonb_agg(jsonb_build_object('day', d.day, 'visits', (select count(*) from v where v.created_at::date = d.day)) order by d.day), '[]')
      from days d
    ),
    'landing', (
      select coalesce(jsonb_agg(t order by t.visits desc), '[]') from (
        select landing_path as key, count(*) as visits, count(distinct visitor_id) as visitors,
               count(*) filter (where pages = 1) as bounces,
               (select count(*) from first_touch ft where ft.landing_path = v.landing_path) as signups
        from v group by landing_path order by count(*) desc limit 20
      ) t
    ),
    'channels', (
      select coalesce(jsonb_agg(t order by t.visits desc), '[]') from (
        select channel as key, count(*) as visits, count(distinct visitor_id) as visitors,
               count(*) filter (where pages = 1) as bounces,
               (select count(*) from first_touch ft where ft.channel = v.channel) as signups
        from v group by channel
      ) t
    ),
    'sources', (
      select coalesce(jsonb_agg(t order by t.visits desc), '[]') from (
        select g.*, coalesce(f.n, 0) as signups from (
          select coalesce(utm_source, referrer_host) as key, count(*) as visits, count(distinct visitor_id) as visitors,
                 count(*) filter (where pages = 1) as bounces
          from v where coalesce(utm_source, referrer_host) is not null
          group by 1 order by count(*) desc limit 15
        ) g left join (select source as key, count(*) as n from first_touch group by 1) f using (key)
      ) t
    ),
    'campaigns', (
      select coalesce(jsonb_agg(t order by t.visits desc), '[]') from (
        select utm_campaign as key, count(*) as visits, count(distinct visitor_id) as visitors,
               count(*) filter (where pages = 1) as bounces, 0 as signups
        from v where utm_campaign is not null
        group by utm_campaign order by count(*) desc limit 15
      ) t
    ),
    'countries', (
      select coalesce(jsonb_agg(t order by t.visits desc), '[]') from (
        select g.*, coalesce(f.n, 0) as signups from (
          select coalesce(country, '??') as key, count(*) as visits, count(distinct visitor_id) as visitors,
                 count(*) filter (where pages = 1) as bounces
          from v group by 1 order by count(*) desc limit 15
        ) g left join (select coalesce(country, '??') as key, count(*) as n from first_touch group by 1) f using (key)
      ) t
    ),
    'cities', (
      select coalesce(jsonb_agg(t order by t.visits desc), '[]') from (
        select city || coalesce(', ' || country, '') as key, count(*) as visits, count(distinct visitor_id) as visitors,
               count(*) filter (where pages = 1) as bounces, 0 as signups
        from v where city is not null
        group by city, country order by count(*) desc limit 15
      ) t
    ),
    'devices', (
      select coalesce(jsonb_agg(t order by t.visits desc), '[]') from (
        select g.*, coalesce(f.n, 0) as signups from (
          select coalesce(device, 'Unknown') as key, count(*) as visits, count(distinct visitor_id) as visitors,
                 count(*) filter (where pages = 1) as bounces
          from v group by 1
        ) g left join (select coalesce(device, 'Unknown') as key, count(*) as n from first_touch group by 1) f using (key)
      ) t
    )
  );
$$;


--
-- Name: blog_post_metrics(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.blog_post_metrics() RETURNS TABLE(post_id uuid, views integer, likes integer, comments integer, pending integer, avg_read integer)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select p.id,
    (select count(*) from blog_post_views v where v.post_id = p.id)::integer,
    (select count(*) from blog_likes l where l.post_id = p.id)::integer,
    (select count(*) from blog_comments c where c.post_id = p.id)::integer,
    (select count(*) from blog_comments c where c.post_id = p.id and not c.approved)::integer,
    (select round(avg(read_seconds))::integer from blog_post_views v where v.post_id = p.id and v.read_seconds >= 3)
  from blog_posts p;
$$;


--
-- Name: course_is_published(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.course_is_published(p_course_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
  select exists (
    select 1 from public.courses
    where id = p_course_id and status = 'published'
  );
$$;


--
-- Name: course_lesson_counts(uuid[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.course_lesson_counts(p_course_ids uuid[]) RETURNS TABLE(course_id uuid, lesson_count integer)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
  select l.course_id, count(*)::integer
  from public.lessons l
  join public.courses c on c.id = l.course_id
  where l.course_id = any (p_course_ids)
    and (c.status = 'published' or c.instructor_id = auth.uid())
  group by l.course_id;
$$;


--
-- Name: course_metrics(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.course_metrics() RETURNS TABLE(course_id uuid, students integer, completed integer, revenue_minor bigint, rating numeric, reviews integer, pending_reviews integer)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select c.id,
    (select count(*) from enrollments e where e.course_id = c.id)::integer,
    (select count(*) from certificates ce where ce.course_id = c.id and ce.revoked_at is null)::integer,
    coalesce((select sum(p.amount_minor) from payments p where p.course_id = c.id and p.status = 'success'), 0)::bigint,
    (select round(avg(r.rating)::numeric, 1) from course_reviews r where r.course_id = c.id and r.approved),
    (select count(*) from course_reviews r where r.course_id = c.id and r.approved)::integer,
    (select count(*) from course_reviews r where r.course_id = c.id and not r.approved)::integer
  from courses c;
$$;


--
-- Name: course_ratings(uuid[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.course_ratings(p_course_ids uuid[]) RETURNS TABLE(course_id uuid, rating numeric, reviews integer)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select r.course_id, round(avg(r.rating)::numeric, 1), count(*)::integer
  from course_reviews r
  where r.approved and r.course_id = any (p_course_ids)
  group by r.course_id;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'avatar_url');
  insert into public.user_roles (user_id, role) values (new.id, 'student');
  return new;
end;
$$;


--
-- Name: has_role(public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(p_role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
  select exists (
    select 1 from public.user_roles r
    join public.profiles p on p.id = r.user_id
    where r.user_id = auth.uid() and r.role = p_role and p.status = 'active' and p.deleted_at is null
  );
$$;


--
-- Name: is_admin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_admin() RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
  select public.has_role('super_admin');
$$;


--
-- Name: is_enrolled(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_enrolled(p_course_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
  select exists (
    select 1 from public.enrollments
    where course_id = p_course_id and user_id = auth.uid()
      and (expires_at is null or expires_at > now())
  );
$$;


--
-- Name: is_instructor(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_instructor() RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
  select public.has_role('tutor') or public.has_role('super_admin');
$$;


--
-- Name: lessons_sync_course_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.lessons_sync_course_id() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  select course_id into new.course_id
  from public.course_modules
  where id = new.module_id;
  return new;
end;
$$;


--
-- Name: mark_thread_read(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.mark_thread_read(p_thread_id uuid) RETURNS void
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO ''
    AS $$
  update public.support_threads set user_unread = false
  where id = p_thread_id and user_id = auth.uid();
$$;


--
-- Name: my_profile(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.my_profile() RETURNS TABLE(status public.account_status, deleted_at timestamp with time zone, last_seen_at timestamp with time zone, notification_prefs jsonb, learning_goal text, skill_level text, weekly_hours text, weekly_goal smallint, onboarded_at timestamp with time zone, show_current_learning boolean, updated_at timestamp with time zone)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
  select status, deleted_at, last_seen_at, notification_prefs, learning_goal, skill_level, weekly_hours,
         weekly_goal, onboarded_at, show_current_learning, updated_at
  from public.profiles
  where id = auth.uid();
$$;


--
-- Name: notify(uuid, text, text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.notify(p_user uuid, p_kind text, p_title text, p_body text, p_href text) RETURNS void
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO ''
    AS $$
  insert into public.notifications (user_id, kind, title, body, href)
  select p_user, p_kind, p_title, left(p_body, 200), p_href
  where p_user is not null;
$$;


--
-- Name: notify_badge(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.notify_badge() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
begin
  perform public.notify(new.user_id, 'badge', 'You earned a new badge', 'See it with the rest of your badges.', '/profile/badges');
  return new;
end;
$$;


--
-- Name: notify_certificate(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.notify_certificate() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
begin
  perform public.notify(new.user_id, 'certificate', 'Your certificate is ready', new.course_title, '/certificate/' || new.code);
  return new;
end;
$$;


--
-- Name: notify_staff_support(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.notify_staff_support() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  t record;
  who text;
begin
  if new.is_staff then return new; end if;
  select id, subject, assigned_to, user_id into t from public.support_threads where id = new.thread_id;
  select coalesce(nullif(full_name, ''), 'A learner') into who from public.profiles where id = t.user_id;
  if t.assigned_to is not null then
    perform public.notify(t.assigned_to, 'support', who || ' wrote to support', new.body, '/admin/chats/' || t.id);
  else
    perform public.notify(r.user_id, 'support', who || ' wrote to support', new.body, '/admin/chats/' || t.id)
      from public.user_roles r where r.role = 'super_admin';
  end if;
  return new;
end;
$$;


--
-- Name: notify_support_reply(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.notify_support_reply() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
begin
  if new.is_staff then
    perform public.notify(t.user_id, 'support', 'Support replied', new.body, '/support/' || t.id)
      from public.support_threads t where t.id = new.thread_id;
  end if;
  return new;
end;
$$;


--
-- Name: owns_course(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.owns_course(p_course_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
  select exists (
    select 1 from public.courses
    where id = p_course_id and instructor_id = auth.uid()
  );
$$;


--
-- Name: quiz_progress(uuid, uuid[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.quiz_progress(p_user_id uuid, p_course_ids uuid[]) RETURNS TABLE(course_id uuid, quizzes integer, passed integer)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select q.course_id,
    count(*)::integer,
    count(*) filter (where exists (select 1 from quiz_attempts a where a.quiz_id = q.id and a.user_id = p_user_id and a.passed))::integer
  from course_quizzes q
  where q.course_id = any (p_course_ids)
  group by q.course_id;
$$;


--
-- Name: renew_enrollments(uuid, uuid[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.renew_enrollments(p_user_id uuid, p_course_ids uuid[]) RETURNS void
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO ''
    AS $$
  update public.enrollments e
     set expires_at = case when c.access_days is null then null else now() + make_interval(days => c.access_days) end
    from public.courses c
   where c.id = e.course_id
     and e.user_id = p_user_id
     and e.course_id = any (p_course_ids)
     and e.expires_at is not null
     and e.expires_at <= now();
$$;


--
-- Name: set_enrollment_expiry(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_enrollment_expiry() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
begin
  if new.expires_at is null then
    select case when c.access_days is null then null else new.enrolled_at + make_interval(days => c.access_days) end
      into new.expires_at
      from public.courses c where c.id = new.course_id;
  end if;
  return new;
end;
$$;


--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


--
-- Name: skip_repeat_page_view(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.skip_repeat_page_view() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  if new.type = 'page_view' and exists (
    select 1 from public.activity_events
    where user_id = new.user_id
      and type = 'page_view'
      and path is not distinct from new.path
      and created_at > now() - interval '10 minutes'
  ) then
    return null;
  end if;
  return new;
end;
$$;


--
-- Name: support_message_bump(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.support_message_bump() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
begin
  update public.support_threads
  set last_message_at = new.created_at,
      staff_unread = case when new.is_staff then staff_unread else true end,
      user_unread = case when new.is_staff then true else user_unread end,
      status = case when new.is_staff then 'pending'::public.thread_status
                    when status = 'pending' then 'open'::public.thread_status
                    else status end
  where id = new.thread_id;
  return new;
end;
$$;


--
-- Name: track_course_publish(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.track_course_publish() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
begin
  if new.status = 'published' and old.status is distinct from 'published' then
    insert into public.activity_events (user_id, type, course_id) values (new.instructor_id, 'course_published', new.id);
  end if;
  return new;
end;
$$;


--
-- Name: track_enrollment(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.track_enrollment() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
begin
  insert into public.activity_events (user_id, type, course_id) values (new.user_id, 'enroll', new.course_id);
  return new;
end;
$$;


--
-- Name: track_lesson_complete(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.track_lesson_complete() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
begin
  insert into public.activity_events (user_id, type, course_id, meta)
  select new.user_id, 'lesson_complete', l.course_id, jsonb_build_object('lesson_id', new.lesson_id)
  from public.lessons l where l.id = new.lesson_id;
  return new;
end;
$$;


--
-- Name: track_signup(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.track_signup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
begin
  insert into public.activity_events (user_id, type) values (new.id, 'signup');
  return new;
end;
$$;


--
-- Name: track_visit(uuid, uuid, uuid, text, boolean, text, text, text, text, text, text, text, text, text, text, text, text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.track_visit(p_visit_id uuid, p_visitor_id uuid, p_user_id uuid, p_path text, p_new_campaign boolean, p_referrer text, p_referrer_host text, p_utm_source text, p_utm_medium text, p_utm_campaign text, p_utm_term text, p_utm_content text, p_channel text, p_country text, p_region text, p_city text, p_device text, p_browser text, p_os text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_id uuid;
begin
  if p_visit_id is not null and not p_new_campaign then
    update public.visits
       set pages = pages + 1,
           last_path = p_path,
           last_seen_at = now(),
           user_id = coalesce(user_id, p_user_id)
     where id = p_visit_id
       and visitor_id = p_visitor_id
       and last_seen_at > now() - interval '30 minutes'
    returning id into v_id;
    if v_id is not null then
      return v_id;
    end if;
  end if;

  insert into public.visits (
    visitor_id, user_id, landing_path, last_path, referrer, referrer_host, utm_source, utm_medium, utm_campaign,
    utm_term, utm_content, channel, country, region, city, device, browser, os
  ) values (
    p_visitor_id, p_user_id, p_path, p_path, p_referrer, p_referrer_host, p_utm_source, p_utm_medium, p_utm_campaign,
    p_utm_term, p_utm_content, p_channel, p_country, p_region, p_city, p_device, p_browser, p_os
  )
  returning id into v_id;
  return v_id;
end;
$$;


--
-- Name: user_id_by_email(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.user_id_by_email(p_email text) RETURNS uuid
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
  select id from auth.users where lower(email) = lower(trim(p_email)) limit 1
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activity_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_events (
    id bigint NOT NULL,
    user_id uuid,
    type text NOT NULL,
    path text,
    course_id uuid,
    meta jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: activity_events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.activity_events ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.activity_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: admin_audit_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_audit_log (
    id bigint NOT NULL,
    actor_id uuid,
    action text NOT NULL,
    target_type text,
    target_id text,
    meta jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: admin_audit_log_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.admin_audit_log ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.admin_audit_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: ai_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_messages (
    id bigint NOT NULL,
    user_id uuid NOT NULL,
    course_id uuid,
    lesson_id uuid,
    feature text NOT NULL,
    role text NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ai_messages_content_check CHECK ((char_length(content) <= 12000)),
    CONSTRAINT ai_messages_role_check CHECK ((role = ANY (ARRAY['user'::text, 'assistant'::text])))
);


--
-- Name: ai_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.ai_messages ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.ai_messages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: announcements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.announcements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    body text DEFAULT ''::text NOT NULL,
    status public.announcement_status DEFAULT 'draft'::public.announcement_status NOT NULL,
    pinned boolean DEFAULT false NOT NULL,
    scheduled_at timestamp with time zone,
    cover_image_url text,
    cover_video_url text,
    author_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    emailed_at timestamp with time zone,
    course_id uuid,
    CONSTRAINT announcements_check CHECK (((status <> 'scheduled'::public.announcement_status) OR (scheduled_at IS NOT NULL))),
    CONSTRAINT announcements_title_check CHECK (((char_length(title) >= 1) AND (char_length(title) <= 160)))
);


--
-- Name: billing_details; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.billing_details (
    user_id uuid NOT NULL,
    name text,
    company text,
    address text,
    city text,
    country text,
    tax_id text,
    receipt_email text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT billing_details_address_check CHECK ((char_length(address) <= 300)),
    CONSTRAINT billing_details_city_check CHECK ((char_length(city) <= 80)),
    CONSTRAINT billing_details_company_check CHECK ((char_length(company) <= 120)),
    CONSTRAINT billing_details_country_check CHECK ((char_length(country) <= 80)),
    CONSTRAINT billing_details_name_check CHECK ((char_length(name) <= 120)),
    CONSTRAINT billing_details_receipt_email_check CHECK ((char_length(receipt_email) <= 254)),
    CONSTRAINT billing_details_tax_id_check CHECK ((char_length(tax_id) <= 40))
);


--
-- Name: blog_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    parent_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT blog_categories_name_check CHECK (((char_length(name) >= 1) AND (char_length(name) <= 60)))
);


--
-- Name: blog_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    user_id uuid,
    author_name text NOT NULL,
    author_email text,
    content text NOT NULL,
    approved boolean DEFAULT false NOT NULL,
    admin_reply text,
    replied_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT blog_comments_admin_reply_check CHECK ((char_length(admin_reply) <= 2000)),
    CONSTRAINT blog_comments_author_email_check CHECK ((char_length(author_email) <= 200)),
    CONSTRAINT blog_comments_author_name_check CHECK (((char_length(author_name) >= 1) AND (char_length(author_name) <= 80))),
    CONSTRAINT blog_comments_content_check CHECK (((char_length(content) >= 1) AND (char_length(content) <= 2000)))
);


--
-- Name: blog_curated; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_curated (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    url text NOT NULL,
    source_name text NOT NULL,
    title text NOT NULL,
    excerpt text,
    cover_url text,
    published boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT blog_curated_cover_url_check CHECK ((char_length(cover_url) <= 2000)),
    CONSTRAINT blog_curated_excerpt_check CHECK ((char_length(excerpt) <= 600)),
    CONSTRAINT blog_curated_source_name_check CHECK ((char_length(source_name) <= 80)),
    CONSTRAINT blog_curated_title_check CHECK ((char_length(title) <= 300)),
    CONSTRAINT blog_curated_url_check CHECK (((url ~ '^https?://'::text) AND (char_length(url) <= 2000)))
);


--
-- Name: blog_likes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_likes (
    post_id uuid NOT NULL,
    fingerprint text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT blog_likes_fingerprint_check CHECK (((char_length(fingerprint) >= 8) AND (char_length(fingerprint) <= 64)))
);


--
-- Name: blog_post_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_post_categories (
    post_id uuid NOT NULL,
    category_id uuid NOT NULL
);


--
-- Name: blog_post_views; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_post_views (
    id bigint NOT NULL,
    post_id uuid NOT NULL,
    country text,
    read_seconds integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT blog_post_views_country_check CHECK ((char_length(country) <= 2)),
    CONSTRAINT blog_post_views_read_seconds_check CHECK (((read_seconds >= 0) AND (read_seconds <= 86400)))
);


--
-- Name: blog_post_views_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.blog_post_views ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.blog_post_views_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    author_id uuid,
    title text NOT NULL,
    slug text NOT NULL,
    excerpt text,
    content text,
    cover_url text,
    tags text[] DEFAULT '{}'::text[] NOT NULL,
    status public.post_status DEFAULT 'draft'::public.post_status NOT NULL,
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    featured boolean DEFAULT false NOT NULL,
    meta_title text,
    meta_description text,
    focus_keyword text,
    CONSTRAINT blog_posts_focus_keyword_check CHECK ((char_length(focus_keyword) <= 80)),
    CONSTRAINT blog_posts_meta_description_check CHECK ((char_length(meta_description) <= 320)),
    CONSTRAINT blog_posts_meta_title_check CHECK ((char_length(meta_title) <= 120))
);


--
-- Name: certificates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.certificates (
    code text NOT NULL,
    user_id uuid NOT NULL,
    course_id uuid,
    recipient_name text NOT NULL,
    course_title text NOT NULL,
    instructor_name text,
    issued_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    revoked_reason text,
    CONSTRAINT certificates_code_check CHECK ((code ~ '^[A-Z0-9]{8}$'::text)),
    CONSTRAINT certificates_revoked_reason_check CHECK ((char_length(revoked_reason) <= 300))
);


--
-- Name: coupon_redemptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coupon_redemptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    coupon_id uuid NOT NULL,
    order_id uuid NOT NULL,
    user_id uuid,
    email text NOT NULL,
    discount_minor integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT coupon_redemptions_discount_minor_check CHECK ((discount_minor >= 0))
);


--
-- Name: coupons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coupons (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code text NOT NULL,
    description text,
    kind text NOT NULL,
    value integer NOT NULL,
    currency text DEFAULT 'NGN'::text NOT NULL,
    applies_to text DEFAULT 'all'::text NOT NULL,
    course_ids uuid[] DEFAULT '{}'::uuid[] NOT NULL,
    product_ids uuid[] DEFAULT '{}'::uuid[] NOT NULL,
    emails text[] DEFAULT '{}'::text[] NOT NULL,
    max_uses integer,
    per_person integer DEFAULT 1,
    min_order_minor integer DEFAULT 0 NOT NULL,
    starts_at timestamp with time zone,
    ends_at timestamp with time zone,
    active boolean DEFAULT true NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT coupons_applies_to_check CHECK ((applies_to = ANY (ARRAY['all'::text, 'courses'::text, 'products'::text, 'selected'::text]))),
    CONSTRAINT coupons_code_check CHECK ((code ~ '^[A-Z0-9_-]{3,32}$'::text)),
    CONSTRAINT coupons_kind_check CHECK ((kind = ANY (ARRAY['percent'::text, 'fixed'::text]))),
    CONSTRAINT coupons_max_uses_check CHECK (((max_uses IS NULL) OR (max_uses > 0))),
    CONSTRAINT coupons_min_order_minor_check CHECK ((min_order_minor >= 0)),
    CONSTRAINT coupons_per_person_check CHECK (((per_person IS NULL) OR (per_person > 0))),
    CONSTRAINT coupons_percent_range CHECK (((kind <> 'percent'::text) OR (value <= 100))),
    CONSTRAINT coupons_value_check CHECK ((value > 0))
);


--
-- Name: course_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    parent_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT course_categories_name_check CHECK (((char_length(name) >= 1) AND (char_length(name) <= 60)))
);


--
-- Name: course_modules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_modules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    course_id uuid NOT NULL,
    title text NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: course_quizzes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_quizzes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    course_id uuid NOT NULL,
    module_id uuid NOT NULL,
    title text NOT NULL,
    pass_mark smallint DEFAULT 70 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT course_quizzes_pass_mark_check CHECK (((pass_mark >= 1) AND (pass_mark <= 100))),
    CONSTRAINT course_quizzes_title_check CHECK (((char_length(title) >= 1) AND (char_length(title) <= 120)))
);


--
-- Name: course_reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    course_id uuid NOT NULL,
    user_id uuid NOT NULL,
    rating smallint NOT NULL,
    body text,
    approved boolean DEFAULT false NOT NULL,
    admin_reply text,
    replied_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT course_reviews_admin_reply_check CHECK ((char_length(admin_reply) <= 2000)),
    CONSTRAINT course_reviews_body_check CHECK ((char_length(body) <= 2000)),
    CONSTRAINT course_reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: courses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.courses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    instructor_id uuid NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    summary text,
    description text,
    cover_url text,
    level public.course_level DEFAULT 'beginner'::public.course_level NOT NULL,
    price_minor integer DEFAULT 0 NOT NULL,
    currency text DEFAULT 'NGN'::text NOT NULL,
    status public.course_status DEFAULT 'draft'::public.course_status NOT NULL,
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    skills text[] DEFAULT '{}'::text[] NOT NULL,
    category text,
    category_id uuid,
    featured boolean DEFAULT false NOT NULL,
    access_days integer,
    CONSTRAINT courses_access_days_check CHECK (((access_days IS NULL) OR ((access_days >= 1) AND (access_days <= 3650)))),
    CONSTRAINT courses_category_check CHECK ((category = ANY (ARRAY['Design'::text, 'Development'::text, 'Marketing'::text, 'Business'::text, 'Data & AI'::text, 'Product'::text, 'Content creation'::text, 'Finance'::text, 'Photography & video'::text, 'Writing'::text, 'Sales'::text, 'Personal growth'::text]))),
    CONSTRAINT courses_price_minor_check CHECK ((price_minor >= 0)),
    CONSTRAINT courses_skills_check CHECK ((cardinality(skills) <= 12))
);


--
-- Name: documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    file_url text NOT NULL,
    file_key text,
    file_name text,
    file_size bigint,
    mime_type text,
    course_id uuid,
    visibility public.document_visibility DEFAULT 'enrolled'::public.document_visibility NOT NULL,
    uploaded_by uuid,
    download_count integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    lesson_id uuid
);


--
-- Name: email_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    to_email text NOT NULL,
    kind text NOT NULL,
    subject text NOT NULL,
    status text NOT NULL,
    provider_id text,
    error text,
    ref text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT email_log_status_check CHECK ((status = ANY (ARRAY['sent'::text, 'failed'::text, 'skipped'::text])))
);


--
-- Name: email_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_templates (
    key text NOT NULL,
    subject text NOT NULL,
    design jsonb NOT NULL,
    html text NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    CONSTRAINT email_templates_subject_check CHECK (((char_length(subject) >= 1) AND (char_length(subject) <= 200)))
);


--
-- Name: enrollments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.enrollments (
    user_id uuid NOT NULL,
    course_id uuid NOT NULL,
    enrolled_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    expires_at timestamp with time zone
);


--
-- Name: feature_flags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.feature_flags (
    key text NOT NULL,
    status text DEFAULT 'on'::text NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT feature_flags_key_check CHECK ((key ~ '^[a-z_]{2,40}$'::text)),
    CONSTRAINT feature_flags_status_check CHECK ((status = ANY (ARRAY['off'::text, 'staff'::text, 'on'::text])))
);


--
-- Name: lesson_notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lesson_notes (
    user_id uuid NOT NULL,
    lesson_id uuid NOT NULL,
    body text DEFAULT ''::text NOT NULL,
    bookmarked boolean DEFAULT false NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT lesson_notes_body_check CHECK ((char_length(body) <= 10000))
);


--
-- Name: lesson_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lesson_progress (
    user_id uuid NOT NULL,
    lesson_id uuid NOT NULL,
    completed_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: lesson_watch; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lesson_watch (
    user_id uuid NOT NULL,
    lesson_id uuid NOT NULL,
    watched_seconds integer DEFAULT 0 NOT NULL,
    qualified boolean DEFAULT false NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT lesson_watch_watched_seconds_check CHECK ((watched_seconds >= 0))
);


--
-- Name: lessons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lessons (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    module_id uuid NOT NULL,
    course_id uuid NOT NULL,
    title text NOT NULL,
    content text,
    video_url text,
    duration_seconds integer,
    "position" integer DEFAULT 0 NOT NULL,
    is_preview boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    kind text DEFAULT 'video'::text NOT NULL,
    CONSTRAINT lessons_duration_seconds_check CHECK (((duration_seconds IS NULL) OR (duration_seconds >= 0))),
    CONSTRAINT lessons_kind_check CHECK ((kind = ANY (ARRAY['video'::text, 'reading'::text])))
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    kind text NOT NULL,
    title text NOT NULL,
    body text,
    href text,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    reference text NOT NULL,
    user_id uuid,
    email text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    phone text,
    country text,
    state text,
    total_minor integer NOT NULL,
    currency text DEFAULT 'NGN'::text NOT NULL,
    status public.payment_status DEFAULT 'pending'::public.payment_status NOT NULL,
    paid_at timestamp with time zone,
    note text,
    reminders_sent integer DEFAULT 0 NOT NULL,
    last_reminded_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    coupon_id uuid,
    discount_minor integer DEFAULT 0 NOT NULL,
    CONSTRAINT orders_discount_minor_check CHECK ((discount_minor >= 0)),
    CONSTRAINT orders_total_minor_check CHECK ((total_minor >= 0))
);


--
-- Name: payment_methods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_methods (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    provider text DEFAULT 'paystack'::text NOT NULL,
    authorization_code text NOT NULL,
    brand text,
    last4 text,
    exp_month smallint,
    exp_year smallint,
    bank text,
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT payment_methods_exp_month_check CHECK (((exp_month >= 1) AND (exp_month <= 12))),
    CONSTRAINT payment_methods_last4_check CHECK ((last4 ~ '^[0-9]{4}$'::text))
);


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    course_id uuid,
    instructor_id uuid,
    amount_minor integer NOT NULL,
    currency text DEFAULT 'NGN'::text NOT NULL,
    provider text DEFAULT 'paystack'::text NOT NULL,
    reference text NOT NULL,
    status public.payment_status DEFAULT 'pending'::public.payment_status NOT NULL,
    note text,
    paid_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    order_id uuid,
    discount_minor integer DEFAULT 0 NOT NULL,
    CONSTRAINT payments_amount_minor_check CHECK ((amount_minor >= 0)),
    CONSTRAINT payments_discount_minor_check CHECK ((discount_minor >= 0))
);


--
-- Name: platform_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.platform_settings (
    id boolean DEFAULT true NOT NULL,
    support_email text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    hero_bg_url text,
    support_whatsapp text,
    social_x text,
    social_instagram text,
    social_linkedin text,
    social_youtube text,
    social_tiktok text,
    certificate_signer_name text,
    certificate_signer_title text,
    announcement_text text,
    announcement_link text,
    announcement_active boolean DEFAULT false NOT NULL,
    site_name text DEFAULT 'Scolar'::text NOT NULL,
    tagline text,
    logo_url text,
    logo_dark_url text,
    icon_url text,
    accent_color text DEFAULT '#2563eb'::text NOT NULL,
    accent_fg text DEFAULT '#ffffff'::text NOT NULL,
    theme_default text DEFAULT 'light'::text NOT NULL,
    font text DEFAULT 'geist'::text NOT NULL,
    email_from_name text,
    CONSTRAINT platform_settings_accent_color_check CHECK ((accent_color ~ '^#[0-9a-fA-F]{6}$'::text)),
    CONSTRAINT platform_settings_accent_fg_check CHECK ((accent_fg ~ '^#[0-9a-fA-F]{6}$'::text)),
    CONSTRAINT platform_settings_announcement_text_check CHECK ((char_length(announcement_text) <= 200)),
    CONSTRAINT platform_settings_certificate_signer_name_check CHECK ((char_length(certificate_signer_name) <= 80)),
    CONSTRAINT platform_settings_certificate_signer_title_check CHECK ((char_length(certificate_signer_title) <= 80)),
    CONSTRAINT platform_settings_font_check CHECK ((font = ANY (ARRAY['geist'::text, 'inter'::text, 'dm_sans'::text, 'plus_jakarta'::text, 'manrope'::text, 'poppins'::text]))),
    CONSTRAINT platform_settings_id_check CHECK (id),
    CONSTRAINT platform_settings_support_whatsapp_check CHECK ((support_whatsapp ~ '^\+?[0-9 ]{7,20}$'::text)),
    CONSTRAINT platform_settings_theme_default_check CHECK ((theme_default = ANY (ARRAY['light'::text, 'dark'::text])))
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    full_name text,
    avatar_url text,
    bio text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    status public.account_status DEFAULT 'active'::public.account_status NOT NULL,
    last_seen_at timestamp with time zone,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    headline text,
    location text,
    website_url text,
    linkedin_url text,
    x_url text,
    interests text[] DEFAULT '{}'::text[] NOT NULL,
    notification_prefs jsonb DEFAULT '{"product_news": false, "course_updates": true, "support_replies": true}'::jsonb NOT NULL,
    cover_url text,
    username text,
    profile_public boolean DEFAULT true NOT NULL,
    weekly_goal smallint,
    show_current_learning boolean DEFAULT true NOT NULL,
    learning_goal text,
    skill_level text,
    weekly_hours text,
    onboarded_at timestamp with time zone,
    guide_state jsonb DEFAULT '{}'::jsonb NOT NULL,
    CONSTRAINT profiles_headline_check CHECK ((char_length(headline) <= 120)),
    CONSTRAINT profiles_interests_check CHECK ((cardinality(interests) <= 12)),
    CONSTRAINT profiles_learning_goal_check CHECK ((learning_goal ~ '^(new_skill|career|creative|freelance|job)(,(new_skill|career|creative|freelance|job))*$'::text)),
    CONSTRAINT profiles_location_check CHECK ((char_length(location) <= 80)),
    CONSTRAINT profiles_skill_level_check CHECK ((skill_level = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'advanced'::text, 'expert'::text]))),
    CONSTRAINT profiles_username_format CHECK ((username ~ '^[a-z0-9_]{3,30}$'::text)),
    CONSTRAINT profiles_weekly_goal_check CHECK (((weekly_goal >= 1) AND (weekly_goal <= 50))),
    CONSTRAINT profiles_weekly_hours_check CHECK ((weekly_hours = ANY (ARRAY['under_3'::text, '3_to_6'::text, 'over_6'::text])))
);


--
-- Name: quiz_attempts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quiz_attempts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    quiz_id uuid NOT NULL,
    user_id uuid NOT NULL,
    score smallint NOT NULL,
    passed boolean NOT NULL,
    answers jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT quiz_attempts_score_check CHECK (((score >= 0) AND (score <= 100)))
);


--
-- Name: quiz_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quiz_questions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    quiz_id uuid NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    prompt text NOT NULL,
    options text[] NOT NULL,
    correct_index smallint NOT NULL,
    explanation text,
    CONSTRAINT quiz_questions_check CHECK ((correct_index < cardinality(options))),
    CONSTRAINT quiz_questions_correct_index_check CHECK ((correct_index >= 0)),
    CONSTRAINT quiz_questions_explanation_check CHECK ((char_length(explanation) <= 1000)),
    CONSTRAINT quiz_questions_options_check CHECK (((cardinality(options) >= 2) AND (cardinality(options) <= 6))),
    CONSTRAINT quiz_questions_prompt_check CHECK (((char_length(prompt) >= 1) AND (char_length(prompt) <= 500)))
);


--
-- Name: saved_courses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.saved_courses (
    user_id uuid NOT NULL,
    course_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: support_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.support_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    thread_id uuid NOT NULL,
    sender_id uuid,
    is_staff boolean DEFAULT false NOT NULL,
    body text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT support_messages_body_check CHECK (((length(body) >= 1) AND (length(body) <= 5000)))
);


--
-- Name: support_threads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.support_threads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    subject text NOT NULL,
    status public.thread_status DEFAULT 'open'::public.thread_status NOT NULL,
    assigned_to uuid,
    last_message_at timestamp with time zone DEFAULT now() NOT NULL,
    user_unread boolean DEFAULT false NOT NULL,
    staff_unread boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_badges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_badges (
    user_id uuid NOT NULL,
    badge_id text NOT NULL,
    earned_at timestamp with time zone DEFAULT now() NOT NULL,
    seen_at timestamp with time zone,
    CONSTRAINT user_badges_badge_id_check CHECK ((badge_id = ANY (ARRAY['early'::text, 'first_lesson'::text, 'lessons_25'::text, 'finisher'::text, 'streak_7'::text, 'lessons_100'::text, 'graduate'::text, 'streak_30'::text, 'tutor'::text])))
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    granted_by uuid,
    granted_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: visits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.visits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    visitor_id uuid NOT NULL,
    user_id uuid,
    landing_path text NOT NULL,
    last_path text,
    referrer text,
    referrer_host text,
    utm_source text,
    utm_medium text,
    utm_campaign text,
    utm_term text,
    utm_content text,
    channel text DEFAULT 'Direct'::text NOT NULL,
    country text,
    region text,
    city text,
    device text,
    browser text,
    os text,
    pages integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    last_seen_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: activity_events activity_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_events
    ADD CONSTRAINT activity_events_pkey PRIMARY KEY (id);


--
-- Name: admin_audit_log admin_audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_audit_log
    ADD CONSTRAINT admin_audit_log_pkey PRIMARY KEY (id);


--
-- Name: ai_messages ai_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_messages
    ADD CONSTRAINT ai_messages_pkey PRIMARY KEY (id);


--
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);


--
-- Name: billing_details billing_details_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing_details
    ADD CONSTRAINT billing_details_pkey PRIMARY KEY (user_id);


--
-- Name: blog_categories blog_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_categories
    ADD CONSTRAINT blog_categories_pkey PRIMARY KEY (id);


--
-- Name: blog_categories blog_categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_categories
    ADD CONSTRAINT blog_categories_slug_key UNIQUE (slug);


--
-- Name: blog_comments blog_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_comments
    ADD CONSTRAINT blog_comments_pkey PRIMARY KEY (id);


--
-- Name: blog_curated blog_curated_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_curated
    ADD CONSTRAINT blog_curated_pkey PRIMARY KEY (id);


--
-- Name: blog_likes blog_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_likes
    ADD CONSTRAINT blog_likes_pkey PRIMARY KEY (post_id, fingerprint);


--
-- Name: blog_post_categories blog_post_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_post_categories
    ADD CONSTRAINT blog_post_categories_pkey PRIMARY KEY (post_id, category_id);


--
-- Name: blog_post_views blog_post_views_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_post_views
    ADD CONSTRAINT blog_post_views_pkey PRIMARY KEY (id);


--
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);


--
-- Name: blog_posts blog_posts_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_slug_key UNIQUE (slug);


--
-- Name: certificates certificates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_pkey PRIMARY KEY (code);


--
-- Name: certificates certificates_user_id_course_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_user_id_course_id_key UNIQUE (user_id, course_id);


--
-- Name: coupon_redemptions coupon_redemptions_order_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_redemptions
    ADD CONSTRAINT coupon_redemptions_order_id_key UNIQUE (order_id);


--
-- Name: coupon_redemptions coupon_redemptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_redemptions
    ADD CONSTRAINT coupon_redemptions_pkey PRIMARY KEY (id);


--
-- Name: coupons coupons_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key UNIQUE (code);


--
-- Name: coupons coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (id);


--
-- Name: course_categories course_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_categories
    ADD CONSTRAINT course_categories_pkey PRIMARY KEY (id);


--
-- Name: course_categories course_categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_categories
    ADD CONSTRAINT course_categories_slug_key UNIQUE (slug);


--
-- Name: course_modules course_modules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_modules
    ADD CONSTRAINT course_modules_pkey PRIMARY KEY (id);


--
-- Name: course_quizzes course_quizzes_module_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_quizzes
    ADD CONSTRAINT course_quizzes_module_id_key UNIQUE (module_id);


--
-- Name: course_quizzes course_quizzes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_quizzes
    ADD CONSTRAINT course_quizzes_pkey PRIMARY KEY (id);


--
-- Name: course_reviews course_reviews_course_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_reviews
    ADD CONSTRAINT course_reviews_course_id_user_id_key UNIQUE (course_id, user_id);


--
-- Name: course_reviews course_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_reviews
    ADD CONSTRAINT course_reviews_pkey PRIMARY KEY (id);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: courses courses_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_slug_key UNIQUE (slug);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: email_log email_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_log
    ADD CONSTRAINT email_log_pkey PRIMARY KEY (id);


--
-- Name: email_templates email_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_templates
    ADD CONSTRAINT email_templates_pkey PRIMARY KEY (key);


--
-- Name: enrollments enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_pkey PRIMARY KEY (user_id, course_id);


--
-- Name: feature_flags feature_flags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feature_flags
    ADD CONSTRAINT feature_flags_pkey PRIMARY KEY (key);


--
-- Name: lesson_notes lesson_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_notes
    ADD CONSTRAINT lesson_notes_pkey PRIMARY KEY (user_id, lesson_id);


--
-- Name: lesson_progress lesson_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_pkey PRIMARY KEY (user_id, lesson_id);


--
-- Name: lesson_watch lesson_watch_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_watch
    ADD CONSTRAINT lesson_watch_pkey PRIMARY KEY (user_id, lesson_id);


--
-- Name: lessons lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: orders orders_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_reference_key UNIQUE (reference);


--
-- Name: payment_methods payment_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_pkey PRIMARY KEY (id);


--
-- Name: payment_methods payment_methods_user_id_authorization_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_user_id_authorization_code_key UNIQUE (user_id, authorization_code);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: payments payments_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_reference_key UNIQUE (reference);


--
-- Name: platform_settings platform_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_settings
    ADD CONSTRAINT platform_settings_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: quiz_attempts quiz_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_pkey PRIMARY KEY (id);


--
-- Name: quiz_questions quiz_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_pkey PRIMARY KEY (id);


--
-- Name: saved_courses saved_courses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_courses
    ADD CONSTRAINT saved_courses_pkey PRIMARY KEY (user_id, course_id);


--
-- Name: support_messages support_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_messages
    ADD CONSTRAINT support_messages_pkey PRIMARY KEY (id);


--
-- Name: support_threads support_threads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_threads
    ADD CONSTRAINT support_threads_pkey PRIMARY KEY (id);


--
-- Name: user_badges user_badges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_pkey PRIMARY KEY (user_id, badge_id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role);


--
-- Name: visits visits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visits
    ADD CONSTRAINT visits_pkey PRIMARY KEY (id);


--
-- Name: activity_events_created_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_events_created_idx ON public.activity_events USING btree (created_at DESC);


--
-- Name: activity_events_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_events_type_idx ON public.activity_events USING btree (type, created_at DESC);


--
-- Name: activity_events_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_events_user_idx ON public.activity_events USING btree (user_id, created_at DESC);


--
-- Name: admin_audit_created_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX admin_audit_created_idx ON public.admin_audit_log USING btree (created_at DESC);


--
-- Name: ai_messages_thread_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ai_messages_thread_idx ON public.ai_messages USING btree (user_id, course_id, created_at);


--
-- Name: ai_messages_usage_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ai_messages_usage_idx ON public.ai_messages USING btree (user_id, feature, created_at) WHERE (role = 'user'::text);


--
-- Name: announcements_course_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX announcements_course_id_idx ON public.announcements USING btree (course_id) WHERE (course_id IS NOT NULL);


--
-- Name: announcements_feed_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX announcements_feed_idx ON public.announcements USING btree (status, pinned DESC, created_at DESC);


--
-- Name: blog_comments_post_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX blog_comments_post_idx ON public.blog_comments USING btree (post_id, approved, created_at);


--
-- Name: blog_post_categories_category_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX blog_post_categories_category_idx ON public.blog_post_categories USING btree (category_id);


--
-- Name: blog_post_views_post_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX blog_post_views_post_idx ON public.blog_post_views USING btree (post_id, created_at DESC);


--
-- Name: blog_posts_one_featured; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX blog_posts_one_featured ON public.blog_posts USING btree (featured) WHERE featured;


--
-- Name: blog_posts_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX blog_posts_status_idx ON public.blog_posts USING btree (status, published_at DESC);


--
-- Name: coupon_redemptions_coupon_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX coupon_redemptions_coupon_idx ON public.coupon_redemptions USING btree (coupon_id);


--
-- Name: coupon_redemptions_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX coupon_redemptions_email_idx ON public.coupon_redemptions USING btree (coupon_id, email);


--
-- Name: course_modules_course_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX course_modules_course_idx ON public.course_modules USING btree (course_id, "position");


--
-- Name: course_reviews_course_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX course_reviews_course_idx ON public.course_reviews USING btree (course_id, approved);


--
-- Name: courses_category_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX courses_category_idx ON public.courses USING btree (category) WHERE (status = 'published'::public.course_status);


--
-- Name: courses_instructor_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX courses_instructor_idx ON public.courses USING btree (instructor_id);


--
-- Name: courses_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX courses_status_idx ON public.courses USING btree (status);


--
-- Name: documents_course_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX documents_course_idx ON public.documents USING btree (course_id);


--
-- Name: documents_lesson_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX documents_lesson_idx ON public.documents USING btree (lesson_id) WHERE (lesson_id IS NOT NULL);


--
-- Name: email_log_recent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX email_log_recent_idx ON public.email_log USING btree (created_at DESC);


--
-- Name: email_log_ref_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX email_log_ref_idx ON public.email_log USING btree (kind, ref, created_at DESC);


--
-- Name: enrollments_course_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX enrollments_course_idx ON public.enrollments USING btree (course_id);


--
-- Name: lessons_course_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lessons_course_idx ON public.lessons USING btree (course_id);


--
-- Name: lessons_module_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lessons_module_idx ON public.lessons USING btree (module_id, "position");


--
-- Name: notifications_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_user_idx ON public.notifications USING btree (user_id, created_at DESC);


--
-- Name: orders_pending_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_pending_idx ON public.orders USING btree (created_at) WHERE (status = 'pending'::public.payment_status);


--
-- Name: orders_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_user_id_idx ON public.orders USING btree (user_id);


--
-- Name: payment_methods_one_default; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX payment_methods_one_default ON public.payment_methods USING btree (user_id) WHERE is_default;


--
-- Name: payments_instructor_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payments_instructor_idx ON public.payments USING btree (instructor_id);


--
-- Name: payments_order_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payments_order_id_idx ON public.payments USING btree (order_id);


--
-- Name: payments_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payments_status_idx ON public.payments USING btree (status, paid_at DESC);


--
-- Name: profiles_username_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX profiles_username_key ON public.profiles USING btree (username);


--
-- Name: quiz_attempts_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX quiz_attempts_user_idx ON public.quiz_attempts USING btree (user_id, quiz_id, passed);


--
-- Name: quiz_questions_quiz_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX quiz_questions_quiz_idx ON public.quiz_questions USING btree (quiz_id, "position");


--
-- Name: support_messages_thread_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX support_messages_thread_idx ON public.support_messages USING btree (thread_id, created_at);


--
-- Name: support_threads_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX support_threads_status_idx ON public.support_threads USING btree (status, last_message_at DESC);


--
-- Name: support_threads_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX support_threads_user_idx ON public.support_threads USING btree (user_id, last_message_at DESC);


--
-- Name: user_badges_unseen_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_badges_unseen_idx ON public.user_badges USING btree (user_id) WHERE (seen_at IS NULL);


--
-- Name: user_roles_role_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_roles_role_idx ON public.user_roles USING btree (role);


--
-- Name: visits_created_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX visits_created_idx ON public.visits USING btree (created_at DESC);


--
-- Name: visits_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX visits_user_idx ON public.visits USING btree (user_id) WHERE (user_id IS NOT NULL);


--
-- Name: visits_visitor_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX visits_visitor_idx ON public.visits USING btree (visitor_id, created_at);


--
-- Name: activity_events activity_events_skip_repeat_view; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER activity_events_skip_repeat_view BEFORE INSERT ON public.activity_events FOR EACH ROW EXECUTE FUNCTION public.skip_repeat_page_view();


--
-- Name: announcements announcements_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER announcements_updated_at BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: billing_details billing_details_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER billing_details_updated_at BEFORE UPDATE ON public.billing_details FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: blog_posts blog_posts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: certificates certificates_notify; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER certificates_notify AFTER INSERT ON public.certificates FOR EACH ROW EXECUTE FUNCTION public.notify_certificate();


--
-- Name: course_reviews course_reviews_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER course_reviews_updated_at BEFORE UPDATE ON public.course_reviews FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: courses courses_track_publish; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER courses_track_publish AFTER UPDATE OF status ON public.courses FOR EACH ROW EXECUTE FUNCTION public.track_course_publish();


--
-- Name: courses courses_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: documents documents_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: enrollments enrollments_set_expiry; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER enrollments_set_expiry BEFORE INSERT ON public.enrollments FOR EACH ROW EXECUTE FUNCTION public.set_enrollment_expiry();


--
-- Name: enrollments enrollments_track; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER enrollments_track AFTER INSERT ON public.enrollments FOR EACH ROW EXECUTE FUNCTION public.track_enrollment();


--
-- Name: lesson_notes lesson_notes_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER lesson_notes_updated_at BEFORE UPDATE ON public.lesson_notes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: lesson_progress lesson_progress_track; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER lesson_progress_track AFTER INSERT ON public.lesson_progress FOR EACH ROW EXECUTE FUNCTION public.track_lesson_complete();


--
-- Name: lessons lessons_sync_course; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER lessons_sync_course BEFORE INSERT OR UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION public.lessons_sync_course_id();


--
-- Name: lessons lessons_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER lessons_updated_at BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: profiles profiles_track_signup; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER profiles_track_signup AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.track_signup();


--
-- Name: profiles profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: support_messages support_messages_bump; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER support_messages_bump AFTER INSERT ON public.support_messages FOR EACH ROW EXECUTE FUNCTION public.support_message_bump();


--
-- Name: support_messages support_messages_notify; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER support_messages_notify AFTER INSERT ON public.support_messages FOR EACH ROW EXECUTE FUNCTION public.notify_support_reply();


--
-- Name: support_messages support_messages_notify_staff; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER support_messages_notify_staff AFTER INSERT ON public.support_messages FOR EACH ROW EXECUTE FUNCTION public.notify_staff_support();


--
-- Name: user_badges user_badges_notify; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER user_badges_notify AFTER INSERT ON public.user_badges FOR EACH ROW EXECUTE FUNCTION public.notify_badge();


--
-- Name: activity_events activity_events_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_events
    ADD CONSTRAINT activity_events_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE SET NULL;


--
-- Name: activity_events activity_events_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_events
    ADD CONSTRAINT activity_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: admin_audit_log admin_audit_log_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_audit_log
    ADD CONSTRAINT admin_audit_log_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: ai_messages ai_messages_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_messages
    ADD CONSTRAINT ai_messages_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: ai_messages ai_messages_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_messages
    ADD CONSTRAINT ai_messages_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE SET NULL;


--
-- Name: ai_messages ai_messages_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_messages
    ADD CONSTRAINT ai_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: announcements announcements_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: announcements announcements_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: billing_details billing_details_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing_details
    ADD CONSTRAINT billing_details_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: blog_categories blog_categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_categories
    ADD CONSTRAINT blog_categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.blog_categories(id) ON DELETE CASCADE;


--
-- Name: blog_comments blog_comments_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_comments
    ADD CONSTRAINT blog_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.blog_posts(id) ON DELETE CASCADE;


--
-- Name: blog_comments blog_comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_comments
    ADD CONSTRAINT blog_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: blog_likes blog_likes_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_likes
    ADD CONSTRAINT blog_likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.blog_posts(id) ON DELETE CASCADE;


--
-- Name: blog_post_categories blog_post_categories_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_post_categories
    ADD CONSTRAINT blog_post_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.blog_categories(id) ON DELETE CASCADE;


--
-- Name: blog_post_categories blog_post_categories_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_post_categories
    ADD CONSTRAINT blog_post_categories_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.blog_posts(id) ON DELETE CASCADE;


--
-- Name: blog_post_views blog_post_views_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_post_views
    ADD CONSTRAINT blog_post_views_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.blog_posts(id) ON DELETE CASCADE;


--
-- Name: blog_posts blog_posts_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: certificates certificates_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE SET NULL;


--
-- Name: certificates certificates_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: coupon_redemptions coupon_redemptions_coupon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_redemptions
    ADD CONSTRAINT coupon_redemptions_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.coupons(id) ON DELETE CASCADE;


--
-- Name: coupon_redemptions coupon_redemptions_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_redemptions
    ADD CONSTRAINT coupon_redemptions_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: coupon_redemptions coupon_redemptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_redemptions
    ADD CONSTRAINT coupon_redemptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: coupons coupons_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: course_categories course_categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_categories
    ADD CONSTRAINT course_categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.course_categories(id) ON DELETE CASCADE;


--
-- Name: course_modules course_modules_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_modules
    ADD CONSTRAINT course_modules_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: course_quizzes course_quizzes_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_quizzes
    ADD CONSTRAINT course_quizzes_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: course_quizzes course_quizzes_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_quizzes
    ADD CONSTRAINT course_quizzes_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.course_modules(id) ON DELETE CASCADE;


--
-- Name: course_reviews course_reviews_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_reviews
    ADD CONSTRAINT course_reviews_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: course_reviews course_reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_reviews
    ADD CONSTRAINT course_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: courses courses_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.course_categories(id) ON DELETE SET NULL;


--
-- Name: courses courses_instructor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES public.profiles(id) ON DELETE RESTRICT;


--
-- Name: documents documents_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE SET NULL;


--
-- Name: documents documents_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;


--
-- Name: documents documents_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: email_log email_log_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_log
    ADD CONSTRAINT email_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: email_templates email_templates_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_templates
    ADD CONSTRAINT email_templates_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: enrollments enrollments_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: enrollments enrollments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: feature_flags feature_flags_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feature_flags
    ADD CONSTRAINT feature_flags_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: lesson_notes lesson_notes_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_notes
    ADD CONSTRAINT lesson_notes_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;


--
-- Name: lesson_notes lesson_notes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_notes
    ADD CONSTRAINT lesson_notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: lesson_progress lesson_progress_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;


--
-- Name: lesson_progress lesson_progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: lesson_watch lesson_watch_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_watch
    ADD CONSTRAINT lesson_watch_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;


--
-- Name: lesson_watch lesson_watch_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_watch
    ADD CONSTRAINT lesson_watch_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: lessons lessons_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: lessons lessons_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.course_modules(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: orders orders_coupon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.coupons(id) ON DELETE SET NULL;


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: payment_methods payment_methods_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: payments payments_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE SET NULL;


--
-- Name: payments payments_instructor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: payments payments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- Name: payments payments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: platform_settings platform_settings_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_settings
    ADD CONSTRAINT platform_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: profiles profiles_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: quiz_attempts quiz_attempts_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.course_quizzes(id) ON DELETE CASCADE;


--
-- Name: quiz_attempts quiz_attempts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: quiz_questions quiz_questions_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.course_quizzes(id) ON DELETE CASCADE;


--
-- Name: saved_courses saved_courses_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_courses
    ADD CONSTRAINT saved_courses_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: saved_courses saved_courses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_courses
    ADD CONSTRAINT saved_courses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: support_messages support_messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_messages
    ADD CONSTRAINT support_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: support_messages support_messages_thread_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_messages
    ADD CONSTRAINT support_messages_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES public.support_threads(id) ON DELETE CASCADE;


--
-- Name: support_threads support_threads_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_threads
    ADD CONSTRAINT support_threads_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: support_threads support_threads_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_threads
    ADD CONSTRAINT support_threads_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: user_badges user_badges_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_granted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: visits visits_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visits
    ADD CONSTRAINT visits_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: profiles active profiles are readable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "active profiles are readable by everyone" ON public.profiles FOR SELECT USING ((deleted_at IS NULL));


--
-- Name: activity_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;

--
-- Name: admin_audit_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: announcements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

--
-- Name: feature_flags anyone reads feature switches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "anyone reads feature switches" ON public.feature_flags FOR SELECT TO anon, authenticated USING (true);


--
-- Name: course_reviews approved reviews and your own are readable; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "approved reviews and your own are readable" ON public.course_reviews FOR SELECT TO authenticated USING ((approved OR (user_id = auth.uid())));


--
-- Name: billing_details; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.billing_details ENABLE ROW LEVEL SECURITY;

--
-- Name: blog_categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

--
-- Name: blog_comments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

--
-- Name: blog_curated; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.blog_curated ENABLE ROW LEVEL SECURITY;

--
-- Name: blog_likes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.blog_likes ENABLE ROW LEVEL SECURITY;

--
-- Name: blog_post_categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.blog_post_categories ENABLE ROW LEVEL SECURITY;

--
-- Name: blog_post_views; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.blog_post_views ENABLE ROW LEVEL SECURITY;

--
-- Name: blog_posts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

--
-- Name: orders buyers see their own orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "buyers see their own orders" ON public.orders FOR SELECT TO authenticated USING (((user_id = ( SELECT auth.uid() AS uid)) OR public.is_admin()));


--
-- Name: blog_categories categories are public; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "categories are public" ON public.blog_categories FOR SELECT USING (true);


--
-- Name: certificates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

--
-- Name: lesson_progress clear own progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "clear own progress" ON public.lesson_progress FOR DELETE TO authenticated USING ((user_id = auth.uid()));


--
-- Name: coupon_redemptions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

--
-- Name: coupons; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

--
-- Name: course_categories course categories are public; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "course categories are public" ON public.course_categories FOR SELECT USING (true);


--
-- Name: lessons course owners manage lessons; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "course owners manage lessons" ON public.lessons TO authenticated USING ((public.owns_course(course_id) OR public.is_admin())) WITH CHECK ((public.owns_course(course_id) OR public.is_admin()));


--
-- Name: course_modules course owners manage modules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "course owners manage modules" ON public.course_modules TO authenticated USING ((public.owns_course(course_id) OR public.is_admin())) WITH CHECK ((public.owns_course(course_id) OR public.is_admin()));


--
-- Name: lesson_progress course owners read student progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "course owners read student progress" ON public.lesson_progress FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.lessons l
  WHERE ((l.id = lesson_progress.lesson_id) AND (public.owns_course(l.course_id) OR public.is_admin())))));


--
-- Name: course_categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.course_categories ENABLE ROW LEVEL SECURITY;

--
-- Name: course_modules; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;

--
-- Name: course_quizzes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.course_quizzes ENABLE ROW LEVEL SECURITY;

--
-- Name: course_reviews; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;

--
-- Name: courses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

--
-- Name: documents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

--
-- Name: documents documents readable by audience; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "documents readable by audience" ON public.documents FOR SELECT USING (((visibility = 'public'::public.document_visibility) OR ((visibility = 'enrolled'::public.document_visibility) AND (course_id IS NOT NULL) AND (public.is_enrolled(course_id) OR public.owns_course(course_id))) OR public.is_admin()));


--
-- Name: email_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.email_log ENABLE ROW LEVEL SECURITY;

--
-- Name: email_templates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

--
-- Name: enrollments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

--
-- Name: feature_flags; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

--
-- Name: courses instructors create their own courses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "instructors create their own courses" ON public.courses FOR INSERT TO authenticated WITH CHECK (((instructor_id = auth.uid()) AND public.is_instructor()));


--
-- Name: courses instructors delete their own draft courses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "instructors delete their own draft courses" ON public.courses FOR DELETE TO authenticated USING ((((instructor_id = auth.uid()) AND (status = 'draft'::public.course_status)) OR public.is_admin()));


--
-- Name: courses instructors update their own courses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "instructors update their own courses" ON public.courses FOR UPDATE TO authenticated USING (((instructor_id = auth.uid()) OR public.is_admin())) WITH CHECK (((instructor_id = auth.uid()) OR public.is_admin()));


--
-- Name: announcements learners read live announcements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "learners read live announcements" ON public.announcements FOR SELECT TO authenticated USING ((((status = 'published'::public.announcement_status) OR ((status = 'scheduled'::public.announcement_status) AND (scheduled_at <= now()))) AND ((course_id IS NULL) OR (EXISTS ( SELECT 1
   FROM public.enrollments e
  WHERE ((e.course_id = announcements.course_id) AND (e.user_id = ( SELECT auth.uid() AS uid))))) OR (EXISTS ( SELECT 1
   FROM public.courses c
  WHERE ((c.id = announcements.course_id) AND (c.instructor_id = ( SELECT auth.uid() AS uid))))))));


--
-- Name: quiz_attempts learners read their own attempts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "learners read their own attempts" ON public.quiz_attempts FOR SELECT TO authenticated USING ((user_id = auth.uid()));


--
-- Name: lessons lesson content for enrolled, preview, or owner; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "lesson content for enrolled, preview, or owner" ON public.lessons FOR SELECT USING (((public.course_is_published(course_id) AND (is_preview OR public.is_enrolled(course_id))) OR public.owns_course(course_id) OR public.is_admin()));


--
-- Name: lesson_notes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.lesson_notes ENABLE ROW LEVEL SECURITY;

--
-- Name: lesson_progress; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

--
-- Name: lesson_watch; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.lesson_watch ENABLE ROW LEVEL SECURITY;

--
-- Name: lessons; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

--
-- Name: blog_posts live posts are readable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "live posts are readable by everyone" ON public.blog_posts FOR SELECT USING ((((status <> 'draft'::public.post_status) AND (published_at <= now())) OR public.is_admin()));


--
-- Name: notifications mark own notifications read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "mark own notifications read" ON public.notifications FOR UPDATE TO authenticated USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));


--
-- Name: course_modules modules of published courses are readable; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "modules of published courses are readable" ON public.course_modules FOR SELECT USING ((public.course_is_published(course_id) OR public.owns_course(course_id) OR public.is_admin()));


--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: orders; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

--
-- Name: payment_methods; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

--
-- Name: payments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_messages people read their own AI messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "people read their own AI messages" ON public.ai_messages FOR SELECT TO authenticated USING ((user_id = auth.uid()));


--
-- Name: platform_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: blog_post_categories post categories are public; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "post categories are public" ON public.blog_post_categories FOR SELECT USING (true);


--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: courses published courses are readable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "published courses are readable by everyone" ON public.courses FOR SELECT USING (((status = 'published'::public.course_status) OR (instructor_id = auth.uid()) OR public.is_admin()));


--
-- Name: quiz_attempts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

--
-- Name: quiz_questions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

--
-- Name: course_quizzes quizzes are readable by enrolled learners; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "quizzes are readable by enrolled learners" ON public.course_quizzes FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.enrollments e
  WHERE ((e.course_id = course_quizzes.course_id) AND (e.user_id = auth.uid())))));


--
-- Name: support_messages read messages of visible threads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "read messages of visible threads" ON public.support_messages FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.support_threads t
  WHERE ((t.id = support_messages.thread_id) AND ((t.user_id = auth.uid()) OR public.is_admin())))));


--
-- Name: notifications read own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "read own notifications" ON public.notifications FOR SELECT TO authenticated USING ((user_id = auth.uid()));


--
-- Name: enrollments read own or owned-course enrollments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "read own or owned-course enrollments" ON public.enrollments FOR SELECT TO authenticated USING (((user_id = auth.uid()) OR public.owns_course(course_id) OR public.is_admin()));


--
-- Name: lesson_progress read own progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "read own progress" ON public.lesson_progress FOR SELECT TO authenticated USING ((user_id = auth.uid()));


--
-- Name: lesson_watch read own watch time; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "read own watch time" ON public.lesson_watch FOR SELECT TO authenticated USING ((user_id = auth.uid()));


--
-- Name: lesson_progress record own progress when enrolled; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "record own progress when enrolled" ON public.lesson_progress FOR INSERT TO authenticated WITH CHECK (((user_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM public.lessons l
  WHERE ((l.id = lesson_progress.lesson_id) AND public.is_enrolled(l.course_id) AND ((COALESCE(l.video_url, ''::text) = ''::text) OR (EXISTS ( SELECT 1
           FROM public.lesson_watch w
          WHERE ((w.user_id = auth.uid()) AND (w.lesson_id = l.id) AND w.qualified)))))))));


--
-- Name: saved_courses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.saved_courses ENABLE ROW LEVEL SECURITY;

--
-- Name: platform_settings settings readable by signed-in users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "settings readable by signed-in users" ON public.platform_settings FOR SELECT TO authenticated USING (true);


--
-- Name: enrollments students self-enroll in free courses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "students self-enroll in free courses" ON public.enrollments FOR INSERT TO authenticated WITH CHECK (((user_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM public.courses c
  WHERE ((c.id = enrollments.course_id) AND (c.status = 'published'::public.course_status) AND (c.price_minor = 0))))));


--
-- Name: support_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: support_threads; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.support_threads ENABLE ROW LEVEL SECURITY;

--
-- Name: user_badges; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: activity_events users log own page views; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "users log own page views" ON public.activity_events FOR INSERT TO authenticated WITH CHECK (((user_id = auth.uid()) AND (type = 'page_view'::text)));


--
-- Name: billing_details users manage own billing details; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "users manage own billing details" ON public.billing_details TO authenticated USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));


--
-- Name: lesson_notes users manage own lesson notes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "users manage own lesson notes" ON public.lesson_notes TO authenticated USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));


--
-- Name: saved_courses users manage own saved courses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "users manage own saved courses" ON public.saved_courses TO authenticated USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));


--
-- Name: user_badges users mark own badges seen; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "users mark own badges seen" ON public.user_badges FOR UPDATE TO authenticated USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));


--
-- Name: support_threads users open their own threads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "users open their own threads" ON public.support_threads FOR INSERT TO authenticated WITH CHECK (((user_id = auth.uid()) AND (status = 'open'::public.thread_status)));


--
-- Name: support_messages users post in own threads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "users post in own threads" ON public.support_messages FOR INSERT TO authenticated WITH CHECK (((sender_id = auth.uid()) AND (is_staff = false) AND (EXISTS ( SELECT 1
   FROM public.support_threads t
  WHERE ((t.id = support_messages.thread_id) AND (t.user_id = auth.uid()) AND (t.status <> 'closed'::public.thread_status))))));


--
-- Name: user_badges users read own badges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "users read own badges" ON public.user_badges FOR SELECT TO authenticated USING ((user_id = auth.uid()));


--
-- Name: certificates users read own certificates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "users read own certificates" ON public.certificates FOR SELECT TO authenticated USING ((user_id = auth.uid()));


--
-- Name: payment_methods users read own payment methods; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "users read own payment methods" ON public.payment_methods FOR SELECT TO authenticated USING ((user_id = auth.uid()));


--
-- Name: user_roles users read own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (((user_id = auth.uid()) OR public.is_admin()));


--
-- Name: support_threads users read own threads, staff read all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "users read own threads, staff read all" ON public.support_threads FOR SELECT TO authenticated USING (((user_id = auth.uid()) OR public.is_admin()));


--
-- Name: payment_methods users remove own payment methods; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "users remove own payment methods" ON public.payment_methods FOR DELETE TO authenticated USING ((user_id = auth.uid()));


--
-- Name: payments users see own payments, instructors see their sales; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "users see own payments, instructors see their sales" ON public.payments FOR SELECT TO authenticated USING (((user_id = auth.uid()) OR (instructor_id = auth.uid()) OR public.is_admin()));


--
-- Name: payment_methods users update own payment methods; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "users update own payment methods" ON public.payment_methods FOR UPDATE TO authenticated USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));


--
-- Name: profiles users update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "users update their own profile" ON public.profiles FOR UPDATE TO authenticated USING ((id = auth.uid())) WITH CHECK ((id = auth.uid()));


--
-- Name: visits; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: -
--

--
-- Access control. Supabase grants every new table, function and sequence to anon/authenticated/service_role by
-- default; the statements below clear that and grant exactly what the app needs (many tables are server-only).
--

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated, service_role;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated, service_role;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated, service_role;

GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: FUNCTION admin_active_users(p_days integer, p_end date); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.admin_active_users(p_days integer, p_end date) FROM PUBLIC;
GRANT ALL ON FUNCTION public.admin_active_users(p_days integer, p_end date) TO service_role;


--
-- Name: FUNCTION admin_daily_activity(p_days integer, p_end date); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.admin_daily_activity(p_days integer, p_end date) FROM PUBLIC;
GRANT ALL ON FUNCTION public.admin_daily_activity(p_days integer, p_end date) TO service_role;


--
-- Name: FUNCTION admin_list_users(p_search text, p_role public.app_role, p_deleted boolean, p_limit integer, p_offset integer); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.admin_list_users(p_search text, p_role public.app_role, p_deleted boolean, p_limit integer, p_offset integer) FROM PUBLIC;
GRANT ALL ON FUNCTION public.admin_list_users(p_search text, p_role public.app_role, p_deleted boolean, p_limit integer, p_offset integer) TO service_role;


--
-- Name: FUNCTION admin_monthly_revenue(p_months integer); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.admin_monthly_revenue(p_months integer) FROM PUBLIC;
GRANT ALL ON FUNCTION public.admin_monthly_revenue(p_months integer) TO service_role;


--
-- Name: FUNCTION admin_top_courses(p_days integer, p_limit integer, p_end date); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.admin_top_courses(p_days integer, p_limit integer, p_end date) FROM PUBLIC;
GRANT ALL ON FUNCTION public.admin_top_courses(p_days integer, p_limit integer, p_end date) TO service_role;


--
-- Name: FUNCTION admin_top_pages(p_days integer, p_limit integer, p_end date); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.admin_top_pages(p_days integer, p_limit integer, p_end date) FROM PUBLIC;
GRANT ALL ON FUNCTION public.admin_top_pages(p_days integer, p_limit integer, p_end date) TO service_role;


--
-- Name: FUNCTION admin_traffic_report(p_days integer, p_end date); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.admin_traffic_report(p_days integer, p_end date) FROM PUBLIC;
GRANT ALL ON FUNCTION public.admin_traffic_report(p_days integer, p_end date) TO service_role;


--
-- Name: FUNCTION blog_post_metrics(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.blog_post_metrics() FROM PUBLIC;
GRANT ALL ON FUNCTION public.blog_post_metrics() TO service_role;


--
-- Name: FUNCTION course_is_published(p_course_id uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.course_is_published(p_course_id uuid) TO anon;
GRANT ALL ON FUNCTION public.course_is_published(p_course_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.course_is_published(p_course_id uuid) TO service_role;


--
-- Name: FUNCTION course_lesson_counts(p_course_ids uuid[]); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.course_lesson_counts(p_course_ids uuid[]) TO anon;
GRANT ALL ON FUNCTION public.course_lesson_counts(p_course_ids uuid[]) TO authenticated;
GRANT ALL ON FUNCTION public.course_lesson_counts(p_course_ids uuid[]) TO service_role;


--
-- Name: FUNCTION course_metrics(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.course_metrics() FROM PUBLIC;
GRANT ALL ON FUNCTION public.course_metrics() TO service_role;


--
-- Name: FUNCTION course_ratings(p_course_ids uuid[]); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.course_ratings(p_course_ids uuid[]) FROM PUBLIC;
GRANT ALL ON FUNCTION public.course_ratings(p_course_ids uuid[]) TO anon;
GRANT ALL ON FUNCTION public.course_ratings(p_course_ids uuid[]) TO authenticated;
GRANT ALL ON FUNCTION public.course_ratings(p_course_ids uuid[]) TO service_role;


--
-- Name: FUNCTION handle_new_user(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.handle_new_user() TO anon;
GRANT ALL ON FUNCTION public.handle_new_user() TO authenticated;
GRANT ALL ON FUNCTION public.handle_new_user() TO service_role;


--
-- Name: FUNCTION has_role(p_role public.app_role); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.has_role(p_role public.app_role) TO anon;
GRANT ALL ON FUNCTION public.has_role(p_role public.app_role) TO authenticated;
GRANT ALL ON FUNCTION public.has_role(p_role public.app_role) TO service_role;


--
-- Name: FUNCTION is_admin(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.is_admin() TO anon;
GRANT ALL ON FUNCTION public.is_admin() TO authenticated;
GRANT ALL ON FUNCTION public.is_admin() TO service_role;


--
-- Name: FUNCTION is_enrolled(p_course_id uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.is_enrolled(p_course_id uuid) TO anon;
GRANT ALL ON FUNCTION public.is_enrolled(p_course_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.is_enrolled(p_course_id uuid) TO service_role;


--
-- Name: FUNCTION is_instructor(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.is_instructor() TO anon;
GRANT ALL ON FUNCTION public.is_instructor() TO authenticated;
GRANT ALL ON FUNCTION public.is_instructor() TO service_role;


--
-- Name: FUNCTION lessons_sync_course_id(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.lessons_sync_course_id() TO anon;
GRANT ALL ON FUNCTION public.lessons_sync_course_id() TO authenticated;
GRANT ALL ON FUNCTION public.lessons_sync_course_id() TO service_role;


--
-- Name: FUNCTION mark_thread_read(p_thread_id uuid); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.mark_thread_read(p_thread_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.mark_thread_read(p_thread_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.mark_thread_read(p_thread_id uuid) TO service_role;


--
-- Name: FUNCTION my_profile(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.my_profile() FROM PUBLIC;
GRANT ALL ON FUNCTION public.my_profile() TO authenticated;
GRANT ALL ON FUNCTION public.my_profile() TO service_role;


--
-- Name: FUNCTION notify(p_user uuid, p_kind text, p_title text, p_body text, p_href text); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.notify(p_user uuid, p_kind text, p_title text, p_body text, p_href text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.notify(p_user uuid, p_kind text, p_title text, p_body text, p_href text) TO service_role;


--
-- Name: FUNCTION notify_badge(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.notify_badge() TO anon;
GRANT ALL ON FUNCTION public.notify_badge() TO authenticated;
GRANT ALL ON FUNCTION public.notify_badge() TO service_role;


--
-- Name: FUNCTION notify_certificate(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.notify_certificate() TO anon;
GRANT ALL ON FUNCTION public.notify_certificate() TO authenticated;
GRANT ALL ON FUNCTION public.notify_certificate() TO service_role;


--
-- Name: FUNCTION notify_staff_support(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.notify_staff_support() TO anon;
GRANT ALL ON FUNCTION public.notify_staff_support() TO authenticated;
GRANT ALL ON FUNCTION public.notify_staff_support() TO service_role;


--
-- Name: FUNCTION notify_support_reply(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.notify_support_reply() TO anon;
GRANT ALL ON FUNCTION public.notify_support_reply() TO authenticated;
GRANT ALL ON FUNCTION public.notify_support_reply() TO service_role;


--
-- Name: FUNCTION owns_course(p_course_id uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.owns_course(p_course_id uuid) TO anon;
GRANT ALL ON FUNCTION public.owns_course(p_course_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.owns_course(p_course_id uuid) TO service_role;


--
-- Name: FUNCTION quiz_progress(p_user_id uuid, p_course_ids uuid[]); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.quiz_progress(p_user_id uuid, p_course_ids uuid[]) FROM PUBLIC;
GRANT ALL ON FUNCTION public.quiz_progress(p_user_id uuid, p_course_ids uuid[]) TO anon;
GRANT ALL ON FUNCTION public.quiz_progress(p_user_id uuid, p_course_ids uuid[]) TO authenticated;
GRANT ALL ON FUNCTION public.quiz_progress(p_user_id uuid, p_course_ids uuid[]) TO service_role;


--
-- Name: FUNCTION renew_enrollments(p_user_id uuid, p_course_ids uuid[]); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.renew_enrollments(p_user_id uuid, p_course_ids uuid[]) FROM PUBLIC;
GRANT ALL ON FUNCTION public.renew_enrollments(p_user_id uuid, p_course_ids uuid[]) TO service_role;


--
-- Name: FUNCTION set_enrollment_expiry(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.set_enrollment_expiry() TO anon;
GRANT ALL ON FUNCTION public.set_enrollment_expiry() TO authenticated;
GRANT ALL ON FUNCTION public.set_enrollment_expiry() TO service_role;


--
-- Name: FUNCTION set_updated_at(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.set_updated_at() TO anon;
GRANT ALL ON FUNCTION public.set_updated_at() TO authenticated;
GRANT ALL ON FUNCTION public.set_updated_at() TO service_role;


--
-- Name: FUNCTION skip_repeat_page_view(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.skip_repeat_page_view() FROM PUBLIC;
GRANT ALL ON FUNCTION public.skip_repeat_page_view() TO service_role;


--
-- Name: FUNCTION support_message_bump(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.support_message_bump() TO anon;
GRANT ALL ON FUNCTION public.support_message_bump() TO authenticated;
GRANT ALL ON FUNCTION public.support_message_bump() TO service_role;


--
-- Name: FUNCTION track_course_publish(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.track_course_publish() TO anon;
GRANT ALL ON FUNCTION public.track_course_publish() TO authenticated;
GRANT ALL ON FUNCTION public.track_course_publish() TO service_role;


--
-- Name: FUNCTION track_enrollment(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.track_enrollment() TO anon;
GRANT ALL ON FUNCTION public.track_enrollment() TO authenticated;
GRANT ALL ON FUNCTION public.track_enrollment() TO service_role;


--
-- Name: FUNCTION track_lesson_complete(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.track_lesson_complete() TO anon;
GRANT ALL ON FUNCTION public.track_lesson_complete() TO authenticated;
GRANT ALL ON FUNCTION public.track_lesson_complete() TO service_role;


--
-- Name: FUNCTION track_signup(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.track_signup() TO anon;
GRANT ALL ON FUNCTION public.track_signup() TO authenticated;
GRANT ALL ON FUNCTION public.track_signup() TO service_role;


--
-- Name: FUNCTION track_visit(p_visit_id uuid, p_visitor_id uuid, p_user_id uuid, p_path text, p_new_campaign boolean, p_referrer text, p_referrer_host text, p_utm_source text, p_utm_medium text, p_utm_campaign text, p_utm_term text, p_utm_content text, p_channel text, p_country text, p_region text, p_city text, p_device text, p_browser text, p_os text); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.track_visit(p_visit_id uuid, p_visitor_id uuid, p_user_id uuid, p_path text, p_new_campaign boolean, p_referrer text, p_referrer_host text, p_utm_source text, p_utm_medium text, p_utm_campaign text, p_utm_term text, p_utm_content text, p_channel text, p_country text, p_region text, p_city text, p_device text, p_browser text, p_os text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.track_visit(p_visit_id uuid, p_visitor_id uuid, p_user_id uuid, p_path text, p_new_campaign boolean, p_referrer text, p_referrer_host text, p_utm_source text, p_utm_medium text, p_utm_campaign text, p_utm_term text, p_utm_content text, p_channel text, p_country text, p_region text, p_city text, p_device text, p_browser text, p_os text) TO service_role;


--
-- Name: FUNCTION user_id_by_email(p_email text); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.user_id_by_email(p_email text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.user_id_by_email(p_email text) TO service_role;


--
-- Name: TABLE activity_events; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.activity_events TO anon;
GRANT ALL ON TABLE public.activity_events TO authenticated;
GRANT ALL ON TABLE public.activity_events TO service_role;


--
-- Name: SEQUENCE activity_events_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON SEQUENCE public.activity_events_id_seq TO anon;
GRANT ALL ON SEQUENCE public.activity_events_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.activity_events_id_seq TO service_role;


--
-- Name: TABLE admin_audit_log; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.admin_audit_log TO anon;
GRANT ALL ON TABLE public.admin_audit_log TO authenticated;
GRANT ALL ON TABLE public.admin_audit_log TO service_role;


--
-- Name: SEQUENCE admin_audit_log_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON SEQUENCE public.admin_audit_log_id_seq TO anon;
GRANT ALL ON SEQUENCE public.admin_audit_log_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.admin_audit_log_id_seq TO service_role;


--
-- Name: TABLE ai_messages; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.ai_messages TO service_role;
GRANT SELECT ON TABLE public.ai_messages TO authenticated;


--
-- Name: SEQUENCE ai_messages_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON SEQUENCE public.ai_messages_id_seq TO anon;
GRANT ALL ON SEQUENCE public.ai_messages_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.ai_messages_id_seq TO service_role;


--
-- Name: TABLE announcements; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.announcements TO authenticated;
GRANT ALL ON TABLE public.announcements TO service_role;


--
-- Name: TABLE billing_details; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.billing_details TO authenticated;
GRANT ALL ON TABLE public.billing_details TO service_role;


--
-- Name: TABLE blog_categories; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.blog_categories TO service_role;
GRANT SELECT ON TABLE public.blog_categories TO anon;
GRANT SELECT ON TABLE public.blog_categories TO authenticated;


--
-- Name: TABLE blog_comments; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.blog_comments TO service_role;


--
-- Name: TABLE blog_curated; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.blog_curated TO service_role;


--
-- Name: TABLE blog_likes; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.blog_likes TO service_role;


--
-- Name: TABLE blog_post_categories; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.blog_post_categories TO service_role;
GRANT SELECT ON TABLE public.blog_post_categories TO anon;
GRANT SELECT ON TABLE public.blog_post_categories TO authenticated;


--
-- Name: TABLE blog_post_views; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.blog_post_views TO service_role;


--
-- Name: SEQUENCE blog_post_views_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON SEQUENCE public.blog_post_views_id_seq TO anon;
GRANT ALL ON SEQUENCE public.blog_post_views_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.blog_post_views_id_seq TO service_role;


--
-- Name: TABLE blog_posts; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.blog_posts TO anon;
GRANT ALL ON TABLE public.blog_posts TO authenticated;
GRANT ALL ON TABLE public.blog_posts TO service_role;


--
-- Name: TABLE certificates; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.certificates TO service_role;
GRANT SELECT ON TABLE public.certificates TO authenticated;


--
-- Name: TABLE coupon_redemptions; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.coupon_redemptions TO service_role;


--
-- Name: TABLE coupons; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.coupons TO service_role;


--
-- Name: TABLE course_categories; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.course_categories TO service_role;
GRANT SELECT ON TABLE public.course_categories TO anon;
GRANT SELECT ON TABLE public.course_categories TO authenticated;


--
-- Name: TABLE course_modules; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.course_modules TO anon;
GRANT ALL ON TABLE public.course_modules TO authenticated;
GRANT ALL ON TABLE public.course_modules TO service_role;


--
-- Name: TABLE course_quizzes; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.course_quizzes TO service_role;
GRANT SELECT ON TABLE public.course_quizzes TO authenticated;


--
-- Name: TABLE course_reviews; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.course_reviews TO service_role;
GRANT SELECT ON TABLE public.course_reviews TO authenticated;


--
-- Name: TABLE courses; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.courses TO anon;
GRANT ALL ON TABLE public.courses TO authenticated;
GRANT ALL ON TABLE public.courses TO service_role;


--
-- Name: TABLE documents; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.documents TO anon;
GRANT ALL ON TABLE public.documents TO authenticated;
GRANT ALL ON TABLE public.documents TO service_role;


--
-- Name: TABLE email_log; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.email_log TO service_role;


--
-- Name: TABLE email_templates; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.email_templates TO service_role;


--
-- Name: TABLE enrollments; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.enrollments TO anon;
GRANT ALL ON TABLE public.enrollments TO authenticated;
GRANT ALL ON TABLE public.enrollments TO service_role;


--
-- Name: TABLE feature_flags; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.feature_flags TO service_role;
GRANT SELECT ON TABLE public.feature_flags TO anon;
GRANT SELECT ON TABLE public.feature_flags TO authenticated;


--
-- Name: TABLE lesson_notes; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.lesson_notes TO authenticated;
GRANT ALL ON TABLE public.lesson_notes TO service_role;


--
-- Name: TABLE lesson_progress; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.lesson_progress TO anon;
GRANT ALL ON TABLE public.lesson_progress TO authenticated;
GRANT ALL ON TABLE public.lesson_progress TO service_role;


--
-- Name: TABLE lesson_watch; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.lesson_watch TO anon;
GRANT ALL ON TABLE public.lesson_watch TO authenticated;
GRANT ALL ON TABLE public.lesson_watch TO service_role;


--
-- Name: TABLE lessons; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.lessons TO anon;
GRANT ALL ON TABLE public.lessons TO authenticated;
GRANT ALL ON TABLE public.lessons TO service_role;


--
-- Name: TABLE notifications; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.notifications TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE ON TABLE public.notifications TO authenticated;
GRANT ALL ON TABLE public.notifications TO service_role;


--
-- Name: COLUMN notifications.read_at; Type: ACL; Schema: public; Owner: -
--

GRANT UPDATE(read_at) ON TABLE public.notifications TO authenticated;


--
-- Name: TABLE orders; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.orders TO authenticated;
GRANT ALL ON TABLE public.orders TO service_role;


--
-- Name: TABLE payment_methods; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.payment_methods TO service_role;
GRANT DELETE ON TABLE public.payment_methods TO authenticated;


--
-- Name: COLUMN payment_methods.id; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(id) ON TABLE public.payment_methods TO authenticated;


--
-- Name: COLUMN payment_methods.user_id; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(user_id) ON TABLE public.payment_methods TO authenticated;


--
-- Name: COLUMN payment_methods.provider; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(provider) ON TABLE public.payment_methods TO authenticated;


--
-- Name: COLUMN payment_methods.brand; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(brand) ON TABLE public.payment_methods TO authenticated;


--
-- Name: COLUMN payment_methods.last4; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(last4) ON TABLE public.payment_methods TO authenticated;


--
-- Name: COLUMN payment_methods.exp_month; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(exp_month) ON TABLE public.payment_methods TO authenticated;


--
-- Name: COLUMN payment_methods.exp_year; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(exp_year) ON TABLE public.payment_methods TO authenticated;


--
-- Name: COLUMN payment_methods.bank; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(bank) ON TABLE public.payment_methods TO authenticated;


--
-- Name: COLUMN payment_methods.is_default; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(is_default),UPDATE(is_default) ON TABLE public.payment_methods TO authenticated;


--
-- Name: COLUMN payment_methods.created_at; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(created_at) ON TABLE public.payment_methods TO authenticated;


--
-- Name: TABLE payments; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.payments TO anon;
GRANT ALL ON TABLE public.payments TO authenticated;
GRANT ALL ON TABLE public.payments TO service_role;


--
-- Name: TABLE platform_settings; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.platform_settings TO anon;
GRANT ALL ON TABLE public.platform_settings TO authenticated;
GRANT ALL ON TABLE public.platform_settings TO service_role;


--
-- Name: TABLE profiles; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE ON TABLE public.profiles TO anon;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;


--
-- Name: COLUMN profiles.id; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(id) ON TABLE public.profiles TO anon;
GRANT SELECT(id) ON TABLE public.profiles TO authenticated;


--
-- Name: COLUMN profiles.full_name; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(full_name),UPDATE(full_name) ON TABLE public.profiles TO authenticated;
GRANT SELECT(full_name) ON TABLE public.profiles TO anon;


--
-- Name: COLUMN profiles.avatar_url; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(avatar_url),UPDATE(avatar_url) ON TABLE public.profiles TO authenticated;
GRANT SELECT(avatar_url) ON TABLE public.profiles TO anon;


--
-- Name: COLUMN profiles.bio; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(bio),UPDATE(bio) ON TABLE public.profiles TO authenticated;
GRANT SELECT(bio) ON TABLE public.profiles TO anon;


--
-- Name: COLUMN profiles.created_at; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(created_at) ON TABLE public.profiles TO anon;
GRANT SELECT(created_at) ON TABLE public.profiles TO authenticated;


--
-- Name: COLUMN profiles.headline; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(headline),UPDATE(headline) ON TABLE public.profiles TO authenticated;
GRANT SELECT(headline) ON TABLE public.profiles TO anon;


--
-- Name: COLUMN profiles.location; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(location),UPDATE(location) ON TABLE public.profiles TO authenticated;
GRANT SELECT(location) ON TABLE public.profiles TO anon;


--
-- Name: COLUMN profiles.website_url; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(website_url),UPDATE(website_url) ON TABLE public.profiles TO authenticated;
GRANT SELECT(website_url) ON TABLE public.profiles TO anon;


--
-- Name: COLUMN profiles.linkedin_url; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(linkedin_url),UPDATE(linkedin_url) ON TABLE public.profiles TO authenticated;
GRANT SELECT(linkedin_url) ON TABLE public.profiles TO anon;


--
-- Name: COLUMN profiles.x_url; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(x_url),UPDATE(x_url) ON TABLE public.profiles TO authenticated;
GRANT SELECT(x_url) ON TABLE public.profiles TO anon;


--
-- Name: COLUMN profiles.interests; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(interests),UPDATE(interests) ON TABLE public.profiles TO authenticated;
GRANT SELECT(interests) ON TABLE public.profiles TO anon;


--
-- Name: COLUMN profiles.notification_prefs; Type: ACL; Schema: public; Owner: -
--

GRANT UPDATE(notification_prefs) ON TABLE public.profiles TO authenticated;


--
-- Name: COLUMN profiles.cover_url; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(cover_url),UPDATE(cover_url) ON TABLE public.profiles TO authenticated;
GRANT SELECT(cover_url) ON TABLE public.profiles TO anon;


--
-- Name: COLUMN profiles.username; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(username),UPDATE(username) ON TABLE public.profiles TO authenticated;
GRANT SELECT(username) ON TABLE public.profiles TO anon;


--
-- Name: COLUMN profiles.profile_public; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(profile_public),UPDATE(profile_public) ON TABLE public.profiles TO authenticated;
GRANT SELECT(profile_public) ON TABLE public.profiles TO anon;


--
-- Name: COLUMN profiles.weekly_goal; Type: ACL; Schema: public; Owner: -
--

GRANT UPDATE(weekly_goal) ON TABLE public.profiles TO authenticated;


--
-- Name: COLUMN profiles.show_current_learning; Type: ACL; Schema: public; Owner: -
--

GRANT UPDATE(show_current_learning) ON TABLE public.profiles TO authenticated;


--
-- Name: COLUMN profiles.learning_goal; Type: ACL; Schema: public; Owner: -
--

GRANT UPDATE(learning_goal) ON TABLE public.profiles TO authenticated;


--
-- Name: COLUMN profiles.skill_level; Type: ACL; Schema: public; Owner: -
--

GRANT UPDATE(skill_level) ON TABLE public.profiles TO authenticated;


--
-- Name: COLUMN profiles.weekly_hours; Type: ACL; Schema: public; Owner: -
--

GRANT UPDATE(weekly_hours) ON TABLE public.profiles TO authenticated;


--
-- Name: COLUMN profiles.onboarded_at; Type: ACL; Schema: public; Owner: -
--

GRANT UPDATE(onboarded_at) ON TABLE public.profiles TO authenticated;


--
-- Name: TABLE quiz_attempts; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.quiz_attempts TO service_role;
GRANT SELECT ON TABLE public.quiz_attempts TO authenticated;


--
-- Name: TABLE quiz_questions; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.quiz_questions TO service_role;


--
-- Name: TABLE saved_courses; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.saved_courses TO authenticated;
GRANT ALL ON TABLE public.saved_courses TO service_role;


--
-- Name: TABLE support_messages; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.support_messages TO anon;
GRANT ALL ON TABLE public.support_messages TO authenticated;
GRANT ALL ON TABLE public.support_messages TO service_role;


--
-- Name: TABLE support_threads; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.support_threads TO anon;
GRANT ALL ON TABLE public.support_threads TO authenticated;
GRANT ALL ON TABLE public.support_threads TO service_role;


--
-- Name: TABLE user_badges; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.user_badges TO service_role;
GRANT SELECT ON TABLE public.user_badges TO authenticated;


--
-- Name: COLUMN user_badges.seen_at; Type: ACL; Schema: public; Owner: -
--

GRANT UPDATE(seen_at) ON TABLE public.user_badges TO authenticated;


--
-- Name: TABLE user_roles; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.user_roles TO anon;
GRANT ALL ON TABLE public.user_roles TO authenticated;
GRANT ALL ON TABLE public.user_roles TO service_role;


--
-- Name: TABLE visits; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.visits TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
--



--
-- Supabase-specific wiring (not part of the public schema dump)
--

-- New sign-ups get a profile and the student role.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Live updates for the support inbox and in-app notifications.
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_threads, public.support_messages, public.notifications;

-- The single settings row every admin settings page reads and updates.
INSERT INTO public.platform_settings (id) VALUES (true) ON CONFLICT DO NOTHING;

-- Referrals. Every learner has a referral code (link: /r/CODE). A friend who signs up through it gets a one-time
-- welcome coupon, and the referrer gets a reward coupon after the friend's first paid order
-- (src/lib/data/referrals.ts). Both are ordinary coupons locked to one email, so they show in Admin > Coupons.
ALTER TABLE public.profiles
  ADD COLUMN referral_code text UNIQUE,
  ADD COLUMN referred_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.platform_settings
  ADD COLUMN referrals_enabled boolean DEFAULT true NOT NULL,
  ADD COLUMN referral_friend_percent integer DEFAULT 10 NOT NULL CHECK (referral_friend_percent BETWEEN 0 AND 100),
  ADD COLUMN referral_reward_percent integer DEFAULT 10 NOT NULL CHECK (referral_reward_percent BETWEEN 0 AND 100);

CREATE TABLE public.referrals (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    referred_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    status text DEFAULT 'joined' NOT NULL CHECK (status IN ('joined', 'rewarded')),
    welcome_coupon_id uuid REFERENCES public.coupons(id) ON DELETE SET NULL,
    reward_coupon_id uuid REFERENCES public.coupons(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    rewarded_at timestamp with time zone
);
CREATE INDEX referrals_referrer_idx ON public.referrals (referrer_id);
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "referrals: own or admin" ON public.referrals FOR SELECT TO authenticated
  USING (referrer_id = (SELECT auth.uid()) OR referred_id = (SELECT auth.uid()) OR public.is_admin());
GRANT ALL ON TABLE public.referrals TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_referrer uuid;
  v_on boolean;
  v_percent integer;
  v_coupon uuid;
  v_code text;
begin
  insert into public.profiles (id, full_name, avatar_url, referral_code)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'avatar_url',
          upper(substr(md5(new.id::text || clock_timestamp()::text), 1, 8)));
  insert into public.user_roles (user_id, role) values (new.id, 'student');

  if coalesce(new.raw_user_meta_data ->> 'ref', '') <> '' then
    select referrals_enabled, referral_friend_percent into v_on, v_percent from public.platform_settings where id;
    select p.id into v_referrer from public.profiles p
      where p.referral_code = upper(new.raw_user_meta_data ->> 'ref') and p.id <> new.id;
    if v_referrer is not null and coalesce(v_on, false) then
      update public.profiles set referred_by = v_referrer where id = new.id;
      if v_percent > 0 and new.email is not null then
        insert into public.coupons (code, description, kind, value, emails, max_uses, per_person)
        values ('WELCOME-' || upper(substr(md5(random()::text), 1, 6)), 'Referral welcome discount', 'percent',
                v_percent, array[lower(new.email)], 1, 1)
        returning id, code into v_coupon, v_code;
        insert into public.notifications (user_id, kind, title, body, href)
        values (new.id, 'referral', 'Your welcome gift',
                'Use ' || v_code || ' at checkout for ' || v_percent || '% off your first course.', '/settings/referrals');
      end if;
      insert into public.referrals (referrer_id, referred_id, welcome_coupon_id) values (v_referrer, new.id, v_coupon);
      insert into public.notifications (user_id, kind, title, body, href)
      values (v_referrer, 'referral', 'A friend joined',
              coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), 'Someone')
                || ' signed up with your link. You get a reward when they buy their first course.',
              '/settings/referrals');
    end if;
  end if;
  return new;
end;
$$;
