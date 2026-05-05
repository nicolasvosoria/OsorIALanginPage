-- Copa Osoria isolated schema migration into EngranaAppDataBase
-- Source project: ryxbfjlhdoxhlypgjyul (Polla Millonaria Algomerkar)
-- Target schema: copaosoria

create schema if not exists copaosoria;

grant usage on schema copaosoria to anon, authenticated, service_role;

create table if not exists copaosoria.competition (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  description text,
  name text
);

create table if not exists copaosoria.phase (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  description text,
  name text
);

create table if not exists copaosoria.competition_phase (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  competition_id uuid,
  phase_id uuid
);

create table if not exists copaosoria."group" (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  description text,
  invitation_link text,
  invitation_expires_at timestamptz
);

create table if not exists copaosoria.users (
  id uuid primary key,
  created_at timestamptz not null default now(),
  username text not null,
  email text not null,
  register_code text
);

create table if not exists copaosoria."match" (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  competition_phase_id uuid not null,
  provider_match_id text not null,
  home_team_name text,
  away_team_name text,
  kickoff_at timestamptz,
  home_score integer,
  away_score integer,
  status text,
  provider_updated_at timestamptz
);

create table if not exists copaosoria.user_prediction (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  user_id uuid,
  prediction jsonb,
  limit_date timestamptz,
  competition_phase_id uuid,
  match_id uuid
);

create table if not exists copaosoria.user_group (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  group_id uuid not null,
  user_id uuid not null
);

create table if not exists copaosoria.user_score (
  id uuid primary key default gen_random_uuid(),
  score bigint,
  user_id uuid not null,
  prediction_id uuid not null
);

insert into copaosoria."competition" ("id", "created_at", "description", "name") values
  ('0c3ec794-79e2-4e3a-a9f4-219e9ec2b661', '2026-02-24T00:02:45.650Z', NULL, 'mundial'),
  ('7279fcba-cc0f-48c7-b9e8-455122f2a258', '2026-02-24T14:23:49.172Z', NULL, 'Premier League')
on conflict do nothing;

insert into copaosoria."phase" ("id", "created_at", "description", "name") values
  ('299b2a32-40b0-4c26-b8f2-178d20e9d3ec', '2026-02-24T00:03:15.710Z', NULL, 'fase de grupos'),
  ('b3a7d427-603f-4cbc-8223-87519916b672', '2026-02-25T13:37:05.259Z', NULL, 'semifinal'),
  ('c4632efd-b2f7-4da5-8ac1-8af9c4b5714e', '2026-02-25T13:36:54.291Z', NULL, 'cuartos de final'),
  ('f7315a4f-f17b-4217-8b06-68a49813bb72', '2026-02-25T13:37:17.926Z', NULL, 'final')
on conflict do nothing;

insert into copaosoria."competition_phase" ("id", "created_at", "competition_id", "phase_id") values
  ('710ed77c-18c3-4c10-b679-d4e4de4d4286', '2026-02-25T16:01:06.792Z', '7279fcba-cc0f-48c7-b9e8-455122f2a258', '299b2a32-40b0-4c26-b8f2-178d20e9d3ec'),
  ('9ab30965-bbdd-45a4-a9a5-68e22fab42b6', '2026-02-24T13:11:44.236Z', '0c3ec794-79e2-4e3a-a9f4-219e9ec2b661', '299b2a32-40b0-4c26-b8f2-178d20e9d3ec')
on conflict do nothing;

insert into copaosoria."group" ("id", "created_at", "name", "description", "invitation_link", "invitation_expires_at") values
  ('3138b90b-73b0-41dd-928b-9afbc99318cf', '2026-03-13T21:55:46.424Z', 'prueba', '', '0018499d-c247-41dd-861f-f6b85555be96', '2026-03-24T02:42:28.206Z'),
  ('3545f17b-9b51-440a-bb8b-a7c4ec9285e9', '2026-03-18T00:19:44.592Z', 'PollaPremierLeage', '', 'a9bd39bd-d63b-4f3e-b28b-385fa36c20aa', '2026-03-25T00:19:44.315Z')
on conflict do nothing;

