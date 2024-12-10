import {
  AnimatedTextBlockWrapper,
  DialogWrapper,
  StaticTextBlockWrapper,
} from "@/components/DialogWrapper";
import React from "react";

export const Outage: React.FC = () => {
  return (
    <DialogWrapper>
      <AnimatedTextBlockWrapper>
        <StaticTextBlockWrapper
          imgSrc="/images/gift.png"
          title="Santa's Busy Preparing Gifts"
          titleClassName="sm:max-w-full"
          description="Santa's workshop is a bit overwhelmed. Hang tight — we'll fix this soon and bring back the magic!"
        />
      </AnimatedTextBlockWrapper>
    </DialogWrapper>
  );
};
