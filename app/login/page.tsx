import { Suspense } from "react"
import { Background } from "@/components/background"
import { Footer } from "@/components/footer"
import { LoginContent } from "@/components/login-content"
import { Loader2 } from "lucide-react"
import { Preloader } from "@/components/preloader"

export default function СтраницаЗаВход() {
  return (
    <div className="min-h-screen bg-transparent text-white overflow-hidden select-none">
      <Preloader />
      <Background />
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <Suspense
          fallback={
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          }
        >
          <LoginContent />
        </Suspense>
      </div>
      <Footer />
    </div>
  )
}
