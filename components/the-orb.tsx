"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

export default function TheOrb() {
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const orbRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 })
  const [showHint, setShowHint] = useState(true)

  // Auto-rotation
  useEffect(() => {
    let animationId: number

    const autoRotate = () => {
      if (!isDragging) {
        setRotation((prev) => ({
          x: prev.x,
          y: prev.y + 0.2,
        }))
      }
      animationId = requestAnimationFrame(autoRotate)
    }

    animationId = requestAnimationFrame(autoRotate)

    const hintTimer = setTimeout(() => {
      setShowHint(false)
    }, 3000)

    return () => {
      cancelAnimationFrame(animationId)
      clearTimeout(hintTimer)
    }
  }, [isDragging])

  // Handle mouse/touch interactions
  useEffect(() => {
    if (!orbRef.current) return

    const handleMouseDown = (e: MouseEvent | TouchEvent) => {
      setIsDragging(true)
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY
      setStartPosition({ x: clientX, y: clientY })
    }

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return

      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY

      const deltaX = clientX - startPosition.x
      const deltaY = clientY - startPosition.y

      setRotation((prev) => ({
        x: prev.x + deltaY * 0.5,
        y: prev.y + deltaX * 0.5,
      }))

      setStartPosition({ x: clientX, y: clientY })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    // Add event listeners
    orbRef.current.addEventListener("mousedown", handleMouseDown)
    orbRef.current.addEventListener("touchstart", handleMouseDown)
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("touchmove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
    window.addEventListener("touchend", handleMouseUp)

    return () => {
      if (!orbRef.current) return
      orbRef.current.removeEventListener("mousedown", handleMouseDown)
      orbRef.current.removeEventListener("touchstart", handleMouseDown)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("touchmove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
      window.removeEventListener("touchend", handleMouseUp)
    }
  }, [isDragging, startPosition])

  // Generate random stars
  const stars = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    size: Math.random() * 2 + 1,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
  }))

  return (
    <div className="relative w-full h-full overflow-hidden bg-black bg-opacity-50 rounded-full">
      {/* Stars background */}
      <div className="absolute inset-0 overflow-hidden">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              width: `${star.size}px`,
              height: `${star.size}px`,
              top: star.top,
              left: star.left,
              animationDelay: star.animationDelay,
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        ))}
      </div>

      {/* Orb container */}
      <div
        ref={orbRef}
        className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
        style={{ perspective: "1000px" }}
      >
        {/* Glow effect */}
        <div className="absolute w-[80%] h-[80%] rounded-full bg-blue-500 opacity-20 blur-xl animate-pulse" />

        {/* Orb */}
        <motion.div
          className="relative w-[70%] h-[70%] rounded-full"
          style={{
            rotateX: rotation.x,
            rotateY: rotation.y,
            transformStyle: "preserve-3d",
          }}
        >
          {/* Earth base */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-700 via-blue-500 to-blue-900 overflow-hidden">
            {/* Continents */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-80">
              {/* Africa */}
              <path
                d="M55,30 Q60,35 58,45 Q56,55 60,60 Q64,65 55,70 Q46,75 45,65 Q44,55 48,50 Q52,45 50,35 Q48,25 55,30"
                fill="#2F855A"
                opacity="0.8"
              />

              {/* Europe */}
              <path d="M45,25 Q50,20 55,22 Q60,24 58,28 Q56,32 50,30 Q44,28 45,25" fill="#2F855A" opacity="0.8" />

              {/* Asia */}
              <path
                d="M60,20 Q70,15 75,25 Q80,35 75,40 Q70,45 65,40 Q60,35 62,30 Q64,25 60,20"
                fill="#2F855A"
                opacity="0.8"
              />

              {/* North America */}
              <path d="M20,20 Q30,15 35,25 Q40,35 35,40 Q30,45 25,40 Q20,35 20,20" fill="#2F855A" opacity="0.8" />

              {/* South America */}
              <path d="M30,50 Q35,45 40,50 Q45,55 40,65 Q35,75 30,70 Q25,65 30,50" fill="#2F855A" opacity="0.8" />

              {/* Australia */}
              <path d="M75,60 Q80,55 85,60 Q90,65 85,70 Q80,75 75,70 Q70,65 75,60" fill="#2F855A" opacity="0.8" />
            </svg>

            {/* Atmosphere highlight */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-20 rounded-full"
              style={{ transform: "translateX(-30%) translateY(-30%)" }}
            />
          </div>

          {/* Wireframe overlay */}
          <div className="absolute inset-0 rounded-full border-[1px] border-blue-300 opacity-30" />
          <div
            className="absolute inset-0 rounded-full border-[1px] border-blue-300 opacity-20"
            style={{ transform: "rotateX(30deg)" }}
          />
          <div
            className="absolute inset-0 rounded-full border-[1px] border-blue-300 opacity-20"
            style={{ transform: "rotateX(60deg)" }}
          />
          <div
            className="absolute inset-0 rounded-full border-[1px] border-blue-300 opacity-20"
            style={{ transform: "rotateX(90deg)" }}
          />
          <div
            className="absolute inset-0 rounded-full border-[1px] border-blue-300 opacity-20"
            style={{ transform: "rotateY(30deg)" }}
          />
          <div
            className="absolute inset-0 rounded-full border-[1px] border-blue-300 opacity-20"
            style={{ transform: "rotateY(60deg)" }}
          />
          <div
            className="absolute inset-0 rounded-full border-[1px] border-blue-300 opacity-20"
            style={{ transform: "rotateY(90deg)" }}
          />
        </motion.div>
      </div>

      {/* Hint */}
      {showHint && (
        <div className="absolute bottom-4 right-4 bg-black bg-opacity-30 text-white text-sm px-3 py-1 rounded-full transition-opacity duration-1000 opacity-80 hover:opacity-100">
          Drag to explore
        </div>
      )}
    </div>
  )
}
