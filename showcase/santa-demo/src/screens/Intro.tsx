import { AnimatedWrapper } from "@/components/DialogWrapper";
import React from "react";
import { useAtom } from "jotai";
import { screenAtom } from "@/store/screens";
import { Video } from "lucide-react";
import AudioButton from "@/components/AudioButton";
import santaVideo from "@/assets/video/introBGVideo.mp4";
import { musicVolumeAtom } from "@/store/musicVolume";
import { apiTokenAtom } from "@/store/tokens";
import { Input } from "@/components/ui/input";

export const Intro: React.FC = () => {
  const [, setScreenState] = useAtom(screenAtom);
  const [musicVolume, setMusicVolume] = useAtom(musicVolumeAtom);
  const [token, setToken] = useAtom(apiTokenAtom);

  const handleClick = () => {
    if (musicVolume === 0) {
      setMusicVolume(0.3);
    }
    setScreenState({ currentScreen: "instructions" });
  };

  return (
    <AnimatedWrapper>
      <div className="flex size-full flex-col items-center justify-center">
        <video
          src={santaVideo}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-primary-overlay" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="flex flex-col gap-2 items-center backdrop-blur-sm rounded-md p-4">
            <Input
              type="text"
              value={token || ""}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter API Token"
              className="w-64 bg-white text-black"
            />

            <p className="text-sm text-white">
              Don't have a token?{" "}
              <a
                href="https://platform.tavus.io/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary"
              >
                Sign up for a Tavus API Key
              </a>
            </p>

          </div>
          <AudioButton
            onClick={handleClick}
            className="relative z-10"
            disabled={!token}
          >
            <Video className="size-5" />
            Talk to Santa
          </AudioButton>
        </div>
      </div>
    </AnimatedWrapper>
  );
};
