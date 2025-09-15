import React from "react";
import { FaRoad, FaTrash, FaTint } from "react-icons/fa";
import "./home.css";

function Home() {
  const categories = [
    { name: "Potholes", icon: <FaRoad /> },
    { name: "Domestic Garbage", icon: <FaTrash /> },
    { name: "Water Logging", icon: <FaTint /> },
  ];

  return (
    <div className="home-wrapper">
      <header className="home-header">
        <h1 className="fade-in">SwarajSetu</h1>
        <p className="fade-in delay-1">Your bridge to self-governance</p>
      </header>

      <h2 className="home-title fade-in delay-2">Report an Issue</h2>
      <p className="home-subtitle fade-in delay-3">Choose a category to get started</p>

      <div className="categories-grid">
        {categories.map((cat, index) => (
          <div
            key={index}
            className={`category-card fade-in delay-${index + 4}`}
          >
            <div className="category-icon">{cat.icon}</div>
            <h3>{cat.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
