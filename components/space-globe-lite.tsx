"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export default function SpaceGlobeLite() {
  const [showHint, setShowHint] = useState(true)
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 })

  // Handle hint timeout
  useEffect(() => {
    const hintTimer = setTimeout(() => {
      setShowHint(false)
    }, 3000)

    return () => clearTimeout(hintTimer)
  }, [])

  // Handle mouse/touch events for rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartPosition({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    const deltaX = e.clientX - startPosition.x
    const deltaY = e.clientY - startPosition.y

    setRotation({
      x: rotation.x + deltaY * 0.5,
      y: rotation.y + deltaX * 0.5,
    })

    setStartPosition({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Auto rotation
  useEffect(() => {
    if (isDragging) return

    const autoRotate = setInterval(() => {
      setRotation((prev) => ({
        x: prev.x,
        y: prev.y + 0.2,
      }))
    }, 50)

    return () => clearInterval(autoRotate)
  }, [isDragging])

  return (
    <div
      className="w-full h-full flex items-center justify-center relative"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Background stars */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 100 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 1 + "px",
              height: Math.random() * 2 + 1 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Globe */}
      <motion.div
        className="relative"
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        }}
      >
        {/* Earth globe */}
        <div
          className="w-64 h-64 md:w-80 md:h-80 rounded-full relative overflow-hidden"
          style={{
            background: "radial-gradient(circle at 30% 30%, #1a73e8, #0c2461)",
            boxShadow: "0 0 60px rgba(26, 115, 232, 0.4)",
          }}
        >
          {/* Continents */}
          <div className="absolute inset-0">
            {/* North America */}
            <div
              className="absolute bg-green-700 opacity-80"
              style={{
                top: "15%",
                left: "15%",
                width: "25%",
                height: "20%",
                borderRadius: "60% 40% 60% 30%",
                transform: "rotate(-15deg)",
              }}
            ></div>

            {/* South America */}
            <div
              className="absolute bg-green-700 opacity-80"
              style={{
                top: "40%",
                left: "25%",
                width: "15%",
                height: "25%",
                borderRadius: "40% 50% 60% 70%",
                transform: "rotate(15deg)",
              }}
            ></div>

            {/* Europe */}
            <div
              className="absolute bg-green-700 opacity-80"
              style={{
                top: "20%",
                left: "45%",
                width: "15%",
                height: "10%",
                borderRadius: "60% 70% 60% 80%",
              }}
            ></div>

            {/* Africa */}
            <div
              className="absolute bg-green-700 opacity-80"
              style={{
                top: "35%",
                left: "45%",
                width: "20%",
                height: "25%",
                borderRadius: "50% 60% 40% 50%",
              }}
            ></div>

            {/* Asia */}
            <div
              className="absolute bg-green-700 opacity-80"
              style={{
                top: "15%",
                left: "60%",
                width: "30%",
                height: "25%",
                borderRadius: "70% 60% 50% 40%",
              }}
            ></div>

            {/* Australia */}
            <div
              className="absolute bg-green-700 opacity-80"
              style={{
                top: "55%",
                left: "75%",
                width: "15%",
                height: "15%",
                borderRadius: "60% 70% 60% 50%",
              }}
            ></div>

            {/* Antarctica */}
            <div
              className="absolute bg-gray-200 opacity-90"
              style={{
                bottom: "5%",
                left: "35%",
                width: "30%",
                height: "10%",
                borderRadius: "50%",
              }}
            ></div>
          </div>

          {/* Cloud layer */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at center, transparent 0%, transparent 60%, rgba(255,255,255,0.1) 100%)",
            }}
          ></div>

          {/* Grid lines */}
          <div
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(0deg, transparent 49.5%, rgba(255,255,255,0.2) 50%, transparent 50.5%),
                linear-gradient(90deg, transparent 49.5%, rgba(255,255,255,0.2) 50%, transparent 50.5%),
                linear-gradient(45deg, transparent 49.5%, rgba(255,255,255,0.1) 50%, transparent 50.5%),
                linear-gradient(135deg, transparent 49.5%, rgba(255,255,255,0.1) 50%, transparent 50.5%)
              `,
              opacity: 0.5,
            }}
          ></div>

          {/* Atmosphere glow */}
          <div
            className="absolute -inset-4 rounded-full"
            style={{
              background: "radial-gradient(circle at center, rgba(26, 115, 232, 0.2) 0%, transparent 70%)",
            }}
          ></div>
        </div>
      </motion.div>

      {/* Hint */}
      {showHint && (
        <div className="absolute bottom-4 right-4 bg-black bg-opacity-30 text-white text-sm px-3 py-1 rounded-full transition-opacity duration-1000 opacity-80 hover:opacity-100 z-10">
          Drag to explore
        </div>
      )}
    </div>
  )
}
