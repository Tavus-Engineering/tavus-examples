# Tavus Conversational Video Interface (CVI) UI • React Quick Start 🚀

A **step‑by‑step** guide to embedding Tavus CVI UI components in your React app.

## 🎮 Try it Live

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/Tavus-Engineering/tavus-examples/tree/main/examples/cvi-ui-haircheck-conversation?file=src%2FApp.tsx)

## 📚 **Full documentation:**

[Component Library Overview](https://docs.tavus.io/sections/conversational-video-interface/component-library/overview)

---

## Prerequisites 🔑

1. **Tavus Account** – Sign up at [https://platform.tavus.io](https://platform.tavus.io).
2. **API Key** – Create one in the [Tavus Dashboard → *API Keys*](https://platform.tavus.io/api-keys).

---

## 1. Install Dependencies ⚙️

Add the CVI UI components to your project:

```bash
npx @tavus/cvi-ui@latest add conversation-01 hair-check-01
```

---

## 2. Wrap Your App with `<CVIProvider>` 🏗️

In **`main.tsx`** (or **`index.tsx`**):

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { CVIProvider } from './components/cvi/components/cvi-provider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CVIProvider>
      <App />
    </CVIProvider>
  </StrictMode>
);
```

---

## 3. Render Hair Check component to request permissions 🎤📷

Call the built‑in `useRequestPermissions` hook **before** creating a conversation.

```tsx
import { createConversation } from './api';
import { HairCheck } from './components/cvi/components/hair-check';

// …inside the component
return (
  <main>
    ...
    <div>
      {screen === 'hairCheck' && (
        <HairCheck
          isJoinBtnLoading={loading}
          onJoin={handleJoin}
          onCancel={() => setScreen('welcome')}
        />
      )}
      ...
    </div>
  </main>
);
```

---

## 4. Render the Conversation UI 💬 <a id="render-the-conversation-ui"></a>

Once you have a `conversation` object, render the CVI UI component in **`App.tsx`**:

```tsx
import { Conversation } from './components/cvi/components/conversation';

// …inside the component
return (
  <main>
    ...
    <div>
      ...HairCheck component...
      {screen === 'call' && conversation && (
        <Conversation
          conversationUrl={conversation.conversation_url}
          onLeave={handleEnd}
        />
      )}
    </div>
  </main>
);
```

---

Made with ❤️ by the Tavus Engineering team.
