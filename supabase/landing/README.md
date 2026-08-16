# Landing OsorIA — schema `landingOsorIA`

La base de datos de la landing vive en el proyecto **Databases4OsorIA**
(`feqsjdhcsrksvrfsjsfv`), dentro del schema `landingOsorIA`.

El nombre del schema lleva mayúsculas — igual que `OsoriaEccomerse` y
`OsoIADataAnalisis` en ese mismo proyecto — así que en SQL **siempre** va entre
comillas dobles: `"landingOsorIA".github_repos`.

## Estado

| Paso | Estado |
|---|---|
| Schema y tablas creados | ✅ aplicado |
| Funciones `sync_github_repos` y `refresh_impact_snapshot` | ✅ aplicadas |
| Schema expuesto en PostgREST | ✅ aplicado |
| Datos de GitHub cargados | ✅ 17 repos, 709 commits, 77 PRs, 111 ramas |
| Alcance en personas calculado | ✅ 1.828 personas, 4.606 puntos de venta |
| Sección de la landing conectada | ✅ lee de la base, sin cifras a mano |
| Copia de datos del proyecto viejo | ⛔ pendiente (falta acceso al origen) |
| Corte de la app al proyecto nuevo | ⛔ pendiente (depende de la copia) |
| Edge Function desplegada + cron | ⛔ pendiente (la carga inicial fue manual) |

## Las cifras que muestra la landing

Todas salen de la base; ninguna está escrita en el código.

| Métrica | Origen | Valor |
|---|---|---|
| Commits publicados | Suma de `commit_count` de los 17 repos | 709 |
| Pull requests | Suma de `pull_requests` | 77 |
| Ramas de trabajo | Suma de `branches` | 111 |
| Personas | `impact_snapshots.total_people` | 1.828 |
| Lenguajes | `recent_languages`, repos con push en 90 días | TS, Dart, PLpgSQL, Python, JS, C++ |

**Sobre los commits:** hay dos cifras y no son intercambiables. `total_commits` (709)
suma los commits de las ramas por defecto de todos los repos — coherente con contar
PRs y ramas por repositorio, y es la que se muestra. `authored_commits` (174) son los
atribuidos a la cuenta vía `contributionsCollection`; queda guardada para auditoría.

**Sobre las personas:** `app_users` (143) son personas con cuenta en algo que
construimos nosotros. `client_platform_people` (1.685) son los contactos de punto de
venta que viven en las plataformas que operamos para clientes. El total suma ambas, así
que la etiqueta en la landing dice "personas en las plataformas que construimos", no
"nuestros usuarios" — la diferencia es real y la redacción tiene que sostenerla.
`business_locations` (4.606) son puntos de venta, **no personas**: `dim_clientes` tiene
`razon_social` y `direccion`, no nombres. No usar esa cifra como gente.

## Carrusel de proyectos

Los nombres viven en `showcase_projects`, una tabla **curada a mano**, aparte de
`github_repos`. La razón es de seguridad: la política de `github_repos` nunca deja salir
un repo privado, y 14 de nuestros 17 lo son. Con una tabla separada, lo único publicable
es un nombre — nunca la descripción, la URL ni el resto del metadato del repositorio.

```sql
-- quitar uno del carrusel
update "landingOsorIA".showcase_projects set is_published = false where name = 'Disay ETL';

-- agregar uno
insert into "landingOsorIA".showcase_projects (name, sort_order) values ('Nuevo Proyecto', 100);
```

Para recalcular el alcance sin esperar al cron:

```sql
select "landingOsorIA".refresh_impact_snapshot();
```

## Tablas

**Migradas desde `public` del proyecto viejo** (`yudejamenhxzipvdjrxq`):
`users`, `contact_messages`, `chat_sessions`, `chat_conversations`.

> `contact_submissions` no se recreó: existe como archivo en `migrations/` pero
> ningún código la usa. El formulario escribe en `contact_messages`
> (`actions/contact.ts`), y el panel admin lee de ahí.

**Nuevas, para la sección de GitHub:**

- `github_repos` — un repo por fila, incluidos los privados.
- `github_yearly_contributions` — commits por año. La API de GitHub solo
  entrega ventanas de un año, así que el total se arma sumando estas filas.
- `github_stats_snapshots` — foto agregada; es lo que lee la landing.
- `github_sync_runs` — bitácora de cada corrida.

## Qué se publica y qué no

RLS está activo en las ocho tablas.

- `users`, `contact_messages`, `chat_*`: sin políticas para `anon`. Solo se
  tocan con `service_role` desde el servidor de Next.
- `github_stats_snapshots` y `github_yearly_contributions`: lectura pública.
  Son agregados — el contador de la landing.
- `github_repos`: lectura pública **solo** de filas con
  `is_published AND NOT is_private`.