insert into copaosoria."users" ("id", "created_at", "username", "email", "register_code") values
  ('0644f0bb-bcb9-4e6c-abd6-155f7ffe1129', '2026-03-18T17:41:43.278Z', 'Lau', 'lau.h.work@gmail.com', NULL),
  ('0d918b61-134a-4da1-a0da-a1764e1b541a', '2026-03-12T15:56:12.035Z', 'Emanuel', 'ejcx@hotmail.com', NULL),
  ('7fa7b6e4-89a3-417e-8b20-0f3089a4c064', '2026-02-19T21:00:28.691Z', 'steven2375', 'stevenzabala75@gmail.com', NULL),
  ('94a3a83d-1556-4f97-9b6c-4bd3511a33d9', '2026-02-20T13:21:11.148Z', 'GerardoRomero', 'gerardoromero859@gmail.com', NULL),
  ('98acb3a1-ee71-4f67-9901-1d4bdef4c91d', '2026-03-18T00:17:53.027Z', 'anvo98', 'anvo0329@gmail.com', NULL),
  ('f2b3c714-6e89-4bdc-b296-d2e9b1c79e1f', '2026-02-24T14:33:02.293Z', 'Julio Patiño', 'gerardo.romero@osoria.tech', NULL),
  ('f7277f72-dca0-4fbb-be70-2cd2f2289d59', '2026-03-12T16:06:53.567Z', 'testing', 'stiven.zabala@osoria.tech', NULL)
on conflict do nothing;

