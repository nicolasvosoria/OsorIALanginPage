-- Add Copa Osoria selectable leagues in schema copaosoria.
-- Idempotent because the migrated source only had mundial + Premier League.

insert into copaosoria.competition (name, description)
select v.name, v.description
from (values
  ('Champions League', 'UEFA Champions League'),
  ('La Liga', 'España - La Liga'),
  ('Serie A', 'Italia - Serie A'),
  ('Bundesliga', 'Alemania - Bundesliga')
) as v(name, description)
where not exists (
  select 1 from copaosoria.competition c where c.name = v.name
);

insert into copaosoria.competition_phase (competition_id, phase_id)
select c.id, p.id
from copaosoria.competition c
cross join copaosoria.phase p
where c.name in ('mundial', 'Champions League', 'Premier League', 'La Liga', 'Serie A', 'Bundesliga')
  and p.name = 'fase de grupos'
  and not exists (
    select 1
    from copaosoria.competition_phase cp
    where cp.competition_id = c.id
      and cp.phase_id = p.id
  );
