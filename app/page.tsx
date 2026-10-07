import Link from "next/link";
import { listPublishedEvents } from "@/lib/events";
import { formatEventDate } from "@/lib/format";

/** Prototype index: lists sample invites. Replaced by the marketing site later. */
export default function Home() {
  const events = listPublishedEvents();

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-16">
      <p className="font-sans text-[11px] font-medium uppercase tracking-[0.32em] text-foreground/60">
        Prototype
      </p>
      <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight">
        TellXR
      </h1>
      <p className="mt-3 font-serif text-lg text-foreground/75">
        Immersive invitations that open beautifully on any phone. Sample invites:
      </p>

      <ul className="mt-10 flex flex-col gap-3">
        {events.map((event) => (
          <li key={event.slug}>
            <Link
              href={`/e/${event.slug}`}
              className="flex items-center justify-between border border-foreground/15 px-5 py-4 transition-colors hover:border-foreground/40"
            >
              <span>
                <span className="block font-serif text-2xl">{event.title}</span>
                <span className="block font-sans text-sm text-foreground/60">
                  {formatEventDate(event)}
                </span>
              </span>
              <span aria-hidden className="text-foreground/50">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
