import React, { useState } from "react";
import {
  FaUser,
  FaLock,
  FaEnvelope,
  FaUserShield,
  FaLandmark,
} from "react-icons/fa";
import "./auth.css"; 

function Auth() {
  const [isRegister, setIsRegister] = useState(false);

  return (
    <div className="auth-wrapper">
      <div className="branding">
        <FaLandmark className="logoIcon" />
        <h1 className="brandName">SwarajSetu</h1>
        <p className="tagline">Your bridge to self-governance</p>
      </div>

      <div className="auth-card">
        <h2 className="title">
          {isRegister ? "Create Account" : "Welcome Back"}
        </h2>
        <p className="subtitle">
          {isRegister
            ? "Register to report or manage civic issues"
            : "Login to continue"}
        </p>

        <form className="form">
          {isRegister && (
            <div className="inputGroup">
              <FaUser className="icon" />
              <input type="text" placeholder="Full Name" className="input" />
            </div>
          )}

          <div className="inputGroup">
            <FaEnvelope className="icon" />
            <input type="email" placeholder="Email" className="input" />
          </div>

          <div className="inputGroup">
            <FaLock className="icon" />
            <input type="password" placeholder="Password" className="input" />
          </div>

          {isRegister && (
            <>
              <div className="inputGroup">
                <FaLock className="icon" />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  className="input"
                />
              </div>

              <div className="inputGroup">
                <FaUserShield className="icon" />
                <select className="input">
                  <option value="citizen">Citizen</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </>
          )}

          <button type="submit" className="button">
            {isRegister ? "Register" : "Login"}
          </button>
        </form>

        <p className="toggle">
          {isRegister ? "Already have an account?" : "Don’t have an account?"}{" "}
          <span
            onClick={() => setIsRegister(!isRegister)}
            className="link"
          >
            {isRegister ? "Login" : "Register"}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Auth;
