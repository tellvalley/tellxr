"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useReducer, useState, useSyncExternalStore, type ReactNode } from "react";
import { clientTemplates } from "@/templates/client";
import type { SealId } from "@/templates/shared-schema";
import { Envelope } from "./envelope";
import { initialTier } from "./quality";
import { createReducer, initialState, stopFor } from "./stages";
import type { QualityTier, StoryPanel } from "./types";
import { useReducedMotion } from "./use-reduced-motion";

const SceneCanvas = dynamic(() => import("./scene-canvas"), { ssr: false });

type Props = {
  templateId: string;
  /** Template content, already validated on the server. */
  content: unknown;
  title: string;
  /** Initials pressed into the wax seal, e.g. "P&D". */
  monogram: string;
  seal: SealId;
  story: StoryPanel[];
  /** The invitation card, rendered on the server as plain HTML. */
  card: ReactNode;
  /** The full 2D page shown when 3D is not possible. */
  fallback: ReactNode;
};

// Device capability is read once per page load.
let cachedTier: QualityTier | null = null;
const readTier = () => (cachedTier ??= initialTier());
const noSubscribe = () => () => {};

/** Seconds per camera flight, by destination. */
const flight = { room: 2.4, story: 1.6, card: 1.8, envelope: 1.2 } as const;

