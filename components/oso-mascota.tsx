"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useEffect, useState } from "react"
import { SpeedDial } from "@/components/speed-dial"

// Sprites pixel-art de 34x42. Los genera scripts/generar-sprite-oso.py, que es
// la fuente de verdad; esto es solo su salida embebida para no pedir archivos.
const SPRITE_IDLE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACIAAAAqCAYAAADWFImvAAADJklEQVR42u1YMWgTURj+LhwZHIM6lGIgc8GhGXKDQztIEQrpIgWl2OBiySCOIZirhIzSIehSmiIK4qJQCIdDHRySIQ6FdOjQwokcNEqgS4ci1CG8y3sv77/37tqKgz8E3l3/973vf+/7//dfgf/2j5qlenktc/Ncfnc6HFhJFzHBs1WT3IWpCTDXw3kSMqZ4qahJvaPheOLClDIyKuK4eCkqEjZJNVn+ra43lO9VJHg8UiNssso5n8vAd8oAgP5iXnskMzs9AEC20yTxXC8ItWJRW8lPvvHgeTi+4xSM9fG10w3HP9+9EEiMdDImQh4Nc05KQvZnOAxXtpScUq4XTJBRRRh3R2Q8fje0dWR1vaGN1JQEs1atoqwjlq4GUGSSWKtWIQujFacQ1btn4bhaSJMLRvnJR6KtIwDgO+UwZevdM5wc7uPkcB9z7V1hMZmEyo/H0oo1KsK59i6KB8coHhwDgJKMqZ/K7Cht9BfzYWECgC/35sPxXHuXBKX8+ot5rKKBVq0ycW8pd+R0OLBatYpA4jJsZqdHCtY2AagW0qhzUbKov23cF94tLQOzCr9qIQ0/ST9CZQ47a56AU2qG487WWIyzTz9MZA2VMVoiVBovLReFZ6fUFEgAwMf3n4zSNlbWRJGQdyLKL8q0RNj9w+4gPtLbj14Jvvwz82Nzdd2dkVgZiOtBOKa97TVh8b3ttVjHEUsjUZpRbT+/E3F6XDtp5+07ZWz4o5v4+8uHuPXs7ejGdcrIdpqxvwgsisDW58nKWbo7D3dhCr5TFlqB19d/48kvW2gBsp0mXC8gcWRCVtS1zy/G9xdx+xEKh6+yVpLe4yKNEdWjxK4jV2WCWHmRUf2JLmp5t3SYiSvrX9kRAMhNjzvtox/D2Oev0waFb1NO7Jl3znaaRl97/FeeDh8IzEq86wXgyzojo2uaZBKuF+DN44xeI6fDgbWy2Rf+uLLZn/joMhGgikQUfmRl5SsfqzGmGSBnGl+4VPjKo6EuqiQkVPMofNsUUBYaEzF/bExLsi8T5JXUkdz0+P8b7Od6gYIELregqYR2Eb8LNUaU0JL68fYH5cMFnBTd/fQAAAAASUVORK5CYII="
const SPRITE_WAVE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACIAAAAqCAYAAADWFImvAAADRUlEQVR42u1YMWjbQBR9MiZDR9N2MAaDZ0OHeLCGDvFQQiCQQCiBQqhNlgYPnU2o5WIyZzDtYpIQKIQuCQSCyOAMHewhHgLOkCEBQRHELYYsGULBHcqX70530kkuoUM/GEvy///e3X/37svAf/tHzZA9fJJ6Phaf3Y+GRtxBdPIlZUHWfNqXzLIxjgNGN18iKOj8ZjQJnE9LZ6aacdR8CdVMKEgWLH7KjS3pcxkINp+SIxQscy7kUnDMKgBgsFgILUn++BwAkO22lPks2/W4YqiWkg1+9uaDd/3SLGrz41u3513/+PKRA/GHJxMgytKQc1wQoj/lobyiJcQtZdmuD4xshlFXRMzHrkaojpQbW6Ez1QVBtluvSXXECNMAFZg4tluvKYXRiCJEzd6Dd71ZnFEOGOQnliRURwDAMavelm32HnB3fYm760vMnXS4wUQQMj82VyhZg2Y4d9LB0tUtlq5uAUAKRtdPpsaJIG6IwnW2UPI+QabyGywWQCq8v5731Fh66BGjd+u1cRl/j6is2u6v57nvtfZgnNRJsFmcQVOY3dlCCf3t19yz5VVgVuK3WZyBE6cfUe0cqjULwKy0vOvuzoSMs++/+naNZbveKrC21h7AiNNPLK8ucfdmpcWBAIDDgyPptiV+sCDuR0MjEbXOIghxJYL8yG6+j7hvre1L5w+dQexMX7z9xPmy9+RHsaKIsSCUu0bVX1o2uDJd7G1wg1/sbWipaGSyhnFGtvzsSogg1P2rqy6NrPUT5X/byaCfXsHhwRH66RVsOxmfjLPxO6cd3+8E2FBJ785pxweu8qoEaz4Nx6xyrcDnp7/w7meSawGy3RYs25XmYVsEOpGNoGOfHYwNjtqPqPJIgUTpPaZpjGjwcmOL60+SeCSjzow9y1gyc0Cy3RbC+pOwWYurRVwRd5B4n3iM1Qh6S1QKWi6TUqqfTv1lv+kIW1IFgu5ZMNluS+ttj33L07VQslq2C1YNCQwNprIoIDiO3I+Gxlp74OsTxJcunUGigpCeNSypqK6kMXEGcMxq4PuMsjSqgDggosRpC5pIZCIxWzbikugLuPociWq5zOT/DfpYtisBEZGsYSYj8jR+UzVGMiJP48fabxZ5KX8RopfdAAAAAElFTkSuQmCC"

