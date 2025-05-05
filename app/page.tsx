"use client"

import { motion, useMotionValue, useSpring } from "framer-motion"
import { ArrowRight, Sparkles, Workflow, BarChart3, ShieldCheckIcon, Users2, Puzzle, HeadsetIcon } from "lucide-react"
import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Footer } from "@/components/footer"
import { Preloader } from "@/components/preloader"

// Import components
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import TypeWriter from "@/components/type-writer"
import RainingLetters from "@/components/raining-letters"
import { ContactForm } from "@/components/contact-form"
import { SuccessCasesCarousel } from "@/components/success-cases-carousel"
import SpaceGlobeLite from "@/components/space-globe-lite"

const blink = {
  "0%, 100%": { opacity: 1 },
  "50%": { opacity: 0 },
}

export default function Home() {
  const router = useRouter()
  const targetRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const gridX = useSpring(mouseX, {
    stiffness: 50,
    damping: 20,
    mass: 0.5,
  })
  const gridY = useSpring(mouseY, {
    stiffness: 50,
    damping: 20,
    mass: 0.5,
  })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2
      mouseX.set(((e.clientX - centerX) / centerX) * 20)
      mouseY.set(((e.clientY - centerY) / centerY) * 20)
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [mouseX, mouseY])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  }

  return (
    <div ref={targetRef} className="min-h-screen bg-transparent text-white overflow-hidden select-none">
      <Preloader />

      {/* Background */}
      <motion.div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-black" />
        <motion.div
          className="absolute inset-0"
          style={{
            "@keyframes blink": blink,
            backgroundImage: `
              linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "clamp(20px, 4vw, 40px) clamp(20px, 4vw, 40px)",
            x: gridX,
            y: gridY,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </motion.div>

      <div className="relative z-10">
        {/* NUEVA SECCIÓN: Space Globe */}
        <section
          id="space-globe"
          className="min-h-[100vh] flex flex-col items-center justify-center px-4 py-12 sm:py-16 lg:py-20"
        >
          <div className="w-full max-w-7xl mx-auto relative">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Explora el Universo Digital</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Navega por un mundo de posibilidades con nuestra tecnología de vanguardia
              </p>
            </motion.div>

            {/* Contenedor para el Space Globe */}
            <div className="relative h-[60vh] w-full flex items-center justify-center">
              <div className="w-full h-full max-w-3xl mx-auto">
                <SpaceGlobeLite />
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN 1: Hero Section */}
        <section
          id="hero"
          className="min-h-[100vh] flex flex-col items-center justify-center px-4 py-12 sm:py-16 lg:py-20"
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center max-w-[90%] sm:max-w-3xl mx-auto space-y-6 sm:space-y-8"
          >
            <motion.h1
              variants={itemVariants}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight flex flex-wrap items-center justify-center gap-2"
            >
              <span className="bg-white text-black px-2">OsorIA</span>
              <span className="flex items-center">
                <TypeWriter text=".tech" delay={150} />
                <span className="w-[2px] h-[1em] bg-white animate-[blink_1s_ease-in-out_infinite]" />
              </span>
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto px-4"
            >
              No debes ser experto en IA, nosotros hacemos lo difícil por ti
            </motion.p>
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center px-4">
              <Button
                size="lg"
                className="w-full sm:w-auto mt-4 sm:mt-8 border-2 border-white text-white hover:bg-white hover:text-black transition-all duration-300 ease-in-out text-base px-6 py-4 h-auto bg-transparent"
                onClick={() => {
                  const contactSection = document.getElementById("contacto")
                  if (contactSection) {
                    contactSection.scrollIntoView({ behavior: "smooth" })
                  }
                }}
              >
                Contáctanos
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="w-full sm:w-auto mt-4 sm:mt-8 bg-white text-black border-2 border-white hover:bg-transparent hover:text-white transition-all duration-300 ease-in-out text-base px-6 py-4 h-auto"
                onClick={() => router.push("/ai-demo")}
              >
                Mira lo que puede generar la IA
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </motion.div>
        </section>

        {/* SECCIÓN 2: Stats Section - Movida a segunda posición */}
        <section id="estadisticas" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 mx-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="max-w-7xl mx-auto space-y-12"
          >
            <div className="text-center px-4">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4"
              >
                3.24 Millones de empresas en Colombia
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base"
              >
                El 98 % valora la transformación digital, pero solo el 58 % actúa, y apenas el 5 % usa inteligencia
                artificial. Nosotros llegamos para cerrar esa brecha y desbloquear su verdadero potencial.
              </motion.p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="p-6 text-center"
              >
                <BarChart3 className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mb-4 mx-auto" />
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">99.8%</div>
                <p className="text-gray-400 text-sm sm:text-base">Precisión en análisis de datos</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="p-6 text-center"
              >
                <Puzzle className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mb-4 mx-auto" />
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">+200</div>
                <p className="text-gray-400 text-sm sm:text-base">Modelos personalizados entrenados para empresas</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="p-6 text-center"
              >
                <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mb-4 mx-auto" />
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">+12.000</div>
                <p className="text-gray-400 text-sm sm:text-base">Procesos automatizados</p>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* SECCIÓN 5: Raining Letters Animation */}
        <section id="animacion">
          <RainingLetters />
        </section>

        {/* SECCIÓN 3: Services Section */}
        <section id="servicios" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-7xl mx-auto"
          >
            <div className="text-center mb-12">
              <motion.h2 variants={itemVariants} className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 px-4">
                Nuestros servicios
              </motion.h2>
              <motion.p variants={itemVariants} className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base px-4">
                Todo lo necesario para hacer crecer tu negocio y satisfacer a tus clientes
              </motion.p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {features.map((feature, index) => (
                <motion.div key={feature.title} variants={itemVariants} custom={index}>
                  <Card
                    role="button"
                    tabIndex={0}
                    className="p-4 sm:p-6 bg-transparent backdrop-blur-2xl border-gray-500 text-white blur-[0.4px] transition-transform duration-300 hover:scale-105 cursor-pointer h-full"
                  >
                    <feature.icon className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mb-4" />
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-400 text-sm sm:text-base">{feature.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* SECCIÓN 4: Success Cases Section */}
        <section id="casos-exito" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <SuccessCasesCarousel />
          </motion.div>
        </section>

        {/* SECCIÓN 6: CTA Section with Contact Form */}
        <section id="contacto" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-7xl mx-auto"
          >
            <div className="text-center mb-12">
              <motion.h2
                variants={itemVariants}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white font-serif"
              >
                ¿Tienes una idea?
              </motion.h2>
              <motion.p variants={itemVariants} className="text-3xl sm:text-4xl text-white font-bold mb-12 font-serif">
                Empieza a construirla con nosotros.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="max-w-md mx-auto"
              >
                <ContactForm />
              </motion.div>
            </div>
          </motion.div>
        </section>

        <Footer />
      </div>
    </div>
  )
}

const features = [
  {
    title: "Desarrollo de soluciones con IA",
    description:
      "Creamos herramientas a la medida de tu negocio, integrando inteligencia artificial para mejorar, procesos, decisiones y resultados.",
    icon: Workflow,
  },
  {
    title: "Automatiza procesos operativos",
    description:
      "Deja que las automatizaciones inteligentes hagan el trabajo por ti, para que ganes tiempo y te enfoques en lo que realmente importa.",
    icon: BarChart3,
  },
  {
    title: "Análisis predictivo de datos",
    description:
      "Transforma tus datos en decisiones inteligentes: anticipamos comportamientos, tendencias y riesgos para que siempre estés un paso adelante.",
    icon: ShieldCheckIcon,
  },
  {
    title: "Creamos páginas web personalizadas",
    description:
      "Sitios modernos, desarrollos rápidos y alineados con tu marca, diseñados para cautivar e impresionar.",
    icon: Users2,
  },
  {
    title: "Identificación de oportunidades",
    description: "Tecnológicas y estratégicas para impulsar la evolución de tu empresa.",
    icon: Puzzle,
  },
  {
    title: "Integramos tus soluciones digitales",
    description: "Para que trabajen como un conjunto integrado, sin interrupciones ni pérdida de datos.",
    icon: HeadsetIcon,
  },
]
