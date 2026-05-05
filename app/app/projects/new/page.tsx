import type { Metadata } from "next";

import { NewProjectWorkspace } from "@/components/app/NewProjectWorkspace";

export const metadata: Metadata = {
  title: "新規プロジェクト作成 | StampForge AI",
};

export default function NewProjectPage() {
  return <NewProjectWorkspace />;
}