La autopublicación ocurre únicamente al insertar un repo por primera vez, y
solo si es público, no fork, no archivado y tiene descripción. Un repo privado
nunca se autopublica. En las corridas siguientes el sync actualiza los datos de
GitHub pero **no** pisa `is_published`, `display_name`, `display_summary` ni
`sort_order`: si despublicas algo a mano, sigue despublicado.

Para ajustar qué sale en la landing:

```sql
update "landingOsorIA".github_repos
set is_published = false
where full_name = 'nicolasvosoria/algun-repo';

update "landingOsorIA".github_repos
set display_name = 'Copa Osoria',
    display_summary = 'Plataforma de predicciones deportivas para 500+ usuarios.',
    sort_order = 1
where full_name = 'nicolasvosoria/copaOsoria';
```

## Pendiente 1 — token de GitHub

Tiene que ser un **token de usuario**, no una GitHub App. Una GitHub App
autentica como instalación, no como persona, y `contributionsCollection` es un
campo del usuario: una App no puede leer el historial de contribuciones de
`nicolasvosoria`, ni sus contribuciones privadas.

Crear en <https://github.com/settings/tokens>:

- **Classic** con scopes `repo` (para ver repos privados) y `read:user`.
- O **fine-grained**, dueño `nicolasvosoria`, todos los repos, permisos de
  solo lectura en `Metadata` y `Contents`.

Además, en <https://github.com/settings/profile>, activar *Include private
contributions on my profile* — si no, los commits privados llegan agregados
en `restricted_contributions` en vez de detallados.

Cargar los secrets de la Edge Function:

```bash
supabase secrets set GITHUB_TOKEN=<token> --project-ref feqsjdhcsrksvrfsjsfv
supabase secrets set GITHUB_SYNC_CRON_SECRET=<generado> --project-ref feqsjdhcsrksvrfsjsfv
supabase functions deploy sync-github --project-ref feqsjdhcsrksvrfsjsfv
```

Guardar el mismo secreto del cron en Vault y agendar:

```sql
select vault.create_secret('<mismo-valor>', 'github_sync_cron_secret');
```

Luego correr `migrations/20260816120200_schedule_github_sync.sql`.

Primera corrida manual:

```bash
curl -X POST https://feqsjdhcsrksvrfsjsfv.supabase.co/functions/v1/sync-github \
  -H "x-cron-secret: <secreto>"
```

## Pendiente 2 — copiar los datos del proyecto viejo

El proyecto origen (`yudejamenhxzipvdjrxq`) no está en la organización a la que
tengo acceso, así que la copia hay que correrla con sus credenciales. Estructura
ya está creada; solo faltan las filas.

```bash
# 1. Exportar solo datos de las cuatro tablas del proyecto viejo
pg_dump "postgresql://postgres:<password>@db.yudejamenhxzipvdjrxq.supabase.co:5432/postgres" \
  --data-only --no-owner --no-privileges \
  -t public.users -t public.contact_messages \
  -t public.chat_sessions -t public.chat_conversations \
  -f landing_data.sql

# 2. Reapuntar el schema en el dump
sd 'public\.(users|contact_messages|chat_sessions|chat_conversations)' \
   '"landingOsorIA".$1' landing_data.sql

# 3. Cargar en el proyecto nuevo
psql "postgresql://postgres:<password>@db.feqsjdhcsrksvrfsjsfv.supabase.co:5432/postgres" \
  -f landing_data.sql
```

Verificar los conteos contra el origen antes de cortar:

```sql
select 'users' t, count(*) from "landingOsorIA".users
union all select 'contact_messages', count(*) from "landingOsorIA".contact_messages
union all select 'chat_sessions', count(*) from "landingOsorIA".chat_sessions
union all select 'chat_conversations', count(*) from "landingOsorIA".chat_conversations;
```

## Pendiente 3 — cortar la app al proyecto nuevo

Solo después de verificar los conteos. Hoy `lib/supabase.ts` sigue apuntando al
proyecto viejo a propósito: cambiarlo antes de la copia mandaría los mensajes
nuevos a una base vacía y el panel admin quedaría en blanco.

El corte es: cambiar los imports de `@/lib/supabase` a `@/lib/supabase-landing`
en `actions/auth.ts`, `actions/contact.ts`, `app/admin/messages/page.tsx` y
`app/api/test-supabase/route.ts`; y reapuntar las variables de entorno en
`app/api/save-chat/route.ts` y `app/api/mark-whatsapp-sent/route.ts`, que leen
`NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` directo.

## Variables de entorno

En Vercel y en `.env.local`:

```
NEXT_PUBLIC_LANDING_SUPABASE_URL=https://feqsjdhcsrksvrfsjsfv.supabase.co
NEXT_PUBLIC_LANDING_SUPABASE_ANON_KEY=<anon key del proyecto>
LANDING_SUPABASE_SERVICE_ROLE_KEY=<service role del proyecto>
```
