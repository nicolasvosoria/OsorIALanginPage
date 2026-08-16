/**
 * Edge Function: sincroniza la actividad de GitHub de la cuenta de Osoria
 * hacia el schema "landingOsorIA" de Databases4OsorIA.
 *
 * Guarda tres cosas:
 *   1. Un repositorio por fila en github_repos (incluye privados; los privados
 *      nunca se autopublican en la landing).
 *   2. Los commits por año en github_yearly_contributions. La API de GitHub
 *      solo entrega ventanas de un año, así que se consulta año por año desde
 *      la creación de la cuenta y se suma.
 *   3. Una foto agregada en github_stats_snapshots, que es lo que lee la landing.
 *
 * Variables de entorno en Supabase:
 *   GITHUB_TOKEN               – PAT de usuario (classic con scopes repo + read:user,
 *                                o fine-grained con Metadata + Contents de solo lectura).
 *                                Tiene que ser token de USUARIO: una GitHub App no puede
 *                                leer contributionsCollection de una persona.
 *   GITHUB_LOGIN               – opcional, solo para validar (default: nicolasvosoria)
 *   GITHUB_SYNC_CRON_SECRET    – secreto para autenticar la llamada
 *   SUPABASE_URL               – inyectado automáticamente
 *   SUPABASE_SERVICE_ROLE_KEY  – inyectado automáticamente
 *
 * Invocación:
 *   POST /sync-github
 *   Header: x-cron-secret: <GITHUB_SYNC_CRON_SECRET>
 */
declare const Deno: {
  serve: (handler: (req: Request) => Promise<Response>) => void;
  env: { get: (key: string) => string | undefined };
};

// @ts-expect-error - ESM URL import; válido en Deno
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GITHUB_GRAPHQL = "https://api.github.com/graphql";
const DEFAULT_LOGIN = "nicolasvosoria";
const REPO_PAGE_SIZE = 50;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, authorization, x-cron-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

type GraphQLResponse<T> = { data?: T; errors?: Array<{ message: string }> };

async function graphql<T>(
  token: string,
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const res = await fetch(GITHUB_GRAPHQL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "osoria-landing-sync",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`GitHub respondió ${res.status}: ${await res.text()}`);
  }

  const payload = (await res.json()) as GraphQLResponse<T>;
  if (payload.errors?.length) {
    throw new Error(`GitHub GraphQL: ${payload.errors.map((e) => e.message).join("; ")}`);
  }
  if (!payload.data) {
    throw new Error("GitHub GraphQL devolvió una respuesta vacía");
  }
  return payload.data;
}

const VIEWER_QUERY = `
  query {
    viewer { login createdAt }
  }
`;

const YEAR_QUERY = `
  query ($from: DateTime!, $to: DateTime!) {
    viewer {
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        restrictedContributionsCount
      }
    }
  }
`;

const REPOS_QUERY = `
  query ($cursor: String, $pageSize: Int!) {
    viewer {
      repositories(
        first: $pageSize
        after: $cursor
        ownerAffiliations: [OWNER]
        orderBy: { field: PUSHED_AT, direction: DESC }
      ) {
        pageInfo { hasNextPage endCursor }
        nodes {
          databaseId
          id
          name
          nameWithOwner
          owner { login }
          description
          url
          homepageUrl
          isPrivate
          isFork
          isArchived
          stargazerCount
          forkCount
          createdAt
          pushedAt
          primaryLanguage { name }
          languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
            edges { size node { name } }
          }
          repositoryTopics(first: 10) { nodes { topic { name } } }
          pullRequests { totalCount }
          refs(refPrefix: "refs/heads/", first: 0) { totalCount }
          defaultBranchRef {
            name
            target { ... on Commit { history { totalCount } } }
          }
        }
      }
    }
  }
`;

interface RepoNode {
  databaseId: number | null;
  id: string;
  name: string;
  nameWithOwner: string;
  owner: { login: string };
  description: string | null;
  url: string;
  homepageUrl: string | null;
  isPrivate: boolean;
  isFork: boolean;
  isArchived: boolean;
  stargazerCount: number;
  forkCount: number;
  createdAt: string;
  pushedAt: string | null;
  primaryLanguage: { name: string } | null;
  languages: { edges: Array<{ size: number; node: { name: string } }> };
  repositoryTopics: { nodes: Array<{ topic: { name: string } }> };
  pullRequests: { totalCount: number };
  refs: { totalCount: number };
  defaultBranchRef: { name: string; target: { history?: { totalCount: number } } | null } | null;
}

