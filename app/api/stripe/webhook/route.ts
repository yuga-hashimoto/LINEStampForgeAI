import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { getBillingPlan } from "@/lib/billing-plans";
import { applyPurchasedPlan } from "@/lib/usage-ledger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured" },
      { status: 400 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const body = await request.text();
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid webhook" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const plan = getBillingPlan(session.metadata?.planId);
    const actorId = session.metadata?.actorId ?? session.client_reference_id;

    if (plan && actorId) {
      const isAddOn = plan.id === "extra-10";

      await applyPurchasedPlan(actorId, {
        planName: plan.name,
        planType: plan.usage.planType,
        generationCreditsLimit: isAddOn ? undefined : plan.usage.generationCreditsLimit,
        exportLimit: isAddOn ? undefined : plan.usage.exportLimit,
        extraGenerationLimit: isAddOn ? undefined : plan.usage.extraGenerationLimit,
        extraGenerationIncrement: isAddOn ? plan.usage.extraGenerationLimit : undefined,
        preserveCurrentPlan: isAddOn,
      });
    }
  }

  return NextResponse.json({ received: true });
}
