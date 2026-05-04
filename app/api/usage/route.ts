import { NextResponse } from "next/server";

import { getCurrentActor } from "@/lib/server-auth";
import { getAssetStorageRuntime } from "@/lib/storage-service";
import { getUsageLedger } from "@/lib/usage-ledger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const actor = await getCurrentActor();

  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const usage = await getUsageLedger(actor.id);

  return NextResponse.json({
    actor,
    usage,
    environment: {
      authProvider: actor.provider === "clerk" ? "Clerk" : "開発デモ",
      stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
      stripeWebhookConfigured: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
      storage: getAssetStorageRuntime(),
      codexAppServerCommand:
        process.env.CODEX_APP_SERVER_COMMAND ?? "codex app-server",
    },
  });
}
