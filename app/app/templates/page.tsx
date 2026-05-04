import type { Metadata } from "next";

import { TemplatesWorkspace } from "@/components/app/TemplatesWorkspace";

export const metadata: Metadata = {
  title: "テンプレート | StampForge AI",
};

export default function AppTemplatesPage() {
  return <TemplatesWorkspace />;
}
