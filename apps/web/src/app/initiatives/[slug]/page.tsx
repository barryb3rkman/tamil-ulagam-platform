import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { InitiativeDetailPage } from "@/components/initiatives/detail";
import { images } from "@/config/images";
import { createPageMetadata } from "@/config/metadata";
import {
  getInitiativeDetail,
  getInitiativeDetailIdentity,
  getInitiativeImageKey,
} from "@/content/initiative-details";
import { initiatives } from "@/content/initiatives";

export interface InitiativePageProps {
  readonly params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return initiatives.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: InitiativePageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = getInitiativeDetail(slug);

  if (!detail) {
    return createPageMetadata(
      "Initiative not found",
      "The requested Tamil Ulagam initiative page could not be found.",
      "/initiatives",
    );
  }

  const initiative = getInitiativeDetailIdentity(detail.slug);

  return createPageMetadata(
    `${initiative.title} Initiative`,
    `${detail.heroStatement} This Tamil Ulagam initiative is planned and will be introduced only in responsible stages.`,
    initiative.href as `/initiatives/${string}`,
    images[getInitiativeImageKey(detail.slug)],
  );
}

export default async function InitiativePage({ params }: InitiativePageProps) {
  const { slug } = await params;
  const detail = getInitiativeDetail(slug);

  if (!detail) {
    notFound();
  }

  return <InitiativeDetailPage detail={detail} />;
}
