import {
  AnimatedTextBlockWrapper,
  DialogWrapper,
  StaticTextBlockWrapper,
} from "@/components/DialogWrapper";
import React from "react";

export const NiceForm: React.FC = () => {
  return (
    <DialogWrapper>
      <AnimatedTextBlockWrapper>
        <StaticTextBlockWrapper
          imgSrc="/images/nice.png"
          title="Great job"
          titleClassName="sm:max-w-full bg-[linear-gradient(91deg,_#43BF8F_16.63%,_#FFF_86.96%)]"
          description="Santa has checked twice, and you're officially on the Nice List!  Keep being kind, and we'll see you again tomorrow!"
        />
      </AnimatedTextBlockWrapper>
    </DialogWrapper>
  );
};
