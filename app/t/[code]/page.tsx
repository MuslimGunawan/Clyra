import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { TOOLS } from "@/data/tools";

interface ShortCodeProps {
  params: Promise<{ code: string }>;
}

export async function generateStaticParams() {
  const byCode = TOOLS.filter((t) => t.code).map((t) => ({ code: t.code! }));
  const bySlug = TOOLS.map((t) => ({ code: t.slug }));
  return [...byCode, ...bySlug];
}

export async function generateMetadata({ params }: ShortCodeProps): Promise<Metadata> {
  const { code } = await params;
  const tool = TOOLS.find((t) => t.code === code || t.slug === code);

  if (!tool) {
    return { title: "Clyra Tool" };
  }

  return {
    title: `${tool.name} | Clyra`,
    description: tool.description,
  };
}

export default async function ShortToolRedirectPage({ params }: ShortCodeProps) {
  const { code } = await params;
  const tool = TOOLS.find((t) => t.code === code || t.slug === code);

  if (!tool) {
    notFound();
  }

  // Redirect cleanly or render directly
  redirect(`/tools/${tool.slug}`);
}
