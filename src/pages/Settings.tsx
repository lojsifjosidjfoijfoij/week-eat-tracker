import { useEffect, useState } from "react";
import {
  Bell, ChevronRight, Crown, FileText, Globe, LifeBuoy, Lock, LogOut, RefreshCw, Share2, Shield, Trash2, User,
  UserMinus, Users, X,
} from "lucide-react";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { Share } from "@capacitor/share";
import { useAuth } from "@/contexts/AuthContext";
import { useFamily, type FamilyMember } from "@/contexts/FamilyContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePremium } from "@/contexts/PremiumContext";
import { useToast } from "@/contexts/ToastContext";
import ConfirmDialog from "@/components/ConfirmDialog";
import { APP_VERSION, LINKS } from "@/config";
import { languageNames, translations, type Language } from "@/lib/i18n";
import { cancelMondayReminder, scheduleMondayReminder } from "@/lib/notifications";
import { haptic } from "@/lib/haptics";
import { classifyStoreError, hasEntitlement, restore, storeAvailable } from "@/lib/revenuecat";
import { safeLocal } from "@/lib/storage";

const REMINDER_KEY = "monday_reminder";

type Confirm =
  | { kind: "leave" }
  | { kind: "remove"; member: FamilyMember }
  | { kind: "newCode" }
  | { kind: "delete" }
  | null;

