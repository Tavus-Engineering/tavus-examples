import { DailyAudio, useAudioTrack, useDaily, useLocalSessionId, useParticipantIds, useVideoTrack } from '@daily-co/daily-react';
import { Video } from '../Video';
import { useState } from 'react';
import type { IConversation } from '@/types';
import { createConversation } from '@/api/createConversation';
import { Button } from '../ui/button';
import { endConversation } from '@/api/endConversation';
import { Loader2, Mic, MicOff, X } from 'lucide-react';

export const Call = () => {
  const remoteParticipantIds = useParticipantIds({ filter: 'remote' });
  const localParticipantId = useLocalSessionId();
  const localAudio = useAudioTrack(localParticipantId);
  const daily = useDaily();
  const isMicEnabled = !localAudio.isOff;
  // useEffect(() => {
  //   if (localAudio.isOff && daily) {
  //     daily.setLocalAudio(true);
  //   }
  // }, [localAudio])

  const toggleMicrophone = () => {
    daily?.setLocalAudio(!isMicEnabled);
  };

  return <div>
    <div className='relative'>
      {
        remoteParticipantIds.length > 0 ?
          <Video
            id={remoteParticipantIds[0]}
          /> :
          <div className='relative flex items-center justify-center h-40'>
            <Loader2 className='size-10 animate-spin' />
          </div>
      }
    </div>
    <Button onClick={toggleMicrophone} variant="outline" size="sm" className='absolute top-0 right-8 z-50 p-1 size-6' >
      {!isMicEnabled ? <MicOff className='size-4' /> : <Mic className='size-4' />}
    </Button>
    <DailyAudio />
  </div>
}

export const CallScreen = () => {
  const daily = useDaily();
  const [conversation, setConversation] = useState<IConversation | null>(null);


  const handleJoin = (conversationUrl: string) => {
    if (daily) {
      daily.join({
        url: conversationUrl,
        startAudioOff: false,
        startVideoOff: true,
      });
    }
  };

  const handleCreateConversation = async () => {
    try {
      const newConversation = await createConversation();
      setConversation(newConversation);
      handleJoin(newConversation.input.room_url);
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  const handleLeave = async () => {
    void endConversation(conversation?.id || '');
    await daily?.leave();
    await daily?.destroy()
    setConversation(null);
  };

  return (
    <div className='fixed bottom-0 right-4'>
      <div className='relative flex flex-col items-center justify-center '>
        {!conversation ? (
          <Button onClick={handleCreateConversation} variant="destructive" className='mb-8'>
            Start Shopping
          </Button>
        ) : (
          <>
            <Call />
            <Button onClick={handleLeave} variant="destructive" size="icon" className='absolute top-0 right-0 p-1 size-6' >
              <X className='size-5' />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
