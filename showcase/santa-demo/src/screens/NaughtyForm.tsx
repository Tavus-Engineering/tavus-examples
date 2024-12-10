import {
  AnimatedTextBlockWrapper,
  DialogWrapper,
  StaticTextBlockWrapper,
} from "@/components/DialogWrapper";
import React from "react";

export const NaughtyForm: React.FC = () => {
  return (
    <DialogWrapper>
      <AnimatedTextBlockWrapper>
        <StaticTextBlockWrapper
          imgSrc="/images/naughty.png"
          title="You're almost there"
          titleClassName="sm:max-w-full bg-[linear-gradient(91deg,_#FB2448_0.48%,_#FFF_85.97%)]"
          description="But for now you're on the Naughty List! Try spreading more kindness and Santa will check again tomorrow!"
        />
      </AnimatedTextBlockWrapper>
    </DialogWrapper>
  );
};
