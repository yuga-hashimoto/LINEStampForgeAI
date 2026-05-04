import type { Metadata } from "next";

import { SettingsWorkspace } from "@/components/app/SettingsWorkspace";

export const metadata: Metadata = {
  title: "設定 | StampForge AI",
};

export default function SettingsPage() {
  return <SettingsWorkspace />;
}
