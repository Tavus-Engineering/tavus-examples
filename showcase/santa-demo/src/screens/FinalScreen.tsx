import {
  AnimatedTextBlockWrapper,
  DialogWrapper,
  StaticTextBlockWrapper,
} from "@/components/DialogWrapper";
import React from "react";

export const FinalScreen: React.FC = () => {
  return (
    <DialogWrapper>
      <AnimatedTextBlockWrapper>
        <StaticTextBlockWrapper
          imgSrc="/images/email.png"
          title="Santa is packing up your transcript and wishlist"
          description="It'll arrive in your inbox shortly!"
        />
      </AnimatedTextBlockWrapper>
    </DialogWrapper>
  );
};
