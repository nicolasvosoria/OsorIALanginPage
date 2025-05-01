"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  ArrowRight,
  Sparkles,
  Zap,
  Check,
  Workflow,
  BarChart3,
  ShieldCheckIcon,
  Users2,
  Puzzle,
  HeadsetIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Globe from "@/components/Globe"
import { Footer } from "@/components/Footer"
import { Navbar } from "@/components/Navbar"
import { useCountUp } from "@/hooks/useCountUp"

export default function Home() {
  const router = useRouter()
  const [isLoaded, setIsLoaded] = useState(false)

  const projectsCount = useCountUp(1234)
  const deploymentCount = useCountUp(5678)
  const securityCount = useCountUp(99)

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

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
    <div className="relative min-h-screen bg-black">
      <Navbar />

      {/* Globe Section */}
      <section className="h-screen w-full relative overflow-hidden">
        <Globe />

        {/* Hero Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoaded ? 1 : 0 }}
            transition={{ duration: 0.8 }}
            className="w-full"
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
                <span>.tech</span>
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
                  onClick={() => router.push("/login")}
                >
                  Comenzar ahora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  className="w-full sm:w-auto mt-4 sm:mt-8 bg-white text-black border-2 border-white hover:bg-transparent hover:text-white transition-all duration-300 ease-in-out text-base px-6 py-4 h-auto"
                  onClick={() => router.push("/register")}
                >
                  Regístrate
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Rest of the content */}
      <div className="bg-black">
        {/* Stats Section */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
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
                Nuestro Impacto en Cifras
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base"
              >
                Mira cómo transformamos negocios en todo el mundo
              </motion.p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="p-6 text-center backdrop-blur-sm bg-black/20 rounded-lg"
              >
                <Users2 className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mb-4 mx-auto" />
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">{projectsCount.toLocaleString()}</div>
                <p className="text-gray-400 text-sm sm:text-base">Usuarios Activos</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="p-6 text-center backdrop-blur-sm bg-black/20 rounded-lg"
              >
                <Workflow className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mb-4 mx-auto" />
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                  {deploymentCount.toLocaleString()}
                </div>
                <p className="text-gray-400 text-sm sm:text-base">Negocios Creados</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="p-6 text-center backdrop-blur-sm bg-black/20 rounded-lg"
              >
                <ShieldCheckIcon className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mb-4 mx-auto" />
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">{securityCount}%</div>
                <p className="text-gray-400 text-sm sm:text-base">Seguridad Garantizada</p>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <motion.section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-7xl mx-auto"
          >
            <div className="text-center mb-12">
              <motion.h2 variants={itemVariants} className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 px-4">
                Potentes funciones para tu negocio
              </motion.h2>
              <motion.p variants={itemVariants} className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base px-4">
                Todo lo necesario para hacer crecer tu negocio y satisfacer a tus clientes
              </motion.p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {features.map((feature, index) => (
                <motion.div key={feature.title} variants={itemVariants} custom={index}>
                  <Card className="p-4 sm:p-6 bg-transparent backdrop-blur-2xl border-gray-500 text-white blur-[0.4px] transition-transform duration-300 hover:scale-105 cursor-pointer h-full">
                    <feature.icon className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mb-4" />
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-400 text-sm sm:text-base">{feature.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.section>

        {/* Pricing Section */}
        <motion.section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-7xl mx-auto"
          >
            <div className="text-center mb-12">
              <motion.h2 variants={itemVariants} className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
                Precios simples y transparentes
              </motion.h2>
              <motion.p variants={itemVariants} className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
                Elige el plan ideal para tus necesidades. Siempre sabrás lo que pagarás.
              </motion.p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {/* Free Plan */}
              <motion.div variants={itemVariants}>
                <Card className="relative p-4 sm:p-6 bg-transparent backdrop-blur-2xl border-gray-500 text-white h-full">
                  <CardHeader>
                    <CardTitle className="text-xl sm:text-2xl font-bold">Gratuito</CardTitle>
                    <p className="text-gray-400 text-sm sm:text-base">Ideal para empezar</p>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <span className="text-2xl sm:text-4xl font-bold">$0</span>
                      <span className="text-gray-400 ml-2 text-sm sm:text-base">/ mes</span>
                    </div>
                    <ul className="space-y-3 text-sm sm:text-base text-gray-300">
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-white flex-shrink-0" />
                        Creador básico de embudos
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-white flex-shrink-0" />
                        Creador de embudos de prueba
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-white flex-shrink-0" />
                        Chat en vivo 24/7
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={() => router.push("/register")}
                      className="w-full border-2 border-white text-sm sm:text-lg py-4 sm:py-6 px-4 sm:px-8 text-black bg-white hover:bg-transparent hover:text-white transition-all duration-300"
                    >
                      Comenzar
                      <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>

              {/* Pro Plan */}
              <motion.div variants={itemVariants}>
                <Card className="relative p-4 sm:p-6 bg-transparent backdrop-blur-2xl border-gray-500 text-white h-full">
                  <CardHeader>
                    <CardTitle className="text-xl sm:text-2xl font-bold">Pro</CardTitle>
                    <p className="text-gray-400 text-sm sm:text-base">Para equipos en crecimiento</p>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <span className="text-2xl sm:text-4xl font-bold">$4.99</span>
                      <span className="text-gray-400 ml-2 text-sm sm:text-base">/ mes</span>
                    </div>
                    <ul className="space-y-3 text-sm sm:text-base text-gray-300">
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-white flex-shrink-0" />
                        Todas las funciones gratuitas
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-white flex-shrink-0" />
                        Creador de embudos escalable
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-white flex-shrink-0" />
                        Análisis de anuncios de Facebook
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-white flex-shrink-0" />
                        Soporte prioritario
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={() => router.push("/login?redirect=/payment?plan=pro")}
                      className="w-full border-2 border-white text-sm sm:text-lg py-4 sm:py-6 px-4 sm:px-8 text-black bg-white hover:bg-transparent hover:text-white transition-all duration-300"
                    >
                      Actualizar a Pro
                      <Zap className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>

              {/* Premium Plan */}
              <motion.div variants={itemVariants}>
                <Card className="relative p-4 sm:p-6 bg-transparent backdrop-blur-2xl border-gray-500 text-white h-full">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-white text-black text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">
                      Más popular
                    </span>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl sm:text-2xl font-bold">Premium</CardTitle>
                    <p className="text-gray-400 text-sm sm:text-base">Para usuarios avanzados</p>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <span className="text-2xl sm:text-4xl font-bold">$29.99</span>
                      <span className="text-gray-400 ml-2 text-sm sm:text-base">/ mes</span>
                    </div>
                    <ul className="space-y-3 text-sm sm:text-base text-gray-300">
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-white flex-shrink-0" />
                        Todas las funciones Pro
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-white flex-shrink-0" />
                        Información sobre la competencia
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-white flex-shrink-0" />
                        Consultas y sugerencias avanzadas
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-white flex-shrink-0" />
                        Soporte prioritario 24/7
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-white flex-shrink-0" />
                        Gestor de cuenta personal
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={() => router.push("/login?redirect=/payment?plan=premium")}
                      className="w-full border-2 border-white text-sm sm:text-lg py-4 sm:py-6 px-4 sm:px-8 text-black bg-white hover:bg-transparent hover:text-white transition-all duration-300"
                    >
                      Obtener Premium
                      <Sparkles className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </motion.section>

        <Footer />
      </div>
    </div>
  )
}

const features = [
  {
    title: "Desarrollo de aplicaciones móviles",
    description:
      "Desarrollamos aplicaciones móviles a medida para tu empresa, creadas rápidamente gracias a la inteligencia artificial.",
    icon: Workflow,
  },
  {
    title: "Análisis de datos empresariales",
    description: "Transforma los datos de tu empresa en información estratégica utilizando inteligencia artificial.",
    icon: BarChart3,
  },
  {
    title: "Procesamiento seguro de datos",
    description: "Tus datos de marketing e información de clientes siempre están protegidos y encriptados.",
    icon: ShieldCheckIcon,
  },
  {
    title: "Análisis de la competencia",
    description: "Mantente siempre un paso adelante analizando las estrategias y posicionamiento de tus competidores.",
    icon: Users2,
  },
  {
    title: "Integraciones de marketing",
    description: "Conéctate sin problemas con tus herramientas de marketing y sistemas CRM favoritos.",
    icon: Puzzle,
  },
  {
    title: "Soporte experto",
    description: "Obtén ayuda para tu estrategia de marketing de nuestro equipo de soporte especializado.",
    icon: HeadsetIcon,
  },
]
