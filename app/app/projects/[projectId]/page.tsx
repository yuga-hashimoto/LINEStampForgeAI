import type { Metadata } from "next";

import { ProjectDashboard } from "@/components/dashboard/ProjectDashboard";

type ProjectPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { projectId } = await params;

  return {
    title: `${decodeURIComponent(projectId)} | StampForge AI`,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params;

  return <ProjectDashboard projectId={projectId} />;
}
