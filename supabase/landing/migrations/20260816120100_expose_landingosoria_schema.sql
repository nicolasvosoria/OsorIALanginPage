-- Expone "landingOsorIA" en PostgREST sin sacar los schemas que ya estaban.
-- Lista previa verificada en pg_roles.rolconfig del rol authenticator:
--   public, graphql_public, ecommerce, OsoriaEccomerse, OsoIADataAnalisis, copaosoria, dataAnalisisDisay
alter role authenticator set pgrst.db_schemas =
  'public,graphql_public,ecommerce,OsoriaEccomerse,OsoIADataAnalisis,copaosoria,dataAnalisisDisay,landingOsorIA';
alter role authenticator set pgrst.db_extra_search_path = 'public,extensions,ecommerce';
notify pgrst, 'reload config';
