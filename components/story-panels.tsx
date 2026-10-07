import type { EmeraldSalonContent } from "@/templates/emerald-salon/schema";

/**
 * Story panels as HTML. In M3 these become panels placed in the 3D room;
 * the same text stays available here for screen readers and the 2D fallback.
 */
export function StoryPanels({ story }: { story: EmeraldSalonContent["story"] }) {
  if (story.length === 0) return null;

  return (
    <section aria-labelledby="story-heading" className="w-full max-w-[380px]">
      <h2
        id="story-heading"
        className="text-center font-sans text-[11px] font-medium uppercase tracking-[0.32em] text-foreground/70"
      >
        Our story
      </h2>
      <ol className="mt-6 flex flex-col gap-3">
        {story.map((panel, i) => (
          <li
            key={panel.title}
            className="border border-event-primary/30 bg-white/[0.03] px-5 py-4"
          >
            <p className="font-sans text-[11px] tracking-[0.2em] text-event-primary">
              {String(i + 1).padStart(2, "0")}
            </p>
            <h3 className="mt-1 font-serif text-[22px] font-semibold leading-tight">
              {panel.title}
            </h3>
            <p className="mt-1 font-serif text-[17px] leading-snug text-foreground/80">
              {panel.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
