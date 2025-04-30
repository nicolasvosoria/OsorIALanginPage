"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Background } from "@/components/background"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Preloader } from "@/components/preloader"

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const paymentIntent = searchParams.get("payment_intent")
    const paymentIntentClientSecret = searchParams.get("payment_intent_client_secret")

    if (paymentIntent && paymentIntentClientSecret) {
      // Update the user's data in localStorage
      const userData = localStorage.getItem("userData")
      if (userData) {
        const parsedUserData = JSON.parse(userData)
        localStorage.setItem(
          "userData",
          JSON.stringify({
            ...parsedUserData,
          }),
        )
      }

      setStatus("success")
      setMessage("Payment successful! Your account has been upgraded.")
      toast.success("Payment successful! Your account has been upgraded.")
    } else {
      setStatus("error")
      setMessage("We couldn't verify your payment. Please contact support if you believe this is an error.")
      toast.error("Payment verification failed")
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-transparent text-white overflow-hidden select-none">
      <Preloader />
      <Background />
      <div className="relative z-10">
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
            <Card className="bg-transparent backdrop-blur-2xl border-gray-500 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {status === "loading" && <Loader2 className="w-6 h-6 animate-spin" />}
                  {status === "success" && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                  {status === "error" && <XCircle className="w-6 h-6 text-red-500" />}
                  Estado del pago
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {status === "loading" ? "Verifying your payment..." : message}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => router.push("/account")}
                  className="w-full border-2 border-white text-black bg-white hover:bg-transparent hover:text-white transition-all duration-300"
                >
                  Ir a la cuenta
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-transparent text-white overflow-hidden select-none">
          <Background />
          <div className="relative z-10 flex items-center justify-center min-h-screen">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  )
}
