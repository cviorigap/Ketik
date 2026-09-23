import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/creepster/latin-400.css";
import "@fontsource/jetbrains-mono/latin-800.css";
import "@fontsource/rubik/latin-500.css";
import "@fontsource/rubik/latin-800.css";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
