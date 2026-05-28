import { useState } from "react";
import { X, User, Users, LogOut, Bell, Globe, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useFamily } from "@/contexts/FamilyContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { scheduleMondayReminder, cancelMondayReminder } from "@/lib/notifications";
import { useLanguage } from "@/contexts/LanguageContext";
import { languageNames, Language } from "@/lib/translations";

import { usePremium } from "@/contexts/PremiumContext";

const Settings = ({ onClose }: { onClose: () => void }) => {
  const { user, signOut } = useAuth();
  const { familyId, familyName, familyCode, createFamily, joinFamily, leaveFamily } = useFamily();
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();

  const [familyNameInput, setFamilyNameInput] = useState("");
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [notificationsOn, setNotificationsOn] = useState(
    localStorage.getItem("monday_reminder") === "true"
  );

  const handleCreateFamily = async () => {
    if (!familyNameInput.trim()) return;
    setLoading(true);
    try {
      const code = await createFamily(familyNameInput.trim());
      setFamilyNameInput("");
      toast({ title: "Family created!", description: `Your family code is ${code}` });
    } catch {
      toast({ title: "Error creating family", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleJoinFamily = async () => {
    if (!joinCodeInput.trim()) return;
    setLoading(true);
    const success = await joinFamily(joinCodeInput.trim());
    if (success) {
      toast({ title: "Joined family!" });
      setJoinCodeInput("");
    } else {
      toast({ title: "Code not found", description: "Check the code and try again.", variant: "destructive" });
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

      {/* Header */}
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
                <div style={{ padding: "0 16px 14px" }}>
                  <button className="settings-btn danger" onClick={leaveFamily}>
                    Leave family
                  </button>
                </div>
              </>
            ) : (
              <div style={{ padding: "14px 16px" }}>
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
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
