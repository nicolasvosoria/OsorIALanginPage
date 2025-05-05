"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface SuccessCase {
  title: string
  description: string
  client: string
  result: string
}

const successCases: SuccessCase[] = [
  {
    title: "Implementación de IA predictiva en atención médica",
    description:
      "Desarrollamos un sistema de IA que predice complicaciones médicas con 48 horas de anticipación, permitiendo intervenciones tempranas y salvando vidas.",
    client: "Hospital Universitario Nacional",
    result: "87% de precisión en predicciones y 35% reducción en complicaciones graves",
  },
  {
    title: "Automatización de procesos financieros con IA",
    description:
      "Implementamos un sistema de procesamiento de documentos financieros que redujo drásticamente el tiempo de procesamiento y los errores humanos.",
    client: "Grupo Financiero Internacional",
    result: "93% reducción en tiempo de procesamiento y 99.7% precisión",
  },
  {
    title: "Optimización de cadena de suministro con machine learning",
    description:
      "Creamos un modelo predictivo que optimiza inventarios y rutas de distribución, reduciendo costos y mejorando la eficiencia operativa.",
    client: "Distribuidora Nacional",
    result: "42% reducción en costos logísticos y 28% menos inventario",
  },
  {
    title: "Asistente virtual con procesamiento de lenguaje natural",
    description:
      "Desarrollamos un asistente virtual avanzado que entiende consultas complejas y resuelve el 90% de las dudas de los clientes sin intervención humana.",
    client: "Telecom Líder",
    result: "65% reducción en costos de atención y 78% aumento en satisfacción",
  },
  {
    title: "Sistema de detección de fraudes con IA",
    description:
      "Implementamos un sistema de detección de fraudes en tiempo real que identifica patrones sospechosos y previene transacciones fraudulentas.",
    client: "Banco Nacional",
    result: "96% tasa de detección y $4.5M ahorrados en fraudes prevenidos",
  },
]

export function SuccessCasesCarousel() {
  const [activeCase, setActiveCase] = useState(0)
  const [autoplay, setAutoplay] = useState(true)

  useEffect(() => {
    if (!autoplay) return

    const interval = setInterval(() => {
      setActiveCase((prev) => (prev + 1) % successCases.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [autoplay])

  const nextCase = () => {
    setAutoplay(false)
    setActiveCase((prev) => (prev + 1) % successCases.length)
  }

  const prevCase = () => {
    setAutoplay(false)
    setActiveCase((prev) => (prev - 1 + successCases.length) % successCases.length)
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-12">Casos de Éxito en IA</h2>

      {/* Success Cases Carousel */}
      <div className="relative mb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCase}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="bg-black bg-opacity-50 backdrop-blur-md p-8 rounded-lg border border-gray-700"
          >
            <div className="flex flex-col justify-center">
              <h3 className="text-2xl font-bold mb-4">{successCases[activeCase].title}</h3>
              <p className="text-gray-300 mb-6">{successCases[activeCase].description}</p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center">
                  <span className="text-gray-400 mr-2">Cliente:</span>
                  <span className="font-semibold">{successCases[activeCase].client}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400 mr-2">Resultado:</span>
                  <span className="font-semibold text-green-400">{successCases[activeCase].result}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <button
          onClick={prevCase}
          className="absolute top-1/2 -left-4 transform -translate-y-1/2 bg-white text-black rounded-full p-2 shadow-lg hover:bg-gray-200 transition-colors"
          aria-label="Caso anterior"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextCase}
          className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-white text-black rounded-full p-2 shadow-lg hover:bg-gray-200 transition-colors"
          aria-label="Siguiente caso"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Indicators */}
        <div className="flex justify-center mt-6 gap-2">
          {successCases.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setAutoplay(false)
                setActiveCase(index)
              }}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === activeCase ? "bg-white" : "bg-gray-600 hover:bg-gray-400"
              }`}
              aria-label={`Ir al caso ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
