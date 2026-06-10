"use client";

import { useState } from "react";
import { useStore } from "@/store";
import { X, Eye, EyeOff } from "lucide-react";
import { Button } from "./Button";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultTab?: "login" | "signup";
}

export default function AuthModal({ isOpen, onClose, onSuccess, defaultTab = "login" }: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "signup">(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");

  // Signup state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPass, setSignupPass] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");

  const { login, signup } = useStore();

  if (!isOpen) return null;

  const resetForm = () => {
    setError("");
    setLoginEmail("");
    setLoginPass("");
    setSignupName("");
    setSignupEmail("");
    setSignupPhone("");
    setSignupPass("");
    setSignupConfirm("");
    setShowPassword(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const result = login(loginEmail, loginPass);
      setLoading(false);
      if (result.success) {
        resetForm();
        onClose();
        onSuccess?.();
      } else {
        setError(result.message);
      }
    }, 600);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (signupPass !== signupConfirm) {
      setError("Passwords do not match.");
      return;
    }
    if (signupPass.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const result = signup({
        name: signupName,
        email: signupEmail,
        phone: signupPhone,
        password: signupPass,
      });
      setLoading(false);
      if (result.success) {
        resetForm();
        onClose();
        onSuccess?.();
      } else {
        setError(result.message);
      }
    }, 600);
  };

  const inputClass = "w-full p-3 border border-border-custom bg-card rounded-lg focus:outline-none focus:ring-2 focus:ring-dadi-green/40 focus:border-dadi-green transition text-sm text-foreground placeholder:text-muted-custom";

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in border border-border-custom">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-muted-custom hover:text-foreground transition p-1"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="bg-dadi-green px-8 pt-8 pb-6 text-center">
          <h2 className="text-2xl font-serif text-white mb-1">
            {tab === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-dadi-cream/70 text-sm">
            {tab === "login" ? "Sign in to your Dadijwears account" : "Join the Dadijwears family"}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border-custom bg-muted-custom/5">
          <button
            onClick={() => { setTab("login"); setError(""); }}
            className={`flex-1 py-3 text-sm font-semibold transition ${tab === "login" ? "text-dadi-green border-b-2 border-dadi-green bg-dadi-green/5 dark:text-dadi-gold dark:border-dadi-gold dark:bg-dadi-gold/5" : "text-muted-custom hover:text-foreground"}`}
          >
            Login
          </button>
          <button
            onClick={() => { setTab("signup"); setError(""); }}
            className={`flex-1 py-3 text-sm font-semibold transition ${tab === "signup" ? "text-dadi-green border-b-2 border-dadi-green bg-dadi-green/5 dark:text-dadi-gold dark:border-dadi-gold dark:bg-dadi-gold/5" : "text-muted-custom hover:text-foreground"}`}
          >
            Sign Up
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-sm rounded-lg">
            {error}
          </div>
        )}

        {/* Forms */}
        <div className="p-6">
          {tab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="your@email.com"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    placeholder="••••••••"
                    className={inputClass + " pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-custom hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <Button type="submit" variant="secondary" className="w-full py-3 rounded-lg text-base" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
              <p className="text-center text-sm text-muted-custom">
                Don&apos;t have an account?{" "}
                <button type="button" onClick={() => { setTab("signup"); setError(""); }} className="text-dadi-green dark:text-dadi-gold font-semibold hover:underline">
                  Sign up
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="John Doe"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="your@email.com"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={signupPass}
                    onChange={(e) => setSignupPass(e.target.value)}
                    placeholder="Min 6 chars"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Confirm</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={signupConfirm}
                    onChange={(e) => setSignupConfirm(e.target.value)}
                    placeholder="Repeat"
                    className={inputClass}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs text-muted-custom cursor-pointer">
                <input type="checkbox" checked={showPassword} onChange={() => setShowPassword(!showPassword)} className="accent-dadi-green dark:accent-dadi-gold" />
                Show passwords
              </label>
              <Button type="submit" variant="secondary" className="w-full py-3 rounded-lg text-base" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </Button>
              <p className="text-center text-sm text-muted-custom">
                Already have an account?{" "}
                <button type="button" onClick={() => { setTab("login"); setError(""); }} className="text-dadi-green dark:text-dadi-gold font-semibold hover:underline">
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
