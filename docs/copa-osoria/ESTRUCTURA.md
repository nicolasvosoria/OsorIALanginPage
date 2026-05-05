# Estructura del proyecto

Organización del código siguiendo buenas prácticas: separación por capas, agrupación por dominio y claridad en las importaciones.

## Raíz del proyecto

- `src/` — Código fuente de la aplicación
- `public/` — Assets estáticos (logo, robots.txt)
- `supabase/` — Migraciones y Edge Functions
- `docs/` — Documentación técnica
- `index.html`, `vite.config.ts`, `package.json`, etc.

## Dentro de `src/`

### `components/`
Componentes reutilizables de la UI.

- **`components/ui/`** — Componentes de diseño (shadcn/ui): Button, Card, Dialog, Input, etc. No contienen lógica de negocio.
- **`components/layout/`** — Elementos de layout y navegación:
  - `BottomNav.tsx` — Barra de navegación inferior
  - `NavLink.tsx` — Enlace compatible con react-router
  - `ProtectedRoute.tsx` — HOC para rutas que requieren autenticación
- **Raíz de `components/`** — Componentes de dominio: `MatchCard`, `MatchResultCard`, `GroupTabs`, etc.

### `pages/`
Una carpeta por “pantalla” o ruta.

- **`pages/auth/`** — Pantallas de autenticación:
  - `Login.tsx`, `Register.tsx`, `PasswordReset.tsx`, `ChangePassword.tsx`
- **Raíz de `pages/`** — Resto de pantallas:
  - `Predictions.tsx`, `Summary.tsx`, `Rankings.tsx`, `Profile.tsx`, `VerificarPuntos.tsx`, `NotFound.tsx`

### `lib/`
Lógica de negocio, clientes de API y utilidades.

- **`lib/api/`** — Clientes de APIs externas:
  - `theSportsDbApi.ts` — TheSportsDB (Mundial 2026, Premier)
  - `footballDataApi.ts` — football-data.org
  - `sportradarClient.ts` — Sportradar (uso en servidor)
- **Raíz de `lib/`** — Supabase, predicciones, puntuación, resumen:
  - `supabase.ts`, `userPrediction.ts`, `summaryData.ts`, `pickemPoints.ts`, `predictionDeadline.ts`, `utils.ts`

### `contexts/`
Contextos de React (estado global, autenticación).

- `AuthContext.tsx` — Usuario, sesión, login, registro, etc.

### `hooks/`
Hooks personalizados.

- `useUserPrediction.ts`, `use-toast.ts`, `use-mobile.tsx`

### `types/`
Definiciones TypeScript (interfaces, tipos).

- `user.ts`, `pickem.ts`, `theSportsDb.ts`, `footballData.ts`, `sportradar.ts`

### `data/`
Datos estáticos o estructuras base (por ejemplo, partidos por día).

- `matchesByDay.ts`

### `test/`
Configuración y tests globales.

- `setup.ts` — Configuración de Vitest
- Los tests por módulo suelen ir junto al archivo: `*.test.ts` / `*.test.tsx`

## Alias de importación

El proyecto usa el alias `@/` apuntando a `src/` (configurado en `vite.config.ts` y `tsconfig`). Ejemplos:

- `import { useAuth } from "@/contexts/AuthContext"`
- `import BottomNav from "@/components/layout/BottomNav"`
- `import { getWorldCup2026Matches } from "@/lib/api/theSportsDbApi"`

## Resumen visual

```
src/
├── components/
│   ├── layout/          # BottomNav, NavLink, ProtectedRoute
│   ├── ui/              # Componentes de diseño (shadcn)
│   ├── MatchCard.tsx
│   ├── MatchResultCard.tsx
│   └── GroupTabs.tsx
├── contexts/            # AuthContext
├── data/                # matchesByDay, datos estáticos
├── hooks/               # useUserPrediction, use-toast, use-mobile
├── lib/
│   ├── api/             # theSportsDbApi, footballDataApi, sportradarClient
│   ├── supabase.ts
│   ├── userPrediction.ts
│   ├── summaryData.ts
│   ├── pickemPoints.ts
│   └── ...
├── pages/
│   ├── auth/            # Login, Register, PasswordReset, ChangePassword
│   ├── Predictions.tsx
│   ├── Summary.tsx
│   ├── Rankings.tsx
│   ├── Profile.tsx
│   └── ...
├── test/                # setup.ts
├── types/               # user, pickem, theSportsDb, etc.
├── App.tsx
└── main.tsx
```
