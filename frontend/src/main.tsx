import "@/styles/global.css";

import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "@/App";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('The app root element "#root" was not found.');
}

createRoot(rootElement).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);