"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useEffect, useState } from "react"

const ACCENT = "#11B30B"

// Segundos que tarda una vuelta completa por cada proyecto de la lista.
const SECONDS_PER_PROJECT = 4

export function ProjectsCarousel() {
  const [projects, setProjects] = useState<string[]>([])
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    let cancelled = false

    fetch("/api/projects")
      .then((res) => (res.ok ? res.json() : null))
      .then((payload: { projects?: string[] } | null) => {
        if (!cancelled && payload?.projects) setProjects(payload.projects)
      })
      .catch((error) => console.error("No se pudieron cargar los proyectos:", error))

    return () => {
      cancelled = true
    }
  }, [])

  if (projects.length === 0) return null

  // La lista va duplicada: cuando la primera copia termina de salir, la segunda
  // está exactamente donde arrancó la primera, así el bucle no tiene costura.
  const loop = [...projects, ...projects]
  const duration = projects.length * SECONDS_PER_PROJECT

  return (
    <section id="proyectos" className="py-12 sm:py-16">
      <div className="text-center mb-10 px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4"
          style={{ color: ACCENT }}
        >
          Proyectos que hemos construido
        </motion.h2>
      </div>

      {/* Las máscaras laterales evitan que los nombres aparezcan y desaparezcan
          de golpe contra el borde de la pantalla. */}
      <div
        className="relative overflow-hidden"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
        }}
      >
        {prefersReducedMotion ? (
          // Sin movimiento: la misma información, pero quieta y envolviendo línea.
          <ul className="flex flex-wrap justify-center gap-4 px-4">
            {projects.map((name) => (
              <ProjectPill key={name} name={name} />
            ))}
          </ul>
        ) : (
          <motion.ul
            className="flex w-max gap-4"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration, ease: "linear", repeat: Infinity }}
          >
            {loop.map((name, index) => (
              <ProjectPill key={`${name}-${index}`} name={name} aria-hidden={index >= projects.length} />
            ))}
          </motion.ul>
        )}
      </div>
    </section>
  )
}

function ProjectPill({ name, ...rest }: { name: string } & React.LiHTMLAttributes<HTMLLIElement>) {
  return (
    <li
      className="shrink-0 rounded-full border border-gray-500 px-6 py-3 text-lg sm:text-xl font-semibold text-white whitespace-nowrap"
      {...rest}
    >
      {name}
    </li>
  )
}
