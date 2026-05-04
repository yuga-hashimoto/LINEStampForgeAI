"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type CheckoutButtonProps = {
  planId: string;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
};

export function CheckoutButton({
  planId,
  children,
  className,
  variant = "default",
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const startCheckout = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const result = (await response.json()) as {
        url?: string;
        mode?: "demo" | "stripe";
        error?: string;
      };

      if (!response.ok || !result.url) {
        throw new Error(result.error ?? "Checkout URLを作成できませんでした");
      }

      if (result.mode === "demo") {
        toast.info("Stripe未設定のためデモCheckoutとして扱います");
      }

      window.location.assign(result.url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Checkoutを開始できませんでした");
      setIsLoading(false);
    }
  };

  return (
    <Button
      className={className}
      disabled={isLoading}
      onClick={startCheckout}
      type="button"
      variant={variant}
    >
      <CreditCard data-icon="inline-start" />
      {children}
    </Button>
  );
}
