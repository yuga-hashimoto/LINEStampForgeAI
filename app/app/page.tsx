import type { Metadata } from "next";

import { AppHome } from "@/components/app/AppHome";

export const metadata: Metadata = {
  title: "ダッシュボード | StampForge AI",
};

export default function AppDashboardPage() {
  return <AppHome />;
}
