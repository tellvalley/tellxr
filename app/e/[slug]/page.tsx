import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { InviteCard } from "@/components/invite-card";
import { Experience } from "@/engine/experience";
import { StoryPanels } from "@/components/story-panels";
import { getPublishedEvent, listPublishedEvents } from "@/lib/events";
import { formatEventDate, hostNames } from "@/lib/format";
import { emeraldSalonContentSchema } from "@/templates/emerald-salon/schema";

export function generateStaticParams() {
  return listPublishedEvents().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/e/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const event = getPublishedEvent(slug);
  if (!event) return {};

  const description = `You're invited to ${hostNames(event)}'s celebration on ${formatEventDate(event)}.`;
  return {
    title: event.title,
    description,
    openGraph: { title: `You're invited · ${event.title}`, description },
  };
}

export default async function InvitePage({ params }: PageProps<"/e/[slug]">) {
  const { slug } = await params;
  const event = getPublishedEvent(slug);
  if (!event) notFound();

  // Emerald Salon is the only template so far; its schema also types the card.
  const content = emeraldSalonContentSchema.parse(event.content);

  const theme = {
    "--event-primary": content.palette.primary,
    "--event-bg": content.palette.background,
  } as CSSProperties;

  // The same HTML serves three roles: the card overlay in 3D, the whole page
  // when 3D is unavailable, and the page for browsers without JavaScript.
  const flatPage = (
    <div className="flex min-h-dvh flex-1 flex-col items-center gap-14 bg-event-bg bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08),transparent_60%)] px-5 py-12">
      <InviteCard event={event} content={content} />
      <StoryPanels story={content.story} />
    </div>
  );

  return (
    <main style={theme} className="flex min-h-dvh flex-1 flex-col bg-event-bg">
      <Experience
        templateId={event.template.id}
        content={content}
        title={event.title}
        story={content.story}
        card={<InviteCard event={event} content={content} />}
        fallback={flatPage}
      />
      <noscript>{flatPage}</noscript>
    </main>
  );
}
