"use client";

import type { SealId } from "@/templates/shared-schema";
import type { EnvelopeArt } from "./types";

type Props = {
  art: EnvelopeArt;
  seal: SealId;
  monogram: string;
  title: string;
  /** False while the scene is still loading: the seal is shown but not tappable. */
  ready: boolean;
  opening: boolean;
  onOpen: () => void;
};

/**
 * The sealed envelope a guest taps to open. Artwork from the template,
 * seal style and monogram from the event.
 */
export function Envelope({ art, seal, monogram, title, ready, opening, onOpen }: Props) {
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center px-5 transition-[opacity,transform] duration-700 ease-in ${opening ? "pointer-events-none translate-y-[30%] opacity-0" : "opacity-100"}`}
    >
      <div
        className="relative w-full max-w-[420px] shadow-[0_40px_90px_-30px_rgba(0,0,0,0.85)]"
        style={{ aspectRatio: `${art.width} / ${art.height}`, maxHeight: "86dvh" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- fixed-size art, already optimised */}
        <img
          src={art.src}
          alt=""
          width={art.width}
          height={art.height}
          fetchPriority="high"
          className="absolute inset-0 h-full w-full select-none object-cover"
          draggable={false}
        />

        <div
          className="absolute inset-x-[14%] flex -translate-y-1/2 flex-col items-center text-center"
          style={{ top: `${art.textAt * 100}%`, color: art.ink }}
        >
          <p className="font-sans text-[11px] font-medium uppercase tracking-[0.32em] opacity-70">
            You&rsquo;re invited
          </p>
          <h1 className="mt-3 font-script text-[clamp(34px,10vw,46px)] leading-[1.1]">{title}</h1>
        </div>

        <div
          className="absolute left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
          style={{ top: `${art.sealAt * 100}%` }}
        >
          <WaxSeal
            seal={seal}
            monogram={monogram}
            disabled={!ready}
            onClick={onOpen}
            label={`Open the invitation from ${title}`}
          />
          <p
            className={`mt-3 font-sans text-[12px] font-medium tracking-[0.12em] transition-opacity duration-500 ${ready ? "opacity-70" : "opacity-0"}`}
            style={{ color: art.ink }}
            aria-hidden
          >
            Tap the seal to open
          </p>
        </div>
      </div>
    </div>
  );
}

/** A wax seal button with the event's monogram pressed into it. */
export function WaxSeal({
  seal,
  monogram,
  disabled,
  onClick,
  label,
}: {
  seal: SealId;
  monogram: string;
  disabled?: boolean;
  onClick?: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="group relative grid size-[108px] place-items-center rounded-full transition-transform duration-300 enabled:hover:scale-105 enabled:active:scale-95 disabled:cursor-wait"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- tiny fixed-size art */}
      <img
        src={`/seals/${seal}.webp`}
        alt=""
        width={360}
        height={360}
        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,0.45)]"
        draggable={false}
      />
      {/* Pressed-in monogram: darker than the wax with a light lower edge, so it reads on any colour */}
      <span
        aria-hidden
        className="relative font-script text-[30px] leading-none text-black/40 [text-shadow:0_1px_0_rgba(255,255,255,0.35),0_-1px_0_rgba(0,0,0,0.25)]"
      >
        {monogram}
      </span>
      {/* Gentle pulse once tappable */}
      <span
        aria-hidden
        className="absolute inset-[-6px] rounded-full border border-white/40 opacity-0 group-enabled:animate-[seal-pulse_2.4s_ease-out_infinite]"
      />
    </button>
  );
}