insert into copaosoria."match" ("id", "created_at", "updated_at", "competition_phase_id", "provider_match_id", "home_team_name", "away_team_name", "kickoff_at", "home_score", "away_score", "status", "provider_updated_at") values
  ('0980d737-5c72-484a-bf9e-60374b7b5ade', '2026-03-20T01:33:13.301Z', '2026-03-20T01:33:11.800Z', '710ed77c-18c3-4c10-b679-d4e4de4d4286', '538085', 'AFC Bournemouth', 'Manchester United FC', '2026-03-20T20:00:00.000Z', NULL, NULL, 'scheduled', '2026-03-19T00:21:06.000Z'),
  ('11e3aee6-cb13-465b-9e64-c981d93cdc93', '2026-03-19T23:20:40.626Z', '2026-03-20T01:33:11.800Z', '710ed77c-18c3-4c10-b679-d4e4de4d4286', '538076', 'Crystal Palace FC', 'Leeds United FC', '2026-03-15T14:00:00.000Z', 0, 0, 'ended', '2026-03-19T00:21:06.000Z'),
  ('208d2710-1424-481a-b169-bcf9f50c711f', '2026-03-05T17:57:08.129Z', '2026-03-12T13:40:00.870Z', '710ed77c-18c3-4c10-b679-d4e4de4d4286', '2267361', 'Tottenham Hotspur', 'Crystal Palace', '2026-03-05T20:00:00.000Z', 1, 3, 'scheduled', '2026-03-12T13:40:00.870Z'),
  ('527cadc0-684c-4937-836a-2d80dd0ff3ba', '2026-03-05T17:57:08.129Z', '2026-03-05T23:55:01.559Z', '710ed77c-18c3-4c10-b679-d4e4de4d4286', '2267360', 'Newcastle United', 'Manchester United', '2026-03-04T20:15:00.000Z', 2, 1, 'scheduled', '2026-03-05T23:55:01.559Z'),
  ('5901a920-c981-4d60-bd17-2a41c69ea3a6', '2026-03-19T23:20:40.626Z', '2026-03-20T01:33:11.800Z', '710ed77c-18c3-4c10-b679-d4e4de4d4286', '538075', 'Sunderland AFC', 'Brighton & Hove Albion FC', '2026-03-14T15:00:00.000Z', 0, 1, 'ended', '2026-03-19T00:21:06.000Z'),
  ('60a67f8c-4fcc-469e-a306-9d2571cf120e', '2026-03-19T23:20:40.626Z', '2026-03-20T01:33:11.800Z', '710ed77c-18c3-4c10-b679-d4e4de4d4286', '538080', 'Chelsea FC', 'Newcastle United FC', '2026-03-14T17:30:00.000Z', 0, 1, 'ended', '2026-03-19T00:21:06.000Z'),
  ('613c596e-bb7e-4dac-8a34-9b82b46a933b', '2026-03-19T23:20:40.626Z', '2026-03-20T01:33:11.800Z', '710ed77c-18c3-4c10-b679-d4e4de4d4286', '538078', 'Brentford FC', 'Wolverhampton Wanderers FC', '2026-03-16T20:00:00.000Z', 2, 2, 'ended', '2026-03-19T00:21:06.000Z'),
  ('85cb3bb3-28bb-4fa7-8f86-50157411cda4', '2026-03-19T23:20:40.626Z', '2026-03-20T01:33:11.800Z', '710ed77c-18c3-4c10-b679-d4e4de4d4286', '538084', 'West Ham United FC', 'Manchester City FC', '2026-03-14T20:00:00.000Z', 1, 1, 'ended', '2026-03-19T00:21:06.000Z'),
  ('9c7e33e2-7464-4a5b-ac64-5f95e447325c', '2026-03-20T01:33:13.301Z', '2026-03-20T01:33:11.800Z', '710ed77c-18c3-4c10-b679-d4e4de4d4286', '538091', 'Manchester City FC', 'Crystal Palace FC', '2026-03-21T00:00:00.000Z', NULL, NULL, 'postponed', '2026-03-19T00:21:06.000Z'),
  ('a463e0f0-29df-466f-9a7d-33355a4ab284', '2026-03-19T23:20:40.626Z', '2026-03-20T01:33:11.800Z', '710ed77c-18c3-4c10-b679-d4e4de4d4286', '538081', 'Liverpool FC', 'Tottenham Hotspur FC', '2026-03-15T16:30:00.000Z', 1, 1, 'ended', '2026-03-19T00:21:06.000Z'),
  ('b5ae2489-d1fa-41eb-87c8-9df8862f7f72', '2026-03-06T00:00:01.746Z', '2026-03-12T13:40:00.870Z', '710ed77c-18c3-4c10-b679-d4e4de4d4286', '2267363', 'Arsenal', 'Everton', '2026-03-14T17:30:00.000Z', NULL, NULL, 'scheduled', '2026-03-12T13:40:00.870Z'),
  ('bb82336d-0694-4e55-bebf-fd732e5d03d8', '2026-03-19T23:20:40.626Z', '2026-03-20T01:33:11.800Z', '710ed77c-18c3-4c10-b679-d4e4de4d4286', '538082', 'Manchester United FC', 'Aston Villa FC', '2026-03-15T14:00:00.000Z', 3, 1, 'ended', '2026-03-19T00:21:06.000Z'),
  ('d1e0d10c-543c-425f-9235-1fd540eb15a1', '2026-03-19T23:20:40.626Z', '2026-03-20T01:33:11.800Z', '710ed77c-18c3-4c10-b679-d4e4de4d4286', '538079', 'Burnley FC', 'AFC Bournemouth', '2026-03-14T15:00:00.000Z', 0, 0, 'ended', '2026-03-19T00:21:06.000Z'),
  ('d69d2949-0aeb-4f74-bec6-ef3a8fe6d38e', '2026-03-19T23:20:40.626Z', '2026-03-20T01:33:11.800Z', '710ed77c-18c3-4c10-b679-d4e4de4d4286', '538083', 'Nottingham Forest FC', 'Fulham FC', '2026-03-15T14:00:00.000Z', 0, 0, 'ended', '2026-03-19T00:21:06.000Z'),
  ('eb672f1a-d091-4543-8956-311797466a32', '2026-03-19T23:20:40.626Z', '2026-03-20T01:33:11.800Z', '710ed77c-18c3-4c10-b679-d4e4de4d4286', '538077', 'Arsenal FC', 'Everton FC', '2026-03-14T17:30:00.000Z', 2, 0, 'ended', '2026-03-19T00:21:06.000Z')
on conflict do nothing;