/** Un repo cuenta como "lo que usamos ahora" si tuvo push en esta ventana. */
const RECENT_WINDOW_DAYS = 90;

/**
 * Recorre año por año desde la creación de la cuenta hasta hoy.
 * contributionsCollection solo acepta ventanas de máximo un año.
 */
async function fetchYearlyContributions(token: string, createdAt: string, owner: string) {
  const startYear = new Date(createdAt).getUTCFullYear();
  const currentYear = new Date().getUTCFullYear();
  const rows = [];

  for (let year = startYear; year <= currentYear; year++) {
    const from = new Date(Date.UTC(year, 0, 1, 0, 0, 0)).toISOString();
    const to = new Date(Date.UTC(year, 11, 31, 23, 59, 59)).toISOString();

    const data = await graphql<{
      viewer: {
        contributionsCollection: {
          totalCommitContributions: number;
          restrictedContributionsCount: number;
        };
      };
    }>(token, YEAR_QUERY, { from, to });

    const c = data.viewer.contributionsCollection;
    rows.push({
      owner,
      year,
      total_commit_contributions: c.totalCommitContributions,
      restricted_contributions: c.restrictedContributionsCount,
      synced_at: new Date().toISOString(),
    });
  }

  return rows;
}

async function fetchAllRepos(token: string): Promise<RepoNode[]> {
  const repos: RepoNode[] = [];
  let cursor: string | null = null;

  for (;;) {
    const data: {
      viewer: {
        repositories: {
          pageInfo: { hasNextPage: boolean; endCursor: string | null };
          nodes: RepoNode[];
        };
      };
    } = await graphql(token, REPOS_QUERY, { cursor, pageSize: REPO_PAGE_SIZE });

    const page = data.viewer.repositories;
    repos.push(...page.nodes);

    if (!page.pageInfo.hasNextPage) break;
    cursor = page.pageInfo.endCursor;
  }

  return repos;
}

function toRepoRow(repo: RepoNode) {
  const languages: Record<string, number> = {};
  for (const edge of repo.languages.edges) {
    languages[edge.node.name] = edge.size;
  }

  return {
    id: repo.databaseId,
    node_id: repo.id,
    owner: repo.owner.login,
    name: repo.name,
    full_name: repo.nameWithOwner,
    description: repo.description ?? "",
    html_url: repo.url,
    homepage: repo.homepageUrl ?? "",
    is_private: repo.isPrivate,
    is_fork: repo.isFork,
    is_archived: repo.isArchived,
    primary_language: repo.primaryLanguage?.name ?? "",
    languages,
    topics: repo.repositoryTopics.nodes.map((n) => n.topic.name),
    stargazers: repo.stargazerCount,
    forks: repo.forkCount,
    default_branch: repo.defaultBranchRef?.name ?? "",
    commit_count: repo.defaultBranchRef?.target?.history?.totalCount ?? 0,
    pull_requests: repo.pullRequests.totalCount,
    branches: repo.refs.totalCount,
    repo_created_at: repo.createdAt,
    pushed_at: repo.pushedAt,
  };
}

type RepoRow = ReturnType<typeof toRepoRow>;

