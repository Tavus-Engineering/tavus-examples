import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useAtom } from "jotai";
import { isMusicMutedAtom, musicVolumeAtom } from "@/store/musicVolume";
import background from "@/assets/sounds/background.mp3";
import { screenAtom } from "@/store/screens";

const BackgroundAudio: React.FC = () => {
  const [volume, setMusicVolume] = useAtom(musicVolumeAtom);
  const [isMuted] = useAtom(isMusicMutedAtom);
  const fadeInterval = useRef<number>();
  const [screen] = useAtom(screenAtom);
  const wasPlayingRef = useRef(false);

  const audio = useMemo(() => {
    const audioObj = new Audio(background);
    audioObj.loop = true;
    audioObj.volume = 0;
    return audioObj;
  }, []);

  const fadeIn = (from = 0, to = volume) => {
    if (audio.muted && to !== 0) {
      audio.muted = false;
    }
    let current = from;
    const steps = Math.ceil(2000 / 50);
    const increment = (to - from) / steps;

    clearInterval(fadeInterval.current);

    fadeInterval.current = window.setInterval(() => {
      current += increment;
      if (current >= to) {
        audio.volume = to;
        if (to === 0) {
          audio.muted = true;
        }
        clearInterval(fadeInterval.current);
      } else {
        audio.volume = current;
      }
    }, 50);
  };

  const handlePlayMusic = useCallback(() => {
    audio
      .play()
      .then(() => {
        fadeIn(0, 0.3);
        setMusicVolume(0.3);
      })
      .catch(console.warn);
  }, [audio, fadeIn, setMusicVolume]);

  useEffect(() => {
    if (audio.currentTime) {
      fadeIn(audio.volume, volume);
    }
    if (audio.currentTime === 0 && volume !== 0) {
      handlePlayMusic();
    }
  }, [audio, volume]);

  useEffect(() => {
    if (isMuted) {
      audio.muted = true;
    } else {
      audio.muted = false;
    }
  }, [audio, isMuted]);

  useEffect(() => {
    if (
      screen.currentScreen === "conversation" &&
      audio.volume !== 0 &&
      !isMuted
    ) {
      fadeIn(audio.volume, 0);
    }
    if (
      (screen.currentScreen === "niceForm" ||
        screen.currentScreen === "naughtyForm") &&
      !isMuted
    ) {
      fadeIn(audio.volume, 0.3);
    }
  }, [audio, screen]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        wasPlayingRef.current = !audio.paused;
        audio.pause();
      } else {
        if (wasPlayingRef.current && !isMuted) {
          audio.play().catch(console.warn);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [audio, isMuted]);

  return null;
};

export default BackgroundAudio;
