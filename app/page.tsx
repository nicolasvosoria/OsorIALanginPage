"use client"

import { motion, useMotionValue, useSpring } from "framer-motion"
import { ArrowRight, Sparkles, Workflow, BarChart3, ShieldCheckIcon, Users2, Puzzle, HeadsetIcon, Trophy } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Footer } from "@/components/footer"
import { Preloader } from "@/components/preloader"
import Image from "next/image"

// Import components
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import TypeWriter from "@/components/type-writer"
import RainingLetters from "@/components/raining-letters"
import { ContactForm } from "@/components/contact-form"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { ChatBot } from "@/components/chat-bot"
import { SpeedDial } from "@/components/speed-dial"

const blink = {
  "0%, 100%": { opacity: 1 },
  "50%": { opacity: 0 },
}

export default function Home() {
  const router = useRouter()
  const targetRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const [isChatOpen, setIsChatOpen] = useState(false)

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
      <SpeedInsights />

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
        {/* SECCIÓN 1: Hero Section */}
        <section
          id="hero"
          className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-2 sm:py-4 lg:py-6 relative"
        >
          {/* Robot Hand Image - Top Left Corner */}
          <div className="absolute top-0 left-0 z-20">
            <Image
              src="/images/robot-hand.webp"
              alt="Robot Hand"
              width={500}
              height={700}
              className="hidden lg:block lg:w-[32rem] lg:h-[40rem] xl:w-[36rem] xl:h-[44rem] object-contain opacity-80"
              priority
            />
          </div>

          <Button
            asChild
            size="sm"
            className="absolute right-4 top-4 z-40 border-2 border-white bg-transparent px-4 py-2 text-sm font-medium text-white transition-all duration-300 ease-in-out hover:bg-white hover:text-black sm:right-6 lg:right-8"
          >
            <a href="/copa-osoria" aria-label="Ingresar a Copa Osoria">
              Copa Osoria
              <Trophy className="ml-2 h-4 w-4" />
            </a>
          </Button>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center max-w-[90%] sm:max-w-3xl mx-auto space-y-6 sm:space-y-8 relative z-30"
          >
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight flex flex-wrap items-center justify-center gap-2"
            >
              <span className="bg-white text-black px-2">OsorIA</span>
              <span className="flex items-center">
                <TypeWriter text=".tech" delay={150} />
                <span className="w-[2px] h-[1em] bg-white animate-[blink_1s_ease-in-out_infinite]" />
              </span>
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl lg:text-2xl text-gray-400 max-w-2xl mx-auto px-4"
            >
              No debes ser experto en IA, nosotros hacemos lo difícil por ti
            </motion.p>
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center px-4">
              <Button
                size="lg"
                className="w-full sm:w-auto mt-4 sm:mt-8 border-2 border-white text-white hover:bg-white hover:text-black transition-all duration-300 ease-in-out text-lg px-6 py-4 h-auto bg-transparent"
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
                className="w-full sm:w-auto mt-4 sm:mt-8 bg-white text-black border-2 border-white hover:bg-transparent hover:text-white transition-all duration-300 ease-in-out text-lg px-6 py-4 h-auto"
                onClick={() => router.push("/ai-demo")}
              >
                Mira lo que puede generar la IA
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </motion.div>
        </section>

        {/* Rest of the sections remain unchanged */}
        {/* SECCIÓN 2: Stats Section - Movida a segunda posición */}
        <section id="estadisticas" className="py-2 sm:py-4 px-4 sm:px-6 lg:px-8 mx-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="max-w-7xl mx-auto space-y-6"
          >
            <div className="text-center px-4">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
              >
                3.24 Millones de empresas en Colombia
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg"
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
                <BarChart3 className="w-8 h-8 sm:w-12 sm:h-12 mb-4 mx-auto" style={{ color: "#11B30B" }} />
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">99.8%</div>
                <p className="text-gray-400 text-base sm:text-lg">Precisión en análisis de datos</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="p-6 text-center"
              >
                <Puzzle className="w-8 h-8 sm:w-12 sm:h-12 mb-4 mx-auto" style={{ color: "#11B30B" }} />
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">+200</div>
                <p className="text-gray-400 text-base sm:text-lg">Modelos personalizados entrenados para empresas</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="p-6 text-center"
              >
                <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 mb-4 mx-auto" style={{ color: "#11B30B" }} />
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">+12.000</div>
                <p className="text-gray-400 text-base sm:text-lg">Procesos automatizados</p>
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
              <motion.h2
                variants={itemVariants}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 px-4"
                style={{ color: "#11B30B" }}
              >
                Nuestros servicios
              </motion.h2>
              <motion.p variants={itemVariants} className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg px-4">
                Todo lo necesario para hacer crecer tu negocio y satisfacer a tus clientes
              </motion.p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {features.map((feature, index) => (
                <motion.div key={feature.title} variants={itemVariants} custom={index}>
                  <Card
                    role="button"
                    tabIndex={0}
                    className="p-4 sm:p-6 bg-transparent backdrop-blur-2xl border-gray-500 text-white blur-[0.4px] transition-all duration-300 hover:scale-105 hover:bg-white hover:text-black cursor-pointer h-full group"
                  >
                    {feature.title === "Desarrollo de soluciones con IA" ? (
                      <Image
                        src="/icons/ai-solution-icon.svg"
                        alt="AI Solution Icon"
                        width={48}
                        height={48}
                        className="w-8 h-8 sm:w-12 sm:h-12 mb-4 transition-all duration-300"
                      />
                    ) : feature.title === "Automatiza procesos operativos" ? (
                      <Image
                        src="/icons/automation-icon.svg"
                        alt="Automation Icon"
                        width={48}
                        height={48}
                        className="w-8 h-8 sm:w-12 sm:h-12 mb-4 transition-all duration-300"
                      />
                    ) : feature.title === "Análisis predictivo de datos" ? (
                      <Image
                        src="/icons/analytics-icon.svg"
                        alt="Analytics Icon"
                        width={48}
                        height={48}
                        className="w-8 h-8 sm:w-12 sm:h-12 mb-4 transition-all duration-300"
                      />
                    ) : feature.title === "Creamos páginas web personalizadas" ? (
                      <Image
                        src="/icons/web-development-icon.svg"
                        alt="Web Development Icon"
                        width={48}
                        height={48}
                        className="w-8 h-8 sm:w-12 sm:h-12 mb-4 transition-all duration-300"
                      />
                    ) : feature.title === "Identificación de oportunidades" ? (
                      <Image
                        src="/icons/opportunities-icon.svg"
                        alt="Opportunities Icon"
                        width={48}
                        height={48}
                        className="w-8 h-8 sm:w-12 sm:h-12 mb-4 transition-all duration-300"
                      />
                    ) : feature.title === "Integramos tus soluciones digitales" ? (
                      <Image
                        src="/icons/integration-icon.svg"
                        alt="Integration Icon"
                        width={48}
                        height={48}
                        className="w-8 h-8 sm:w-12 sm:h-12 mb-4 transition-all duration-300"
                      />
                    ) : (
                      <feature.icon
                        className="w-8 h-8 sm:w-12 sm:h-12 mb-4 group-hover:text-black transition-colors"
                        style={{ color: "#11B30B" }}
                      />
                    )}
                    <h3 className="text-xl sm:text-2xl font-semibold mb-2 group-hover:text-black transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 text-base sm:text-lg group-hover:text-black transition-colors">
                      {feature.description}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* SECCIÓN 6: CTA Section with Contact Form - Ahora en dos columnas */}
        <section id="contacto" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-7xl mx-auto"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
              {/* Columna izquierda: Título, subtítulo e imagen */}
              <motion.div variants={itemVariants} className="flex flex-col items-center text-center pt-0">
                <h2 className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-bold mb-4 text-white font-['Montserrat'] leading-tight">
                  ¿Tienes una idea?
                </h2>
                <p className="text-3xl sm:text-4xl text-white font-bold mb-8 font-['Montserrat']">
                  Empieza a construirla con nosotros.
                </p>
                <div className="relative w-full flex justify-end">
                  <div className="w-1/2 md:w-3/5 lg:w-1/2">
                    <Image
                      src="/images/imagen-cierre-web.webp"
                      alt="Mano robótica apuntando hacia arriba"
                      width={350}
                      height={350}
                      className="w-full h-auto object-contain ml-auto"
                      quality={100}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Columna derecha: Formulario de contacto */}
              <motion.div variants={itemVariants} className="w-full max-w-md mx-auto">
                <ContactForm />
              </motion.div>
            </div>
          </motion.div>
        </section>

        <SpeedDial onChatOpen={() => setIsChatOpen(true)} />
        <ChatBot isOpenExternal={isChatOpen} onOpenChange={setIsChatOpen} showFloatingButton={false} />
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
