"use client"

import { motion } from "framer-motion"
import { ArrowRight, Sparkles, Cpu, Zap } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import TypeWriter from "@/components/type-writer"

type LandingHeroProps = {
  onContactClick: () => void
  onDemoClick: () => void
}

const heroVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
    },
  },
}

const proofItems = [
  { label: "Automatizaciones activas", value: "+12.000", icon: Zap },
  { label: "Precisión en análisis", value: "99.8%", icon: Cpu },
  { label: "Modelos entrenados", value: "+200", icon: Sparkles },
]

export function LandingHero({ onContactClick, onDemoClick }: LandingHeroProps) {
  return (
    <section id="hero" className="relative px-4 pb-8 pt-10 sm:px-6 sm:pt-14 lg:px-8 lg:pt-16">
      <div className="hero-spotlight pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />

      <motion.div
        variants={heroVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto grid min-h-[75vh] w-full max-w-7xl items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]"
      >
        <div className="text-center lg:text-left">
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            Soluciones de IA para empresas que quieren escalar
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
          >
            <span className="inline-flex items-center gap-2">
              <span className="hero-osoria-chip">OsorIA</span>
              <span className="inline-flex items-center">
                <TypeWriter text=".tech" delay={120} />
                <span className="hero-cursor" aria-hidden="true" />
              </span>
            </span>
            <span className="mt-3 block text-balance text-white/90">IA aplicada con foco real en resultados</span>
          </motion.h1>

            <motion.p variants={itemVariants} className="mx-auto mt-6 max-w-2xl text-base text-zinc-300 sm:text-lg lg:mx-0 lg:text-xl">
              No tienes que ser experto en IA. Diseñamos, implementamos y escalamos soluciones que transforman tus procesos sin fricción.
            </motion.p>

          <motion.div variants={itemVariants} className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Button
              size="lg"
              className="h-auto w-full border-2 border-white bg-transparent px-6 py-4 text-base text-white transition-all duration-300 hover:bg-white hover:text-black sm:w-auto"
              onClick={onContactClick}
            >
              Contáctanos
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="h-auto w-full border-2 border-white bg-white px-6 py-4 text-base text-black transition-all duration-300 hover:bg-transparent hover:text-white sm:w-auto"
              onClick={onDemoClick}
            >
              Mira lo que puede generar la IA
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8 grid grid-cols-1 gap-3 text-left sm:grid-cols-3">
            {proofItems.map(({ label, value, icon: Icon }) => (
              <div key={label} className="hero-proof-card">
                <div className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-white/5">
                  <Icon className="h-4 w-4 text-emerald-400" />
                </div>
                <p className="text-lg font-semibold text-white">{value}</p>
                <p className="text-xs text-zinc-300">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="relative hidden min-h-[460px] items-center justify-center lg:flex">
          <div className="hero-ring" aria-hidden="true" />
          <div className="hero-ring hero-ring-delayed" aria-hidden="true" />
          <div className="hero-panel">
            <Image
              src="/images/robot-hand.webp"
              alt="Mano robótica futurista"
              width={640}
              height={760}
              className="h-auto w-full object-contain opacity-90"
              priority
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
