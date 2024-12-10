import { DialogWrapper } from "@/components/DialogWrapper";
import {
  DailyAudio,
  useDaily,
  useLocalSessionId,
  useParticipantIds,
  useVideoTrack,
  useAudioTrack,
} from "@daily-co/daily-react";
import React, { useCallback, useEffect, useState } from "react";
import Video from "@/components/Video";
import { conversationAtom } from "@/store/conversation";
import { useAtom, useAtomValue } from "jotai";
import { screenAtom } from "@/store/screens";
import { Button } from "@/components/ui/button";
import { endConversation } from "@/api/endConversation";
import {
  MicIcon,
  MicOffIcon,
  VideoIcon,
  VideoOffIcon,
  PhoneIcon,
} from "lucide-react";
import {
  clearSessionTime,
  getSessionTime,
  setSessionStartTime,
  updateSessionEndTime,
} from "@/utils";
import { Timer } from "@/components/Timer";
import { TIME_LIMIT } from "@/config";
import { niceScoreAtom } from "@/store/game";
import { naughtyScoreAtom } from "@/store/game";
import { apiTokenAtom } from "@/store/tokens";

const timeToGoPhrases = [
  "I'll need to dash off soon—there’s still so much to prepare for Christmas! But let’s make these last moments count.",
  "The elves are calling me back to the workshop soon, but I've got a little more time for you!",
  "I'll be heading out soon—the reindeer are getting restless—but I'd love to hear one more thing before I go!",
];

const outroPhrases = [
  "It's time for me to go now—Christmas magic doesn't make itself! Take care, and I'll see you soon!",
  "I've got to get back to the North Pole—the workshop needs me! Be good, and Merry Christmas until we meet again!",
  "I must say goodbye for now—the magic of Christmas calls! Stay on the nice list, and I'll see you soon!",
];

export const Conversation: React.FC = () => {
  const [conversation, setConversation] = useAtom(conversationAtom);
  const [, setScreenState] = useAtom(screenAtom);
  const [naughtyScore] = useAtom(naughtyScoreAtom);
  const [niceScore] = useAtom(niceScoreAtom);
  const token = useAtomValue(apiTokenAtom);

  const daily = useDaily();
  const localSessionId = useLocalSessionId();
  const localVideo = useVideoTrack(localSessionId);
  const localAudio = useAudioTrack(localSessionId);
  const isCameraEnabled = !localVideo.isOff;
  const isMicEnabled = !localAudio.isOff;
  const remoteParticipantIds = useParticipantIds({ filter: "remote" });
  const [start, setStart] = useState(false);

  useEffect(() => {
    if (remoteParticipantIds.length && !start) {
      setStart(true);
      setTimeout(() => daily?.setLocalAudio(true), 4000);
    }
  }, [remoteParticipantIds, start]);

  useEffect(() => {
    if (!remoteParticipantIds.length || !start) return;

    setSessionStartTime();
    const interval = setInterval(() => {
      const time = getSessionTime();
      if (time === TIME_LIMIT - 60) {
        daily?.sendAppMessage({
          message_type: "conversation",
          event_type: "conversation.echo",
          conversation_id: conversation?.conversation_id,
          properties: {
            modality: "text",
            text:
              timeToGoPhrases[Math.floor(Math.random() * 3)] ??
              timeToGoPhrases[0],
          },
        });
      }
      if (time === TIME_LIMIT - 10) {
        daily?.sendAppMessage({
          message_type: "conversation",
          event_type: "conversation.echo",
          conversation_id: conversation?.conversation_id,
          properties: {
            modality: "text",
            text:
              outroPhrases[Math.floor(Math.random() * 3)] ?? outroPhrases[0],
          },
        });
      }
      if (time >= TIME_LIMIT) {
        leaveConversation();
        clearInterval(interval);
      } else {
        updateSessionEndTime();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [remoteParticipantIds, start]);

  useEffect(() => {
    if (conversation?.conversation_url) {
      daily
        ?.join({
          url: conversation.conversation_url,
          startVideoOff: false,
          startAudioOff: true,
        })
        .then(() => {
          daily?.setLocalAudio(false);
        });
    }
  }, [conversation?.conversation_url]);

  const toggleVideo = useCallback(() => {
    daily?.setLocalVideo(!isCameraEnabled);
  }, [daily, isCameraEnabled]);

  const toggleAudio = useCallback(() => {
    daily?.setLocalAudio(!isMicEnabled);
  }, [daily, isMicEnabled]);

  const leaveConversation = useCallback(() => {
    daily?.leave();
    daily?.destroy();
    if (conversation?.conversation_id && token) {
      endConversation(token, conversation.conversation_id);
    }
    setConversation(null);
    clearSessionTime();

    const naughtyScorePositive = Math.abs(naughtyScore);
    if (naughtyScorePositive > niceScore) {
      setScreenState({ currentScreen: "naughtyForm" });
    } else {
      setScreenState({ currentScreen: "niceForm" });
    }
  }, [daily, token]);

  return (
    <DialogWrapper>
      <div className="absolute inset-0 size-full">
        <Timer />
        {remoteParticipantIds?.length > 0 && (
          <Video
            id={remoteParticipantIds[0]}
            className="size-full"
            tileClassName="!object-cover"
          />
        )}
        {localSessionId && (
          <Video
            id={localSessionId}
            tileClassName="!object-cover"
            className="absolute bottom-20 right-4 aspect-video h-40 w-24 overflow-hidden rounded-lg border-2 border-primary sm:bottom-12 lg:h-auto lg:w-52"
          />
        )}
        <div className="absolute bottom-8 right-1/2 z-10 flex translate-x-1/2 justify-center gap-4">
          <Button
            size="icon"
            className=""
            variant="secondary"
            onClick={toggleAudio}
          >
            {!isMicEnabled ? (
              <MicOffIcon className="size-6" />
            ) : (
              <MicIcon className="size-6" />
            )}
          </Button>
          <Button
            size="icon"
            className=""
            variant="secondary"
            onClick={toggleVideo}
          >
            {!isCameraEnabled ? (
              <VideoOffIcon className="size-6" />
            ) : (
              <VideoIcon className="size-6" />
            )}
          </Button>
          <Button
            size="icon"
            className="bg-[rgba(251,36,71,0.80)] backdrop-blur hover:bg-[rgba(251,36,71,0.60)]"
            variant="secondary"
            onClick={leaveConversation}
          >
            <PhoneIcon className="size-6 rotate-[135deg]" />
          </Button>
        </div>
        <DailyAudio />
      </div>
    </DialogWrapper>
  );
};
