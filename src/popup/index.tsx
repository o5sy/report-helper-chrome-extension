import "../styles/globals.css";

import { Popup } from "./Popup";
import React from "react";
import { createRoot } from "react-dom/client";

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

const root = createRoot(container);
root.render(<Popup />);
