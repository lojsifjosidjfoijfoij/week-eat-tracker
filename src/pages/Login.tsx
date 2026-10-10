import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { signIn, signUp } = useAuth();

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    if (isSignUp) {
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, fullName);
      if (error) {
        if (error.message.includes("already registered")) {
          setError("Email already in use. Try signing in instead.");
        } else {
          setError(error.message);
        }
      } else {
        setSuccess("Account created! Please check your email to confirm your account.");
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        if (error.message.includes("Invalid login")) {
          setError("Wrong email or password. Please check your details and try again.");
        } else if (error.message.includes("Email not confirmed")) {
          setError("Email not confirmed. Please check your inbox first.");
        } else {
          setError(error.message);
        }
      }
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100dvh",
      background: "var(--bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      paddingTop: "calc(env(safe-area-inset-top, 50px) + 24px)",
      paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)",
    }}>
      <div style={{ width: "100%", maxWidth: "360px" }}>

        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: "2.5rem",
            color: "var(--ink)",
            letterSpacing: "-0.02em",
            marginBottom: "8px",
          }}>dinrr</h1>
          <p style={{ fontSize: "0.9rem", color: "var(--ink-3)", fontWeight: 300 }}>
            {isSignUp ? "Create your account" : "Welcome back"}
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {isSignUp && (
            <input
              className="settings-input"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          )}
          <input
            className="settings-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
          />
          <input
            className="settings-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
          />

          {error && (
            <p style={{ fontSize: "0.825rem", color: "var(--red)", textAlign: "center" }}>{error}</p>
          )}
          {success && (
            <p style={{ fontSize: "0.825rem", color: "var(--green)", textAlign: "center" }}>{success}</p>
          )}

          <button
            className="settings-btn"
            onClick={handleSubmit}
            disabled={loading}
            style={{ marginTop: "4px" }}
          >
            {loading ? "Loading..." : isSignUp ? "Create account" : "Sign in"}
          </button>
        </div>

        <p style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--ink-3)", marginTop: "24px" }}>
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(""); setSuccess(""); }}
            style={{ color: "var(--ink)", fontWeight: 600, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "3px" }}
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>

      </div>
    </div>
  );
};

export default Login;