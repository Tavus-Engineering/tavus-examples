import { FC, PropsWithChildren } from "react";
import { motion, TapHandlers } from "framer-motion";

import { cn } from "@/utils";

const Button: FC<PropsWithChildren<{ onTap?: TapHandlers["onTap"] }>> = ({
  children,
  onTap,
}) => {
  return (
    <motion.button
      className="group relative cursor-pointer p-1"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 1 }}
      onTap={onTap}
    >
      <motion.div
        variants={{
          initial: { backgroundPosition: "0 50%" },
          animate: { backgroundPosition: ["0, 50%", "100% 50%", "0 50%"] },
        }}
        initial="initial"
        animate="animate"
        transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
        style={{ backgroundSize: "400% 400%" }}
        className={cn(
          "absolute inset-0 z-[1] rounded-2xl opacity-60 blur-xl transition duration-300 group-hover:opacity-100",
          "bg-[radial-gradient(circle_farthest-side_at_0_100%,#61dafb,transparent),radial-gradient(circle_farthest-side_at_100%_0,#3c82f6,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#ffc414,transparent),radial-gradient(circle_farthest-side_at_0_0,#1ca0fb,#141316)]",
        )}
      />
      <motion.div
        variants={{
          initial: { backgroundPosition: "0 50%" },
          animate: { backgroundPosition: ["0, 50%", "100% 50%", "0 50%"] },
        }}
        initial="initial"
        animate="animate"
        transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
        style={{ backgroundSize: "400% 400%" }}
        className={cn(
          "absolute inset-[2px] z-[1] rounded-[12px]",
          "bg-[radial-gradient(circle_farthest-side_at_0_100%,#61dafb,transparent),radial-gradient(circle_farthest-side_at_100%_0,#3c82f6,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#ffc414,transparent),radial-gradient(circle_farthest-side_at_0_0,#1ca0fb,#141316)]",
        )}
      />

      <div className="relative z-10 rounded-[10px] bg-[#282c34] px-4 py-2">
        {children}
      </div>
    </motion.button>
  );
};

export default Button;
