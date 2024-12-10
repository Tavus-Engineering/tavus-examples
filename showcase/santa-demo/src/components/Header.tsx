import { useEffect, memo } from "react";
import { atom, useAtom } from "jotai";
import { Button } from "./ui/button";
import { Music } from "lucide-react";
import { isMusicMutedAtom, musicVolumeAtom } from "@/store/musicVolume";

const timeLeftAtom = atom({
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
});

export const Header = memo(() => {
  const [timeLeft, setTimeLeft] = useAtom(timeLeftAtom);
  const [musicVolume, setMusicVolume] = useAtom(musicVolumeAtom);
  const [isMuted, setIsMuted] = useAtom(isMusicMutedAtom);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const christmas = new Date(new Date().getFullYear(), 11, 25); // December 25th
      const now = new Date();
      const difference = christmas.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [setTimeLeft]);

  const toggleMusic = () => {
    if (!isMuted && musicVolume === 0) {
      setMusicVolume(0.3);
    } else {
      setIsMuted(!isMuted);
    }
  };

  return (
    <header className="flex w-full items-start justify-between">
      <img
        src="/images/logo.svg"
        alt="Tavus"
        className="relative h-6 sm:h-10"
      />
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex h-10 items-center rounded-xl border border-secondary/50 bg-secondary/10 px-1 backdrop-blur-sm sm:h-14 sm:px-2.5 ">
          <div className="flex w-12 flex-col items-center border-r border-secondary/50">
            <span className="font-santa text-lg !leading-none sm:text-2xl">
              {timeLeft.days}
            </span>
            <span className="text-2xxs uppercase sm:text-xxs">Days</span>
          </div>
          <div className="flex w-12 flex-col items-center border-r border-secondary/50">
            <span className="font-santa text-lg	!leading-none sm:text-2xl">
              {timeLeft.hours}
            </span>
            <span className="text-2xxs uppercase sm:text-xxs">Hrs</span>
          </div>
          <div className="flex w-12 flex-col items-center border-r border-secondary/50">
            <span className="font-santa text-lg	!leading-none sm:text-2xl">
              {timeLeft.minutes}
            </span>
            <span className="text-2xxs uppercase sm:text-xxs">Min</span>
          </div>
          <div className="flex w-12 flex-col items-center">
            <span className="font-santa text-lg	!leading-none sm:text-2xl">
              {timeLeft.seconds}
            </span>
            <span className="text-2xxs uppercase sm:text-xxs">Sec</span>
          </div>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMusic}
          className="relative size-10 sm:size-14"
        >
          <Music className="size-4 sm:size-6" />
          {(musicVolume === 0 || isMuted) && (
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45 text-2xl font-thin sm:text-4xl">
              /
            </span>
          )}
        </Button>
      </div>
    </header>
  );
});
