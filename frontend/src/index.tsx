import "./index.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

const el = document.getElementById("root");
if (!el) throw new Error('Missing root element with id="root"');
const root = createRoot(el);
root.render(<App />);
