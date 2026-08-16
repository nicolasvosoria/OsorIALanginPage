-- Upsert de repos que respeta la curaduria manual.
--
-- El sync corre a diario y pisa los campos que vienen de GitHub, pero nunca
-- toca is_published / display_name / display_summary / sort_order de una fila
-- que ya existe: si alguien despublica un repo a mano, sigue despublicado.
--
-- La regla de autopublicacion solo aplica al insertar: publico, no fork,
-- no archivado y con descripcion. Un repo privado jamas se autopublica.

create or replace function "landingOsorIA".sync_github_repos(p_repos jsonb)
returns integer
language plpgsql
security definer
set search_path = "landingOsorIA", public
as $$
declare
  v_count integer;
begin
  insert into "landingOsorIA".github_repos as gr (
    id, node_id, owner, name, full_name, description, html_url, homepage,
    is_private, is_fork, is_archived, primary_language, languages, topics,
    stargazers, forks, default_branch, commit_count, repo_created_at, pushed_at,
    is_published, synced_at
  )
  select
    (r->>'id')::bigint,
    r->>'node_id',
    r->>'owner',
    r->>'name',
    r->>'full_name',
    nullif(r->>'description', ''),
    r->>'html_url',
    nullif(r->>'homepage', ''),
    (r->>'is_private')::boolean,
    (r->>'is_fork')::boolean,
    (r->>'is_archived')::boolean,
    nullif(r->>'primary_language', ''),
    coalesce(r->'languages', '{}'::jsonb),
    coalesce(
      (select array_agg(value::text) from jsonb_array_elements_text(r->'topics')),
      '{}'::text[]
    ),
    coalesce((r->>'stargazers')::integer, 0),
    coalesce((r->>'forks')::integer, 0),
    nullif(r->>'default_branch', ''),
    coalesce((r->>'commit_count')::integer, 0),
    (r->>'repo_created_at')::timestamptz,
    (r->>'pushed_at')::timestamptz,
    -- autopublicacion solo en el insert inicial
    (
      not (r->>'is_private')::boolean
      and not (r->>'is_fork')::boolean
      and not (r->>'is_archived')::boolean
      and coalesce(nullif(r->>'description', ''), '') <> ''
    ),
    now()
  from jsonb_array_elements(p_repos) as r
  on conflict (id) do update set
    node_id          = excluded.node_id,
    owner            = excluded.owner,
    name             = excluded.name,
    full_name        = excluded.full_name,
    description      = excluded.description,
    html_url         = excluded.html_url,
    homepage         = excluded.homepage,
    is_private       = excluded.is_private,
    is_fork          = excluded.is_fork,
    is_archived      = excluded.is_archived,
    primary_language = excluded.primary_language,
    languages        = excluded.languages,
    topics           = excluded.topics,
    stargazers       = excluded.stargazers,
    forks            = excluded.forks,
    default_branch   = excluded.default_branch,
    commit_count     = excluded.commit_count,
    repo_created_at  = excluded.repo_created_at,
    pushed_at        = excluded.pushed_at,
    synced_at        = now()
    -- is_published, display_name, display_summary y sort_order quedan intactos
  ;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function "landingOsorIA".sync_github_repos(jsonb) from public, anon, authenticated;
grant execute on function "landingOsorIA".sync_github_repos(jsonb) to service_role;
