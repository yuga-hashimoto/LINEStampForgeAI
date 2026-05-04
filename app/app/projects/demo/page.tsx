import type { Metadata } from "next";

import { ProjectDashboard } from "@/components/dashboard/ProjectDashboard";

export const metadata: Metadata = {
  title: "魔法うさぎスタンプ Vol.1 | StampForge AI",
};

export default function DemoProjectPage() {
  return <ProjectDashboard />;
}
