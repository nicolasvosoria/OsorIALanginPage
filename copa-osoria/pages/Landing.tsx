import { useNavigate } from "react-router-dom";
import { Trophy, Coins, Coffee, Target, CheckCircle2 } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="relative h-screen overflow-hidden bg-[#07110b] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.07)_1px,transparent_1px)] bg-[size:28px_28px] opacity-70" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(45,226,194,.22),transparent_35%),radial-gradient(circle_at_50%_100%,rgba(34,197,94,.14),transparent_40%)]" />

      <header className="relative z-20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/copa_osoria_logo.svg" alt="Copa Osoria" className="w-12 h-12 object-contain" />
            <div>
              <p className="text-xs uppercase tracking-[0.34em] text-[#80ffe7]">OSORIA.TECH</p>
              <p className="font-display font-bold">Copa Osoria 2026</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="h-11 px-5 rounded-xl border border-white/35 bg-white/10 backdrop-blur text-white font-semibold hover:bg-white/20 transition-all"
          >
            Iniciar sesión
          </button>
        </div>
      </header>

      <main className="relative z-10 h-[calc(100vh-76px)] max-w-5xl mx-auto px-4 pb-4 flex flex-col justify-between">
        <section className="rounded-3xl border border-[#2de2c2]/25 bg-white/[.08] backdrop-blur p-4 md:p-6 shadow-[0_0_40px_rgba(45,226,194,.12)]">
          <div className="flex flex-col items-center gap-6">
            <div className="text-center">
              <h1 className="text-3xl md:text-5xl font-display font-black leading-none">
                COPA OSORIA 2026
              </h1>
              <p className="mt-1 text-sm md:text-base text-gray-200">Predice partidos acumula puntos y gana !</p>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm md:text-lg font-semibold text-[#80ffe7] mb-2">
              ¿Eres fanático del fútbol? Esta copa realizada por osorIA es para ti ⚽
            </p>
            <p className="text-3xl md:text-6xl font-display font-black leading-none">
              ¡LLEGA A <span className="text-[#2de2c2]">50 PUNTOS</span> Y GANA!
            </p>
          </div>
        </section>

        <section className="mt-3">
          <article className="rounded-2xl border border-white/20 bg-white/[.08] p-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/15 bg-black/20 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Coins className="text-[#80ffe7]" />
                  <p className="text-[11px] uppercase tracking-wide text-[#80ffe7] font-semibold">Premio principal</p>
                </div>
                <p className="text-2xl md:text-3xl font-display font-black">100 MIL</p>
                <p className="text-base md:text-lg font-display font-bold text-[#2de2c2]">PESOS EN EFECTIVO</p>
              </div>

              <div className="rounded-xl border border-white/15 bg-black/20 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Coffee className="text-[#80ffe7]" />
                  <p className="text-[11px] uppercase tracking-wide text-[#80ffe7] font-semibold">Premio adicional</p>
                </div>
                <p className="text-2xl md:text-3xl font-display font-black">3 LIBRAS</p>
                <p className="text-base md:text-lg font-display font-bold text-[#2de2c2]">DE CAFÉ EXPORTACIÓN</p>
              </div>
            </div>
            <p className="text-center text-[11px] text-gray-300 mt-2">Ganas uno u otro premio.</p>
          </article>
        </section>

        <section className="mt-3 rounded-2xl border border-white/20 bg-white/[.08] p-4">
          <h2 className="text-lg font-display font-bold flex items-center gap-2">
            <Trophy className="text-[#80ffe7]" size={22} />
            ¿Qué es Copa OsorIA?
          </h2>
          <p className="mt-1 text-sm text-gray-200">
            Es una polla deportiva donde registrás tus marcadores, sumás puntos y compite con otros participantes en el ranking.
          </p>

          <div className="mt-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base font-display font-bold flex items-center gap-2">
                <Target className="text-[#80ffe7]" size={20} />
                ¿Cómo funciona?
              </h3>
              <ul className="mt-1 space-y-1 text-sm text-gray-200">
                <li className="flex items-start gap-2"><CheckCircle2 size={14} className="mt-1 text-[#2de2c2]" />Ingresá tus predicciones.</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={14} className="mt-1 text-[#2de2c2]" />+0 / +2 / +5 según acierto.</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={14} className="mt-1 text-[#2de2c2]" />Llegá a 50 puntos.</li>
              </ul>
            </div>
            <button
              onClick={() => navigate("/registro")}
              className="shrink-0 mt-6 md:mt-10 md:-ml-24 px-5 md:px-7 py-3 md:py-3.5 rounded-xl bg-[#2de2c2] text-black text-lg md:text-2xl font-display font-black shadow-[0_0_25px_rgba(45,226,194,.3)] hover:scale-[1.01] transition-all"
            >
              ¡PARTICIPA YA!
            </button>
          </div>
        </section>

        <section className="mt-3 text-center">
          <p className="text-xs text-gray-300 mb-2">Premio: 100 mil pesos <strong>o</strong> 3 libras de café tipo exportación.</p>
        </section>
      </main>
    </div>
  );
}
