import { motion } from "framer-motion";
import { useDailyEvent } from "@daily-co/daily-react";
import { memo, useCallback, useMemo, useState } from "react";
import { useAtom } from "jotai";
import { cn } from "@/utils";
import nice from "@/assets/sounds/nice.mp3";
import naughty from "@/assets/sounds/naughty.mp3";
import { niceScoreAtom, naughtyScoreAtom } from "@/store/game";

const Typewriter = ({
  text,
  variant,
}: {
  text: string;
  variant: "naughty" | "nice";
}) => {
  const wordAnimation = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.5,
        staggerChildren: 0.08,
      },
    },
  };

  const characterAnimation = {
    hidden: {
      opacity: 0,
      y: 50,
    },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <motion.h3
      className={cn(
        "relative z-20 text-nowrap text-4xl font-medium",
        variant === "naughty" ? "text-[#FB254F]" : "text-[#43BD8F]",
      )}
      variants={wordAnimation}
      initial="hidden"
      animate="visible"
    >
      {variant === "naughty" && (
        <>
          <motion.span
            className="absolute -top-5 left-10 inline-block text-2xl leading-none"
            variants={characterAnimation}
          >
            🤥
          </motion.span>
          <motion.span
            className="absolute -top-3 left-20 inline-block text-xs  leading-none"
            variants={characterAnimation}
          >
            🤥
          </motion.span>
          <motion.span
            className="absolute -top-4 right-8 inline-block text-lg leading-none"
            variants={characterAnimation}
          >
            🤥
          </motion.span>
          <motion.span
            className="absolute -bottom-4 left-2 inline-block text-sm leading-none"
            variants={characterAnimation}
          >
            🤥
          </motion.span>
          <motion.span
            className="absolute -bottom-7 left-16 inline-block text-xl leading-none"
            variants={characterAnimation}
          >
            🤥
          </motion.span>
          <motion.span
            className="absolute -bottom-6 right-10 inline-block text-2xl leading-none"
            variants={characterAnimation}
          >
            🤥
          </motion.span>
          <motion.span
            className="absolute -bottom-3 right-2 inline-block text-sm leading-none"
            variants={characterAnimation}
          >
            🤥
          </motion.span>
        </>
      )}
      {variant === "nice" && (
        <>
          <motion.span
            className="absolute -left-7 -top-2 inline-block text-2xl leading-none"
            variants={characterAnimation}
          >
            😎
          </motion.span>
          <motion.span
            className="absolute -top-3 left-20 inline-block text-xs  leading-none"
            variants={characterAnimation}
          >
            😎
          </motion.span>
          <motion.span
            className="absolute -top-4 right-8 inline-block text-lg leading-none"
            variants={characterAnimation}
          >
            😎
          </motion.span>
          <motion.span
            className="absolute -bottom-4 left-2 inline-block text-sm leading-none"
            variants={characterAnimation}
          >
            😎
          </motion.span>
          <motion.span
            className="absolute -bottom-0 -right-7 inline-block text-xl leading-none"
            variants={characterAnimation}
          >
            😎
          </motion.span>
          <motion.span
            className="absolute -bottom-6 right-2 inline-block text-2xl leading-none"
            variants={characterAnimation}
          >
            😎
          </motion.span>
        </>
      )}

      {text.split("").map((character, index) => {
        return (
          <motion.span
            className="text-shadow inline-block"
            key={index}
            variants={characterAnimation}
          >
            {character}
          </motion.span>
        );
      })}
    </motion.h3>
  );
};

