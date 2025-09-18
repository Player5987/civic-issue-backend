import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // default styles
import App from "./App";
import reportWebVitals from "./reportWebVitals"; // optional, comes with CRA
<<<<<<< HEAD
=======
import { BrowserRouter } from "react-router-dom";


>>>>>>> 0f596ba2188e171bad4e936cbf509d6ea72b6fce

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
<<<<<<< HEAD
    <App />
=======
    <BrowserRouter>
      <App />
    </BrowserRouter>
>>>>>>> 0f596ba2188e171bad4e936cbf509d6ea72b6fce
  </React.StrictMode>
);

// If you want to measure performance, you can call reportWebVitals(console.log)
reportWebVitals();
