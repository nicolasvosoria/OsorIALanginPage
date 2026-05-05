/**
 * Vercel serverless proxy para v3.football.api-sports.io/fixtures.
 * El navegador no puede llamar esa API directamente (CORS), así que esta
 * función actúa de intermediaria server-side.
 *
 * URL interna: /api/fixtures?league=1&season=2026
 */
export default async function handler(req, res) {
  const API_KEY = process.env.VITE_API_FOOTBALL_KEY ?? "";

  if (!API_KEY) {
    return res
      .status(500)
      .json({ error: "VITE_API_FOOTBALL_KEY no está configurada en Vercel" });
  }

  const params = new URLSearchParams(req.query ?? {});
  const url = `https://v3.football.api-sports.io/fixtures?${params.toString()}`;

  try {
    const upstream = await fetch(url, {
      headers: { "x-apisports-key": API_KEY },
    });

    const text = await upstream.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(502).json({
        error: "Upstream devolvió respuesta no-JSON",
        status: upstream.status,
        body: text.slice(0, 300),
      });
    }

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
    return res.status(upstream.status).json(data);
  } catch (err) {
    return res
      .status(502)
      .json({ error: "Error de red al contactar api-sports.io", detail: String(err) });
  }
}
