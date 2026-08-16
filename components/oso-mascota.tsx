"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useEffect, useState } from "react"

// Segundos que tarda en cruzar la pantalla de un lado al otro.
const CROSSING_SECONDS = 22

// El FAB de contacto y el chat viven en bottom-6 right-6; el oso se detiene
// antes de llegar para no caminarles por encima.
const RIGHT_SAFE_ZONE = 120

export function OsoMascota() {
  const [maxX, setMaxX] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    const measure = () => {
      const size = window.innerWidth < 640 ? 56 : 76
      setMaxX(Math.max(0, window.innerWidth - size - RIGHT_SAFE_ZONE))
    }

    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [])

  const goToContact = () => {
    document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" })
  }

  // Ida y vuelta: mira a la derecha en la primera mitad del recorrido y a la
  // izquierda en la segunda, para que nunca camine de espaldas.
  const walk = prefersReducedMotion
    ? {}
    : {
        x: [0, maxX, 0],
        transition: {
          duration: CROSSING_SECONDS,
          repeat: Infinity,
          ease: "linear" as const,
        },
      }

  const facing = prefersReducedMotion
    ? {}
    : {
        scaleX: [1, 1, -1, -1],
        transition: {
          duration: CROSSING_SECONDS,
          times: [0, 0.499, 0.5, 1],
          repeat: Infinity,
          ease: "linear" as const,
        },
      }

  return (
    <div className="pointer-events-none fixed bottom-0 left-0 z-30 hidden w-full sm:block">
      <motion.div
        className="w-fit"
        animate={isPaused ? { x: undefined } : walk}
        style={prefersReducedMotion ? { transform: `translateX(16px)` } : undefined}
      >
        <motion.button
          type="button"
          onClick={goToContact}
          onHoverStart={() => setIsPaused(true)}
          onHoverEnd={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
          animate={isPaused ? {} : facing}
          className="pointer-events-auto group relative block cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#11B30B] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          aria-label="Hablar con nosotros: ir a la sección de contacto"
        >
          <Bear paused={isPaused || Boolean(prefersReducedMotion)} />
          <Bubble />
        </motion.button>
      </motion.div>
    </div>
  )
}

/** El bocadillo explica para qué sirve el oso; sin él es solo algo que se mueve. */
function Bubble() {
  return (
    <span
      className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-full bg-white px-3 py-1 text-xs font-semibold text-black opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
      aria-hidden="true"
    >
      ¡Hablemos!
    </span>
  )
}

function Bear({ paused }: { paused: boolean }) {
  // Las patas se mueven en fases opuestas; al pausar quedan quietas.
  const swing = (from: number) =>
    paused
      ? {}
      : {
          rotate: [from, -from, from],
          transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut" as const },
        }

  return (
    <motion.svg
      viewBox="0 0 76 68"
      className="h-14 w-14 drop-shadow-[0_0_12px_rgba(17,179,11,0.35)] sm:h-[76px] sm:w-[76px]"
      role="img"
      aria-hidden="true"
      animate={paused ? {} : { y: [0, -2, 0] }}
      transition={paused ? undefined : { duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* patas traseras */}
      <motion.g
        animate={swing(14)}
        style={{ transformOrigin: "22px 46px", transformBox: "fill-box" }}
      >
        <rect x="17" y="44" width="9" height="18" rx="4.5" fill="#d4d4d4" />
      </motion.g>
      {/* patas delanteras */}
      <motion.g
        animate={swing(-14)}
        style={{ transformOrigin: "42px 46px", transformBox: "fill-box" }}
      >
        <rect x="38" y="44" width="9" height="18" rx="4.5" fill="#d4d4d4" />
      </motion.g>

      {/* cola */}
      <circle cx="9" cy="36" r="5" fill="#e8e8e8" />
      {/* cuerpo */}
      <ellipse cx="30" cy="38" rx="21" ry="15" fill="#ffffff" />

      {/* pata delantera visible, por encima del cuerpo */}
      <motion.g
        animate={swing(16)}
        style={{ transformOrigin: "44px 44px", transformBox: "fill-box" }}
      >
        <rect x="41" y="42" width="9" height="19" rx="4.5" fill="#ffffff" />
      </motion.g>

      {/* bufanda: el único punto de color, el verde de la marca */}
      <path d="M45 32 q7 5 14 1 l1 6 q-8 4 -15 -1 z" fill="#11B30B" />

      {/* oreja */}
      <circle cx="50" cy="13" r="6" fill="#ffffff" />
      <circle cx="50" cy="13" r="2.6" fill="#11B30B" opacity="0.55" />
      {/* cabeza */}
      <circle cx="55" cy="25" r="13" fill="#ffffff" />
      {/* hocico */}
      <ellipse cx="65" cy="29" rx="7.5" ry="5.5" fill="#ececec" />
      <ellipse cx="70" cy="27" rx="2.6" ry="2.1" fill="#1a1a1a" />
      {/* ojo */}
      <circle cx="56" cy="22" r="2.1" fill="#1a1a1a" />
      <circle cx="56.7" cy="21.3" r="0.7" fill="#ffffff" />
    </motion.svg>
  )
}
