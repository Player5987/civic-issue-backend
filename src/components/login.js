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
import supabase from "../lib/supabaseClient";

function Auth() {
  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("citizen");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      setError("");
      // Firebase popup sign-in
      const { firebaseAuth, googleProvider } = await import("../lib/firebaseClient");
      const { signInWithPopup } = await import("firebase/auth");
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      // result.user contains firebase user; you may want to create/sync this user with Supabase server if needed
      navigate("/home");
    } catch (e) {
      setError(e.message || "Google login failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isRegister) {
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          return;
        }
        // Create user via server-side admin endpoint so the account is auto-confirmed
        const resp = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName, email, password, role }),
        });
        const result = await resp.json();
        if (!resp.ok) throw new Error(result?.message || "Signup failed");
        // Sign in the newly created user to establish a session
        const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signinError) throw signinError;
        if (!signinData?.user) throw new Error("Login after signup failed");
        navigate("/home");
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        if (!data?.user) throw new Error("Login failed");
        navigate("/home");
      }
    } catch (e) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
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
        <h2 className="title">{isRegister ? "Create Account" : "Welcome Back"}</h2>
        <p className="subtitle">{isRegister ? "Register to report or manage civic issues" : "Login to continue"}</p>

        <form className="form" onSubmit={handleSubmit}>
          {isRegister && (
            <div className="inputGroup">
              <FaUser className="icon" />
              <input
                type="text"
                placeholder="Full Name"
                className="input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="inputGroup">
            <FaEnvelope className="icon" />
            <input
              type="email"
              placeholder="Email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="inputGroup">
            <FaLock className="icon" />
            <input
              type="password"
              placeholder="Password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {isRegister && (
            <>
              <div className="inputGroup">
                <FaLock className="icon" />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  className="input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div className="inputGroup">
                <FaUserShield className="icon" />
                <select
                  className="input"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="citizen">Citizen</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </>
          )}

          <button type="submit" className="button" disabled={loading}>
            {loading ? (isRegister ? "Registering..." : "Logging in...") : isRegister ? "Register" : "Login"}
          </button>
          {error && <p className="auth-error" role="alert">{error}</p>}
        </form>

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
