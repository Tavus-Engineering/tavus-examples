// Paste the id of a deployment from the Tavus PAL Maker (https://maker.tavus.io).
export const DEPLOYMENT_ID = "";

// The call page is nothing but the element, so the device check is skipped
// and the element's own full-screen preview carries the page copy.
export const OVERRIDE_CONFIG = JSON.stringify({
  customization: {
    show_haircheck: false,
    preview: {
      title: "Ready when you are",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      btn_title: "Start the call",
    },
  },
});

export const TOPICS = [
  { id: "lorem", label: "Lorem ipsum", hint: "Dolor sit amet, consectetur." },
  { id: "tempor", label: "Tempor incididunt", hint: "Ut labore et dolore magna." },
  { id: "veniam", label: "Minim veniam", hint: "Quis nostrud exercitation." },
] as const;

export type TopicId = (typeof TOPICS)[number]["id"];

export function conversationalContext(firstName: string, topic: string): string {
  return `The visitor's first name is ${firstName}. They chose the topic "${topic}" before the call. Address them by name and start with that topic.`;
}

export function customGreeting(firstName: string): string {
  return `Hi ${firstName}, I'm glad you're here. Let's get started.`;
}

export const NEXT_STEPS = [
  { title: "Lorem ipsum dolor", body: "Consectetur adipiscing elit, sed do eiusmod tempor incididunt." },
  { title: "Ut enim ad minim", body: "Quis nostrud exercitation ullamco laboris nisi ut aliquip." },
  { title: "Duis aute irure", body: "In reprehenderit in voluptate velit esse cillum dolore." },
];

export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}
