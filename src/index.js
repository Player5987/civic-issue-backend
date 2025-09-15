import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // default styles
import App from "./App";
import reportWebVitals from "./reportWebVitals"; // optional, comes with CRA

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to measure performance, you can call reportWebVitals(console.log)
reportWebVitals();
