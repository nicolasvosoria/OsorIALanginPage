"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useEffect, useState } from "react"
import { Preloader } from "@/components/preloader"

export default function AIDemo() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular tiempo de carga para la animación
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <Preloader />

      {/* Botón para regresar */}
      <div className="fixed top-6 left-6 z-50">
        <Button onClick={() => router.push("/")} className="bg-white text-black hover:bg-gray-200 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Regresar
        </Button>
      </div>

      {/* Contenedor principal de la animación */}
      <div className="relative w-full h-screen flex items-center justify-center">
        {loading ? (
          <div className="text-2xl">Preparando demostración de IA...</div>
        ) : (
          <div className="w-full max-w-6xl mx-auto px-4">
            {/* Título con efecto de escritura */}
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="text-4xl md:text-6xl font-bold text-center mb-12"
            >
              El poder de la IA en acción
            </motion.h1>

            {/* Animación principal */}
            <div className="relative h-[60vh] bg-gradient-to-r from-blue-900 to-purple-900 rounded-xl overflow-hidden">
              {/* Partículas animadas */}
              <ParticlesAnimation />

              {/* Texto flotante con estadísticas */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="text-5xl md:text-7xl font-bold mb-8 text-white"
                >
                  +400%
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.3, duration: 0.8 }}
                  className="text-xl md:text-3xl max-w-2xl"
                >
                  Aumento en productividad con soluciones de IA personalizadas
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 2.2, duration: 0.8 }}
                  className="mt-12 text-lg md:text-xl bg-white/10 backdrop-blur-md p-4 rounded-lg"
                >
                  Nuestros clientes experimentan resultados transformadores en tiempo récord
                </motion.div>
              </div>
            </div>

            {/* Llamada a la acción */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3, duration: 1 }}
              className="mt-12 text-center"
            >
              <Button
                onClick={() => router.push("/")}
                className="bg-white text-black hover:bg-gray-200 transition-colors text-lg py-6 px-8"
                size="lg"
              >
                Descubre cómo transformar tu negocio
              </Button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

// Componente de animación de partículas
function ParticlesAnimation() {
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number; size: number; color: string; speed: number }>
  >([])

  useEffect(() => {
    // Crear partículas
    const particlesArray = []
    const colors = ["#4F46E5", "#7C3AED", "#EC4899", "#8B5CF6", "#3B82F6"]

    for (let i = 0; i < 100; i++) {
      particlesArray.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 10 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: Math.random() * 0.5 + 0.1,
      })
    }

    setParticles(particlesArray)

    // Animar partículas
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((particle) => ({
          ...particle,
          y: particle.y - particle.speed,
          x: particle.x + (Math.random() - 0.5) * 0.2,
          ...(particle.y < -10 && {
            y: 110,
            x: Math.random() * 100,
          }),
        })),
      )
    }, 50)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="absolute inset-0">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            opacity: 0.6,
          }}
          animate={{
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}
