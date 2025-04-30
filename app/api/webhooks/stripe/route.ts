import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { supabaseAdmin } from "@/lib/supabase"

export const dynamic = "force-dynamic"

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error("Missing STRIPE_WEBHOOK_SECRET environment variable")
}

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

async function updateSubscriptionData(
  email: string,
  {
    customerId,
    subscriptionId,
    subscriptionItemId,
    periodStart,
    periodEnd,
    status,
    plan,
  }: {
    customerId: string
    subscriptionId: string
    subscriptionItemId: string
    periodStart: number
    periodEnd: number
    status: string
    plan: string
  },
) {
  await supabaseAdmin
    .from("users")
    .update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      stripe_subscription_item_id: subscriptionItemId,
      subscription_period_start: new Date(periodStart * 1000).toISOString(),
      subscription_period_end: new Date(periodEnd * 1000).toISOString(),
      subscription_status: status,
      plan: plan,
      updated_at: new Date().toISOString(),
    })
    .eq("email", email)
}

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get("stripe-signature")

  if (!signature || !endpointSecret) {
    return NextResponse.json({ error: "Missing signature or endpoint secret" }, { status: 400 })
  }

  try {
    const event = stripe.webhooks.constructEvent(body, signature, endpointSecret)

    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object
        const customerId = paymentIntent.customer as string

        if (customerId) {
          // Fetch the customer's subscription
          const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            limit: 1,
            status: "active",
            expand: ["data.default_payment_method"],
          })

          if (subscriptions.data.length > 0) {
            const subscription = subscriptions.data[0]

            // Get user by Stripe customer ID
            const { data: user } = await supabaseAdmin
              .from("users")
              .select("email")
              .eq("stripe_customer_id", customerId)
              .single()

            if (user) {
              await updateSubscriptionData(user.email, {
                customerId,
                subscriptionId: subscription.id,
                subscriptionItemId: subscription.items.data[0].id,
                periodStart: subscription.current_period_start,
                periodEnd: subscription.current_period_end,
                status: subscription.status,
                plan: subscription.metadata.plan || "free",
              })
            }
          }
        }
        break

      case "checkout.session.completed":
        const session = event.data.object
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
          const sessionCustomerId = session.customer as string

          const { data: checkoutUser } = await supabaseAdmin
            .from("users")
            .select("email")
            .eq("stripe_customer_id", sessionCustomerId)
            .single()

          if (checkoutUser) {
            await updateSubscriptionData(checkoutUser.email, {
              customerId: sessionCustomerId,
              subscriptionId: subscription.id,
              subscriptionItemId: subscription.items.data[0].id,
              periodStart: subscription.current_period_start,
              periodEnd: subscription.current_period_end,
              status: subscription.status,
              plan: subscription.metadata.plan || "free",
            })
          }
        }
        break

      case "invoice.payment_succeeded":
        const invoice = event.data.object
        const invoiceCustomerId = invoice.customer as string

        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)

          const { data: paidUser } = await supabaseAdmin
            .from("users")
            .select("email")
            .eq("stripe_customer_id", invoiceCustomerId)
            .single()

          if (paidUser) {
            await updateSubscriptionData(paidUser.email, {
              customerId: invoiceCustomerId,
              subscriptionId: subscription.id,
              subscriptionItemId: subscription.items.data[0].id,
              periodStart: subscription.current_period_start,
              periodEnd: subscription.current_period_end,
              status: "active", // Explicitly set to "active"
              plan: subscription.metadata.plan || "free",
            })
          }
        }
        break

      case "customer.subscription.updated":
        const updatedSubscription = event.data.object
        const updatedCustomerId = updatedSubscription.customer as string

        const { data: updatedUser } = await supabaseAdmin
          .from("users")
          .select("email")
          .eq("stripe_customer_id", updatedCustomerId)
          .single()

        if (updatedUser) {
          await updateSubscriptionData(updatedUser.email, {
            customerId: updatedCustomerId,
            subscriptionId: updatedSubscription.id,
            subscriptionItemId: updatedSubscription.items.data[0].id,
            periodStart: updatedSubscription.current_period_start,
            periodEnd: updatedSubscription.current_period_end,
            status: updatedSubscription.status,
            plan: updatedSubscription.metadata.plan || "free",
          })
        }
        break

      case "invoice.payment_failed":
        const failedInvoice = event.data.object
        const failedCustomerId = failedInvoice.customer as string

        const { data: failedUser } = await supabaseAdmin
          .from("users")
          .select("email")
          .eq("stripe_customer_id", failedCustomerId)
          .single()

        if (failedUser) {
          await supabaseAdmin
            .from("users")
            .update({
              subscription_status: "declined",
              updated_at: new Date().toISOString(),
            })
            .eq("email", failedUser.email)
        }
        break

      case "customer.subscription.deleted":
        const deletedSubscription = event.data.object
        const deletedCustomerId = deletedSubscription.customer as string

        const { data: deletedUser } = await supabaseAdmin
          .from("users")
          .select("email")
          .eq("stripe_customer_id", deletedCustomerId)
          .single()

        if (deletedUser) {
          await supabaseAdmin
            .from("users")
            .update({
              plan: "free",
              subscription_status: "canceled",
              stripe_subscription_id: null,
              stripe_subscription_item_id: null,
              subscription_period_end: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("email", deletedUser.email)
        }
        break
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("Webhook error:", err)
    return NextResponse.json(
      {
        error: "Webhook handler failed",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 400 },
    )
  }
}