insert into copaosoria."user_prediction" ("id", "created_at", "updated_at", "user_id", "prediction", "limit_date", "competition_phase_id", "match_id") values
  ('03a17cf2-1288-4827-8a4d-d487c390f3b5', '2026-02-24T14:33:58.780Z', '2026-02-24T14:33:59.621Z', 'f2b3c714-6e89-4bdc-b296-d2e9b1c79e1f', '{"match_id":"5","away_score":2,"home_score":2,"away_team_name":"Suiza","home_team_name":"Catar"}'::jsonb, '2026-06-13T19:00:00.000Z', NULL, NULL),
  ('18786377-2a9d-42c3-aa70-543895d6a647', '2026-02-25T16:43:31.688Z', '2026-02-25T16:43:33.782Z', '7fa7b6e4-89a3-417e-8b20-0f3089a4c064', '{"match_id":"2267348","away_score":0,"home_score":8,"away_team_name":"Manchester City","home_team_name":"Leeds United"}'::jsonb, '2026-02-28T17:30:00.000Z', '710ed77c-18c3-4c10-b679-d4e4de4d4286', NULL),
  ('1bbae83b-4e5d-4802-b20e-61e0a664c257', '2026-02-23T14:02:51.332Z', '2026-02-23T14:02:52.117Z', '94a3a83d-1556-4f97-9b6c-4bd3511a33d9', '{"match_id":"4","away_score":0,"home_score":3,"away_team_name":"Paraguay","home_team_name":"Estados Unidos"}'::jsonb, '2026-06-13T01:00:00.000Z', '9ab30965-bbdd-45a4-a9a5-68e22fab42b6', NULL),
  ('2929fc5f-b96c-48b0-88ed-5d3b5e7c8812', '2026-02-21T17:44:21.886Z', '2026-02-21T18:17:05.988Z', '7fa7b6e4-89a3-417e-8b20-0f3089a4c064', '{"match_id":"4","away_score":0,"home_score":0,"away_team_name":"Paraguay","home_team_name":"Estados Unidos"}'::jsonb, '2026-06-13T01:00:00.000Z', '9ab30965-bbdd-45a4-a9a5-68e22fab42b6', NULL),
  ('36b7b0c4-9e06-4ca8-b1cf-b6cdff34587e', '2026-02-21T17:44:23.115Z', '2026-02-21T18:17:07.202Z', '7fa7b6e4-89a3-417e-8b20-0f3089a4c064', '{"match_id":"7","away_score":0,"home_score":0,"away_team_name":"Escocia","home_team_name":"Haití"}'::jsonb, '2026-06-14T01:00:00.000Z', '9ab30965-bbdd-45a4-a9a5-68e22fab42b6', NULL),
  ('3c5266e3-f497-4e22-9fe6-ac08e1da9fe1', '2026-02-24T14:33:48.122Z', '2026-02-24T14:33:47.842Z', 'f2b3c714-6e89-4bdc-b296-d2e9b1c79e1f', '{"match_id":"1","away_score":0,"home_score":2,"away_team_name":"Sudáfrica","home_team_name":"México"}'::jsonb, '2026-06-11T19:00:00.000Z', NULL, NULL),
  ('460e6fd8-c331-41e1-9c55-a66497788d18', '2026-02-23T14:02:38.339Z', '2026-02-23T14:02:38.900Z', '94a3a83d-1556-4f97-9b6c-4bd3511a33d9', '{"match_id":"1","away_score":2,"home_score":1,"away_team_name":"Sudáfrica","home_team_name":"México"}'::jsonb, '2026-06-11T19:00:00.000Z', '9ab30965-bbdd-45a4-a9a5-68e22fab42b6', NULL),
  ('4c75174f-7e85-4ec8-9478-057c5473c815', '2026-02-21T17:44:21.052Z', '2026-02-21T18:17:05.130Z', '7fa7b6e4-89a3-417e-8b20-0f3089a4c064', '{"match_id":"2","away_score":1,"home_score":3,"away_team_name":"Por definir","home_team_name":"Corea del Sur"}'::jsonb, '2026-06-12T02:00:00.000Z', '9ab30965-bbdd-45a4-a9a5-68e22fab42b6', NULL),
  ('50cc5a30-2184-4508-b8ba-6b451763fe47', '2026-03-05T18:08:52.107Z', '2026-03-05T19:16:12.467Z', '7fa7b6e4-89a3-417e-8b20-0f3089a4c064', '{"match_id":"2267361","away_score":1,"home_score":3,"away_team_name":"Crystal Palace","home_team_name":"Tottenham Hotspur"}'::jsonb, '2026-03-05T20:00:00.000Z', '710ed77c-18c3-4c10-b679-d4e4de4d4286', '208d2710-1424-481a-b169-bcf9f50c711f'),
  ('524e2ada-e8eb-44d7-bdd2-033d11d14fa7', '2026-02-25T16:13:04.562Z', '2026-02-25T16:13:06.236Z', '7fa7b6e4-89a3-417e-8b20-0f3089a4c064', '{"match_id":"2267344","away_score":1,"home_score":4,"away_team_name":"Sunderland","home_team_name":"Bournemouth"}'::jsonb, '2026-02-28T12:30:00.000Z', NULL, NULL),
  ('5d73819e-abc6-4128-8494-41c090290217', '2026-02-25T16:29:28.400Z', '2026-02-25T16:29:31.637Z', '7fa7b6e4-89a3-417e-8b20-0f3089a4c064', '{"match_id":"2267351","away_score":3,"home_score":6,"away_team_name":"Everton","home_team_name":"Newcastle United"}'::jsonb, '2026-02-28T15:00:00.000Z', NULL, NULL),
  ('67156486-fdd4-476c-a5f1-33165dde1c39', '2026-02-24T14:34:01.604Z', '2026-02-24T14:34:02.588Z', 'f2b3c714-6e89-4bdc-b296-d2e9b1c79e1f', '{"match_id":"6","away_score":0,"home_score":1,"away_team_name":"Marruecos","home_team_name":"Brasil"}'::jsonb, '2026-06-13T22:00:00.000Z', NULL, NULL),
  ('716bf658-bb58-41d3-85ca-d422b0f4ef5b', '2026-02-25T16:19:04.474Z', '2026-02-25T16:19:04.232Z', '7fa7b6e4-89a3-417e-8b20-0f3089a4c064', '{"match_id":"2267346","away_score":1,"home_score":6,"away_team_name":"Brentford","home_team_name":"Burnley"}'::jsonb, '2026-02-28T15:00:00.000Z', NULL, NULL),
  ('814baf9b-d2c7-4904-8995-958e48bae7fe', '2026-02-25T14:14:22.104Z', '2026-02-25T14:14:22.890Z', '7fa7b6e4-89a3-417e-8b20-0f3089a4c064', '{"match_id":"2267352","away_score":2,"home_score":3,"away_team_name":"Aston Villa","home_team_name":"Wolverhampton Wanderers"}'::jsonb, '2026-02-27T20:00:00.000Z', NULL, NULL),
  ('8528a862-888c-49a8-aa71-a67eb07576b5', '2026-02-25T16:19:04.679Z', '2026-02-25T16:19:04.354Z', '7fa7b6e4-89a3-417e-8b20-0f3089a4c064', '{"match_id":"2267346","away_score":0,"home_score":6,"away_team_name":"Brentford","home_team_name":"Burnley"}'::jsonb, '2026-02-28T15:00:00.000Z', NULL, NULL),
  ('8682fdb4-c70a-4e68-a583-833ad3593525', '2026-02-21T17:44:20.663Z', '2026-02-26T23:49:57.282Z', '7fa7b6e4-89a3-417e-8b20-0f3089a4c064', '{"match_id":"1","away_score":2,"home_score":5,"away_team_name":"Sudáfrica","home_team_name":"México"}'::jsonb, '2026-06-11T19:00:00.000Z', '9ab30965-bbdd-45a4-a9a5-68e22fab42b6', NULL),
  ('89556034-afb2-4e84-8c8c-4c3fc7c64c28', '2026-02-23T14:03:02.781Z', '2026-02-23T14:03:03.418Z', '94a3a83d-1556-4f97-9b6c-4bd3511a33d9', '{"match_id":"6","away_score":0,"home_score":4,"away_team_name":"Marruecos","home_team_name":"Brasil"}'::jsonb, '2026-06-13T22:00:00.000Z', '9ab30965-bbdd-45a4-a9a5-68e22fab42b6', NULL),
  ('998f9510-a5d8-43cf-a72d-40a9fcfa76f1', '2026-02-25T16:26:40.946Z', '2026-02-25T16:26:42.136Z', '7fa7b6e4-89a3-417e-8b20-0f3089a4c064', '{"match_id":"2267349","away_score":2,"home_score":1,"away_team_name":"West Ham United","home_team_name":"Liverpool"}'::jsonb, '2026-02-28T15:00:00.000Z', NULL, NULL),
  ('9f7a4442-9ad3-466c-8af7-46c75fcbabb7', '2026-02-24T14:33:58.292Z', '2026-02-24T14:33:58.211Z', 'f2b3c714-6e89-4bdc-b296-d2e9b1c79e1f', '{"match_id":"4","away_score":1,"home_score":1,"away_team_name":"Paraguay","home_team_name":"Estados Unidos"}'::jsonb, '2026-06-13T01:00:00.000Z', NULL, NULL),
  ('a691f4b6-489a-4ed8-9a51-2ba8ec505347', '2026-02-21T17:44:22.725Z', '2026-02-21T18:17:06.783Z', '7fa7b6e4-89a3-417e-8b20-0f3089a4c064', '{"match_id":"6","away_score":0,"home_score":0,"away_team_name":"Marruecos","home_team_name":"Brasil"}'::jsonb, '2026-06-13T22:00:00.000Z', '9ab30965-bbdd-45a4-a9a5-68e22fab42b6', NULL),
  ('a6f667b2-88c2-4dcf-adf4-7a690880f710', '2026-02-21T17:44:21.466Z', '2026-02-21T18:17:05.586Z', '7fa7b6e4-89a3-417e-8b20-0f3089a4c064', '{"match_id":"3","away_score":3,"home_score":2,"away_team_name":"Por definir","home_team_name":"Canadá"}'::jsonb, '2026-06-12T19:00:00.000Z', '9ab30965-bbdd-45a4-a9a5-68e22fab42b6', NULL),
  ('b6fc8794-1374-4a2a-a948-0a916c0deffb', '2026-02-23T14:03:07.193Z', '2026-02-23T14:03:07.715Z', '94a3a83d-1556-4f97-9b6c-4bd3511a33d9', '{"match_id":"7","away_score":3,"home_score":1,"away_team_name":"Escocia","home_team_name":"Haití"}'::jsonb, '2026-06-14T01:00:00.000Z', '9ab30965-bbdd-45a4-a9a5-68e22fab42b6', NULL),
  ('c5018b98-0b07-4558-9f70-21550a2e12e4', '2026-02-25T14:46:31.472Z', '2026-02-25T14:46:33.038Z', 'f2b3c714-6e89-4bdc-b296-d2e9b1c79e1f', '{"match_id":"2","away_score":0,"home_score":1,"away_team_name":"Por definir","home_team_name":"Corea del Sur"}'::jsonb, '2026-06-12T02:00:00.000Z', NULL, NULL),
  ('c81ba0d8-7aa4-486a-8a53-f4b4af67e24a', '2026-02-24T14:33:48.126Z', '2026-02-24T14:33:47.854Z', 'f2b3c714-6e89-4bdc-b296-d2e9b1c79e1f', '{"match_id":"1","away_score":1,"home_score":2,"away_team_name":"Sudáfrica","home_team_name":"México"}'::jsonb, '2026-06-11T19:00:00.000Z', NULL, NULL),
  ('d5089e7b-00e7-4059-9b05-139655ff9bab', '2026-02-24T14:34:05.460Z', '2026-02-24T14:34:06.314Z', 'f2b3c714-6e89-4bdc-b296-d2e9b1c79e1f', '{"match_id":"7","away_score":2,"home_score":0,"away_team_name":"Escocia","home_team_name":"Haití"}'::jsonb, '2026-06-14T01:00:00.000Z', NULL, NULL),
  ('d50be5b3-f846-4426-9f99-4028fc8d122c', '2026-02-23T14:02:59.756Z', '2026-02-23T14:03:00.765Z', '94a3a83d-1556-4f97-9b6c-4bd3511a33d9', '{"match_id":"5","away_score":1,"home_score":0,"away_team_name":"Suiza","home_team_name":"Catar"}'::jsonb, '2026-06-13T19:00:00.000Z', '9ab30965-bbdd-45a4-a9a5-68e22fab42b6', NULL),
  ('eebf118b-6e73-43df-ace6-4fa74a634cb8', '2026-02-21T17:44:22.297Z', '2026-02-21T18:17:06.396Z', '7fa7b6e4-89a3-417e-8b20-0f3089a4c064', '{"match_id":"5","away_score":0,"home_score":0,"away_team_name":"Suiza","home_team_name":"Catar"}'::jsonb, '2026-06-13T19:00:00.000Z', '9ab30965-bbdd-45a4-a9a5-68e22fab42b6', NULL)
