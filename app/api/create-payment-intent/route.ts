import { stripe } from "@/lib/stripe"
import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(req: Request) {
  try {
    const { amount, plan } = await req.json()

    // Validate the amount
    if (!amount || amount < 1) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    // Get user from session (you'll need to implement your auth logic here)
    // For now, we'll use a placeholder
    const userEmail = "test@example.com" // Replace with actual user email from session

    // Get or create Stripe customer
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("stripe_customer_id")
      .eq("email", userEmail)
      .single()

    let customerId = user?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          supabaseUserId: userEmail, // Using email as identifier
        },
      })
      customerId = customer.id

      // Save the customer ID to the user record
      await supabaseAdmin.from("users").update({ stripe_customer_id: customerId }).eq("email", userEmail)
    }

    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      customer: customerId,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
      metadata: {
        plan,
      },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (error) {
    console.error("Error creating payment intent:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
