import { useVideoTrack, DailyVideo } from '@daily-co/daily-react';
import { cn } from '@/lib/utils';

export const Video = ({ id, className }: { id: string, className?: string }) => {
  const videoState = useVideoTrack(id);

  return (
    <DailyVideo
      automirror
      sessionId={id}
      type='video'
      className={cn('h-auto bg-slate-500/80 rounded-md', className, {
        hidden: videoState.isOff,
      })}
    />
  );
}