on conflict do nothing;

insert into copaosoria."user_group" ("id", "created_at", "group_id", "user_id") values
  ('040f3d4c-edd9-470e-a064-ea2e82ed4f91', '2026-03-17T02:56:47.182Z', '3138b90b-73b0-41dd-928b-9afbc99318cf', 'f7277f72-dca0-4fbb-be70-2cd2f2289d59'),
  ('11dedb2e-990d-42db-a7e2-b744f265b2ec', '2026-03-18T00:20:12.752Z', '3545f17b-9b51-440a-bb8b-a7c4ec9285e9', 'f7277f72-dca0-4fbb-be70-2cd2f2289d59'),
  ('2c490929-6acf-4dba-9d78-767c3319bb43', '2026-03-18T00:19:45.004Z', '3545f17b-9b51-440a-bb8b-a7c4ec9285e9', '98acb3a1-ee71-4f67-9901-1d4bdef4c91d'),
  ('d37d7e4a-1d20-46d1-b04e-e43912dda853', '2026-03-13T21:55:46.657Z', '3138b90b-73b0-41dd-928b-9afbc99318cf', '7fa7b6e4-89a3-417e-8b20-0f3089a4c064')
on conflict do nothing;

insert into copaosoria."user_score" ("id", "score", "user_id", "prediction_id") values
  ('3cfb79e8-4f45-4bd9-9b44-56f6175c0b6c', '0', '7fa7b6e4-89a3-417e-8b20-0f3089a4c064', '50cc5a30-2184-4508-b8ba-6b451763fe47')
