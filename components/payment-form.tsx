"use client"

import type React from "react"

import { useState } from "react"
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface PaymentFormProps {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function PaymentForm({ onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      console.error("Stripe.js hasn't loaded yet.")
      setErrorMessage("Payment system is not ready. Please try again.")
      return
    }

    setIsProcessing(true)
    setErrorMessage("")

    try {
      const { error: submitError } = await elements.submit()
      if (submitError) {
        setErrorMessage(submitError.message ?? "An error occurred while submitting the payment.")
        return
      }

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
      })

      if (error) {
        // This point will only be reached if there is an immediate error when
        // confirming the payment. Otherwise, your customer will be redirected to
        // your `return_url`.
        setErrorMessage(error.message ?? "An unexpected error occurred.")
        onError?.(error)
        toast.error(error.message)
      } else {
        toast.success("Payment successful!")
        onSuccess?.()
      }
    } catch (error) {
      console.error("Payment error:", error)
      setErrorMessage("An unexpected error occurred while processing your payment.")
      onError?.(error as Error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="bg-transparent border-gray-500">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <PaymentElement
            options={{
              layout: "tabs",
              defaultValues: {
                billingDetails: {
                  name: "Jenny Rosen",
                },
              },
            }}
          />

          {errorMessage && <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-md">{errorMessage}</div>}

          <Button
            type="submit"
            disabled={!stripe || isProcessing}
            className="w-full border-2 border-white text-black bg-white hover:bg-transparent hover:text-white transition-all duration-300"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              "Pagar ahora"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
