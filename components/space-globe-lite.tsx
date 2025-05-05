"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export default function SpaceGlobeLite() {
  const [showHint, setShowHint] = useState(true)
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 })
  const [currentColor, setCurrentColor] = useState(0)

  // Colors for the globe
  const colors = [
    "#3a86ff", // Blue
    "#8338ec", // Purple
    "#ff006e", // Pink
    "#fb5607", // Orange
    "#ffbe0b", // Yellow
  ]

  // Handle color transition
  useEffect(() => {
    const colorInterval = setInterval(() => {
      setCurrentColor((prev) => (prev + 1) % colors.length)
    }, 5000)

    return () => clearInterval(colorInterval)
  }, [])

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
        {/* Main globe */}
        <div
          className="w-64 h-64 md:w-80 md:h-80 rounded-full relative"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${colors[currentColor]}33, ${colors[currentColor]}99)`,
            boxShadow: `0 0 60px ${colors[currentColor]}66`,
          }}
        >
          {/* Grid lines */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `
                linear-gradient(0deg, transparent 49.5%, ${colors[currentColor]} 50%, transparent 50.5%),
                linear-gradient(90deg, transparent 49.5%, ${colors[currentColor]} 50%, transparent 50.5%),
                linear-gradient(45deg, transparent 49.5%, ${colors[currentColor]} 50%, transparent 50.5%),
                linear-gradient(135deg, transparent 49.5%, ${colors[currentColor]} 50%, transparent 50.5%)
              `,
              opacity: 0.3,
            }}
          />

          {/* Glow effect */}
          <div
            className="absolute -inset-4 rounded-full"
            style={{
              background: `radial-gradient(circle at center, ${colors[currentColor]}22 0%, transparent 70%)`,
            }}
          />
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