on conflict do nothing;

alter table copaosoria.users add constraint users_email_key unique (email);
alter table copaosoria.competition_phase add constraint competition_phase_competition_id_fkey foreign key (competition_id) references copaosoria.competition(id) on delete cascade;
alter table copaosoria.competition_phase add constraint competition_phase_phase_id_fkey foreign key (phase_id) references copaosoria.phase(id) on delete cascade;
alter table copaosoria."match" add constraint match_competition_phase_id_fkey foreign key (competition_phase_id) references copaosoria.competition_phase(id);
alter table copaosoria."match" add constraint match_competition_phase_provider_uidx unique (competition_phase_id, provider_match_id);
alter table copaosoria.user_prediction add constraint user_prediction_competition_phase_id_fkey foreign key (competition_phase_id) references copaosoria.competition_phase(id) on delete cascade;
alter table copaosoria.user_prediction add constraint user_prediction_match_id_fkey foreign key (match_id) references copaosoria."match"(id);
alter table copaosoria.user_prediction add constraint user_prediction_user_id_fkey foreign key (user_id) references copaosoria.users(id) on delete cascade;
alter table copaosoria.user_prediction add constraint uq_user_prediction_user_match unique (user_id, match_id);
alter table copaosoria.user_group add constraint user_group_group_id_fkey foreign key (group_id) references copaosoria."group"(id) on delete cascade;
alter table copaosoria.user_group add constraint user_group_user_id_fkey foreign key (user_id) references copaosoria.users(id) on delete cascade;
alter table copaosoria.user_score add constraint user_score_prediction_id_fkey foreign key (prediction_id) references copaosoria.user_prediction(id);
alter table copaosoria.user_score add constraint user_score_user_id_fkey foreign key (user_id) references copaosoria.users(id) on delete cascade;
alter table copaosoria.user_score add constraint user_score_prediction_id_key unique (prediction_id);

