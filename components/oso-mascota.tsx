"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useEffect, useState } from "react"
import { SpeedDial } from "@/components/speed-dial"

// Sprite pixel-art de 32x34. Se genera con scripts/generar-sprite-oso.py:
// ese script es la fuente de verdad, esto es solo su salida embebida.
const SPRITE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAiCAYAAAA+stv/AAAB2ElEQVR42u1Xq04DQRQ9M1mBKIIKEhLECiAYzISgcPwBqgq1aUgVio+oWtU0TVVVPwCLqyJkDYaUihFNSBBFUNmkqFmmw7zutgQEN2my87j3nN65jxngX35ZWGhDWq8t1beczVms4Vg9FjKSZ6Ic3/QLyNmc6cZNUes2PRIB3Ugrkegs0tKYbtwUfd3Us5FgFPAqEiLBY5QPjr5+VOksUrQS6VznIWUTtCoJchCm9dryrn3pVJyMJYmEKwa8HnCBUMF9koQ2TMZyxe0x4Ne9ovzuNsV6BKj/WIG/vn8AAPZ2tr0keEwBooLb5vNMwFbAWGwVXIcAAGxxe0mOOoKL5i0A4PC0Uc69PA4BAPe99lpByGPBY9ZdZ02OAdVUbvoFKB6ygXWbwtuMEoq7lNtDEko90hEoOTlreMfUChiVBaq3Pz0Mv4GqOV8g6uDKXnQ7vjrfx2A0RZ4JbyCGskDFkbJnkmAucF3E8W7lNCue31bGJomEajCUltTawDcNTtlHJvAT8vcIyNmcDUbTjQSgqW/LgsRVhgej6XITBBSw64ES9TLS2zI1C0KVkFPAY1LMXHddRCrXAR1E90bVe0ElAmWb7jeQZwJ626beokivY9tr12wyof2mfAI3+guOJa+HIwAAAABJRU5ErkJggg=="

const SPRITE_W = 32
const SPRITE_H = 34

// Píxeles de "dato" que titilan sobre el pelaje, en porcentaje del sprite.
const DATA_PIXELS = [
  { x: 15.62, y: 23.53 },
  { x: 78.12, y: 17.65 },
  { x: 9.38, y: 44.12 },
  { x: 84.38, y: 50.0 },
  { x: 15.62, y: 70.59 },
  { x: 81.25, y: 73.53 },
  { x: 28.12, y: 85.29 },
  { x: 68.75, y: 85.29 },
]

// Segundos que tarda en cruzar la pantalla de un lado al otro.
const CROSSING_SECONDS = 26

// Ancho del oso en escritorio.
const BEAR_W = 84
const BEAR_H = Math.round((BEAR_W * SPRITE_H) / SPRITE_W)

interface OsoMascotaProps {
  onChatOpen: () => void
}

export function OsoMascota({ onChatOpen }: OsoMascotaProps) {
  const [maxX, setMaxX] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    const measure = () => setMaxX(Math.max(0, window.innerWidth - BEAR_W - 48))
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [])

  const goToContact = () => {
    document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" })
  }

  const still = prefersReducedMotion || isPaused

  return (
    <div className="pointer-events-none fixed bottom-0 left-0 z-40 hidden w-full sm:block">
      <motion.div
        className="w-fit"
        animate={
          prefersReducedMotion || isPaused
            ? {}
            : {
                x: [0, maxX, 0],
                transition: {
                  duration: CROSSING_SECONDS,
                  repeat: Infinity,
                  ease: "linear",
                },
              }
        }
        style={prefersReducedMotion ? { transform: "translateX(24px)" } : undefined}
        onHoverStart={() => setIsPaused(true)}
        onHoverEnd={() => setIsPaused(false)}
      >
        <div className="pointer-events-auto relative flex w-fit flex-col items-center gap-1 pb-3">
          {/* El botón de contacto viaja sobre la cabeza del oso */}
          <div className="relative z-10">
            <SpeedDial onChatOpen={onChatOpen} inline />
          </div>

          <motion.button
            type="button"
            onClick={goToContact}
            onFocus={() => setIsPaused(true)}
            onBlur={() => setIsPaused(false)}
            className="group relative block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#11B30B] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            aria-label="Hablar con nosotros: ir a la sección de contacto"
            // Camina mirando a la derecha en la ida y a la izquierda en la vuelta.
            animate={
              still
                ? {}
                : {
                    scaleX: [1, 1, -1, -1],
                    y: [0, -3, 0],
                    transition: {
                      scaleX: {
                        duration: CROSSING_SECONDS,
                        times: [0, 0.499, 0.5, 1],
                        repeat: Infinity,
                        ease: "linear",
                      },
                      y: { duration: 0.5, repeat: Infinity, ease: "easeInOut" },
                    },
                  }
            }
          >
            <span className="relative block" style={{ width: BEAR_W, height: BEAR_H }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- data URI: sin red ni optimización que aplicar */}
              <img
                src={SPRITE}
                alt=""
                width={BEAR_W}
                height={BEAR_H}
                aria-hidden="true"
                // Sin esto el navegador suaviza el sprite y deja de verse retro.
                style={{ imageRendering: "pixelated" }}
                className="block h-full w-full drop-shadow-[0_0_10px_rgba(17,179,11,0.3)]"
              />
              {DATA_PIXELS.map((pixel, index) => (
                <motion.span
                  key={`${pixel.x}-${pixel.y}`}
                  className="absolute rounded-[1px] bg-[#6EFF5A]"
                  style={{
                    left: `${pixel.x}%`,
                    top: `${pixel.y}%`,
                    width: `${100 / SPRITE_W}%`,
                    height: `${100 / SPRITE_H}%`,
                  }}
                  animate={
                    prefersReducedMotion
                      ? { opacity: 0.9 }
                      : {
                          opacity: [0.25, 1, 0.25],
                          transition: {
                            duration: 1.6,
                            repeat: Infinity,
                            delay: index * 0.18,
                            ease: "easeInOut",
                          },
                        }
                  }
                />
              ))}
            </span>

            <span
              className="pointer-events-none absolute -left-2 top-1/2 -translate-x-full -translate-y-1/2 whitespace-nowrap rounded-md border-2 border-black bg-white px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-black opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
              aria-hidden="true"
            >
              ¡Hablemos!
            </span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
