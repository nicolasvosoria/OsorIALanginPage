"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

interface ImageGalleryProps {
  images: {
    src: string
    alt: string
    title?: string
    description?: string
  }[]
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goToPrevious = () => {
    const isFirstImage = currentIndex === 0
    const newIndex = isFirstImage ? images.length - 1 : currentIndex - 1
    setCurrentIndex(newIndex)
  }

  const goToNext = () => {
    const isLastImage = currentIndex === images.length - 1
    const newIndex = isLastImage ? 0 : currentIndex + 1
    setCurrentIndex(newIndex)
  }

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex)
  }

  return (
    <div className="relative w-full max-w-7xl mx-auto h-[300px] sm:h-[400px] md:h-[500px] group">
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full h-full rounded-2xl bg-center bg-cover relative overflow-hidden"
      >
        <Image
          src={images[currentIndex].src || "/placeholder.svg"}
          alt={images[currentIndex].alt}
          fill
          className="object-cover rounded-2xl"
          priority
        />

        {/* Overlay with text */}
        {(images[currentIndex].title || images[currentIndex].description) && (
          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-center p-4">
            {images[currentIndex].title && (
              <h3 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
                {images[currentIndex].title}
              </h3>
            )}
            {images[currentIndex].description && (
              <p className="text-white/90 text-sm sm:text-base md:text-lg max-w-2xl">
                {images[currentIndex].description}
              </p>
            )}
          </div>
        )}
      </motion.div>

      {/* Left Arrow */}
      <div className="hidden group-hover:block absolute top-1/2 -translate-y-1/2 left-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer">
        <ChevronLeft onClick={goToPrevious} size={30} />
      </div>

      {/* Right Arrow */}
      <div className="hidden group-hover:block absolute top-1/2 -translate-y-1/2 right-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer">
        <ChevronRight onClick={goToNext} size={30} />
      </div>

      {/* Dots/Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, slideIndex) => (
          <div
            key={slideIndex}
            onClick={() => goToSlide(slideIndex)}
            className={`cursor-pointer h-2 w-2 rounded-full ${
              slideIndex === currentIndex ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