const Settings = ({ onClose }: { onClose: () => void }) => {
  const { user, signOut, deleteAccount } = useAuth();
  const { family, members, isOwner, createFamily, joinFamily, leaveFamily, removeMember, regenerateCode } = useFamily();
  const { language, setLanguage, t, f } = useLanguage();
  const { isPremium, ownsSubscription, viaFamily, openPaywall, refresh: refreshPremium, applyCustomerInfo } = usePremium();
  const toast = useToast();

  const [familyNameInput, setFamilyNameInput] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [familyError, setFamilyError] = useState("");
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [reminderOn, setReminderOn] = useState(safeLocal.get(REMINDER_KEY) === "true");
  const [version, setVersion] = useState(APP_VERSION);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    App.getInfo().then((i) => setVersion(`${i.version} (${i.build})`)).catch(() => {});
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !confirm) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, confirm]);

  const familyErrorText = (code: string) => ({
    invalid_code: t.errInvalidCode,
    rate_limited: t.errTooManyAttempts,
    family_full: t.errFamilyFull,
    already_in_family: t.errAlreadyInFamily,
    premium_required: t.errPremiumRequired,
    server_outdated: t.errServerOutdated,
    name_required: t.errNameRequired,
    network: t.networkError,
  } as Record<string, string>)[code] ?? t.genericError;

  const handleCreate = async () => {
    const name = familyNameInput.trim();
    if (!name) return setFamilyError(t.errNameRequired);
    setBusy(true);
    setFamilyError("");
    await refreshPremium(); // make sure the server knows about a fresh purchase
    const res = await createFamily(name);
    setBusy(false);
    if (!res.ok) return setFamilyError(familyErrorText(res.error));
    haptic.success();
    setFamilyNameInput("");
    toast({ title: t.familyCreated, variant: "success" });
  };

  const handleJoin = async () => {
    const code = codeInput.trim();
    if (!code) return;
    setBusy(true);
    setFamilyError("");
    const res = await joinFamily(code);
    setBusy(false);
    if (!res.ok) return setFamilyError(familyErrorText(res.error));
    haptic.success();
    setCodeInput("");
    toast({ title: f(t.joinedFamily, { name: res.name ?? "" }), variant: "success" });
  };

  const shareCode = async () => {
    if (!family) return;
    const text = f(t.shareMessage, { code: family.code });
    try {
      if (Capacitor.isNativePlatform()) {
        await Share.share({ text, dialogTitle: t.shareCode });
      } else if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(family.code);
        toast({ title: t.codeCopied });
      }
    } catch {
      /* user closed the share sheet */
    }
  };

  const runConfirm = async () => {
    if (!confirm) return;
    setBusy(true);
    let error: string | null = null;
    if (confirm.kind === "leave") {
      const r = await leaveFamily();
      if (!r.ok) error = r.error;
    } else if (confirm.kind === "remove") {
      const r = await removeMember(confirm.member.user_id);
      if (!r.ok) error = r.error;
    } else if (confirm.kind === "newCode") {
      const r = await regenerateCode();
      if (!r.ok) error = r.error;
    } else if (confirm.kind === "delete") {
      const r = await deleteAccount();
      if (!r.ok) {
        setBusy(false);
        setConfirm(null);
        toast({ title: t.deleteFailed, variant: "error" });
        return;
      }
      return; // signed out → this screen unmounts
    }
    setBusy(false);
    setConfirm(null);
    if (error) toast({ title: familyErrorText(error), variant: "error" });
  };

  const handleRestore = async () => {
    if (!storeAvailable()) return toast({ title: t.storeOnlyOnPhone });
    setBusy(true);
    try {
      const info = await restore();
      applyCustomerInfo(info);
      if (hasEntitlement(info)) {
        haptic.success();
        toast({ title: t.restored, variant: "success" });
      } else {
        toast({ title: t.nothingToRestore });
      }
    } catch (e) {
      if (classifyStoreError(e).kind !== "cancelled") toast({ title: t.purchaseFailed, variant: "error" });
    } finally {
      setBusy(false);
    }
  };

  const toggleReminder = async () => {
    if (reminderOn) {
      await cancelMondayReminder();
      safeLocal.set(REMINDER_KEY, "false");
      setReminderOn(false);
      return;
    }
    const ok = await scheduleMondayReminder(t.reminderTitle, t.reminderBody);
    if (ok) {
      safeLocal.set(REMINDER_KEY, "true");
      setReminderOn(true);
      haptic.tap();
    } else {
      toast({ title: t.notificationsDenied, variant: "error" });
    }
  };

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    if (reminderOn) {
      const tt = translations[lang];
      scheduleMondayReminder(tt.reminderTitle, tt.reminderBody).catch(() => {});
    }
  };

  const memberLabel = (m: FamilyMember) => m.name || m.email || `${m.user_id.slice(0, 8)}…`;
  const displayName = (user?.user_metadata?.full_name as string | undefined)?.trim();

  return (
    <div className="settings-overlay" role="dialog" aria-modal="true" aria-label={t.settings}>
      <div className="settings-header">
        <h2 className="settings-title">{t.settings}</h2>
        <button className="icon-btn" onClick={onClose} aria-label={t.close}>
          <X size={16} strokeWidth={2} />
        </button>
      </div>

      <div className="settings-body">
        {/* Account */}
        <section className="settings-section">
          <p className="settings-section-label">{t.account}</p>
          <div className="settings-card">
            <div className="settings-row settings-row--static">
              <div className="settings-row__left">
                <div className="settings-row__icon"><User size={15} /></div>
                <div className="settings-row__stack">
                  {displayName && <span className="settings-row__label">{displayName}</span>}
                  <span className={displayName ? "settings-row__sub" : "settings-row__label"}>{user?.email}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* dinrr+ */}
        <section className="settings-section">
          <p className="settings-section-label">{t.subscription}</p>
          <div className="settings-card">
            <div className="settings-row settings-row--static">
              <div className="settings-row__left">
                <div className="settings-row__icon"><Crown size={15} /></div>
                <span className="settings-row__label">dinrr+</span>
              </div>
              <span className={`status-pill${isPremium ? " is-on" : ""}`}>
                {ownsSubscription ? t.statusActive : viaFamily ? t.statusFamily : isPremium ? t.statusActive : t.statusFree}
              </span>
            </div>
            {!isPremium && (
              <button className="settings-row" onClick={openPaywall}>
                <div className="settings-row__left">
                  <div className="settings-row__icon"><Crown size={15} /></div>
                  <span className="settings-row__label settings-row__label--accent">{t.upgrade}</span>
                </div>
                <ChevronRight size={14} className="settings-row__chev" />
              </button>
            )}
            {ownsSubscription && (
              <a className="settings-row" href={LINKS.manageSubscriptions} target="_blank" rel="noreferrer">
                <div className="settings-row__left">
                  <div className="settings-row__icon"><RefreshCw size={15} /></div>
                  <span className="settings-row__label">{t.manageSubscription}</span>
                </div>
                <ChevronRight size={14} className="settings-row__chev" />
              </a>
            )}
            {!ownsSubscription && (
              <button className="settings-row" onClick={handleRestore} disabled={busy}>
                <div className="settings-row__left">
                  <div className="settings-row__icon"><RefreshCw size={15} /></div>
                  <span className="settings-row__label">{t.restorePurchases}</span>
                </div>
                <ChevronRight size={14} className="settings-row__chev" />
              </button>
            )}
          </div>
        </section>

        {/* Family */}
        <section className="settings-section">
          <p className="settings-section-label">{t.family}</p>
          <div className="settings-card">
            {family ? (
              <>
                <div className="settings-row settings-row--static">
                  <div className="settings-row__left">
                    <div className="settings-row__icon"><Users size={15} /></div>
                    <span className="settings-row__label">{family.name}</span>
                  </div>
                </div>

                <div className="settings-pad">
                  <div className="family-code-box">
                    <div className="family-code-box__code">{family.code}</div>
                    <p className="family-code-box__hint">{t.inviteHint}</p>
                    <div className="family-code-box__actions">
                      <button className="chip-btn" onClick={shareCode}><Share2 size={13} /> {t.shareCode}</button>
                      {isOwner && (
                        <button className="chip-btn chip-btn--ghost" onClick={() => setConfirm({ kind: "newCode" })}>
                          <RefreshCw size={13} /> {t.newCode}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {members.length > 0 && (
                  <div className="settings-pad settings-pad--tight">
                    <p className="members-label">{t.members}</p>
                    <ul className="members">
                      {members.map((m) => {
                        const me = m.user_id === user?.id;
                        return (
                          <li key={m.user_id} className="members__row">
                            <span className="members__name">
                              {memberLabel(m)}{me && <span className="members__you"> ({t.you})</span>}
                            </span>
                            {m.is_owner ? (
                              <span className="members__tag">{t.owner}</span>
                            ) : isOwner && !me ? (
                              <button
                                className="members__remove"
                                onClick={() => setConfirm({ kind: "remove", member: m })}
                                aria-label={`${t.remove} ${memberLabel(m)}`}
                              >
                                <UserMinus size={15} />
                              </button>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                <div className="settings-pad">
                  <button className="settings-btn danger" onClick={() => setConfirm({ kind: "leave" })}>
                    {t.leaveFamily}
                  </button>
                </div>
              </>
            ) : (
              <div className="settings-pad">
                {familyError && <p className="form-error form-error--left" role="alert">{familyError}</p>}

                {isPremium ? (
                  <>
                    <input
                      className="settings-input"
                      placeholder={t.familyName}
                      value={familyNameInput}
                      maxLength={60}
                      onChange={(e) => setFamilyNameInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
                    />
                    <button className="settings-btn" onClick={handleCreate} disabled={busy}>{t.createFamily}</button>
                    <div className="settings-or">{t.or}</div>
                  </>
                ) : (
                  <button className="locked-row" onClick={openPaywall}>
                    <span className="settings-row__icon"><Users size={15} /></span>
                    <span className="locked-row__text">
                      <span className="settings-row__label">{t.createFamily}</span>
                      <span className="settings-row__sub">{t.requiresPremium}</span>
                    </span>
                    <Lock size={14} color="var(--ink-3)" />
                  </button>
                )}

                {!isPremium && <p className="settings-note">{t.joinFree}</p>}
                <input
                  className="settings-input settings-input--code"
                  placeholder={t.enterInviteCode}
                  value={codeInput}
                  autoCapitalize="characters"
                  autoCorrect="off"
                  autoComplete="off"
                  spellCheck={false}
                  maxLength={12}
                  onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => { if (e.key === "Enter") handleJoin(); }}
                />
                <button className="settings-btn secondary" onClick={handleJoin} disabled={busy || !codeInput.trim()}>
                  {t.joinFamily}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Preferences */}
        <section className="settings-section">
          <p className="settings-section-label">{t.preferences}</p>
          <div className="settings-card">
            <button className="settings-row" onClick={toggleReminder} role="switch" aria-checked={reminderOn}>
              <div className="settings-row__left">
                <div className="settings-row__icon"><Bell size={15} /></div>
                <span className="settings-row__label">{t.mondayReminder}</span>
              </div>
              <span className={`switch${reminderOn ? " is-on" : ""}`} aria-hidden><span /></span>
            </button>
            <label className="settings-row">
              <div className="settings-row__left">
                <div className="settings-row__icon"><Globe size={15} /></div>
                <span className="settings-row__label">{t.language}</span>
              </div>
              <select className="settings-select" value={language} onChange={(e) => changeLanguage(e.target.value as Language)}>
                {(Object.entries(languageNames) as [Language, string][]).map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </label>
          </div>
        </section>

        {/* About */}
        <section className="settings-section">
          <p className="settings-section-label">{t.about}</p>
          <div className="settings-card">
            <a className="settings-row" href={LINKS.privacy} target="_blank" rel="noreferrer">
              <div className="settings-row__left">
                <div className="settings-row__icon"><Shield size={15} /></div>
                <span className="settings-row__label">{t.privacyPolicy}</span>
              </div>
              <ChevronRight size={14} className="settings-row__chev" />
            </a>
            <a className="settings-row" href={LINKS.terms} target="_blank" rel="noreferrer">
              <div className="settings-row__left">
                <div className="settings-row__icon"><FileText size={15} /></div>
                <span className="settings-row__label">{t.termsOfUse}</span>
              </div>
              <ChevronRight size={14} className="settings-row__chev" />
            </a>
            <a className="settings-row" href={`mailto:${LINKS.supportEmail}?subject=dinrr%20${encodeURIComponent(version)}`}>
              <div className="settings-row__left">
                <div className="settings-row__icon"><LifeBuoy size={15} /></div>
                <span className="settings-row__label">{t.contactSupport}</span>
              </div>
              <ChevronRight size={14} className="settings-row__chev" />
            </a>
            <div className="settings-row settings-row--static">
              <div className="settings-row__left">
                <span className="settings-row__label settings-row__label--muted">{t.version}</span>
              </div>
              <span className="settings-row__value">{version}</span>
            </div>
          </div>
        </section>

        {/* Sign out / delete */}
        <section className="settings-section">
          <div className="settings-card">
            <button className="settings-row" onClick={() => { signOut(); onClose(); }}>
              <div className="settings-row__left">
                <div className="settings-row__icon red"><LogOut size={15} /></div>
                <span className="settings-row__label settings-row__label--danger">{t.signOut}</span>
              </div>
            </button>
            <button className="settings-row" onClick={() => setConfirm({ kind: "delete" })}>
              <div className="settings-row__left">
                <div className="settings-row__icon red"><Trash2 size={15} /></div>
                <span className="settings-row__label settings-row__label--danger">{t.deleteAccount}</span>
              </div>
            </button>
          </div>
        </section>
      </div>

      {confirm?.kind === "leave" && (
        <ConfirmDialog
          title={t.leaveFamilyTitle}
          body={<p>{isOwner ? t.leaveFamilyOwnerBody : t.leaveFamilyBody}</p>}
          confirmLabel={t.leaveFamily}
          cancelLabel={t.cancel}
          busy={busy}
          onConfirm={runConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
      {confirm?.kind === "remove" && (
        <ConfirmDialog
          title={t.removeMemberTitle}
          body={<p>{f(t.removeMemberBody, { name: memberLabel(confirm.member) })}</p>}
          confirmLabel={t.remove}
          cancelLabel={t.cancel}
          busy={busy}
          onConfirm={runConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
      {confirm?.kind === "newCode" && (
        <ConfirmDialog
          title={t.newCodeTitle}
          body={<p>{t.newCodeBody}</p>}
          confirmLabel={t.newCode}
          cancelLabel={t.cancel}
          destructive={false}
          busy={busy}
          onConfirm={runConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
      {confirm?.kind === "delete" && (
        <ConfirmDialog
          title={t.deleteAccountTitle}
          body={<><p>{t.deleteAccountBody}</p><p className="alert-note">{t.deleteAccountSubNote}</p></>}
          confirmLabel={t.delete}
          cancelLabel={t.cancel}
          busy={busy}
          onConfirm={runConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
};

export default Settings;
