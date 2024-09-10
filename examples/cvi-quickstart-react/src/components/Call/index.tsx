import { useState } from 'react';
import { DailyAudio, useParticipantIds, useLocalSessionId } from '@daily-co/daily-react';
import { Minimize, Maximize } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Video } from '../Video';
import { Button } from '../ui/button';

export const Call = () => {
  const remoteParticipantIds = useParticipantIds({ filter: 'remote' });
  const localSessionId = useLocalSessionId();
  const [mode, setMode] = useState<'full' | 'minimal'>('full');


  const handleToggleMode = () => {
    setMode(prev => prev === 'full' ? 'minimal' : 'full');
  }

  return <>
    <div className={cn("flex items-center justify-center", {
      'fixed bottom-20 right-20': mode === 'minimal',
    })}>
      <div className='relative'>
        <Button variant='outline' onClick={handleToggleMode} className='absolute top-2 right-2 z-10 gap-2' size='sm'>
          {mode === 'full' ? 'Minimize' : 'Maximize'}
          {mode === 'full' ? <Minimize className='size-4' /> : <Maximize className='size-4' />}
        </Button>
        {
          remoteParticipantIds.length > 0 ?
            <Video
              id={remoteParticipantIds[0]}
              className={
                cn({
                  'max-h-[50vh] min-h-[20rem]': mode === 'full',
                  'max-h-[15rem]': mode === 'minimal',
                })
              }
            /> :
            <div className='relative flex items-center justify-center size-[50vh]'>
              <p className='text-2xl text-black'>Waiting for others to join...</p>
            </div>
        }
        {localSessionId && (
          <Video
            id={localSessionId}
            className={cn('absolute bottom-2 right-2', {
              'max-h-40': mode === 'full',
              'max-h-20': mode === 'minimal',
            })}
          />
        )}
      </div>
    </div>
    <DailyAudio />
  </>
}