export const Game: React.FC = memo(() => {
  const [niceScore, setNiceScore] = useAtom(niceScoreAtom);
  const [naughtyScore, setNaughtyScore] = useAtom(naughtyScoreAtom);
  const [showNice, setShowNice] = useState(false);
  const [showNaughty, setShowNaughty] = useState(false);
  const audioNice = useMemo(() => {
    const audioObj = new Audio(nice);
    audioObj.volume = 0.7;
    return audioObj;
  }, []);
  const audioNaughty = useMemo(() => {
    const audioObj = new Audio(naughty);
    audioObj.volume = 0.7;
    return audioObj;
  }, []);

  const getScorePoint = (score: number) => {
    if (score > 0.75) return 0.75;
    if (score > 0.5) return 0.5;
    if (score > 0.25) return 0.25;
    if (score > 0) return 0.1;
    if (score === 0) return 0;
    if (score < -0.75) return -0.75;
    if (score < -0.5) return -0.5;
    if (score < -0.25) return -0.25;
    if (score < 0) return -0.1;
    return 0;
  };

  useDailyEvent(
    "app-message",
    useCallback(
      (ev: {
        data?: {
          event_type: string;
          properties?: { arguments?: { score?: number } };
        };
      }) => {
        if (ev.data?.event_type === "conversation.tool_call") {
          const score = ev.data?.properties?.arguments?.score ?? 0;
          const scorePoint = getScorePoint(score);
          console.log({ score, scorePoint });

          if (score > 0) {
            if (scorePoint > niceScore) {
              setShowNice(true);
              setTimeout(() => {
                setShowNice(false);
              }, 2000);
              audioNice.play().catch((error) => {
                console.warn("Audio playback failed:", error);
              });
              setNiceScore(scorePoint);
            }
          } else if (score < 0) {
            if (scorePoint !== naughtyScore) {
              setShowNaughty(true);
              audioNaughty.play().catch((error) => {
                console.warn("Audio playback failed:", error);
              });
              setTimeout(() => {
                setShowNaughty(false);
              }, 2000);
              setNaughtyScore(scorePoint);
            }
          }
        }
      },
      [niceScore, naughtyScore],
    ),
  );

  return (
    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center border border-white/20 bg-[rgba(28,18,30,0.80)] p-4 pt-3">
      <div className="flex w-full max-w-[628px] items-center justify-center gap-3 sm:gap-4">
        <div className="relative flex items-center justify-center gap-1">
          <span className="w-8">
            <img
              src="/images/smallNaughty.png"
              alt="Naughty"
              className="size-8"
            />
          </span>
          <span className="font-medium">Naughty</span>
          <div className="absolute -top-24 left-0 z-20 -rotate-12 lg:-left-1/2">
            {showNaughty && <Typewriter text="NAUGHTY" variant="naughty" />}
          </div>
        </div>

        <div className="flex w-full items-center justify-between gap-1">
          <div className="grid w-full grid-cols-4 items-center justify-between gap-1">
            <div
              className={cn(
                "h-2 w-full rounded-3xl bg-white/20 transition-all duration-300",
                {
                  "bg-[linear-gradient(271deg,_#F233AB_-15.44%,#FF1E22_130.93%)]":
                    naughtyScore < -0.75,
                },
              )}
            ></div>
            <div
              className={cn(
                "h-2 w-full rounded-3xl bg-white/20 transition-all duration-300",
                {
                  "bg-[linear-gradient(271deg,_#F233AB_-15.44%,#FF1E22_130.93%)]":
                    naughtyScore < -0.5,
                },
              )}
            ></div>
            <div
              className={cn(
                "h-2 w-full rounded-3xl bg-white/20 transition-all duration-300",
                {
                  "bg-[linear-gradient(271deg,_#F233AB_-15.44%,#FF1E22_130.93%)]":
                    naughtyScore < -0.25,
                },
              )}
            ></div>
            <div
              className={cn(
                "h-2 w-full rounded-3xl bg-white/20 transition-all duration-300",
                {
                  "bg-[linear-gradient(271deg,_#F233AB_-15.44%,#FF1E22_130.93%)]":
                    naughtyScore < 0,
                },
              )}
            ></div>
          </div>
          <div className="grid w-full grid-cols-4 items-center justify-between gap-1">
            <div
              className={cn(
                "h-2 w-full rounded-3xl bg-white/20 transition-all duration-300",
                {
                  "bg-[linear-gradient(90deg,_#65DFD7_0%,_#37B478_127.98%)]":
                    niceScore > 0,
                },
              )}
            ></div>
            <div
              className={cn(
                "h-2 w-full rounded-3xl bg-white/20 transition-all duration-300",
                {
                  "bg-[linear-gradient(90deg,_#65DFD7_0%,_#37B478_127.98%)]":
                    niceScore > 0.25,
                },
              )}
            ></div>
            <div
              className={cn(
                "h-2 w-full rounded-3xl bg-white/20 transition-all duration-300",
                {
                  "bg-[linear-gradient(90deg,_#65DFD7_0%,_#37B478_127.98%)]":
                    niceScore > 0.5,
                },
              )}
            ></div>
            <div
              className={cn(
                "h-2 w-full rounded-3xl bg-white/20 transition-all duration-300",
                {
                  "bg-[linear-gradient(90deg,_#65DFD7_0%,_#37B478_127.98%)]":
                    niceScore > 0.75,
                },
              )}
            ></div>
          </div>
        </div>

        <div className="relative flex items-center justify-center gap-1">
          <span className="font-medium">Nice</span>
          <span className="w-8">
            <img src="/images/smallNice.png" alt="Nice" className="size-8" />
          </span>
          <div className="absolute -left-1/2 -top-20 z-20 rotate-6">
            {showNice && <Typewriter text="NICE" variant="nice" />}
          </div>
        </div>
      </div>
    </div>
  );
});
