# Cómo probar el sistema de puntuación y posicionamiento

## 1. Tests automáticos

En la raíz del proyecto ejecuta:

```bash
npm run test
```

Se ejecutan:

- **`pickemPoints.test.ts`**: reglas de puntuación (0, 2 y 5 pts).
- **`summaryData.test.ts`**: conteo de partidos con resultado.
- **`MatchResultCard.test.tsx`**: que la **página** muestre bien los puntos:
  - El badge a la derecha muestra **5**, **2** o **0** según corresponda.
  - **5 pts** → clase verde (`green`).
  - **2 pts** → clase ámbar (`amber`).
  - **0 pts** → clase gris (`muted`).
  - Si no hay puntos (`null`/`undefined`), no se muestra badge.

### Qué cubren los tests

- **5 pts**: predicción con marcador exacto (ej. predices 2-1, resultado 2-1).
- **2 pts**: aciertas ganador o empate pero no el marcador (ej. predices 3-0, resultado 2-1).
- **0 pts**: no aciertas el desenlace (ej. predices victoria local, resultado empate o victoria visitante).
- **countMatchesWithResult**: cuenta correctamente cuántos partidos tienen resultado en los días cargados.

---

## 2. Comprobar en la interfaz que los puntos se ven bien

Hay una **página de verificación visual** que muestra las tres opciones de puntos (0, 2 y 5) con la misma tarjeta que en Predicciones:

1. Inicia la app: `npm run dev`
2. En el navegador abre: **http://localhost:5173/verificar-puntos**
3. Deberías ver **3 tarjetas** de partido:
   - **Primera**: badge a la derecha con **0** en **gris**
   - **Segunda**: badge con **2** en **ámbar**
   - **Tercera**: badge con **5** en **verde**

Si esos tres círculos se ven con los colores indicados, la interfaz está mostrando correctamente la puntuación. No hace falta iniciar sesión para esta página.

---

## 3. Pruebas manuales en la app (Predicciones y Resumen)

### Puntuación por partido (0 / 2 / 5)

1. Entra con un usuario en **Predicciones**.
2. Haz predicciones para varios partidos que ya tengan resultado en la API (o datos estáticos).
3. En cada tarjeta de partido:
   - A la **derecha** debe aparecer un círculo con **0**, **2** o **5**.
   - **Verde** = 5 pts (marcador exacto).
   - **Ámbar** = 2 pts (acertaste ganador/empate).
   - **Gris** = 0 pts (no acertaste).
4. Comprueba un caso de cada tipo:
   - Exacto: pon el mismo marcador que el resultado → debe salir **5** en verde.
   - Solo resultado: mismo ganador/empate, otro marcador → **2** en ámbar.
   - Fallo: otro desenlace → **0** en gris.

### Total de puntos

1. En **Predicciones**, revisa el bloque del header que dice **Puntos: X pts**.
2. Suma mentalmente los puntos de cada partido (0+2+5+…) y comprueba que el total coincida.

### Página Resumen

1. Ve a **Resumen**.
2. **Ranking Global**: debe mostrar tu posición según los puntos (y la de otros usuarios si hay datos en `user_score` o se calculan en vivo).
3. **Puntos** en el header: debe coincidir con el total que ves en Predicciones (mismo cálculo).
4. **Tabla de posiciones**: lista de usuarios ordenada por puntos (mayor primero). Tu fila debe tener el indicador “(tú)” y el mismo total de puntos.

### Base de datos (opcional)

- **user_prediction**: tus predicciones por partido (`match_id`, `home_score`, `away_score`).
- **user_score**: si tu backend escribe aquí el total por usuario, el ranking en Resumen puede leerlo; si la tabla está vacía, la app puede mostrar todos con 0 y calcular solo los puntos del usuario actual en tiempo real.

---

## 4. Resumen rápido

| Qué probar              | Dónde              | Cómo verificarlo                          |
|-------------------------|--------------------|--------------------------------------------|
| Reglas 0 / 2 / 5        | `npm run test`     | Tests de `calculatePollaPoints`            |
| Conteo partidos con resultado | `npm run test`     | Tests de `countMatchesWithResult`          |
| **Visualización de puntos (0/2/5 y colores)** | `npm run test` y **/verificar-puntos** | Tests automáticos + página **/verificar-puntos** en el navegador para ver las 3 opciones |
| Puntos por partido      | Predicciones       | Círculo derecho en cada tarjeta (color y número) |
| Total de puntos         | Predicciones + Resumen | Mismo número en ambos sitios          |
| Orden del ranking       | Resumen            | Usuarios ordenados por puntos, tú con “(tú)” |

Si algo no cuadra, revisa que los partidos tengan `homeScore` y `awayScore` en los datos que usa la app (API o estático) y que las predicciones estén guardadas en `user_prediction` para ese usuario.
