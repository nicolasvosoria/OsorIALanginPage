"use client"

import { motion } from "framer-motion"
import { Brain, ShieldCheck, SearchCheck, GitMerge } from "lucide-react"
import { Card } from "@/components/ui/card"

const ACCENT = "#11B30B"

// Cada punto describe una etapa real del proceso, no una promesa genérica.
const PILLARS = [
  {
    icon: Brain,
    title: "Modelos de lenguaje de punta",
    description:
      "Trabajamos con los modelos más capaces disponibles hoy, y los cambiamos cuando aparece uno mejor. La herramienta no es el diferencial: lo que hacemos con ella, sí.",
  },
  {
    icon: GitMerge,
    title: "Las decisiones son tuyas",
    description:
      "Antes de escribir una línea mapeamos la superficie del cambio y te llevamos las decisiones reales con sus alternativas. Nada de arquitectura elegida a tus espaldas.",
  },
  {
    icon: SearchCheck,
    title: "Verificación independiente",
    description:
      "Quien escribe el código nunca es quien lo aprueba. Un revisor aparte, sin el contexto de quien lo construyó, valida cada cambio contra criterios definidos de antemano. Así es como cazamos las alucinaciones antes de que lleguen a producción.",
  },
  {
    icon: ShieldCheck,
    title: "Seguridad antes del despliegue",
    description:
      "Todo cambio que toque autenticación, pagos o datos pasa por una revisión de seguridad dedicada, y los hallazgos se corrigen y se vuelven a revisar hasta quedar limpios.",
  },
]

export function WhyUs() {
  return (
    <section id="por-que-nosotros" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="max-w-7xl mx-auto"
      >
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 px-4"
            style={{ color: ACCENT }}
          >
            ¿Por qué trabajar con nosotros?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-gray-400 max-w-3xl mx-auto text-base sm:text-lg px-4"
          >
            Construimos con inteligencia artificial, pero no le entregamos el timón. Todo lo que
            entregamos pasa por un proceso con puertas de calidad explícitas.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          {PILLARS.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 bg-transparent backdrop-blur-2xl border-gray-500 text-white h-full">
                <pillar.icon
                  className="w-8 h-8 sm:w-10 sm:h-10 mb-4"
                  style={{ color: ACCENT }}
                  aria-hidden="true"
                />
                <h3 className="text-xl sm:text-2xl font-semibold mb-2">{pillar.title}</h3>
                <p className="text-gray-400 text-base sm:text-lg">{pillar.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-10 text-center text-gray-400 text-base sm:text-lg max-w-3xl mx-auto px-4"
        >
          Ese proceso lo construimos nosotros y lo usamos en cada proyecto. Se llama{" "}
          <span className="font-semibold text-white">oso-code</span>: cierra cada cambio contra un
          estándar de cero advertencias, revisa la deuda técnica que deja atrás y no deja pasar nada
          sin una segunda mirada.
        </motion.p>
      </motion.div>
    </section>
  )
}
