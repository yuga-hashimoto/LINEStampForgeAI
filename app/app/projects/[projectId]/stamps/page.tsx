import type { Metadata } from "next";

import { ProjectDashboard } from "@/components/dashboard/ProjectDashboard";

type StampCreationPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export async function generateMetadata({ params }: StampCreationPageProps): Promise<Metadata> {
  const { projectId } = await params;

  return {
    title: `${decodeURIComponent(projectId)}のスタンプ作成 | StampForge AI`,
  };
}

export default async function StampCreationPage({ params }: StampCreationPageProps) {
  const { projectId } = await params;

  return <ProjectDashboard mode="stamps" projectId={projectId} />;
}
