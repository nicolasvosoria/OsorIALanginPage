"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-black/80 backdrop-blur-md py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-xl font-semibold flex items-center gap-1">
              <span className="bg-white text-black px-2">OsorIA</span>
              <span className="text-white">.tech</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">
              Funciones
            </a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">
              Precios
            </a>
            <a href="#about" className="text-gray-300 hover:text-white transition-colors">
              Nosotros
            </a>
            <Button
              variant="ghost"
              className="border-2 border-white text-white hover:bg-white hover:text-black transition-all duration-300"
              onClick={() => router.push("/login")}
            >
              Iniciar sesión
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white"
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-black/90 backdrop-blur-md"
        >
          <div className="px-4 py-4 space-y-4">
            <a
              href="#features"
              className="block text-gray-300 hover:text-white transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Funciones
            </a>
            <a
              href="#pricing"
              className="block text-gray-300 hover:text-white transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Precios
            </a>
            <a
              href="#about"
              className="block text-gray-300 hover:text-white transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Nosotros
            </a>
            <Button
              variant="ghost"
              className="w-full border-2 border-white text-white hover:bg-white hover:text-black transition-all duration-300"
              onClick={() => {
                setIsMobileMenuOpen(false)
                router.push("/login")
              }}
            >
              Iniciar sesión
            </Button>
          </div>
        </motion.div>
      )}
    </motion.header>
  )
}
