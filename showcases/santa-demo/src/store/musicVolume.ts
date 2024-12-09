import { atom } from "jotai";

export const musicVolumeAtom = atom<number>(0);
export const isMusicMutedAtom = atom<boolean>(false);
