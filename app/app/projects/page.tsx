import type { Metadata } from "next";

import { ProjectsWorkspace } from "@/components/app/ProjectsWorkspace";

export const metadata: Metadata = {
  title: "キャラクターシート | StampForge AI",
};

export default function ProjectsPage() {
  return <ProjectsWorkspace />;
}
