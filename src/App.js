import React from "react";
import Auth from "./components/login"; // login/register page
import Home from "./components/home"; // static home page

function App() {
  // Change this to true to show Home instead of Auth for testing
  const showHome = true;

  return (
    <div className="App">
      {showHome ? <Home /> : <Auth />}
    </div>
  );
}

export default App;
