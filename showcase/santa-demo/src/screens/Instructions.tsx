import { createConversation } from "@/api";
import {
  DialogWrapper,
  AnimatedTextBlockWrapper,
} from "@/components/DialogWrapper";
import { screenAtom } from "@/store/screens";
import { conversationAtom } from "@/store/conversation";
import React, { useCallback, useMemo, useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import { AlertTriangle, Mic, Video } from "lucide-react";
import { useDaily, useDailyEvent, useDevices } from "@daily-co/daily-react";
import { ConversationLoading } from "./ConversationLoading";
import { ConversationError } from "./ConversationError";
import buttonBell from "@/assets/sounds/button_bell.mp3";
import { Button } from "@/components/ui/button";
import { apiTokenAtom } from "@/store/tokens";

const useCreateConversationMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setScreenState] = useAtom(screenAtom);
  const [, setConversation] = useAtom(conversationAtom);
  const token = useAtomValue(apiTokenAtom);

  const createConversationRequest = async () => {
    try {
      if (!token) {
        throw new Error("Token is required");
      }
      const conversation = await createConversation(token);
      setConversation(conversation);
      setScreenState({ currentScreen: "conversation" });
    } catch (error) {
      setError(error as string);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    createConversationRequest,
  };
};

export const Instructions: React.FC = () => {
  const daily = useDaily();
  const { currentMic, setMicrophone, setSpeaker } = useDevices();
  const { createConversationRequest } = useCreateConversationMutation();
  const [getUserMediaError, setGetUserMediaError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [error, setError] = useState(false);
  const audio = useMemo(() => {
    const audioObj = new Audio(buttonBell);
    audioObj.volume = 0.7;
    return audioObj;
  }, []);
  useDailyEvent(
    "camera-error",
    useCallback(() => {
      setGetUserMediaError(true);
    }, []),
  );

  const handleClick = async () => {
    try {
      setIsLoading(true);
      audio.currentTime = 0;
      audio.play().catch(() => {
        console.warn("Audio playback failed:");
      });
      let micDeviceId = currentMic?.device?.deviceId;
      if (!micDeviceId) {
        const res = await daily?.startCamera({
          startVideoOff: false,
          startAudioOff: false,
          audioSource: "default",
        });
        // @ts-expect-error deviceId exists in the MediaDeviceInfo
        const isDefaultMic = res?.mic?.deviceId === "default";
        // @ts-expect-error deviceId exists in the MediaDeviceInfo
        const isDefaultSpeaker = res?.speaker?.deviceId === "default";
        // @ts-expect-error deviceId exists in the MediaDeviceInfo
        micDeviceId = res?.mic?.deviceId;

        if (isDefaultMic) {
          if (!isDefaultMic) {
            setMicrophone("default");
          }
          if (!isDefaultSpeaker) {
            setSpeaker("default");
          }
        }
      }
      if (micDeviceId) {
        setIsLoadingConversation(true);
        await createConversationRequest();
      } else {
        setGetUserMediaError(true);
      }
    } catch (error) {
      console.error(error);
      setError(true);
    } finally {
      setIsLoading(false);
      setIsLoadingConversation(false);
    }
  };

  if (isLoadingConversation) {
    return <ConversationLoading />;
  }
  if (error) {
    return <ConversationError onClick={handleClick} />;
  }

  return (
    <DialogWrapper>
      <AnimatedTextBlockWrapper>
        <h1 className="mb-6 bg-text-primary bg-clip-text pt-1 text-center font-santa text-4.5xl text-transparent sm:text-6.5xl lg:text-7xl">
          Santa's Ready for Anything
        </h1>
        <p className="max-w-[650px] text-center  text-base sm:text-lg">
          See if Santa can keep up with the holiday chaos—share your wishlist,
          ask crazy questions, test his patience, and find out if you’ve been
          naughty or nice!
        </p>
        {/* TODO: add tooltip to provide access to mic */}
        <Button
          onClick={handleClick}
          className="relative my-8 sm:my-10"
          disabled={isLoading}
        >
          Start Conversation with Santa
          {getUserMediaError && (
            <div className="absolute  -top-1 left-0 right-0 flex items-center gap-1 text-wrap rounded-lg border bg-red-500 p-2 text-white backdrop-blur-sm">
              <AlertTriangle className="text-red size-4" />
              <p>
                To chat with Santa, please allow microphone access. Check your
                browser settings.
              </p>
            </div>
          )}
        </Button>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:gap-6">
          <div className="flex items-center gap-2">
            <Mic className="size-6 text-primary" />
            Mic access is required
          </div>
          <div className="flex items-center gap-2">
            <Video className="size-6 text-primary" />
            Camera access is required
          </div>
        </div>
        <span className="absolute bottom-6 px-4 text-sm opacity-60 sm:bottom-8 sm:px-8">
          By starting a conversation, I accept the Terms of Use and acknowledge
          the Privacy Policy.
        </span>
      </AnimatedTextBlockWrapper>
    </DialogWrapper>
  );
};
