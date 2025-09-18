import React from "react";
<<<<<<< HEAD
import Auth from "./components/login"; // login/register page
import Home from "./components/home"; // static home page
import Report from "./components/Report";//report page


function App() {
  // Change this to true to show Home instead of Auth for testing
  const showHome = false;

  return (
    <div className="App">
      {showHome ? <Home /> : <Report />}
    </div>
=======
import Auth from "./components/login";
import Home from "./components/home";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Auth />} />
      <Route path="/home" element={<Home />} />
    </Routes>
>>>>>>> 0f596ba2188e171bad4e936cbf509d6ea72b6fce
  );
}

export default App;
