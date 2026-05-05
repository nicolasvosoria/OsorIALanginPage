-- Expose copaosoria through PostgREST without removing existing Engrana schemas.
alter role authenticator set pgrst.db_schemas = 'public,graphql_public,ecommerce,OsoriaEccomerse,OsoIADataAnalisis,copaosoria';
alter role authenticator set pgrst.db_extra_search_path = 'public,extensions,ecommerce';
notify pgrst, 'reload config';