/** Suma los bytes por lenguaje de los repos tocados recientemente. */
function recentLanguages(rows: RepoRow[]): Record<string, number> {
  const cutoff = new Date(Date.now() - RECENT_WINDOW_DAYS * 86_400_000).toISOString();
  const totals: Record<string, number> = {};

  for (const row of rows) {
    if (!row.pushed_at || row.pushed_at < cutoff) continue;
    for (const [name, size] of Object.entries(row.languages)) {
      totals[name] = (totals[name] ?? 0) + size;
    }
  }

  return totals;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json(405, { error: "Método no permitido" });
  }

  const cronSecret = Deno.env.get("GITHUB_SYNC_CRON_SECRET");
  if (!cronSecret || req.headers.get("x-cron-secret") !== cronSecret) {
    return json(401, { error: "No autorizado" });
  }

  const githubToken = Deno.env.get("GITHUB_TOKEN");
  if (!githubToken) {
    return json(500, { error: "Falta GITHUB_TOKEN" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return json(500, { error: "Faltan credenciales de Supabase" });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    db: { schema: "landingOsorIA" },
    auth: { persistSession: false },
  });

  const { data: run, error: runError } = await supabase
    .from("github_sync_runs")
    .insert({ status: "running" })
    .select("id")
    .single();

  if (runError) {
    return json(500, { error: `No se pudo abrir el run: ${runError.message}` });
  }

  const failRun = async (message: string) => {
    await supabase
      .from("github_sync_runs")
      .update({ status: "error", finished_at: new Date().toISOString(), error_message: message })
      .eq("id", run.id);
    return json(500, { error: message, run_id: run.id });
  };

  try {
    const viewer = await graphql<{ viewer: { login: string; createdAt: string } }>(
      githubToken,
      VIEWER_QUERY,
    );
    const login = viewer.viewer.login;
    const expected = Deno.env.get("GITHUB_LOGIN") ?? DEFAULT_LOGIN;

    if (login.toLowerCase() !== expected.toLowerCase()) {
      return await failRun(`El token pertenece a "${login}", se esperaba "${expected}"`);
    }

    // --- commits por año -------------------------------------------------
    const yearRows = await fetchYearlyContributions(githubToken, viewer.viewer.createdAt, login);
    const { error: yearError } = await supabase
      .from("github_yearly_contributions")
      .upsert(yearRows, { onConflict: "owner,year" });
    if (yearError) return await failRun(`Error guardando años: ${yearError.message}`);

    // Commits atribuidos a la cuenta. Es MENOR que la suma por repositorio,
    // porque no cuenta lo que empujaron otros autores ni los bots.
    const authoredCommits = yearRows.reduce(
      (sum, r) => sum + r.total_commit_contributions + r.restricted_contributions,
      0,
    );

    // --- repositorios ----------------------------------------------------
    const repos = await fetchAllRepos(githubToken);
    const repoRows = repos.filter((r) => r.databaseId !== null).map(toRepoRow);

    const { error: repoError } = await supabase.rpc("sync_github_repos", { p_repos: repoRows });
    if (repoError) return await failRun(`Error guardando repos: ${repoError.message}`);

    // --- foto agregada ---------------------------------------------------
    const languages: Record<string, number> = {};
    for (const row of repoRows) {
      for (const [name, size] of Object.entries(row.languages)) {
        languages[name] = (languages[name] ?? 0) + size;
      }
    }

    const firstActivity = repoRows.reduce<string | null>((earliest, r) => {
      if (!r.repo_created_at) return earliest;
      return !earliest || r.repo_created_at < earliest ? r.repo_created_at : earliest;
    }, null);

    // La cifra que muestra la landing: commits en las ramas por defecto de
    // todos los repos, coherente con contar PRs y ramas por repositorio.
    const totalCommits = repoRows.reduce((sum, r) => sum + r.commit_count, 0);

    const { error: snapshotError } = await supabase.from("github_stats_snapshots").insert({
      owner: login,
      total_commits: totalCommits,
      authored_commits: authoredCommits,
      total_pull_requests: repoRows.reduce((sum, r) => sum + r.pull_requests, 0),
      total_branches: repoRows.reduce((sum, r) => sum + r.branches, 0),
      total_repos: repoRows.length,
      public_repos: repoRows.filter((r) => !r.is_private).length,
      private_repos: repoRows.filter((r) => r.is_private).length,
      total_stars: repoRows.reduce((sum, r) => sum + r.stargazers, 0),
      languages,
      recent_languages: recentLanguages(repoRows),
      first_activity_at: firstActivity,
    });
    if (snapshotError) return await failRun(`Error guardando snapshot: ${snapshotError.message}`);

    // --- alcance en personas ---------------------------------------------
    // Recuenta desde las bases reales; la función vive en Postgres porque
    // cruza schemas a los que la Edge Function no debería asomarse.
    const { data: impact, error: impactError } = await supabase.rpc("refresh_impact_snapshot");
    if (impactError) return await failRun(`Error calculando alcance: ${impactError.message}`);

    await supabase
      .from("github_sync_runs")
      .update({
        status: "ok",
        finished_at: new Date().toISOString(),
        repos_synced: repoRows.length,
        total_commits: totalCommits,
      })
      .eq("id", run.id);

    return json(200, {
      ok: true,
      run_id: run.id,
      login,
      repos_synced: repoRows.length,
      total_commits: totalCommits,
      authored_commits: authoredCommits,
      total_people: impact?.total_people ?? null,
      years_covered: yearRows.length,
    });
  } catch (err) {
    return await failRun(err instanceof Error ? err.message : String(err));
  }
});
