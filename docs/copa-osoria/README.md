# Copa Osoria

Aplicación web para la **Polla Mundialista Copa Osoria 2026**: predicciones de resultados, ranking por puntos y resumen de partidos (Mundial 2026 y Premier League).

## Funcionalidades

- **Autenticación**: registro, inicio de sesión, recuperación y cambio de contraseña (Supabase Auth).
- **Predicciones**: elegir marcadores para partidos del Mundial 2026 (primeros días) o de la Premier League (jornadas 28 y 29). Cierre 5 minutos antes de cada partido.
- **Puntuación**: 0, 2 o 5 puntos por partido según acierto (exacto o diferencia).
- **Resumen**: tabla de posiciones con puntos del usuario y del resto.
- **Ranking**: listado de usuarios ordenado por puntos.
- **Perfil**: datos de usuario, cambio de contraseña, avatar.

## Tecnologías

- **Frontend**: React 18, TypeScript, Vite
- **Estilos**: Tailwind CSS, shadcn/ui (Radix), Framer Motion
- **Backend / datos**: Supabase (Auth, base de datos)
- **Partidos**: API TheSportsDB (Mundial 2026 y Premier League)
- **Tests**: Vitest, Testing Library

## Requisitos

- Node.js 18+
- pnpm (recomendado) o npm

## Cómo ejecutar

```bash
# Clonar e instalar dependencias
git clone <URL_DEL_REPOSITORIO>
cd CopaOsoria
pnpm install

# Variables de entorno: crear .env con las claves de Supabase
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...
# VITE_API_FOOTBALL_KEY=... # API-Football / api-sports.io para Champions y ligas europeas

# Desarrollo (puerto 8080)
pnpm dev

# Build para producción
pnpm build

# Vista previa del build
pnpm preview
```

## Scripts

| Comando        | Descripción              |
|----------------|--------------------------|
| `pnpm dev`     | Servidor de desarrollo   |
| `pnpm build`   | Build de producción      |
| `pnpm preview` | Sirve el build localmente|
| `pnpm test`    | Ejecutar tests (Vitest)  |
| `pnpm lint`    | Linter (ESLint)          |

## Estructura del proyecto

- `src/pages/` — Pantallas (auth, Predicciones, Resumen, Ranking, Perfil).
- `src/components/` — Componentes de UI: `layout/` (BottomNav, ProtectedRoute), `ui/` (shadcn), y de dominio (p. ej. MatchResultCard).
- `src/lib/` — Lógica y APIs: `api/theSportsDbApi.ts`, Supabase, puntuación, predicciones.
- `src/contexts/` — AuthContext.
- `src/types/`, `src/hooks/`, `src/data/` — Tipos, hooks y datos estáticos.
- `supabase/migrations/` — Migraciones SQL (tablas, RLS).
- `docs/` — Documentación adicional (estructura, APIs, pruebas).

Detalle en `docs/ESTRUCTURA.md`.

## Licencia

Proyecto privado — Copa Osoria.