export function Experience({ templateId, content, title, monogram, seal, story, card, fallback }: Props) {
  const detected = useSyncExternalStore(noSubscribe, readTier, () => null);
  const [slow, setSlow] = useState(false);
  const reducedMotion = useReducedMotion();

  const reduce = useMemo(() => createReducer(story.length), [story.length]);
  const [state, dispatch] = useReducer(reduce, initialState);
  const [ready, setReady] = useState(false);
  const [arrived, setArrived] = useState<string | null>(null);

  const template = clientTemplates[templateId];
  const stop = stopFor(state);
  const atStop = arrived === stop;

  const onReady = useCallback(() => setReady(true), []);
  const onArrive = useCallback((s: string) => setArrived(s), []);
  const onSlow = useCallback(() => setSlow(true), []);

  // Keeps the HTML envelope on screen while it animates away after opening.
  const [envelopeLeaving, setEnvelopeLeaving] = useState(false);
  useEffect(() => {
    if (!envelopeLeaving) return;
    const t = setTimeout(() => setEnvelopeLeaving(false), 700);
    return () => clearTimeout(t);
  }, [envelopeLeaving]);
  const openEnvelope = useCallback(() => {
    setEnvelopeLeaving(true);
    dispatch({ type: "open" });
  }, []);

  // Server render and first client pass: nothing decided yet.
  if (detected === null) return <Loader title={title} />;
  if (detected === "none" || !template) return <>{fallback}</>;

  const tier = slow ? "low" : detected;
  const flightSeconds = reducedMotion ? 0 : flight[state.stage];
  const showCard = state.stage === "card";
  const envelopeArt = template.envelope;
  const atEnvelope = state.stage === "envelope";
  const sceneFilter = showCard
    ? "blur(6px) brightness(0.55)"
    : envelopeArt && atEnvelope
      ? "blur(3px) brightness(0.45)"
      : "none";

  return (
    <div className="fixed inset-0 overflow-hidden bg-event-bg">
      <div
        className="absolute inset-0 transition-[filter] duration-700"
        style={{ filter: sceneFilter }}
      >
        <SceneCanvas
          template={template}
          content={content}
          stage={state.stage}
          storyIndex={state.storyIndex}
          storyCount={story.length}
          stop={stop}
          tier={tier}
          flightSeconds={flightSeconds}
          paused={atStop && (showCard || Boolean(envelopeArt && atEnvelope))}
          onReady={onReady}
          onArrive={onArrive}
          onSlow={onSlow}
        />
      </div>

      {/* An HTML envelope shows at once; the seal unlocks when the scene is ready. */}
      {envelopeArt && (atEnvelope || envelopeLeaving) ? (
        <Envelope
          art={envelopeArt}
          seal={seal}
          monogram={monogram}
          title={title}
          ready={ready}
          opening={!atEnvelope}
          onOpen={openEnvelope}
        />
      ) : null}

      {!ready && !envelopeArt ? <Loader title={title} /> : null}

      {ready && !envelopeArt && state.stage === "envelope" ? (
        <Panel visible={atStop} className="justify-end pb-[18dvh]">
          <p className="font-sans text-[11px] font-medium uppercase tracking-[0.32em] text-white/75">
            You&rsquo;re invited
          </p>
          <h1 className="mt-3 text-center font-script text-[42px] leading-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
            {title}
          </h1>
          <PrimaryButton onClick={() => dispatch({ type: "open" })}>Open invitation</PrimaryButton>
        </Panel>
      ) : null}

      {ready && state.stage === "room" ? (
        <Panel visible={atStop} className="justify-between py-[8dvh]">
          <h1 className="text-center font-script text-[46px] leading-tight text-white [text-shadow:0_0_18px_var(--event-primary),0_0_42px_var(--event-primary)]">
            {title}
          </h1>
          <div className="flex flex-col items-center gap-3">
            <PrimaryButton onClick={() => dispatch({ type: "next" })}>
              {story.length > 0 ? "Our story" : "View invitation"}
            </PrimaryButton>
            {story.length > 0 ? (
              <TextButton onClick={() => dispatch({ type: "skip" })}>Skip to invitation</TextButton>
            ) : null}
          </div>
        </Panel>
      ) : null}

      {ready && state.stage === "story" ? (
        <Panel visible={atStop} className="justify-end pb-[6dvh]">
          <section
            aria-live="polite"
            className="w-full max-w-[380px] border border-event-primary/50 bg-black/55 px-6 py-5 text-white backdrop-blur-sm"
          >
            <p className="font-sans text-[11px] tracking-[0.2em] text-event-primary">
              {String(state.storyIndex + 1).padStart(2, "0")} / {String(story.length).padStart(2, "0")}
            </p>
            <h2 className="mt-1 font-serif text-[26px] font-semibold leading-tight">
              {story[state.storyIndex]?.title}
            </h2>
            <p className="mt-2 font-serif text-[18px] leading-snug text-white/85">
              {story[state.storyIndex]?.body}
            </p>
          </section>
          <div className="mt-4 flex w-full max-w-[380px] items-center justify-between">
            <TextButton onClick={() => dispatch({ type: "back" })}>Back</TextButton>
            <PrimaryButton onClick={() => dispatch({ type: "next" })} compact>
              {state.storyIndex + 1 < story.length ? "Next" : "View invitation"}
            </PrimaryButton>
            <TextButton onClick={() => dispatch({ type: "skip" })}>Skip</TextButton>
          </div>
        </Panel>
      ) : null}

      {ready && showCard ? (
        <div
          className={`absolute inset-0 overflow-y-auto transition-opacity duration-700 ${atStop || reducedMotion ? "opacity-100" : "opacity-0"}`}
        >
          <div className="flex min-h-full flex-col items-center gap-6 px-5 py-10">
            {card}
            <div className="flex items-center gap-6">
              <TextButton onClick={() => dispatch({ type: "back" })}>Back</TextButton>
              <TextButton onClick={() => dispatch({ type: "replay" })}>Replay</TextButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Panel({
  visible,
  className,
  children,
}: {
  visible: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    // The panel lets taps through to nothing (the canvas is decorative), but its
    // buttons only become tappable once the camera has arrived and the panel shows.
    <div
      className={`pointer-events-none absolute inset-0 flex flex-col items-center px-5 transition-opacity duration-500 ${visible ? "opacity-100 [&_button]:pointer-events-auto" : "opacity-0"} ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

function PrimaryButton({
  onClick,
  children,
  compact,
}: {
  onClick: () => void;
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${compact ? "" : "mt-6"} min-h-11 rounded-full bg-event-primary px-7 font-sans text-[14px] font-semibold tracking-[0.04em] text-black shadow-[0_8px_30px_-8px_rgba(0,0,0,0.6)] transition-transform active:scale-95`}
    >
      {children}
    </button>
  );
}

function TextButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-11 px-2 font-sans text-[13px] font-medium tracking-[0.04em] text-white/85 underline-offset-4 [text-shadow:0_1px_6px_rgba(0,0,0,0.8)] hover:underline"
    >
      {children}
    </button>
  );
}

function Loader({ title }: { title: string }) {
  return (
    <div
      role="status"
      aria-label={`Loading ${title}`}
      className="fixed inset-0 flex flex-col items-center justify-center gap-6 bg-event-bg"
    >
      <p className="font-script text-[34px] text-white/90">{title}</p>
      <div className="h-[3px] w-40 overflow-hidden rounded-full bg-white/15">
        <div className="h-full w-1/3 animate-[loader_1.2s_ease-in-out_infinite] rounded-full bg-event-primary" />
      </div>
    </div>
  );
}
