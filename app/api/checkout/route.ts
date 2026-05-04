import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { getBillingPlan } from "@/lib/billing-plans";
import { getCurrentActor } from "@/lib/server-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const actor = await getCurrentActor();

  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { planId?: string };
  const plan = getBillingPlan(body.planId);

  if (!plan) {
    return NextResponse.json({ error: "Unknown billing plan" }, { status: 400 });
  }

  const baseUrl = getBaseUrl(request);

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({
      mode: "demo",
      url: `${baseUrl}/app/billing?checkout=demo&planId=${plan.id}`,
      message: "STRIPE_SECRET_KEY is not configured. Returning a local demo URL.",
    });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const configuredPriceId = plan.priceEnvName
    ? process.env[plan.priceEnvName]
    : undefined;
  const session = await stripe.checkout.sessions.create({
    mode: plan.mode,
    client_reference_id: actor.id,
    customer_email: actor.email,
    line_items: [
      configuredPriceId
        ? { price: configuredPriceId, quantity: 1 }
        : {
            quantity: 1,
            price_data: {
              currency: plan.currency,
              unit_amount: plan.amount,
              recurring:
                plan.mode === "subscription" && plan.interval
                  ? { interval: plan.interval }
                  : undefined,
              product_data: {
                name: `StampForge AI ${plan.name}`,
                description:
                  plan.mode === "subscription"
                    ? "LINEスタンプ制作SaaS 月額プラン"
                    : "LINEスタンプ制作SaaS 単発売りプラン",
              },
            },
          },
    ],
    metadata: {
      actorId: actor.id,
      planId: plan.id,
      service: "stampforge-ai",
    },
    success_url: `${baseUrl}/app/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/app/billing?checkout=cancel&planId=${plan.id}`,
  });

  return NextResponse.json({
    mode: "stripe",
    sessionId: session.id,
    url: session.url,
  });
}

function getBaseUrl(request: NextRequest) {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host");

  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return request.nextUrl.origin;
}
