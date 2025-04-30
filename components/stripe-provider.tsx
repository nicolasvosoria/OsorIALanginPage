"use client"

import { Elements } from "@stripe/react-stripe-js"
import { loadStripe, type Stripe } from "@stripe/stripe-js"
import { type ReactNode, useEffect, useState } from "react"

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error("Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable")
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

interface StripeProviderProps {
  children: ReactNode
  clientSecret?: string
}

export function StripeProvider({ children, clientSecret }: StripeProviderProps) {
  const [stripe, setStripe] = useState<Stripe | null>(null)

  useEffect(() => {
    const initStripe = async () => {
      const stripe = await stripePromise
      setStripe(stripe)
    }
    initStripe()
  }, [])

  if (!clientSecret) {
    return <>{children}</>
  }

  return (
    <Elements
      stripe={stripe}
      options={{
        clientSecret,
        appearance: {
          theme: "night",
          variables: {
            colorPrimary: "#fff",
            colorBackground: "transparent",
            colorText: "#fff",
          },
        },
      }}
      key={clientSecret}
    >
      {children}
    </Elements>
  )
}
