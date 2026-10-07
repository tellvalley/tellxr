import type { EventConfig } from "@/lib/event-schema";
import {
  formatEventDateParts,
  formatEventTime,
  formatPlainDate,
} from "@/lib/format";
import type { EmeraldSalonContent } from "@/templates/emerald-salon/schema";

/** Copy that depends on the event type, so new types only add a line here. */
const invitationLine: Record<EventConfig["type"], string> = {
  wedding: "request the pleasure of your company as they celebrate their wedding",
};

type Props = {
  event: EventConfig;
  content: EmeraldSalonContent;
};

/**
 * The invitation card as plain HTML.
 * Used on its own today; later it is the overlay on the 3D table
 * and the whole page in the 2D fallback.
 */
export function InviteCard({ event, content }: Props) {
  const [first, ...rest] = event.hosts;
  const { weekday, date } = formatEventDateParts(event);

  return (
    <article
      aria-label={`Invitation: ${event.title}`}
      className="relative w-full max-w-[380px] bg-ivory text-ink shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]"
    >
      {/* Inset hairline frame in the event colour */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-3 border border-event-primary/60"
      />

      <div className="relative flex flex-col items-center px-8 pt-12 pb-10 text-center">
        <p className="font-sans text-[11px] font-medium uppercase tracking-[0.32em] text-muted-ink">
          Save the date
        </p>

        <h1 className="mt-6 font-script text-[44px] leading-[1.05] text-ink">
          <span className="block">{first.displayName}</span>
          {rest.map((host) => (
            <span key={host.displayName} className="block">
              <span className="text-event-primary">&amp;</span> {host.displayName}
            </span>
          ))}
        </h1>

        <p className="mt-5 max-w-[260px] font-serif text-[17px] italic leading-snug text-muted-ink">
          {invitationLine[event.type]}
        </p>

        <Divider />

        <dl className="flex flex-col gap-4 font-serif [font-variant-numeric:lining-nums]">
          <div>
            <dt className="sr-only">Date</dt>
            <dd className="uppercase">
              <span className="block font-sans text-[11px] font-medium tracking-[0.32em] text-muted-ink">
                {weekday}
              </span>
              <span className="mt-1 block text-[21px] font-semibold tracking-[0.08em]">
                {date}
              </span>
            </dd>
          </div>
          <div>
            <dt className="sr-only">Time</dt>
            <dd className="text-[17px] tracking-[0.12em] text-muted-ink">
              {formatEventTime(event)}
            </dd>
          </div>
          <div>
            <dt className="sr-only">Venue</dt>
            <dd className="text-[18px] leading-snug">
              <span className="block font-semibold">{event.venue.name}</span>
              <span className="block text-muted-ink">{event.venue.address}</span>
              {event.venue.mapUrl ? (
                <a
                  href={event.venue.mapUrl}
                  className="mt-1 inline-block font-sans text-[13px] font-medium text-ink underline decoration-event-primary underline-offset-4"
                >
                  Get directions
                </a>
              ) : null}
            </dd>
          </div>
          {content.dressCode ? (
            <div>
              <dt className="font-sans text-[11px] font-medium uppercase tracking-[0.28em] text-muted-ink">
                Dress code
              </dt>
              <dd className="mt-1 text-[17px] italic">{content.dressCode}</dd>
            </div>
          ) : null}
        </dl>

        <Divider />

        <p className="font-sans text-[12px] tracking-[0.06em] text-muted-ink">
          Kindly respond by {formatPlainDate(event.rsvpDeadline)}
        </p>
      </div>
    </article>
  );
}

function Divider() {
  return (
    <div aria-hidden className="my-7 flex items-center gap-3">
      <span className="h-px w-12 bg-event-primary/60" />
      <span className="size-1.5 rotate-45 bg-event-primary" />
      <span className="h-px w-12 bg-event-primary/60" />
    </div>
  );
}
