import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ModuleRouteContent } from "@/components/workspace/module-route-content";
import { createApplicationMetadata } from "@/config/metadata";
import {
  findWorkspaceModule,
  workspaceModules,
} from "@/content/workspace-modules";
import { RouteLoading } from "@/components/application/route-loading";

export interface ModulePageProps {
  readonly params: Promise<{ module: string }>;
}

export function generateStaticParams() {
  return workspaceModules.map(({ id }) => ({ module: id }));
}

export async function generateMetadata({
  params,
}: ModulePageProps): Promise<Metadata> {
  const { module: moduleId } = await params;
  const workspaceModule = findWorkspaceModule(moduleId);
  return createApplicationMetadata(
    workspaceModule?.label ?? "Programme",
    workspaceModule?.description ?? "A Tamil Ulagam programme area.",
    `/workspace/sangam/modules/${moduleId}`,
  );
}

export default async function WorkspaceSangamModulePage({
  params,
}: ModulePageProps) {
  const { module: moduleId } = await params;
  const workspaceModule = findWorkspaceModule(moduleId);
  if (!workspaceModule) notFound();

  return (
    <Suspense fallback={<RouteLoading label="Loading…" />}>
      <ModuleRouteContent
        workspaceModule={workspaceModule}
        workspaceType="sangam"
      />
    </Suspense>
  );
}
