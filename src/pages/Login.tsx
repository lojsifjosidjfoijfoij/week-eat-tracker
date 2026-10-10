import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth, type AuthErrorKind } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { LINKS } from "@/config";

type Mode = "signIn" | "signUp" | "reset";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = () => {
  const { t } = useLanguage();
  const { signIn, signUp, requestPasswordReset, resendConfirmation, linkError, clearLinkError } = useAuth();

  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [canResend, setCanResend] = useState(false);

  const messages: Record<AuthErrorKind, string> = {
    wrongCredentials: t.errWrongCredentials,
    emailNotConfirmed: t.errEmailNotConfirmed,
    emailInUse: t.errEmailInUse,
    tooManyAttempts: t.errTooManyAttempts,
    weakPassword: t.errWeakPassword,
    invalidEmail: t.errInvalidEmail,
    linkExpired: t.linkExpired,
    network: t.networkError,
    unknown: t.genericError,
  };

  const shownError = error || (linkError ? messages[linkError] : "");

  const switchMode = (m: Mode) => {
    clearLinkError();
    setMode(m);
    setError("");
    setSuccess("");
    setCanResend(false);
  };

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (loading) return;
    clearLinkError();
    setError("");
    setSuccess("");

    const cleanEmail = email.trim();
    if (mode === "reset") {
      if (!EMAIL_RE.test(cleanEmail)) return setError(cleanEmail ? t.errInvalidEmail : t.errEnterEmail);
    } else {
      if (!cleanEmail || !password) return setError(t.errEnterEmailPassword);
      if (!EMAIL_RE.test(cleanEmail)) return setError(t.errInvalidEmail);
      if (mode === "signUp" && password.length < 8) return setError(t.errPasswordShort);
    }

    setLoading(true);
    try {
      if (mode === "signIn") {
        const res = await signIn(cleanEmail, password);
        if (!res.ok) {
          setError(messages[res.error]);
          setCanResend(res.error === "emailNotConfirmed");
        }
      } else if (mode === "signUp") {
        const res = await signUp(cleanEmail, password, fullName);
        if (res.ok) {
          setSuccess(t.accountCreated);
          setCanResend(true);
          setPassword("");
        } else {
          setError(messages[res.error]);
        }
      } else {
        const res = await requestPasswordReset(cleanEmail);
        // Same message whether or not the email exists (don't leak accounts)
        if (res.ok || res.error === "unknown") setSuccess(t.resetLinkSent);
        else setError(messages[res.error]);
      }
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setLoading(true);
    const res = await resendConfirmation(email);
    setLoading(false);
    if (res.ok) { setSuccess(t.emailResent); setError(""); }
    else setError(messages[res.error]);
  };

  const title = mode === "signUp" ? t.createYourAccount : mode === "reset" ? t.resetPasswordTitle : t.welcomeBack;
  const cta = mode === "signUp" ? t.createAccount : mode === "reset" ? t.sendResetLink : t.signIn;

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={submit} noValidate>
        <div className="auth-brand">
          <h1>dinrr</h1>
          <p>{title}</p>
        </div>

        {mode === "reset" && <p className="auth-hint">{t.resetPasswordHint}</p>}

        <div className="auth-fields">
          {mode === "signUp" && (
            <input
              className="settings-input"
              placeholder={t.fullName}
              value={fullName}
              autoComplete="name"
              autoCapitalize="words"
              maxLength={80}
              onChange={(e) => setFullName(e.target.value)}
            />
          )}
          <input
            className="settings-input"
            type="email"
            inputMode="email"
            placeholder={t.email}
            value={email}
            autoComplete={mode === "signUp" ? "email" : "username"}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            onChange={(e) => setEmail(e.target.value)}
          />
          {mode !== "reset" && (
            <div className="password-field">
              <input
                className="settings-input"
                type={showPassword ? "text" : "password"}
                placeholder={t.password}
                value={password}
                autoComplete={mode === "signUp" ? "new-password" : "current-password"}
                autoCapitalize="none"
                autoCorrect="off"
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="password-field__toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? t.hidePassword : t.showPassword}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          )}

          {shownError && <p className="form-error" role="alert">{shownError}</p>}
          {success && <p className="form-success" role="status">{success}</p>}

          <button className="settings-btn" type="submit" disabled={loading}>
            {loading ? t.loading : cta}
          </button>

          {canResend && mode !== "reset" && (
            <button type="button" className="btn-text" onClick={resend} disabled={loading}>{t.resendEmail}</button>
          )}
          {mode === "signIn" && (
            <button type="button" className="btn-text" onClick={() => switchMode("reset")}>{t.forgotPassword}</button>
          )}
        </div>

        {mode === "signUp" && (
          <p className="auth-legal">
            {t.legalPrefix}{" "}
            <a href={LINKS.terms} target="_blank" rel="noreferrer">{t.termsOfUse}</a>{" "}
            {t.and}{" "}
            <a href={LINKS.privacy} target="_blank" rel="noreferrer">{t.privacyPolicy}</a>.
          </p>
        )}

        <p className="auth-switch">
          {mode === "reset" ? (
            <button type="button" onClick={() => switchMode("signIn")}>{t.backToSignIn}</button>
          ) : (
            <>
              {mode === "signUp" ? t.haveAccount : t.noAccount}{" "}
              <button type="button" onClick={() => switchMode(mode === "signUp" ? "signIn" : "signUp")}>
                {mode === "signUp" ? t.signIn : t.signUp}
              </button>
            </>
          )}
        </p>
      </form>
    </div>
  );
};

export default Login;
