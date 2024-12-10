import {
  AnimatedTextBlockWrapper,
  DialogWrapper,
  StaticTextBlockWrapper,
} from "@/components/DialogWrapper";
import React from "react";

export const SeasonEnded: React.FC = () => {
  return (
    <DialogWrapper>
      <AnimatedTextBlockWrapper>
        <StaticTextBlockWrapper
          imgSrc="/images/snowman.png"
          title="Santa is on vacation"
          description="He'll be back next year to hear your wishes and spread the magic once again. See you soon! 🎄✨"
        />
      </AnimatedTextBlockWrapper>
    </DialogWrapper>
  );
};
