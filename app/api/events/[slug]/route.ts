import { getPublishedEvent, listPublishedEvents } from "@/lib/events";

export function generateStaticParams() {
  return listPublishedEvents().map((e) => ({ slug: e.slug }));
}

/** Public, published event content for the guest page. */
export async function GET(_req: Request, ctx: RouteContext<"/api/events/[slug]">) {
  const { slug } = await ctx.params;
  const event = getPublishedEvent(slug);

  if (!event) {
    return Response.json({ error: "Event not found" }, { status: 404 });
  }

  return Response.json(event);
}
