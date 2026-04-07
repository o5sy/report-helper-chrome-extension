import "../popup/styles/globals.css";

import { Options } from "./Options";
import { createRoot } from "react-dom/client";

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

createRoot(container).render(<Options />);