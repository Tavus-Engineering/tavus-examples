# Tavus Santa Demo

## 🎅 Introduction

Welcome to the Tavus Santa Demo, a festive showcase of Tavus's groundbreaking Conversational Video Interface (CVI), now with a holiday twist! 
Check it out to see how you can leverage our technology to create hyperrealistic, interactive personas like Santa Claus.

![AI Santa Demo](./public/images/demo.gif)

With this demo, you can:
- Explore real-time video interactions powered by Tavus CVI APIs
- Fork and customize the experience
- Use a new **Persona ID** or **Replica ID** to bring your custom vision to life, whether it’s a Santa variant or an entirely new character!

<br></br>
The Santa Demo stack includes:
- React
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
<br></br>
## 🎮 Try it Live
Thanks to StackBlitz, you can spin up and delpoy a Santa demo fork in under a minute!

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/Tavus-Engineering/tavus-examples/tree/main/showcase/santa-demo?file=src%2FApp.tsx)

<br></br>
## 🎄 Prerequisites

1. Create an account on [Tavus Platform](https://platform.tavus.io/api-keys).
2. Generate an API token in your account settings.


<br></br>
## 🍴Forking the Demo
1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Clone and Customize:**  
   Fork this repository and modify it to create your own unique Santa AI persona. To personalize your experience:
   - Edit the **persona_id** in the `createConversation.ts` file to match your new persona. You can learn how to [create your own persona](https://docs.tavus.io/sections/conversational-video-interface/creating-a-persona) or persona replicas directly on the [Tavus Platform](https://platform.tavus.io/).
   - You can also swap Santa out with a completely different replica/persona to use this a simple react template for your next CVI project.

   For example, to update the persona ID, locate the following snippet in `createConversation.ts`:

   ```typescript
   body: JSON.stringify({
     // Replace with your own Persona ID
     persona_id: "your_persona_id_here",
   }),
   ```


<br></br>
## 📚 Learn More About Tavus

- [Developer Documentation](https://docs.tavus.io/)
- [API Reference](https://docs.tavus.io/api-reference/)
- [Tavus Platform](https://platform.tavus.io/)
- [Daily React Reference](https://docs.daily.co/reference/daily-react)
