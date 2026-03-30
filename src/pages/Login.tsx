import { useState } from "react";
import { UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async () => {
  if (!email || !password) {
    toast({ title: "Missing fields", description: "Please enter your email and password.", variant: "destructive" });
    return;
  }
  setLoading(true);

  if (isSignUp) {
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Password must be at least 6 characters.", variant: "destructive" });
      setLoading(false);
      return;
    }
    const { error } = await signUp(email, password, fullName);
    if (error) {
      if (error.message.includes("already registered")) {
        toast({ title: "Email already in use", description: "Try signing in instead.", variant: "destructive" });
      } else {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    } else {
      toast({ title: "Account created!", description: "Please check your email to confirm your account." });
    }
  } else {
    const { error } = await signIn(email, password);
    if (error) {
      if (error.message.includes("Invalid login")) {
        toast({ title: "Wrong email or password", description: "Please check your details and try again.", variant: "destructive" });
      } else if (error.message.includes("Email not confirmed")) {
        toast({ title: "Email not confirmed", description: "Please check your inbox and confirm your email first.", variant: "destructive" });
      } else {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    }
  }
  setLoading(false);
};

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <UtensilsCrossed className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold">Weekplate</h1>
          <p className="text-muted-foreground text-sm">
            {isSignUp ? "Create your account" : "Welcome back"}
          </p>
        </div>

        <div className="space-y-3">
          {isSignUp && (
            <Input
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          )}
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
          />
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Loading..." : isSignUp ? "Create account" : "Sign in"}
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-foreground font-medium underline underline-offset-4"
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
