import type { Metadata } from "next";

import { BillingWorkspace } from "@/components/app/BillingWorkspace";

export const metadata: Metadata = {
  title: "プランと利用量 | StampForge AI",
};

export default function BillingPage() {
  return <BillingWorkspace />;
}
