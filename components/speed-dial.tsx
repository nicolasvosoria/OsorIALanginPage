"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface SpeedDialProps {
  onChatOpen: () => void
}

export function SpeedDial({ onChatOpen }: SpeedDialProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const handleChatClick = () => {
    onChatOpen()
    setIsOpen(false)
  }

  const items = [
    {
      id: "whatsapp",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          className="w-[60px] h-[60px]"
          style={{ transform: 'scale(2.2)' }}
        >
          <path
            d="M16.04 5a10.9 10.9 0 0 0-9.32 16.6l-.62 3.5a1 1 0 0 0 1.16 1.16l3.5-.62a10.92 10.92 0 0 0 16.6-9.4A11.25 11.25 0 0 0 16.04 5Zm5.92 15.4a2.75 2.75 0 0 1-1.9.87c-.5 0-.5.38-3.23-.66s-4.93-4.3-5.07-4.5a5.8 5.8 0 0 1-1.15-3.1 3.5 3.5 0 0 1 1.12-2.6 1.23 1.23 0 0 1 .88-.34h.63c.2 0 .47-.08.75.57s1 2.44 1.09 2.62a.6.6 0 0 1 0 .56 2.28 2.28 0 0 1-.34.57 6 6 0 0 1-.51.63c-.17.18-.36.38-.17.74s.86 1.42 1.83 2.3 2.31 1.5 2.66 1.65.57.14.78-.08.9-1 1.15-1.35.47-.28.78-.17 2 1 2.3 1.23.56.28.65.44a2.78 2.78 0 0 1-1.02 2.31Z"
            fill="#25D366"
          />
        </svg>
      ),
      label: "WhatsApp",
      action: () => {
        const message = encodeURIComponent(
          "Hola, vengo desde la página web de OsorIA.tech y me gustaría obtener más información sobre cómo puedo acceder a sus servicios."
        )
        window.open(`https://wa.me/3058661668?text=${message}`, "_blank", "noopener,noreferrer")
        setIsOpen(false)
      },
    },
    {
      id: "chatbot",
      icon: (
        <div style={{ transform: 'scale(1.6)' }}>
          <Bot className="w-[75px] h-[75px]" />
        </div>
      ),
      label: "Chat",
      action: handleChatClick,
    },
  ]

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Speed Dial Items */}
      <div className="relative">
        <AnimatePresence>
          {isOpen && (
            <div className="absolute bottom-16 right-0 flex flex-col-reverse gap-3">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0, y: 20 }}
                  transition={{
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                  className="flex items-center gap-2"
                >
                  {/* Button */}
                  <Button
                    onClick={item.action}
                    className="w-[60px] h-[60px] rounded-full bg-white text-black hover:bg-gray-100 shadow-lg border-2 border-gray-200 transition-all duration-300 hover:scale-110"
                    size="lg"
                  >
                    {item.icon}
                  </Button>
                  {/* Label */}
                  <motion.span
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: index * 0.1 + 0.1 }}
                    className="bg-black/80 text-white text-sm px-3 py-1.5 rounded-lg whitespace-nowrap backdrop-blur-md"
                  >
                    {item.label}
                  </motion.span>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Main Button */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            onClick={toggleMenu}
            className="w-16 h-16 rounded-full bg-white text-black hover:bg-gray-100 shadow-lg border-2 border-gray-200 transition-all duration-300"
            size="lg"
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-7 h-7" />
                </motion.div>
              ) : (
                <motion.div
                  key="open"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <MessageCircle className="w-7 h-7" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

