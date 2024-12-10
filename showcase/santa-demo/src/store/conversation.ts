import { atom } from "jotai";
import { IConversation } from "../types";

const initialConversationState: IConversation | null = null;

export const conversationAtom = atom<IConversation | null>(
  initialConversationState,
);
