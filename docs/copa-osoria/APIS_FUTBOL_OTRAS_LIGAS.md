# Otras ligas con la misma API y alternativas gratuitas

Tu app usa **TheSportsDB** (clave pública `123`) para el Mundial 2026. Con la **misma API** puedes obtener fechas y resultados de otras competiciones de fútbol. Abajo: cómo hacerlo y otras APIs gratuitas.

---

## 1. TheSportsDB (la que ya usas) – Otras ligas

Misma base: `https://www.thesportsdb.com/api/v1/json/123/`

### Calendario y resultados por liga/temporada

- **Eventos de una temporada** (igual que el Mundial, cambiando ID y temporada):
  ```text
  GET eventsseason.php?id={ID_LIGA}&s={TEMPORADA}
  ```
  Ejemplo Mundial 2026: `id=4429&s=2026`  
  Para otras ligas solo cambias `id` y `s` (ej. `2024-2025`, `2025`, etc.).

### Cómo descubrir IDs de ligas (gratis)

- **Listar ligas por país y deporte:**
  ```text
  GET search_all_leagues.php?c=England&s=Soccer
  GET search_all_leagues.php?c=Spain&s=Soccer
  GET search_all_leagues.php?c=Germany&s=Soccer
  ```
  Respuesta incluye `idLeague` (y nombre de liga). Ese `idLeague` es el que usas en `eventsseason.php`.

- **Listar todas las ligas** (límite 10 en gratis):
  ```text
  GET all_leagues.php
  ```

- **Próximos partidos de una liga** (sin temporada):
  ```text
  GET eventsnextleague.php?id={ID_LIGA}
  ```

- **Partidos de un día concreto:**
  ```text
  GET eventsday.php?d=2025-03-15&s=Soccer
  ```

### IDs de ejemplo (fútbol)

| Competición        | ID típico | Temporada ejemplo |
|--------------------|-----------|--------------------|
| FIFA World Cup     | 4429      | 2026               |
| English Premier League | 4328  | 2024-2025          |
| La Liga (España)   | 4335      | 2024-2025          |
| Serie A (Italia)   | 4332      | 2024-2025          |
| Bundesliga         | 4331      | 2024-2025          |
| Copa América       | 4346      | 2024               |

Los IDs pueden variar; lo fiable es usar `search_all_leagues.php` por país (`c=...`) y `s=Soccer` y leer `idLeague` del JSON.

### Límites gratis TheSportsDB

- 30 peticiones por minuto.
- `eventsseason`: límite 15 por minuto en gratis (suficiente para una liga por carga).

---

## 2. Otras APIs gratuitas (fechas y resultados)

Misma idea: calendario + resultados; algunas con límites bajos.

| API | Qué ofrece | Límite gratis |
|-----|------------|----------------|
| **TheSportsDB** | Mundial, ligas, copas; fechas y resultados por temporada/día | 30 req/min, misma clave 123 |
| **Todo por el Fútbol** (api.todoporelfutbol.com) | Muchas competiciones (800+), fechas y resultados | 1 competición, 10 req/hora |
| **Football-Data.org** | Ligas europeas (Premier, La Liga, etc.) | Plan free con límite de requests/día |
| **API-Football** (api-football.com) | Ligas y copas mundiales | Capa free con cuota diaria limitada |

Para “las mismas fechas y resultados que el Mundial pero de otra liga”, la opción más directa es **seguir con TheSportsDB** y solo cambiar `id` y `s` en `eventsseason.php` (y opcionalmente usar `search_all_leagues.php` para obtener más IDs).

---

## 3. Resumen rápido

- **Misma API (TheSportsDB):**  
  Otras ligas = mismo endpoint `eventsseason.php` con otro `id={ID_LIGA}` y `s={TEMPORADA}`.  
  IDs de liga: `search_all_leagues.php?c=País&s=Soccer`.

- **Otras APIs gratuitas:**  
  Útiles si más adelante quieres más competiciones o otro proveedor; para añadir “otras ligas” con la misma información (fechas y resultados), TheSportsDB basta cambiando liga y temporada.
