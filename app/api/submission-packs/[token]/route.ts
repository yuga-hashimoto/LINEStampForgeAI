import { NextResponse } from "next/server";

import { getSubmissionPack } from "@/lib/submission-pack-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ token: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { token } = await context.params;
  const pack = await getSubmissionPack(token);

  if (!pack) {
    return NextResponse.json(
      { error: "submission pack was not found or has expired" },
      { status: 404 }
    );
  }

  return new NextResponse(JSON.stringify(pack.manifest, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Content-Disposition": 'inline; filename="submission-manifest.json"',
    },
  });
}
