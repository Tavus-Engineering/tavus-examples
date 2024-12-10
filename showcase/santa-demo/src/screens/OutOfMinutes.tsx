import {
  DialogWrapper,
  AnimatedTextBlockWrapper,
  StaticTextBlockWrapper,
} from "@/components/DialogWrapper";
import React from "react";

export const OutOfMinutes: React.FC = () => {
  return (
    <DialogWrapper>
      <AnimatedTextBlockWrapper>
        <StaticTextBlockWrapper
          imgSrc="/images/clock.png"
          title="You've already chatted with Santa today"
          description="Come back tomorrow to talk to him again. He'll be waiting!"
        />
      </AnimatedTextBlockWrapper>
    </DialogWrapper>
  );
};
