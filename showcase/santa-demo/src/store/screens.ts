import { atom } from "jotai";

type Screen =
  | "introLoading"
  | "outage"
  | "outOfMinutes"
  | "intro"
  | "instructions"
  | "conversation"
  | "conversationError"
  | "niceForm"
  | "naughtyForm"
  | "finalScreen"
  | "seasonEnded";

interface ScreenState {
  currentScreen: Screen;
}

const initialScreenState: ScreenState = {
  currentScreen: "introLoading",
};

export const screenAtom = atom<ScreenState>(initialScreenState);
