import React from "react";
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
  );
}

export default App;
