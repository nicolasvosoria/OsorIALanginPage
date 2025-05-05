import { Background } from "@/components/background"
import { AuthTest } from "@/components/auth-test"
import { Preloader } from "@/components/preloader"

export default function TestPage() {
  return (
    <div className="min-h-screen bg-transparent text-white overflow-hidden select-none">
      <Preloader />
      <Background />
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <AuthTest />
        </div>
      </div>
    </div>
  )
}
