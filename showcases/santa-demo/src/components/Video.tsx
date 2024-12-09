import { cn } from "@/lib/utils";
import { DailyVideo, useVideoTrack } from "@daily-co/daily-react";

export default function Video({
  id,
  className,
  tileClassName,
}: {
  id: string;
  className?: string;
  tileClassName?: string;
}) {
  const videoState = useVideoTrack(id);

  return (
    <div
      className={cn("bg-[rgba(248,250,252,0.08)]", className, {
        "hidden size-0": videoState.isOff,
      })}
    >
      <DailyVideo
        automirror
        sessionId={id}
        type="video"
        className={cn("size-full object-cover", tileClassName, {
          hidden: videoState.isOff,
        })}
      />
    </div>
  );
}
