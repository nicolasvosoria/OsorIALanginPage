"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect, Suspense } from "react"
import { motion } from "framer-motion"
import { Background } from "@/components/background"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StripeProvider } from "@/components/stripe-provider"
import { PaymentForm } from "@/components/payment-form"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Preloader } from "@/components/preloader"

function PaymentContent() {
  const [clientSecret, setClientSecret] = useState<string>()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<"pro" | "premium" | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const plan = searchParams.get("plan") as "pro" | "premium" | null
    if (!plan || !["pro", "premium"].includes(plan)) {
      router.push("/account")
      return
    }
    setSelectedPlan(plan)
  }, [searchParams, router])

  const createPaymentIntent = async () => {
    if (!selectedPlan) return

    try {
      setIsLoading(true)
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: selectedPlan === "pro" ? 499 : 2999,
          currency: "usd",
          plan: selectedPlan,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create payment intent")
      }

      const data = await response.json()
      if (!data.clientSecret) {
        throw new Error("No client secret received")
      }

      setClientSecret(data.clientSecret)
    } catch (error) {
      console.error("Error creating payment intent:", error)
      toast.error("Failed to initialize payment. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-transparent text-white overflow-hidden select-none">
        <Preloader />
        <Background />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent text-white overflow-hidden select-none">
      <Preloader />
      <Background />
      <div className="relative z-10">
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
            <Card className="bg-transparent backdrop-blur-2xl border-gray-500 text-white">
              <CardHeader>
                <CardTitle>Completa tu compra</CardTitle>
                <CardDescription className="text-gray-400">
                  {selectedPlan === "pro" ? "Plan Pro - $4.99/mes" : "Plan Premium - $29.99/mes"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {clientSecret ? (
                  <StripeProvider clientSecret={clientSecret}>
                    <PaymentForm
                      onSuccess={() => {
                        toast.success(`Successfully subscribed to ${selectedPlan} plan!`)
                        router.push("/payment-success")
                      }}
                      onError={(error) => toast.error(error.message)}
                    />
                  </StripeProvider>
                ) : (
                  <button
                    onClick={createPaymentIntent}
                    disabled={isLoading}
                    className="w-full border-2 border-white text-black bg-white hover:bg-transparent hover:text-white transition-all duration-300 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Inicializando..." : "Proceder al pago"}
                  </button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-transparent text-white overflow-hidden select-none">
          <Preloader />
          <Background />
          <div className="relative z-10 flex items-center justify-center min-h-screen">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  )
}
