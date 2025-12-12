import Link from "next/link"
import { Linkedin, Instagram } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function Footer() {
  return (
    <footer className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 border-t border-gray-500 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center mb-4 sm:mb-0">
          <span className="text-lg sm:text-xl font-semibold flex items-center gap-1">
            <span className="bg-white text-black px-2">OsorIA</span>
            <span className="text-white">.tech</span>
          </span>
        </div>

        <div className="flex gap-4 sm:gap-6 text-gray-400 text-sm sm:text-base mb-4 sm:mb-0">
          <Link href="#" className="hover:text-white transition-colors">
            Términos
          </Link>
          <Link href="#" className="hover:text-white transition-colors">
            Privacidad
          </Link>
          <Link href="#" className="hover:text-white transition-colors">
            Contacto
          </Link>
        </div>

        <div className="flex gap-4">
          <Link
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <Linkedin className="w-6 h-6" />
            <span className="sr-only">LinkedIn</span>
          </Link>
          <Link
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <Instagram className="w-6 h-6" />
            <span className="sr-only">Instagram</span>
          </Link>
          <Link
            href="https://tiktok.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6"
            >
              <path d="M9 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"></path>
              <path d="M16 8v8"></path>
              <path d="M12 16v4"></path>
              <path d="M20 12V8h-4"></path>
              <path d="M16 8a4 4 0 0 0-4-4"></path>
            </svg>
            <span className="sr-only">TikTok</span>
          </Link>
        </div>
      </div>
    </footer>
  )
}
