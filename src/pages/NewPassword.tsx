import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";

const NewPassword = () => {
  const { t } = useLanguage();
  const { updatePassword, signOut } = useAuth();
  const toast = useToast();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return setError(t.errPasswordShort);
    setLoading(true);
    const res = await updatePassword(password);
    setLoading(false);
    if (res.ok) toast({ title: t.passwordUpdated, variant: "success" });
    else setError(res.error === "weakPassword" ? t.errWeakPassword : t.genericError);
  };

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={submit} noValidate>
        <div className="auth-brand">
          <h1>dinrr</h1>
          <p>{t.newPasswordTitle}</p>
        </div>
        <div className="auth-fields">
          <input
            className="settings-input"
            type="password"
            placeholder={t.newPassword}
            value={password}
            autoComplete="new-password"
            autoFocus
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="settings-btn" type="submit" disabled={loading}>
            {loading ? t.loading : t.savePassword}
          </button>
          <button type="button" className="btn-text" onClick={() => signOut()}>{t.cancel}</button>
        </div>
      </form>
    </div>
  );
};

export default NewPassword;
