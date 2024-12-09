import { GitFork, ExternalLink } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="flex w-full items-center justify-between gap-4">
      <a
        href="https://github.com/Tavus-Engineering/tavus-examples"
        target="_blank"
        className="hover:shadow-footer-btn relative flex items-center justify-center gap-2 rounded-3xl bg-white px-2 py-3 text-sm font-medium text-black transition-all duration-200 hover:text-primary hover:underline sm:p-4"
      >
        <GitFork className="size-4" /> Fork the demo
      </a>

      <a
        href="https://docs.tavus.io/sections/conversational-video-interface/cvi-overview"
        target="_blank"
        className="relative flex items-center justify-center gap-2 rounded-3xl bg-[rgba(28,18,30,0.20)] px-2 py-3 text-sm font-medium backdrop-blur-sm hover:underline sm:p-4"
      >
        How Tavus CVI works <ExternalLink className="size-4" />
      </a>
    </footer>
  );
};
