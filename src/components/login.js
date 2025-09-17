import React, { useState } from "react";
import {
  FaUser,
  FaLock,
  FaEnvelope,
  FaUserShield,
  FaLandmark,
} from "react-icons/fa";
import "./auth.css";
import { useNavigate } from "react-router-dom";

// Firebase
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// ⚡ Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAQe5l8LM8S9cL1TaA5MiwtTImdwXaJyfY",
  authDomain: "swaraj-setu.firebaseapp.com",
  projectId: "swaraj-setu",
  storageBucket: "swaraj-setu.firebasestorage.app",
  messagingSenderId: "800030530606",
  appId: "1:800030530606:web:0b4d42d20f096cc68353bf"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

function Auth() {
  const [isRegister, setIsRegister] = useState(false);
  const navigate = useNavigate();

  // Google Login
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      navigate("/home"); // redirect to home after login
    } catch (error) {
      console.error("Google login failed:", error.message);
    }
  };

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

        {/* Google Login Button */}
        <button className="google-btn" onClick={handleGoogleLogin}>
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google"
            className="google-icon"
          />
          Sign in with Google
        </button>

        <p className="toggle">
          {isRegister ? "Already have an account?" : "Don’t have an account?"}{" "}
          <span onClick={() => setIsRegister(!isRegister)} className="link">
            {isRegister ? "Login" : "Register"}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Auth;
