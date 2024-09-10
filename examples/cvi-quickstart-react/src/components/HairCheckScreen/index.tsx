import { useEffect } from 'react';
import { useDaily } from '@daily-co/daily-react';
import { useLocalSessionId } from '@daily-co/daily-react';
import { CameraSettings } from '../CameraSettings';
import { Video } from '../Video';

export const HairCheckScreen = ({ handleJoin, handleEnd }:
  {
    handleJoin: () => void,
    handleEnd: () => void
  }
) => {
  const localSessionId = useLocalSessionId();
  const daily = useDaily();

  useEffect(() => {
    if (daily) {
      daily?.startCamera({ startVideoOff: false, startAudioOff: false });
    }
  }, [daily, localSessionId]);

  return <div>
    <Video id={localSessionId} className='max-h-[70vh]' />
    <CameraSettings
      actionLabel='Join Call'
      onAction={handleJoin}
      cancelLabel='Cancel'
      onCancel={handleEnd}
    />
  </div>
};