const SPRITE_W = 34
const SPRITE_H = 42

const BEAR_W = 96
const BEAR_H = Math.round((BEAR_W * SPRITE_H) / SPRITE_W)

// Cada cuánto saluda, y cuánto dura el saludo.
const GREETING_EVERY_MS = 9000
const GREETING_LASTS_MS = 2600

interface OsoMascotaProps {
  onChatOpen: () => void
}

export function OsoMascota({ onChatOpen }: OsoMascotaProps) {
  const [isWaving, setIsWaving] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (prefersReducedMotion) return

    let stopWaving: ReturnType<typeof setTimeout>
    const startWaving = setInterval(() => {
      setIsWaving(true)
      stopWaving = setTimeout(() => setIsWaving(false), GREETING_LASTS_MS)
    }, GREETING_EVERY_MS)

    return () => {
      clearInterval(startWaving)
      clearTimeout(stopWaving)
    }
  }, [prefersReducedMotion])

  const goToContact = () => {
    document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-40 hidden sm:block lg:left-8">
      <div className="pointer-events-auto flex flex-col items-center gap-1">
        {/* El botón de contacto va sobre la cabeza del oso */}
        <SpeedDial onChatOpen={onChatOpen} inline />

        <button
          type="button"
          onClick={goToContact}
          // Saluda también al pasarle el mouse: el saludo es la invitación a
          // hacerle clic, así que responder al puntero lo hace descubrible.
          onMouseEnter={() => setIsWaving(true)}
          onMouseLeave={() => setIsWaving(false)}
          onFocus={() => setIsWaving(true)}
          onBlur={() => setIsWaving(false)}
          className="relative block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3FE0D0] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          aria-label="Hablar con nosotros: ir a la sección de contacto"
        >
          <AnimatePresence>
            {isWaving && (
              <motion.span
                initial={{ opacity: 0, y: 6, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.9 }}
                transition={{ duration: 0.18 }}
                className="absolute -top-2 left-full ml-1 -translate-y-full whitespace-nowrap rounded-md border-2 border-[#3FE0D0] bg-black px-3 py-1.5 text-sm font-bold text-[#3FE0D0]"
                aria-hidden="true"
              >
                ¡Hey! Hola
              </motion.span>
            )}
          </AnimatePresence>

          {/* eslint-disable-next-line @next/next/no-img-element -- data URI: no hay red ni optimización que aplicar */}
          <img
            src={isWaving && !prefersReducedMotion ? SPRITE_WAVE : SPRITE_IDLE}
            alt=""
            width={BEAR_W}
            height={BEAR_H}
            aria-hidden="true"
            // Sin esto el navegador suaviza el sprite y deja de verse retro.
            style={{ imageRendering: "pixelated" }}
            className="block drop-shadow-[0_0_14px_rgba(63,224,208,0.28)]"
          />
        </button>
      </div>
    </div>
  )
}
