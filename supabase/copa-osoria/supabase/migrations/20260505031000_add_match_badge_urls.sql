alter table copaosoria."match"
  add column if not exists home_team_badge_url text,
  add column if not exists away_team_badge_url text;
