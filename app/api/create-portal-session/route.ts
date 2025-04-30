import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    // Get user's Stripe customer ID
    const { data: user } = await supabaseAdmin.from("users").select("stripe_customer_id").eq("email", email).single()

    if (!user?.stripe_customer_id) {
      return NextResponse.json({ error: "No Stripe customer found" }, { status: 404 })
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      configuration: process.env.STRIPE_PORTAL_CONFIGURATION_ID,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/account`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Portal session error:", error)
    return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 })
  }
}
