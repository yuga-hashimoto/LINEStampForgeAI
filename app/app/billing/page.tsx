import type { Metadata } from "next";

import { BillingWorkspace } from "@/components/app/BillingWorkspace";

export const metadata: Metadata = {
  title: "プランと利用量 | StampForge AI",
};

type BillingPageProps = {
  searchParams?: Promise<{
    checkout?: string;
    planId?: string;
  }>;
};

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const params = await searchParams;
  const checkout =
    params?.checkout === "demo" ||
    params?.checkout === "success" ||
    params?.checkout === "cancel"
      ? params.checkout
      : undefined;

  return <BillingWorkspace checkoutPlanId={params?.planId} checkoutResult={checkout} />;
}
