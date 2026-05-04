import type { Metadata } from "next";

import { ProjectsWorkspace } from "@/components/app/ProjectsWorkspace";

export const metadata: Metadata = {
  title: "プロジェクト | StampForge AI",
};

export default function ProjectsPage() {
  return <ProjectsWorkspace />;
}
