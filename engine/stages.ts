import type { Stage } from "./types";

/**
 * Guest journey state machine:
 *   envelope → room → story 1…n → card
 * "skip" jumps to the card from anywhere; "replay" returns to the envelope.
 */
export type EngineState = {
  stage: Stage;
  /** 0-based index of the story panel shown while stage === "story". */
  storyIndex: number;
};

export type EngineAction =
  | { type: "open" }
  | { type: "next" }
  | { type: "back" }
  | { type: "skip" }
  | { type: "replay" };

export const initialState: EngineState = { stage: "envelope", storyIndex: 0 };

export function createReducer(storyCount: number) {
  return function reduce(state: EngineState, action: EngineAction): EngineState {
    switch (action.type) {
      case "open":
        return state.stage === "envelope" ? { stage: "room", storyIndex: 0 } : state;

      case "next":
        if (state.stage === "envelope") return { stage: "room", storyIndex: 0 };
        if (state.stage === "room") {
          return storyCount > 0
            ? { stage: "story", storyIndex: 0 }
            : { stage: "card", storyIndex: 0 };
        }
        if (state.stage === "story") {
          return state.storyIndex + 1 < storyCount
            ? { stage: "story", storyIndex: state.storyIndex + 1 }
            : { stage: "card", storyIndex: state.storyIndex };
        }
        return state;

      case "back":
        if (state.stage === "card") {
          return storyCount > 0
            ? { stage: "story", storyIndex: storyCount - 1 }
            : { stage: "room", storyIndex: 0 };
        }
        if (state.stage === "story") {
          return state.storyIndex > 0
            ? { stage: "story", storyIndex: state.storyIndex - 1 }
            : { stage: "room", storyIndex: 0 };
        }
        return state;

      case "skip":
        return { stage: "card", storyIndex: state.storyIndex };

      case "replay":
        return initialState;
    }
  };
}

/** The camera stop name for a given state, e.g. "story-2". */
export function stopFor(state: EngineState): string {
  return state.stage === "story" ? `story-${state.storyIndex + 1}` : state.stage;
}
