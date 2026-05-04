import type { UsageLedger } from "@/lib/usage-ledger";

export type BillingPlanId =
  | "trial-8"
  | "standard-24"
  | "creator-lite"
  | "creator-pro"
  | "studio"
  | "extra-10";

export type BillingPlanCheckoutMode = "payment" | "subscription";

export type BillingPlanConfig = {
  id: BillingPlanId;
  name: string;
  mode: BillingPlanCheckoutMode;
  amount: number;
  currency: "jpy";
  priceEnvName?: string;
  interval?: "month";
  usage: {
    planType: UsageLedger["planType"];
    generationCreditsLimit?: number;
    exportLimit?: number;
    extraGenerationLimit?: number;
  };
};

export const billingPlans: Record<BillingPlanId, BillingPlanConfig> = {
  "trial-8": {
    id: "trial-8",
    name: "8個お試し",
    mode: "payment",
    amount: 980,
    currency: "jpy",
    priceEnvName: "STRIPE_PRICE_TRIAL_8",
    usage: {
      planType: "one-shot",
      generationCreditsLimit: 10,
      exportLimit: 1,
      extraGenerationLimit: 2,
    },
  },
  "standard-24": {
    id: "standard-24",
    name: "24個標準",
    mode: "payment",
    amount: 2480,
    currency: "jpy",
    priceEnvName: "STRIPE_PRICE_STANDARD_24",
    usage: {
      planType: "one-shot",
      generationCreditsLimit: 20,
      exportLimit: 1,
      extraGenerationLimit: 5,
    },
  },
  "creator-lite": {
    id: "creator-lite",
    name: "Creator Lite",
    mode: "subscription",
    amount: 1980,
    currency: "jpy",
    interval: "month",
    priceEnvName: "STRIPE_PRICE_CREATOR_LITE",
    usage: {
      planType: "subscription",
      generationCreditsLimit: 20,
      exportLimit: 1,
      extraGenerationLimit: 0,
    },
  },
  "creator-pro": {
    id: "creator-pro",
    name: "Creator Pro",
    mode: "subscription",
    amount: 4980,
    currency: "jpy",
    interval: "month",
    priceEnvName: "STRIPE_PRICE_CREATOR_PRO",
    usage: {
      planType: "subscription",
      generationCreditsLimit: 80,
      exportLimit: 5,
      extraGenerationLimit: 20,
    },
  },
  studio: {
    id: "studio",
    name: "Studio",
    mode: "subscription",
    amount: 14800,
    currency: "jpy",
    interval: "month",
    priceEnvName: "STRIPE_PRICE_STUDIO",
    usage: {
      planType: "subscription",
      generationCreditsLimit: 250,
      exportLimit: 20,
      extraGenerationLimit: 80,
    },
  },
  "extra-10": {
    id: "extra-10",
    name: "追加生成10回",
    mode: "payment",
    amount: 980,
    currency: "jpy",
    priceEnvName: "STRIPE_PRICE_EXTRA_10",
    usage: {
      planType: "one-shot",
      extraGenerationLimit: 10,
    },
  },
};

export function getBillingPlan(planId: string | undefined) {
  if (!planId || !(planId in billingPlans)) {
    return null;
  }

  return billingPlans[planId as BillingPlanId];
}
