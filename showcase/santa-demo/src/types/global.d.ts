interface Window {
  grecaptcha?: {
    enterprise?: {
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  };
} 