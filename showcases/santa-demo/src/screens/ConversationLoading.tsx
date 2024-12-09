import {
  AnimatedTextBlockWrapper,
  DialogWrapper,
} from "@/components/DialogWrapper";
import { SnowLoader } from "@/components/SnowLoader";
import React from "react";

export const ConversationLoading: React.FC = () => {
  return (
    <DialogWrapper>
      <AnimatedTextBlockWrapper>
        <div className="flex size-full items-center justify-center">
          <SnowLoader />
        </div>
      </AnimatedTextBlockWrapper>
    </DialogWrapper>
  );
};
