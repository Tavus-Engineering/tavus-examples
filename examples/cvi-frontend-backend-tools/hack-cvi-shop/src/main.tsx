import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { DailyProvider } from "@daily-co/daily-react";
import { Toaster } from "@/components/ui/toaster"


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <DailyProvider>
      <App />
      <Toaster />
    </DailyProvider>
  </React.StrictMode>,
);
