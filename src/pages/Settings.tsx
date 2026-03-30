import { useState } from "react";
import { User, Users, LogOut, ChevronRight, Mail, Crown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useFamily } from "@/contexts/FamilyContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { scheduleMondayReminder, cancelMondayReminder } from "@/lib/notifications";
import { useLanguage } from "@/contexts/LanguageContext";
import { languageNames, Language } from "@/lib/translations";

const Settings = ({ onClose }: { onClose: () => void }) => {
  const { user, signOut } = useAuth();
  const { familyId, familyName, familyCode, createFamily, joinFamily, leaveFamily } = useFamily();
  const { toast } = useToast();

  const [familyNameInput, setFamilyNameInput] = useState("");
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [notificationsOn, setNotificationsOn] = useState(
  localStorage.getItem("monday_reminder") === "true"
);
const { language, setLanguage } = useLanguage();

  const handleCreateFamily = async () => {
    if (!familyNameInput.trim()) return;
    setLoading(true);
    try {
      const code = await createFamily(familyNameInput.trim());
      setFamilyNameInput("");
      toast({ title: "Family created! 🎉", description: `Your family code is ${code}` });
    } catch (e) {
      toast({ title: "Error creating family", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleJoinFamily = async () => {
    if (!joinCodeInput.trim()) return;
    setLoading(true);
    const success = await joinFamily(joinCodeInput.trim());
    if (success) {
      toast({ title: "Joined family! 🎉" });
      setJoinCodeInput("");
    } else {
      toast({ title: "Code not found", description: "Check the code and try again.", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !familyId) return;
    setLoading(true);
    const { error } = await supabase.from("family_invites").insert({
      family_id: familyId,
      email: inviteEmail.trim().toLowerCase(),
    });
    if (error) {
      toast({ title: "Error sending invite", variant: "destructive" });
    } else {
      toast({ title: "Invite sent! ✉️", description: `We'll let ${inviteEmail} know when they sign up.` });
      setInviteEmail("");
    }
    setLoading(false);
  };
  const handleToggleNotification = async () => {
  if (notificationsOn) {
    await cancelMondayReminder();
    localStorage.removeItem("monday_reminder");
    setNotificationsOn(false);
    toast({ title: "Reminder turned off" });
  } else {
    const success = await scheduleMondayReminder();
    if (success) {
      localStorage.setItem("monday_reminder", "true");
      setNotificationsOn(true);
      toast({ title: "Reminder set! ✅", description: "You'll get a nudge every Monday at 9am." });
    } else {
      toast({ title: "Permission denied", description: "Enable notifications in your iPhone settings.", variant: "destructive" });
    }
  }
};

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Settings</h1>
          <Button variant="ghost" onClick={onClose}>Done</Button>
        </div>

        {/* Profile */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">Account</p>
          <Card className="divide-y">
            <div className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">{user?.user_metadata?.full_name || "Your account"}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 p-4 w-full text-destructive hover:bg-muted/50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm">Sign out</span>
            </button>
          </Card>
        </div>

        {/* Family */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">Family</p>
          {familyId ? (
            <Card className="divide-y">
              <div className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{familyName}</p>
                  <p className="text-xs text-muted-foreground">Code: {familyCode}</p>
                </div>
              </div>

              {/* Invite by email */}
              <div className="p-4 space-y-2">
                <p className="text-sm font-medium">Invite a family member</p>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Email address..."
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                  <Button onClick={handleInvite} disabled={loading} size="sm">
                    <Mail className="h-4 w-4 mr-1" />
                    Invite
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  They'll be added to your family when they sign up with this email.
                </p>
              </div>

              <button
                onClick={leaveFamily}
                className="flex items-center gap-3 p-4 w-full text-destructive hover:bg-muted/50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Leave family</span>
              </button>
            </Card>
          ) : (
            <Card className="divide-y">
              <div className="p-4 space-y-2">
                <p className="text-sm font-medium">Create a family</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Family name..."
                    value={familyNameInput}
                    onChange={(e) => setFamilyNameInput(e.target.value)}
                  />
                  <Button onClick={handleCreateFamily} disabled={loading} size="sm">Create</Button>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <p className="text-sm font-medium">Join a family</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter code..."
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                    maxLength={6}
                  />
                  <Button onClick={handleJoinFamily} disabled={loading} size="sm">Join</Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Subscription - placeholder for later */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">Subscription</p>
          <Card>
            <div className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Crown className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Free plan</p>
                <p className="text-xs text-muted-foreground">Upgrade to unlock AI suggestions and family sharing</p>
              </div>
  <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </Card>
        </div>

        <div>
<div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">Language</p>
          <Card className="divide-y">
            {(Object.keys(languageNames) as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className="flex items-center justify-between p-4 w-full hover:bg-muted/50 transition-colors"
              >
                <span className="text-sm">{languageNames[lang]}</span>
                {language === lang && (
                  <Check className="h-4 w-4 text-foreground" />
                )}
              </button>
            ))}
          </Card>
        </div>

          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">Notifications</p>
          <Card>
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-sm">Monday reminder</p>
                <p className="text-xs text-muted-foreground">Get reminded every Monday at 9am</p>
              </div>
              <Button
                variant={notificationsOn ? "default" : "outline"}
                size="sm"
                onClick={handleToggleNotification}
              >
                {notificationsOn ? "On" : "Off"}
              </Button>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default Settings;