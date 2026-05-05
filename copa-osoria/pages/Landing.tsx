import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#eef7f3] text-slate-950">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-emerald-900/10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/copa_osoria_logo.svg" alt="Copa Osoria" className="w-10 h-10" />
            <span className="font-display font-bold">Copa Osoria 2026</span>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 rounded-xl border border-emerald-700 text-emerald-800 font-semibold bg-white hover:bg-emerald-50"
          >
            Iniciar sesión
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <section className="rounded-3xl border border-emerald-900/10 bg-white p-6 text-center shadow-sm">
          <h1 className="text-4xl md:text-5xl font-display font-black">COPA OSORIA 2026</h1>
          <p className="mt-2 text-lg text-slate-700">Predice partidos y acumula puntos</p>
          <p className="mt-5 text-5xl md:text-7xl font-display font-black leading-none">
            ¡LLEGA A <span className="text-emerald-700">50 PUNTOS</span> Y GANA!
          </p>
        </section>

        <section className="grid md:grid-cols-2 gap-4">
          <article className="rounded-2xl border border-emerald-900/10 bg-white p-5">
            <h2 className="text-3xl font-display font-black">100 MIL</h2>
            <p className="text-emerald-700 text-2xl font-display font-black">EN EFECTIVO</p>
          </article>
          <article className="rounded-2xl border border-emerald-900/10 bg-white p-5">
            <h2 className="text-3xl font-display font-black">3 LIBRAS</h2>
            <p className="text-emerald-700 text-2xl font-display font-black">DE CAFÉ TIPO EXPORTACIÓN</p>
          </article>
        </section>

        <section className="rounded-2xl border border-emerald-900/10 bg-white p-6">
          <h3 className="text-2xl font-display font-bold">¿Qué es Copa Osoria?</h3>
          <p className="mt-2 text-slate-700">Es una polla mundialista donde registrás tus marcadores, sumás puntos y competís en el ranking.</p>
          <h3 className="text-2xl font-display font-bold mt-5">¿Cómo funciona?</h3>
          <ul className="mt-2 text-slate-700 list-disc pl-5 space-y-1">
            <li>Ingresás tus predicciones de cada partido.</li>
            <li>+0 si no acertás, +2 si acertás ganador, +5 si acertás marcador exacto.</li>
            <li>Si llegás a 50 puntos, participás por premios.</li>
          </ul>
        </section>

        <section className="text-center pb-8">
          <button
            onClick={() => navigate("/registro")}
            className="px-8 py-4 rounded-2xl bg-emerald-700 text-white text-3xl font-display font-black hover:bg-emerald-800"
          >
            ¡PARTICIPA YA!
          </button>
        </section>
      </main>
    </div>
  );
}

