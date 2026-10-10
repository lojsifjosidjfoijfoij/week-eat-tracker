import { useState } from "react";
import { X, User, Users, LogOut, Bell, Globe, ChevronRight, Lock, UserMinus, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useFamily } from "@/contexts/FamilyContext";
import { scheduleMondayReminder, cancelMondayReminder } from "@/lib/notifications";
import { useLanguage } from "@/contexts/LanguageContext";
import { languageNames, Language } from "@/lib/translations";
import { usePremium } from "@/contexts/PremiumContext";

const Settings = ({ onClose }: { onClose: () => void }) => {
  const { user, signOut, deleteAccount } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { familyId, familyName, familyCode, ownerId, isOwner, members, createFamily, joinFamily, leaveFamily, kickMember } = useFamily();
  const { language, setLanguage, t } = useLanguage();
  const { isPremium, openPaywall, isTestMode } = usePremium();

  const handleDeleteAccount = async () => {
    setShowDeleteConfirm(false);
    setLoading(true);
    const { error } = await deleteAccount();
    if (error) {
      alert("Error deleting account. Please contact support.");
    }
    setLoading(false);
  };

  const [familyNameInput, setFamilyNameInput] = useState("");
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [notificationsOn, setNotificationsOn] = useState(
    localStorage.getItem("monday_reminder") === "true"
  );
  const [familyError, setFamilyError] = useState("");
  const [familySuccess, setFamilySuccess] = useState("");

  const handleCreateFamily = async () => {
    if (!familyNameInput.trim()) return;
    setFamilyError("");
    setFamilySuccess("");
    setLoading(true);
    try {
      const code = await createFamily(familyNameInput.trim());
      setFamilyNameInput("");
      setFamilySuccess(`Family created! Code: ${code}`);
    } catch {
      setFamilyError("Error creating family. Please try again.");
    }
    setLoading(false);
  };

  const handleJoinFamily = async () => {
    if (!joinCodeInput.trim()) return;
    setFamilyError("");
    setFamilySuccess("");
    setLoading(true);
    const success = await joinFamily(joinCodeInput.trim());
    if (success) {
      setFamilySuccess("Joined family!");
      setJoinCodeInput("");
    } else {
      setFamilyError("Code not found. Check the code and try again.");
    }
    setLoading(false);
  };

  const handleToggleNotifications = async () => {
    if (notificationsOn) {
      await cancelMondayReminder();
      localStorage.setItem("monday_reminder", "false");
      setNotificationsOn(false);
    } else {
      await scheduleMondayReminder();
      localStorage.setItem("monday_reminder", "true");
      setNotificationsOn(true);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  return (
    <div className="settings-overlay">

      <div className="settings-header">
        <h2 className="settings-title">Settings</h2>
        <button className="icon-btn" onClick={onClose} aria-label="Close">
          <X size={16} strokeWidth={2} />
        </button>
      </div>

      <div className="settings-body">

        {/* Account */}
        <div className="settings-section">
          <p className="settings-section-label">Account</p>
          <div className="settings-card">
            <div className="settings-row">
              <div className="settings-row__left">
                <div className="settings-row__icon">
                  <User size={15} />
                </div>
                <span className="settings-row__label">{user?.email}</span>
              </div>
            </div>
            <div className="settings-row" onClick={handleSignOut}>
              <div className="settings-row__left">
                <div className="settings-row__icon red">
                  <LogOut size={15} />
                </div>
                <span className="settings-row__label" style={{ color: "var(--red)" }}>Sign out</span>
              </div>
            </div>
            <div className="settings-row" onClick={() => setShowDeleteConfirm(true)} style={{ cursor: "pointer" }}>
              <div className="settings-row__left">
                <div className="settings-row__icon red">
                  <Trash2 size={15} />
                </div>
                <span className="settings-row__label" style={{ color: "var(--red)" }}>Delete account</span>
              </div>
            </div>
          </div>
        </div>

        {/* Family */}
        <div className="settings-section">
          <p className="settings-section-label">Family</p>
          <div className="settings-card">
            {familyId ? (
              <>
                <div className="settings-row">
                  <div className="settings-row__left">
                    <div className="settings-row__icon">
                      <Users size={15} />
                    </div>
                    <span className="settings-row__label">{familyName}</span>
                  </div>
                </div>

                {familyCode && (
                  <div style={{ padding: "12px 16px" }}>
                    <div className="family-code-box">
                      <div className="family-code-box__code">{familyCode}</div>
                      <p className="family-code-box__hint">Share this code to invite family members</p>
                    </div>
                  </div>
                )}

                {/* Member list — only visible to the family owner */}
                {isOwner && members.length > 0 && (
                  <div style={{ padding: "0 16px 4px" }}>
                    <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: "6px" }}>
                      Members
                    </p>
                    {members.map(m => {
                      const isMe = m.user_id === ownerId
                      const label = m.email ?? `${m.user_id.slice(0, 8)}…`
                      return (
                        <div key={m.user_id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
                          <span style={{ fontSize: "0.825rem", color: "var(--ink)", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                            {label}
                          </span>
                          {isMe ? (
                            <span style={{ fontSize: "0.7rem", color: "var(--ink-3)", marginLeft: "8px", flexShrink: 0 }}>admin</span>
                          ) : (
                            <button
                              onClick={() => kickMember(m.user_id)}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--red)", padding: "4px", marginLeft: "8px", flexShrink: 0, display: "flex", alignItems: "center" }}
                              aria-label={`Remove ${label}`}
                            >
                              <UserMinus size={15} />
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                <div style={{ padding: "10px 16px 14px" }}>
                  <button className="settings-btn danger" onClick={leaveFamily}>
                    Leave family
                  </button>
                </div>
              </>
            ) : isPremium ? (
              <div style={{ padding: "14px 16px" }}>
                {familyError && (
                  <p style={{ fontSize: "0.8rem", color: "var(--red)", marginBottom: "8px" }}>{familyError}</p>
                )}
                {familySuccess && (
                  <p style={{ fontSize: "0.8rem", color: "var(--green)", marginBottom: "8px" }}>{familySuccess}</p>
                )}
                <input
                  className="settings-input"
                  placeholder="Family name"
                  value={familyNameInput}
                  onChange={(e) => setFamilyNameInput(e.target.value)}
                />
                <button className="settings-btn" onClick={handleCreateFamily} disabled={loading}>
                  Create family
                </button>
                <div style={{ margin: "12px 0", textAlign: "center", fontSize: "0.8rem", color: "var(--ink-3)" }}>or</div>
                <input
                  className="settings-input"
                  placeholder="Enter invite code"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value)}
                />
                <button className="settings-btn secondary" onClick={handleJoinFamily} disabled={loading}>
                  Join family
                </button>
              </div>
            ) : (
              <>
                {/* Create family requires dinrr+ */}
                <div className="settings-row" onClick={openPaywall} style={{ cursor: "pointer" }}>
                  <div className="settings-row__left">
                    <div className="settings-row__icon">
                      <Users size={15} />
                    </div>
                    <div>
                      <span className="settings-row__label">Create family</span>
                      <p style={{ fontSize: "0.75rem", color: "var(--ink-3)", marginTop: "1px" }}>Requires dinrr+</p>
                    </div>
                  </div>
                  <Lock size={14} color="var(--ink-3)" />
                </div>
                {/* Join family is free */}
                <div style={{ padding: "0 16px 14px" }}>
                  {familyError && (
                    <p style={{ fontSize: "0.8rem", color: "var(--red)", marginBottom: "8px" }}>{familyError}</p>
                  )}
                  {familySuccess && (
                    <p style={{ fontSize: "0.8rem", color: "var(--green)", marginBottom: "8px" }}>{familySuccess}</p>
                  )}
                  <div style={{ margin: "4px 0 10px", fontSize: "0.8rem", color: "var(--ink-3)" }}>or join a family for free</div>
                  <input
                    className="settings-input"
                    placeholder="Enter invite code"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value)}
                  />
                  <button className="settings-btn secondary" onClick={handleJoinFamily} disabled={loading}>
                    Join family
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Preferences */}
        <div className="settings-section">
          <p className="settings-section-label">Preferences</p>
          <div className="settings-card">
            <div className="settings-row" onClick={handleToggleNotifications}>
              <div className="settings-row__left">
                <div className="settings-row__icon">
                  <Bell size={15} />
                </div>
                <span className="settings-row__label">Monday reminder</span>
              </div>
              <span className="settings-row__value">
                {notificationsOn ? "On" : "Off"}
                <ChevronRight size={14} />
              </span>
            </div>
            <div className="settings-row">
              <div className="settings-row__left">
                <div className="settings-row__icon">
                  <Globe size={15} />
                </div>
                <span className="settings-row__label">Language</span>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "0.825rem",
                  color: "var(--ink-3)",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                {Object.entries(languageNames).map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </div>
            {isTestMode && (
              <div className="settings-row" onClick={() => window.location.reload()} style={{ cursor: "pointer" }}>
                <div className="settings-row__left">
                  <div className="settings-row__icon red">
                    <span style={{ fontSize: "14px" }}>🧪</span>
                  </div>
                  <span className="settings-row__label" style={{ color: "var(--red)" }}>Disable test mode</span>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {showDeleteConfirm && (
        <div className="alert-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="alert-box" onClick={(e) => e.stopPropagation()}>
            <h3>Delete account?</h3>
            <p>This will permanently delete your account and all your data. This cannot be undone.</p>
            <div className="alert-actions">
              <button className="btn-cancel" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="btn-destructive" onClick={handleDeleteAccount} disabled={loading}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;