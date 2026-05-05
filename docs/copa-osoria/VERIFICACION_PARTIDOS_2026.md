# Verificación: partidos Mundial 2026

## Fuentes

- **En vivo:** TheSportsDB API (`eventsseason.php?id=4429&s=2026`) cuando la app puede llamarla.
- **Fallback:** `src/data/matchesByDay.ts` (datos estáticos).

## Cambios realizados

### 1. Fecha de agrupación en GMT-5 (API)

La API devuelve `dateEvent` y `strTime` en **UTC**. Partidos que en UTC son ya “día siguiente” (p. ej. USA–Paraguay 01:00 UTC 13 Jun = 20:00 GMT-5 del 12 Jun) se agrupaban mal.  
Ahora en `src/lib/api/theSportsDbApi.ts` se convierte cada partido a **GMT-5** y se usa esa fecha para agrupar (`date` y `time`), de modo que cada partido aparece en el **día correcto** en la UI.

### 2. Calendario estático alineado con FIFA

Comprobado contra el calendario oficial (FIFA / NBC / fwcschedule.com):

| Fecha   | Partidos en estático | Notas |
|--------|-----------------------|--------|
| 11 Jun | México–Sudáfrica, Corea del Sur–Por definir | Inauguración Grupo A ✓ |
| 12 Jun | Canadá–Por definir, USA–Paraguay | Grupos B y D ✓ |
| 13 Jun | Catar–Suiza, Brasil–Marruecos, Haití–Escocia | Grupos B y C ✓ |
| 14 Jun | Australia–Por definir (00:00), Alemania–Curazao, Costa de Marfil–Ecuador, Países Bajos–Japón, Por definir–Túnez | Añadido Australia–Por definir (medianoche ET) ✓ |
| 15 Jun | Bélgica–Egipto, Irán–Nueva Zelanda, España–Cabo Verde, Arabia Saudita–Uruguay | Grupos G y H ✓ |
| 18 Jun | Por definir–Sudáfrica, México–Corea del Sur, Canadá–Catar, Suiza–Por definir | Segunda jornada A y B ✓ |
| 24 Jun | Por definir–México, Sudáfrica–Corea del Sur | Tercera jornada Grupo A ✓ |

Horas en estático: todas en **GMT-5**.

### 3. Qué falta (limitaciones)

- **TheSportsDB:** hoy solo devuelve **14 partidos** para la temporada 2026 (no los 72 de fase de grupos ni los 104 totales). Los que devuelve tienen fecha y hora corregidas a GMT-5.
- **Estático:** solo incluye **22 partidos** (subset 11–24 Jun). Faltan:
  - Resto de jornadas de grupos (16–17 Jun, 19–23 Jun, 25–27 Jun),
  - Grupos I–L completos,
  - Fase eliminatoria (32, 16, 8, 4, final).

Cuando TheSportsDB o otra fuente publique más partidos, se pueden añadir al estático o depender de la API sin cambiar la lógica de fechas GMT-5.

## Resumen

- **Fechas:** Los partidos se agrupan por **día en GMT-5**; los que cruzan medianoche UTC ya no se asignan al día equivocado.
- **Estático:** Los 22 partidos incluidos coinciden con el calendario oficial para 11–24 Jun; añadido Australia–Por definir el 14 Jun.
- **API:** Misma lógica de fecha/hora GMT-5; cuando la API devuelva más partidos, se mostrarán en la fecha correcta.