create index if not exists match_competition_phase_id_idx on copaosoria."match" (competition_phase_id);
create index if not exists match_provider_match_id_idx on copaosoria."match" (provider_match_id);
create index if not exists match_status_idx on copaosoria."match" (status);
create index if not exists user_prediction_match_id_idx on copaosoria.user_prediction (match_id);
create index if not exists user_score_user_id_idx on copaosoria.user_score (user_id);

create or replace function copaosoria.compute_points(pred_home integer, pred_away integer, real_home integer, real_away integer, match_status text)
returns bigint language sql immutable as $$
select case
  when match_status is distinct from 'ended' then 0
  when pred_home is null or pred_away is null or real_home is null or real_away is null then 0
  when pred_home = real_home and pred_away = real_away then 5
  when (pred_home > pred_away and real_home > real_away)
    or (pred_home < pred_away and real_home < real_away)
    or (pred_home = pred_away and real_home = real_away) then 2
  else 0
end
$$;

create or replace function copaosoria.backfill_user_prediction_match_id(p_competition_phase_id uuid)
returns bigint language plpgsql security definer set search_path to 'copaosoria' as $$
declare v_updated bigint;
begin
  update copaosoria.user_prediction up
  set match_id = m.id
  from copaosoria."match" m
  where up.match_id is null
    and up.competition_phase_id = p_competition_phase_id
    and m.competition_phase_id = p_competition_phase_id
    and up.prediction->>'match_id' = m.provider_match_id;
  get diagnostics v_updated = row_count;
  return v_updated;
end;
$$;

