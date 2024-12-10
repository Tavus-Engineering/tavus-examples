import { cn } from "@/utils";
import { motion } from "framer-motion";

const desktopClassName = "lg:aspect-video lg:max-h-none lg:h-auto";
const tabletClassName = "sm:max-h-[680px]"; // sm
const mobileClassName = "w-full h-full max-h-[500px] max-w-5xl";

export const DialogWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2.5xl border-2 border-primary bg-wrapper shadow-wrapper-shadow backdrop-blur-sm",
        desktopClassName,
        tabletClassName,
        mobileClassName,
      )}
    >
      <img
        src="/images/dialogBlur.svg"
        alt="santa"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {children}
    </div>
  );
};

export const AnimatedWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        scale: {
          duration: 0.5,
          ease: [0.34, 1.56, 0.64, 1],
        },
      }}
      className={cn(
        "relative overflow-hidden rounded-2.5xl border-2 border-primary bg-wrapper shadow-wrapper-shadow backdrop-blur-sm",
        desktopClassName,
        tabletClassName,
        mobileClassName,
      )}
    >
      <img
        src="/images/dialogBlur.svg"
        alt="santa"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {children}
    </motion.div>
  );
};

export const TextBlockWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="relative flex size-full flex-col items-center justify-center px-2.5 py-6 sm:p-8">
      {children}
    </div>
  );
};

export const AnimatedTextBlockWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        scale: {
          duration: 0.5,
          ease: [0.34, 1.56, 0.64, 1],
        },
      }}
      className="relative flex size-full flex-col items-center justify-center px-2.5 py-6 sm:p-8"
    >
      {children}
    </motion.div>
  );
};

export const StaticTextBlockWrapper = ({
  imgSrc,
  title,
  titleClassName,
  description,
  descriptionClassName,
  children,
}: {
  imgSrc: string;
  title: string;
  titleClassName?: string;
  description: string;
  descriptionClassName?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <img
        src={imgSrc}
        alt="gift"
        className="mb-4 size-20 sm:mb-8 lg:size-30"
      />
      <h2
        className={cn(
          "mb-4 bg-text-primary bg-clip-text pt-1 text-center font-santa text-4.5xl text-transparent sm:max-w-[650px] sm:text-6.5xl lg:text-7xl",
          titleClassName,
        )}
      >
        {title}
      </h2>
      <p
        className={cn(
          "max-w-[650px] text-center text-base sm:text-lg",
          descriptionClassName,
        )}
      >
        {description}
      </p>
      {children}
    </div>
  );
};