create or replace function copaosoria.handle_new_user()
returns trigger language plpgsql security definer set search_path to 'copaosoria' as $$
begin
  insert into copaosoria.users (id, email, username, register_code)
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data->>'username', ''), nullif(new.raw_user_meta_data->>'full_name', ''), split_part(coalesce(new.email, ''), '@', 1), 'user'),
    nullif(new.raw_user_meta_data->>'register_code', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function copaosoria.on_match_update_recalc_user_scores()
returns trigger language plpgsql security definer set search_path to 'copaosoria' as $$
begin
  insert into copaosoria.user_score (user_id, prediction_id, score)
  select up.user_id, up.id, copaosoria.compute_points(
    case when (up.prediction->>'home_score') ~ '^\d+$' then (up.prediction->>'home_score')::int else null end,
    case when (up.prediction->>'away_score') ~ '^\d+$' then (up.prediction->>'away_score')::int else null end,
    new.home_score, new.away_score, new.status
  )
  from copaosoria.user_prediction up
  where up.match_id = new.id
  on conflict (prediction_id) do update set score = excluded.score;
  return new;
end;
$$;

create or replace function copaosoria.prevent_user_prediction_changes_after_deadline()
returns trigger language plpgsql as $$
begin
  if old.limit_date is not null and now() > old.limit_date then
    raise exception 'Deadline passed. Record locked since %.', old.limit_date using errcode = '23514';
  end if;
  if tg_op = 'UPDATE' then return new; end if;
  return old;
end;
$$;

drop trigger if exists trg_match_status_to_ended on copaosoria."match";
create trigger trg_match_status_to_ended after update of status on copaosoria."match" for each row when ((new.status = 'ended'::text) and (old.status is distinct from 'ended'::text)) execute function copaosoria.on_match_update_recalc_user_scores();
drop trigger if exists trg_user_prediction_deadline_delete on copaosoria.user_prediction;
create trigger trg_user_prediction_deadline_delete before delete on copaosoria.user_prediction for each row execute function copaosoria.prevent_user_prediction_changes_after_deadline();
drop trigger if exists trg_user_prediction_deadline_update on copaosoria.user_prediction;
create trigger trg_user_prediction_deadline_update before update on copaosoria.user_prediction for each row execute function copaosoria.prevent_user_prediction_changes_after_deadline();
drop trigger if exists on_auth_user_created_copaosoria on auth.users;
create trigger on_auth_user_created_copaosoria after insert on auth.users for each row execute function copaosoria.handle_new_user();

alter table copaosoria."competition" enable row level security;
alter table copaosoria."phase" enable row level security;
alter table copaosoria."competition_phase" enable row level security;
alter table copaosoria."group" enable row level security;
alter table copaosoria."users" enable row level security;
alter table copaosoria."match" enable row level security;
alter table copaosoria."user_prediction" enable row level security;
alter table copaosoria."user_group" enable row level security;
alter table copaosoria."user_score" enable row level security;

create policy "Enable read access for all users" on copaosoria.competition for select to authenticated using (true);
create policy "Enable read access for all users" on copaosoria.phase for select to authenticated using (true);
create policy "Enable read access for all users" on copaosoria.competition_phase for select to authenticated using (true);
create policy "Enable read access for all users" on copaosoria."match" for select to authenticated using (true);
create policy "Enable read access for all users" on copaosoria."group" for select to authenticated using (true);
create policy "Enable insert for authenticated users only" on copaosoria."group" for insert to authenticated with check (true);
create policy "Permitir actualizar grupos" on copaosoria."group" for update to authenticated using (true);
create policy "Enable read access for all users" on copaosoria.user_group for select to public using (true);
create policy "Enable insert for authenticated users only" on copaosoria.user_group for insert to authenticated with check (true);
create policy "Enable insert for authenticated users only" on copaosoria.user_prediction for insert to authenticated with check (true);
create policy "Enable users to view their own data only" on copaosoria.user_prediction for select to authenticated using ((select auth.uid()) = user_id);
create policy "user_prediction_update_own" on copaosoria.user_prediction for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Ranking: authenticated can read all scores" on copaosoria.user_score for select to authenticated using (true);
create policy "Ranking: authenticated can read all users" on copaosoria.users for select to authenticated using (true);
create policy "Users can read own profile" on copaosoria.users for select to authenticated using (id = auth.uid());
create policy "Users can update own profile" on copaosoria.users for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

grant all on all tables in schema copaosoria to service_role;
grant select, insert, update, delete on all tables in schema copaosoria to authenticated;
grant execute on all functions in schema copaosoria to authenticated, service_role;
