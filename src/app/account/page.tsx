"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/Button";
import {
  User,
  MapPin,
  Baby,
  LogOut,
  Eye,
  EyeOff,
  CheckCircle,
  ShieldCheck,
  Pencil,
  Lock,
  Mail,
  Phone,
  Package,
  Star,
  Globe,
  Laptop,
  Compass,
  X,
  AlertCircle,
  KeyRound,
} from "lucide-react";

type AuthView = "LOGIN" | "SIGNUP" | "RESET" | "DASHBOARD";

type ProfileState = {
  name: string;
  phone: string;
  kidsAge: string;
  address: string;
};

type AuditState = {
  lastSignIn: string;
  device: string;
  ip: string;
  location: string;
  activeSessions: number;
};

const emptyProfile: ProfileState = {
  name: "",
  phone: "",
  kidsAge: "",
  address: "",
};

function stripPhone(value?: string | null) {
  if (!value) return "";
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) return digits.slice(2);
  if (digits.startsWith("0") && digits.length === 11) return digits.slice(1);
  return digits.slice(-10);
}

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `+91${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (value.startsWith("+")) return value.trim();
  return `+${digits}`;
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, "").slice(0, 10);
}

function passwordStrength(value: string) {
  return {
    length: value.length >= 8,
    upper: /[A-Z]/.test(value),
    number: /\d/.test(value),
    special: /[^A-Za-z0-9]/.test(value),
  };
}

function deviceLabel() {
  if (typeof navigator === "undefined") return "Browser";
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("android")) return "Android Mobile";
  if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ios")) return "iOS Device";
  if (ua.includes("mac")) return "macOS Computer";
  if (ua.includes("windows")) return "Windows PC";
  if (ua.includes("linux")) return "Linux Workstation";
  return "Web Browser";
}

export default function AccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const resetMode = searchParams.get("mode") === "reset";

  const [view, setView] = useState<AuthView>(resetMode ? "RESET" : "LOGIN");
  const [pageLoading, setPageLoading] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [authUser, setAuthUser] = useState<any>(null);
  const [dbUser, setDbUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  const [profile, setProfile] = useState<ProfileState>(emptyProfile);
  const [baselineProfile, setBaselineProfile] = useState<ProfileState>(emptyProfile);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);

  const [audit, setAudit] = useState<AuditState>({
    lastSignIn: "",
    device: "",
    ip: "Resolving secure address...",
    location: "Locating region...",
    activeSessions: 1,
  });

  const [email, setEmail] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [dbNewPassword, setDbNewPassword] = useState("");
  const [dbConfirmPassword, setDbConfirmPassword] = useState("");
  const [showDbNewPassword, setShowDbNewPassword] = useState(false);
  const [showDbConfirmPassword, setShowDbConfirmPassword] = useState(false);
  const [dbPasswordBusy, setDbPasswordBusy] = useState(false);

  const [acceptPolicies, setAcceptPolicies] = useState(false);
  const [otpToken, setOtpToken] = useState("");
  const [signupStep, setSignupStep] = useState<1 | 2 | 3>(1);
  const [resendSeconds, setResendSeconds] = useState(0);

  const strongPassword = useMemo(() => passwordStrength(password), [password]);
  const strongPasswordOk = strongPassword.length && strongPassword.upper && strongPassword.number && strongPassword.special;
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  const dbPasswordStrObj = useMemo(() => passwordStrength(dbNewPassword), [dbNewPassword]);
  const dbPasswordValid = dbPasswordStrObj.length && dbPasswordStrObj.upper && dbPasswordStrObj.number && dbPasswordStrObj.special;
  const dbPasswordsIdentical = dbConfirmPassword.length > 0 && dbNewPassword === dbConfirmPassword;

  const profileSectionDirty = useMemo(
    () =>
      profile.name.trim() !== baselineProfile.name.trim() ||
      digitsOnly(profile.phone) !== digitsOnly(baselineProfile.phone) ||
      profile.kidsAge.trim() !== baselineProfile.kidsAge.trim(),
    [profile, baselineProfile]
  );

  const addressDirty = useMemo(
    () => profile.address.trim() !== baselineProfile.address.trim(),
    [profile, baselineProfile]
  );

  // Time-based Greeting Filter Logic
  const timeBasedGreeting = useMemo(() => {
    const currentHour = new Date().getHours();
    if (currentHour >= 4 && currentHour < 12) return "Good morning";
    if (currentHour >= 12 && currentHour < 17) return "Good afternoon";
    if (currentHour >= 17 && currentHour < 22) return "Good evening";
    return "Good night";
  }, []);

  const clearAuthInputs = () => {
    setPassword("");
    setConfirmPassword("");
    setOtpToken("");
    setAcceptPolicies(false);
    setResendSeconds(0);
    setSignupStep(1);
    setDbNewPassword("");
    setDbConfirmPassword("");
  };

  const hydrateAccount = async () => {
    const { data } = await supabase.auth.getSession();
    const session = data.session;

    if (!session?.user) {
      setAuthUser(null);
      setDbUser(null);
      setOrders([]);
      setReviews([]);
      setProfile(emptyProfile);
      setBaselineProfile(emptyProfile);
      return false;
    }

    setAuthUser(session.user);

    const profileRes = await fetch("/api/profile");
    let nextDbUser: any = null;

    if (profileRes.ok) {
      const json = await profileRes.json();
      nextDbUser = json.user ?? null;
    }

    const fallbackProfile: ProfileState = {
      name: session.user.user_metadata?.name ?? session.user.email?.split("@")[0] ?? "",
      phone: "",
      kidsAge: "",
      address: "",
    };

    if (nextDbUser) {
      const nextProfile: ProfileState = {
        name: nextDbUser.name ?? fallbackProfile.name,
        phone: stripPhone(nextDbUser.phone),
        kidsAge: nextDbUser.kidsAge ?? "",
        address: nextDbUser.address ?? "",
      };
      setDbUser(nextDbUser);
      setOrders(nextDbUser.orders ?? []);
      setReviews(nextDbUser.reviews ?? []);
      setProfile(nextProfile);
      setBaselineProfile(nextProfile);
    } else {
      setDbUser({
        email: session.user.email,
        orders: [],
        reviews: [],
      });
      setOrders([]);
      setReviews([]);
      setProfile(fallbackProfile);
      setBaselineProfile(fallbackProfile);
    }

    const currentDevice = deviceLabel();
    setAudit((prev) => ({
      ...prev,
      lastSignIn: session.user.last_sign_in_at ?? new Date().toISOString(),
      device: currentDevice,
      activeSessions: 1,
    }));

    (async () => {
      let resolvedIp = "Connection Unverified";
      let resolvedLocation = "Routing Restrained";

      try {
        const res = await fetch("https://ipapi.co/json/");
        if (res.ok) {
          const ipData = await res.json();
          if (ipData.ip) {
            resolvedIp = ipData.ip;
            resolvedLocation = ipData.city ? `${ipData.city}, ${ipData.region}, ${ipData.country_name}` : "Unknown Origin";
          }
        } else {
          throw new Error("Primary interface unreachable");
        }
      } catch {
        try {
          const fallbackRes = await fetch("https://api.ipify.org?format=json");
          if (fallbackRes.ok) {
            const fbData = await fallbackRes.json();
            resolvedIp = fbData.ip || "Connection Unverified";
            resolvedLocation = "Location Protected";
          }
        } catch {
          resolvedIp = "Connection Unverified";
          resolvedLocation = "Routing Restrained";
        }
      }

      setAudit((prev) => ({
        ...prev,
        ip: resolvedIp,
        location: resolvedLocation,
      }));
    })();

    setView("DASHBOARD");
    return true;
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setPageLoading(true);
      try {
        const loaded = await hydrateAccount();
        if (!mounted) return;
        if (!loaded) {
          setView(resetMode ? "RESET" : "LOGIN");
        }
      } finally {
        if (mounted) setPageLoading(false);
      }
    };

    void init();

    const interval = setInterval(() => {
      setResendSeconds((value) => (value > 0 ? value - 1 : 0));
    }, 1000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [resetMode]);

  const saveProfile = async (nextProfile: ProfileState) => {
    setError("");
    setMessage("");
    setSaveBusy(true);

    if (nextProfile.phone && digitsOnly(nextProfile.phone).length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      setSaveBusy(false);
      return false;
    }

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nextProfile.name,
          phone: normalizePhone(nextProfile.phone),
          kidsAge: nextProfile.kidsAge,
          address: nextProfile.address,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error ?? "Failed to save updates.");
        return false;
      }

      const updated = data.user ?? null;
      setDbUser(updated);
      if (updated) {
        const refreshed: ProfileState = {
          name: updated.name ?? "",
          phone: stripPhone(updated.phone),
          kidsAge: updated.kidsAge ?? "",
          address: updated.address ?? "",
        };
        setProfile(refreshed);
        setBaselineProfile(refreshed);
        setOrders(updated.orders ?? []);
        setReviews(updated.reviews ?? []);
      } else {
        setBaselineProfile(nextProfile);
      }

      setMessage("Your profile updates have been saved.");
      setEditingProfile(false);
      setEditingAddress(false);
      return true;
    } finally {
      setSaveBusy(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!acceptPolicies) {
      setError("You must acknowledge and accept our terms & conditions, and other policies to proceed.");
      return;
    }

    setAuthBusy(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Invalid email or password. Typo? Forget passwd?");
      setAuthBusy(false);
      return;
    }

    await hydrateAccount();
    setAuthBusy(false);
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!acceptPolicies) {
      setError("You must agree to the terms, conditions, and cancellation policies to create an account.");
      return;
    }

    setAuthBusy(true);

    try {
      const checkRes = await fetch(`/api/profile?checkEmail=${encodeURIComponent(email)}`);
      if (checkRes.ok) {
        const checkData = await checkRes.json();
        if (checkData.exists) {
          setError("This email is already registered. Please log in instead.");
          setAuthBusy(false);
          return;
        }
      }
    } catch {
      setError("Validation system failure. Please try again.");
      setAuthBusy(false);
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });

    setAuthBusy(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSignupStep(2);
    setResendSeconds(45);
    setMessage("An 8-digit verification code was sent to your inbox.");
  };

  const handleResendOTP = async () => {
    if (resendSeconds > 0 || resendBusy) return;

    setError("");
    setMessage("");
    setResendBusy(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });

    setResendBusy(false);

    if (error) {
      setError(error.message);
      return;
    }

    setResendSeconds(45);
    setMessage("Verification code resent successfully.");
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setAuthBusy(true);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otpToken.trim(),
      type: "email",
    });

    if (error) {
      setError("Invalid or expired code. Verify and try again.");
      setAuthBusy(false);
      return;
    }

    setSignupStep(3);
    setAuthBusy(false);
  };

  const handleCompleteOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!strongPasswordOk) {
      setError("Password strength validation failed. Complete all security criteria.");
      return;
    }

    if (!passwordsMatch) {
      setError("Password parameters do not match.");
      return;
    }

    if (!profile.name.trim() || !profile.phone || !profile.kidsAge.trim() || !profile.address.trim()) {
      setError("All user profile fields are mandatory.");
      return;
    }

    if (digitsOnly(profile.phone).length !== 10) {
      setError("Please input a standard 10-digit mobile phone number.");
      return;
    }

    setAuthBusy(true);

    try {
      const checkPhoneRes = await fetch(`/api/profile?checkPhone=${encodeURIComponent(profile.phone)}`);
      if (checkPhoneRes.ok) {
        const checkPhoneData = await checkPhoneRes.json();
        if (checkPhoneData.exists) {
          setError("This mobile number is already used on another account.");
          setAuthBusy(false);
          return;
        }
      }
    } catch {
      setError("Phone duplication verification check failed. Retry.");
      setAuthBusy(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      setAuthBusy(false);
      return;
    }

    const saved = await saveProfile(profile);
    if (!saved) {
      setAuthBusy(false);
      return;
    }

    await hydrateAccount();
    setMessage("Account setup completed.");
    setView("DASHBOARD");
    setAuthBusy(false);
  };

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Email address parameter is mandatory.");
      return;
    }

    setAuthBusy(true);

    const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/account?mode=reset` : undefined;

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });

    setAuthBusy(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Link sent. Plese use that link to login to your account and please update password and save it.");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!strongPasswordOk) {
      setError("Password criteria requirements not met.");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords entries must match completely.");
      return;
    }

    setAuthBusy(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setAuthBusy(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Credentials updated. Synchronizing secure view.");
    clearAuthInputs();
    await hydrateAccount();
    setView("DASHBOARD");
  };

  const handleUpdateDashboardPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!dbPasswordValid) {
      setError("Password must satisfy all security metrics.");
      return;
    }
    if (!dbPasswordsIdentical) {
      setError("Password entries do not match.");
      return;
    }

    setDbPasswordBusy(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password: dbNewPassword,
    });

    setDbPasswordBusy(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessage("passwd updated successfully!");
    setDbNewPassword("");
    setDbConfirmPassword("");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthUser(null);
    setDbUser(null);
    setOrders([]);
    setReviews([]);
    setProfile(emptyProfile);
    setBaselineProfile(emptyProfile);
    setView("LOGIN");
    clearAuthInputs();
    router.refresh();
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#fcfbf7] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-emerald-100 border-t-[#c5a880] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfbf7] font-sans antialiased text-[#1e2522] px-4 py-12">
      <div className="mx-auto w-full max-w-7xl">
        
        {/* Alerts & Notifications Block */}
        {error && (
          <div className="mx-auto mb-6 flex items-center justify-between w-full max-w-xl rounded-xl border border-red-200 bg-red-50/60 px-4 py-3.5 text-sm text-red-800 shadow-sm backdrop-blur-sm animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <AlertCircle size={18} className="shrink-0 text-red-600" />
              <span className="font-medium text-sm">{error}</span>
            </div>
            <button 
              onClick={() => setError("")}
              className="text-red-500 hover:text-red-800 p-1 rounded-lg hover:bg-red-100/50 transition shrink-0"
              aria-label="Dismiss message"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {message && (
          <div className="mx-auto mb-6 flex items-center justify-between w-full max-w-xl rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3.5 text-sm text-emerald-900 shadow-sm backdrop-blur-sm animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <CheckCircle size={18} className="shrink-0 text-emerald-700" />
              <span className="font-medium text-sm">{message}</span>
            </div>
            <button 
              onClick={() => setMessage("")}
              className="text-emerald-600 hover:text-emerald-900 p-1 rounded-lg hover:bg-emerald-100/50 transition shrink-0"
              aria-label="Dismiss message"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {view === "LOGIN" && (
          <div className="mx-auto w-full max-w-[440px] bg-white rounded-2xl border-1 border-[#c5a880] shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-8 md:p-10 mt-4 transition-all">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold tracking-tight text-[#163300]">Welcome Back</h1>
              <p className="text-sm text-gray-500 mt-2">How r u doing? Happy Shopping!</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-wider text-gray-700 uppercase">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email-address@example.com"
                    className="w-full text-base rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-4 py-2.5 outline-none focus:border-[#163300] focus:bg-white focus:ring-4 focus:ring-emerald-800/5 transition duration-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold tracking-wider text-gray-700 uppercase">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-base rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-10 py-2.5 outline-none focus:border-[#163300] focus:bg-white focus:ring-4 focus:ring-emerald-800/5 transition duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-2.5 text-xs text-gray-600 cursor-pointer select-none leading-relaxed">
                  <input
                    type="checkbox"
                    required
                    checked={acceptPolicies}
                    onChange={(e) => setAcceptPolicies(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded-md border-gray-300 accent-[#163300] focus:ring-0 transition"
                  />
                  <span>
                    I accept {" "}
                    <Link href="/terms" className="text-emerald-800 font-semibold hover:underline">Terms & Conditions</Link>,{" "}
                    <Link href="/privacy" className="text-emerald-800 font-semibold hover:underline">Privacy Policy</Link>, {" "}
                    <Link href="/refund" className="text-emerald-800 font-semibold hover:underline">Return, Refund, & Cancellation Policy</Link>, and {" "}
                    <Link href="/shipping" className="text-emerald-800 font-semibold hover:underline">Shipping Policy</Link>.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={authBusy}
                className="w-full bg-[#163300] hover:bg-[#234e02] disabled:bg-gray-400 text-white rounded-xl text-base py-3 font-semibold transition duration-200 shadow-md transform active:scale-[0.99]"
              >
                {authBusy ? "Verifying..." : "Sign In"}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between text-sm border-t border-gray-100 pt-5">
              <button
                type="button"
                onClick={() => {
                  setView("RESET");
                  setResetEmail(email);
                  setError("");
                  setMessage("");
                }}
                className="text-gray-500 hover:text-emerald-900 transition font-medium"
              >
                Forgot password?
              </button>
              <button
                type="button"
                onClick={() => {
                  setView("SIGNUP");
                  setError("");
                  setMessage("");
                }}
                className="text-emerald-800 font-bold hover:text-[#234e02] hover:underline transition"
              >
                Create account
              </button>
            </div>
          </div>
        )}

        {view === "SIGNUP" && (
          <div className="mx-auto w-full max-w-[440px] bg-white rounded-2xl border-1 border-[#c5a880] shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-8 md:p-10 mt-4 transition-all">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold tracking-tight text-[#163300]">Create Account</h1>
              <p className="text-sm text-gray-500 mt-2">Mom & Son &mdash; Premium Kids Wear</p>
            </div>

            {signupStep === 1 && (
              <form onSubmit={handleSendOTP} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider text-gray-700 uppercase">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value.trim())}
                      placeholder="email-address@example.com"
                      className="w-full text-base rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-4 py-2.5 outline-none focus:border-[#163300] focus:bg-white focus:ring-4 focus:ring-emerald-800/5 transition duration-200"
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <label className="flex items-start gap-2.5 text-xs text-gray-600 cursor-pointer select-none leading-relaxed">
                    <input
                      type="checkbox"
                      required
                      checked={acceptPolicies}
                      onChange={(e) => setAcceptPolicies(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded-md border-gray-300 accent-[#163300] focus:ring-0 transition"
                    />
                    <span>
                      I accept {" "}
                      <Link href="/terms" className="text-emerald-800 font-semibold hover:underline">Terms & Conditions</Link>, {" "}
                      <Link href="/privacy" className="text-emerald-800 font-semibold hover:underline">Privacy Policy</Link>, {" "}
                      <Link href="/refund" className="text-emerald-800 font-semibold hover:underline">Return, Refund, & Cancellation Policy</Link>, and {" "}
                      <Link href="/shipping" className="text-emerald-800 font-semibold hover:underline">Shipping Policy</Link>.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={authBusy}
                  className="w-full bg-[#163300] hover:bg-[#234e02] disabled:bg-gray-400 text-white rounded-xl text-base py-3 font-semibold transition duration-200 shadow-md"
                >
                  {authBusy ? "Sending OTP" : "Verify Email with OTP"}
                </button>

                <div className="text-center text-sm border-t border-gray-100 pt-5 text-gray-500">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setView("LOGIN");
                      setError("");
                      setMessage("");
                    }}
                    className="text-emerald-800 font-bold hover:underline"
                  >
                    Sign in
                  </button>
                </div>
              </form>
            )}

            {signupStep === 2 && (
              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div className="text-center pb-2">
                  <ShieldCheck className="mx-auto text-emerald-800 mb-2" size={32} />
                  <p className="text-sm text-gray-600">Verification code sent to <br /><strong className="text-gray-900">{email}</strong></p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider text-gray-700 uppercase block text-center">Enter 8-Digit Code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={8}
                    required
                    value={otpToken}
                    onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, "").slice(0, 8))}
                    placeholder="12345678"
                    className="w-full text-center tracking-[0.3em] text-2xl font-bold p-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:border-[#163300] outline-none transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authBusy}
                  className="w-full bg-[#163300] hover:bg-[#234e02] text-white rounded-xl text-base py-3 font-semibold transition duration-200 shadow-md"
                >
                  {authBusy ? "Validating Code..." : "Confirm Verification"}
                </button>

                <div className="flex flex-col items-center gap-2.5 pt-3 border-t border-gray-100 text-sm">
                  <button
                    type="button"
                    disabled={resendSeconds > 0 || resendBusy}
                    onClick={handleResendOTP}
                    className="text-emerald-800 font-semibold disabled:text-gray-400 hover:underline transition"
                  >
                    {resendSeconds > 0 ? `Resend code in ${resendSeconds}s` : "Resend Code"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignupStep(1)}
                    className="text-gray-500 hover:text-gray-800 transition"
                  >
                    Change email address
                  </button>
                </div>
              </form>
            )}

            {signupStep === 3 && (
              <form onSubmit={handleCompleteOnboarding} className="space-y-4">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs text-emerald-800 flex items-center gap-2 font-medium">
                  <CheckCircle size={15} className="shrink-0" /> Verified. Complete your account setup details below.
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Full Name</label>
                    <input
                      type="text"
                      required
                      value={profile.name}
                      onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Your Name"
                      className="w-full text-base rounded-xl border border-gray-200 px-3.5 py-2 outline-none focus:border-[#163300] focus:ring-4 focus:ring-emerald-800/5 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Mobile Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="tel"
                        inputMode="numeric"
                        required
                        maxLength={10}
                        value={profile.phone}
                        onChange={(e) => setProfile((prev) => ({ ...prev, phone: digitsOnly(e.target.value) }))}
                        placeholder="9876543210"
                        className="w-full text-base rounded-xl border border-gray-200 pl-10 pr-4 py-2 outline-none focus:border-[#163300] focus:ring-4 focus:ring-emerald-800/5 transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Child Milestone</label>
                    <div className="relative">
                      <Baby className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        required
                        value={profile.kidsAge}
                        onChange={(e) => setProfile((prev) => ({ ...prev, kidsAge: e.target.value }))}
                        placeholder="e.g., 6 months, 2 years"
                        className="w-full text-base rounded-xl border border-gray-200 pl-10 pr-4 py-2 outline-none focus:border-[#163300] focus:ring-4 focus:ring-emerald-800/5 transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Delivery Address</label>
                    <textarea
                      required
                      rows={2}
                      value={profile.address}
                      onChange={(e) => setProfile((prev) => ({ ...prev, address: e.target.value }))}
                      placeholder="Complete Shipping Address..."
                      className="w-full resize-none text-base rounded-xl border border-gray-200 px-3.5 py-2 outline-none focus:border-[#163300] focus:ring-4 focus:ring-emerald-800/5 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Create Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className="w-full text-base rounded-xl border border-gray-200 pl-10 pr-10 py-2 outline-none focus:border-[#163300] focus:ring-4 focus:ring-emerald-800/5 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2 pt-1.5 text-[11px] text-gray-400">
                      <p className={strongPassword.length ? "text-emerald-800 font-medium" : ""}>✓ Min 8 characters</p>
                      <p className={strongPassword.upper ? "text-emerald-800 font-medium" : ""}>✓ Uppercase letter</p>
                      <p className={strongPassword.number ? "text-emerald-800 font-medium" : ""}>✓ Contain number</p>
                      <p className={strongPassword.special ? "text-emerald-800 font-medium" : ""}>✓ Special symbol</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm password entry"
                        className="w-full text-base rounded-xl border border-gray-200 pl-10 pr-10 py-2 outline-none focus:border-[#163300] transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {confirmPassword.length > 0 && (
                      <p className={`text-[11px] font-semibold ${passwordsMatch ? "text-emerald-800" : "text-red-600"}`}>
                        {passwordsMatch ? "Passwords match verified" : "Passwords do not match"}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authBusy}
                  className="w-full bg-[#163300] hover:bg-[#234e02] text-white rounded-xl text-base py-3 font-semibold transition duration-200 shadow-md mt-2"
                >
                  {authBusy ? "Creating Profile Account..." : "Finalize Profile Registration"}
                </button>
              </form>
            )}
          </div>
        )}

        {view === "RESET" && (
          <div className="mx-auto w-full max-w-[440px] bg-white rounded-2xl border-1 border-[#c5a880] shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-8 md:p-10 mt-4 transition-all">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold tracking-tight text-[#163300]">Reset Password</h1>
              <p className="text-sm text-gray-500 mt-2">Oh! it happens with all of us.</p>
            </div>

            {!authUser ? (
              <form onSubmit={handleSendResetEmail} className="space-y-5">
                <p className="text-sm text-gray-500 leading-relaxed">
                  Submit email address you used to create account. A linked will be shared. After successful login please change you password and save it.
                </p>
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider text-gray-700 uppercase">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="email"
                      required
                      value={resetEmail || email}
                      onChange={(e) => {
                        setResetEmail(e.target.value);
                        setEmail(e.target.value);
                      }}
                      placeholder="name@example.com"
                      className="w-full text-base rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-4 py-2.5 outline-none focus:border-[#163300]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authBusy}
                  className="w-full bg-[#163300] hover:bg-[#234e02] text-white rounded-xl text-base py-3 font-semibold transition duration-200 shadow-md"
                >
                  {authBusy ? "Sending link..." : "Send Reset Link"}
                </button>

                <div className="text-center text-sm border-t border-gray-100 pt-5">
                  <button
                    type="button"
                    onClick={() => setView("LOGIN")}
                    className="text-gray-500 hover:text-emerald-900 transition font-medium"
                  >
                    Remember passwd? Return to login
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 uppercase">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 8 characters"
                        className="w-full text-base rounded-xl border border-gray-200 pl-10 pr-10 py-2 outline-none focus:border-[#163300]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 uppercase">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter verification code"
                        className="w-full text-base rounded-xl border border-gray-200 pl-10 pr-10 py-2 outline-none focus:border-[#163300]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authBusy}
                  className="w-full bg-[#163300] hover:bg-[#234e02] text-white rounded-xl text-base py-3 font-semibold transition duration-200 shadow-md"
                >
                  {authBusy ? "Saving changes..." : "Save Password & Connect"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Premium Dashboard Workspace */}
        {view === "DASHBOARD" && (
          <div className="space-y-6">
            
            {/* Top Greeting Frame */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200/80 pb-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                  Hi, {profile.name || "User"}. {timeBasedGreeting}!
                </h1>
              </div>
              <button
                onClick={handleLogout}
                className="mt-1 sm:mt-0 self-start sm:self-center flex items-center gap-1.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-1.5 text-sm font-semibold text-gray-700 shadow-sm transition duration-150"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>

            {/* Layout Split System */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
              
              {/* Sidebar: Identity & Compact Update Password Cards stacked together */}
              <aside className="space-y-5">
                
                {/* Profile Meta Details */}
                <div className="bg-white rounded-2xl border border-emerald-900/5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-5">
                  <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#163300] text-sm font-bold text-white shrink-0">
                      {profile.name ? profile.name[0].toUpperCase() : "U"}
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-bold text-gray-900">
                        {profile.name || "User Details"}
                      </h2>
                      <p className="truncate text-xs text-gray-400">{dbUser?.email}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Live Session Connection Verification Indicator */}
                    <div className="flex items-start gap-2.5 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/50">
                      <span className="mt-1 relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
                      </span>
                      <div className="text-xs">
                        <p className="font-bold text-emerald-950">Session Active</p>
                        <p className="text-emerald-700/80">Secure Connection Verified</p>
                      </div>
                    </div>

                    {/* Infrastructure Audit Metadata metrics */}
                    <div className="border-t border-gray-100 pt-3.5 space-y-2.5 text-xs">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Laptop size={14} className="text-gray-400 shrink-0" />
                        <span className="truncate"><strong>Device:</strong> {audit.device}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Globe size={14} className="text-gray-400 shrink-0" />
                        <span className="truncate"><strong>IP Address:</strong> {audit.ip}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Compass size={14} className="text-gray-400 shrink-0" />
                        <span className="leading-normal"><strong>Location:</strong> {audit.location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Update Password: Small compact card placed out of the main panel layout right below telemetry */}
                <div className="bg-white rounded-2xl border border-emerald-900/5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-5">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-2 mb-3">
                    <KeyRound className="text-emerald-800" size={15} />
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Update Password</h3>
                  </div>

                  <form onSubmit={handleUpdateDashboardPassword} className="space-y-3">
                    <div className="space-y-2.5">
                      <div className="space-y-1">
                        <span className="block text-[11px] font-semibold text-gray-500">New Password</span>
                        <div className="relative">
                          <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                          <input
                            type={showDbNewPassword ? "text" : "password"}
                            required
                            value={dbNewPassword}
                            onChange={(e) => setDbNewPassword(e.target.value)}
                            placeholder="Min 8 characters"
                            className="w-full text-xs rounded-lg border border-gray-200 bg-gray-50/50 pl-7.5 pr-8 py-1.5 outline-none focus:border-emerald-800 focus:bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowDbNewPassword(!showDbNewPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                          >
                            {showDbNewPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-x-2 pt-0.5 text-[9px] text-gray-400">
                          <span className={dbPasswordStrObj.length ? "text-emerald-800 font-medium" : ""}>✓ 8 Chars</span>
                          <span className={dbPasswordStrObj.upper ? "text-emerald-800 font-medium" : ""}>✓ Caps</span>
                          <span className={dbPasswordStrObj.number ? "text-emerald-800 font-medium" : ""}>✓ Num</span>
                          <span className={dbPasswordStrObj.special ? "text-emerald-800 font-medium" : ""}>✓ Symbol</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="block text-[11px] font-semibold text-gray-500">Confirm Password</span>
                        <div className="relative">
                          <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                          <input
                            type={showDbConfirmPassword ? "text" : "password"}
                            required
                            value={dbConfirmPassword}
                            onChange={(e) => setDbConfirmPassword(e.target.value)}
                            placeholder="Re-enter password"
                            className="w-full text-xs rounded-lg border border-gray-200 bg-gray-50/50 pl-7.5 pr-8 py-1.5 outline-none focus:border-emerald-800 focus:bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowDbConfirmPassword(!showDbConfirmPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                          >
                            {showDbConfirmPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                        </div>
                        {dbConfirmPassword.length > 0 && (
                          <p className={`text-[9px] font-medium pt-0.5 ${dbPasswordsIdentical ? "text-emerald-800" : "text-red-600"}`}>
                            {dbPasswordsIdentical ? "Passwords match verified" : "Passwords do not match"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end pt-2 border-t border-gray-50">
                      <button
                        type="submit"
                        disabled={dbPasswordBusy || !dbPasswordValid || !dbPasswordsIdentical}
                        className="bg-[#163300] hover:bg-[#234e02] disabled:bg-gray-100 disabled:text-gray-400 text-[#11px] text-white px-3 py-1 rounded-lg transition font-semibold"
                      >
                        {dbPasswordBusy ? "Updating..." : "Update Password"}
                      </button>
                    </div>
                  </form>
                </div>

              </aside>

              {/* Main Column Workspaces */}
              <div className="space-y-6">
                
                {/* Row 1: Profile Properties & Shipping Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Your Profile Card */}
                  <div className="bg-white rounded-2xl border border-emerald-900/5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2.5 mb-4">
                        <div className="flex items-center gap-2">
                          <User className="text-emerald-800" size={16} />
                          <h3 className="text-base font-bold text-gray-900">Your Info</h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (editingProfile) setProfile(baselineProfile);
                            setEditingProfile(!editingProfile);
                          }}
                          className="text-gray-400 hover:text-emerald-800 transition"
                        >
                          <Pencil size={14} />
                        </button>
                      </div>

                      <div className="space-y-3.5 text-sm">
                        <div>
                          <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Name</span>
                          {editingProfile ? (
                            <input
                              type="text"
                              required
                              value={profile.name}
                              onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                              className="mt-1 w-full text-sm rounded-lg border border-gray-200 bg-gray-50/50 px-2.5 py-1.5 outline-none focus:border-emerald-800 focus:bg-white"
                            />
                          ) : (
                            <p className="font-semibold text-gray-800 mt-0.5">{profile.name || "—"}</p>
                          )}
                        </div>

                        <div>
                          <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</span>
                          <p className="text-gray-500 mt-0.5 break-all select-all">
                            {dbUser?.email}
                          </p>
                        </div>

                        <div>
                          <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Mobile Number</span>
                          {editingProfile ? (
                            <input
                              type="tel"
                              inputMode="numeric"
                              required
                              maxLength={10}
                              value={profile.phone}
                              onChange={(e) => setProfile((prev) => ({ ...prev, phone: digitsOnly(e.target.value) }))}
                              className="mt-1 w-full text-sm rounded-lg border border-gray-200 bg-gray-50/50 px-2.5 py-1.5 outline-none focus:border-emerald-800 focus:bg-white"
                            />
                          ) : (
                            <p className="font-semibold text-gray-800 mt-0.5">
                              {profile.phone ? `+91 ${profile.phone}` : "—"}
                            </p>
                          )}
                        </div>

                        <div>
                          <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Child Age</span>
                          {editingProfile ? (
                            <input
                              type="text"
                              required
                              value={profile.kidsAge}
                              onChange={(e) => setProfile((prev) => ({ ...prev, kidsAge: e.target.value }))}
                              className="mt-1 w-full text-sm rounded-lg border border-gray-200 bg-gray-50/50 px-2.5 py-1.5 outline-none focus:border-emerald-800 focus:bg-white"
                            />
                          ) : (
                            <p className="font-semibold text-gray-800 mt-0.5">{profile.kidsAge || "—"}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {editingProfile && (
                      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                        <Button
                          type="button"
                          variant="secondary"
                          className="text-xs bg-[#163300] hover:bg-[#234e02] text-white px-3.5 py-1.5 rounded-lg border-none"
                          disabled={!profileSectionDirty || saveBusy}
                          onClick={() => saveProfile(profile)}
                        >
                          {saveBusy ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Address Book Card */}
                  <div className="bg-white rounded-2xl border border-emerald-900/5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2.5 mb-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="text-emerald-800" size={16} />
                          <h3 className="text-base font-bold text-gray-900">Address Book</h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (editingAddress) setProfile(baselineProfile);
                            setEditingAddress(!editingAddress);
                          }}
                          className="text-gray-400 hover:text-emerald-800 transition"
                        >
                          <Pencil size={14} />
                        </button>
                      </div>

                      <div className="space-y-2 text-sm"> 
                        {editingAddress ? (
                          <textarea
                            rows={3}
                            required
                            value={profile.address}
                            onChange={(e) => setProfile((prev) => ({ ...prev, address: e.target.value }))}
                            className="mt-1 w-full text-sm rounded-lg border border-gray-200 bg-gray-50/50 px-2.5 py-1.5 outline-none focus:border-emerald-800 focus:bg-white resize-none"
                          />
                        ) : (
                          <p className="text-gray-700 leading-relaxed font-medium bg-gray-50/60 p-3 rounded-xl border border-gray-100 min-h-[95px]">
                            {profile.address || "No delivery address added."}
                          </p>
                        )}
                      </div>
                    </div>

                    {editingAddress && (
                      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                        <Button
                          type="button"
                          variant="secondary"
                          className="text-xs bg-[#163300] hover:bg-[#234e02] text-white px-3.5 py-1.5 rounded-lg border-none"
                          disabled={!addressDirty || saveBusy}
                          onClick={() => saveProfile(profile)}
                        >
                          {saveBusy ? "Saving..." : "Save Address"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Row 2: Order Activity Logs & Feedback Ledger */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Order History Card */}
                  <div className="bg-white rounded-2xl border border-emerald-900/5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-5">
                    <div className="flex items-center gap-2 border-b border-gray-100 pb-2 mb-3">
                      <Package className="text-emerald-800" size={16} />
                      <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">Order History</h3>
                    </div>

                    {orders.length === 0 ? (
                      <div className="text-sm text-gray-400 py-6 text-center border border-dashed border-gray-100 rounded-xl bg-gray-50/50 font-medium">
                        you haven't shopped with us.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                        {orders.map((order: any) => (
                          <div key={order.id} className="text-sm border border-gray-100 rounded-xl p-3 bg-gray-50/50 hover:bg-gray-50 transition">
                            <div className="flex justify-between font-bold text-gray-800">
                              <span>Order #{String(order.id).slice(0, 8).toUpperCase()}</span>
                              <span className="text-emerald-900">₹{order.totalAmount ?? order.total_amount ?? 0}</span>
                            </div>
                            <div className="flex justify-between text-gray-400 mt-1.5 text-xs">
                              <span>{new Date(order.createdAt ?? order.created_at ?? Date.now()).toLocaleDateString()}</span>
                              <span className="bg-emerald-100/60 text-emerald-950 px-2 py-0.5 rounded-md uppercase tracking-wider font-bold text-[10px]">
                                {order.status ?? "Delivered"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reviews Card */}
                  <div className="bg-white rounded-2xl border border-emerald-900/5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-5">
                    <div className="flex items-center gap-2 border-b border-gray-100 pb-2 mb-3">
                      <Star className="text-emerald-800" size={16} />
                      <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">Reviews</h3>
                    </div>

                    {reviews.length === 0 ? (
                      <div className="text-sm text-gray-400 py-6 text-center border border-dashed border-gray-100 rounded-xl bg-gray-50/50 font-medium">
                        you haven't submitted reviews yet.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                        {reviews.map((review: any, index: number) => (
                          <div key={review.id ?? index} className="text-sm border border-gray-100 rounded-xl p-3 bg-gray-50/50">
                            <div className="flex justify-between font-bold text-gray-800">
                              <span className="truncate max-w-[140px]">{review.title || "Product Review"}</span>
                              <span className="text-gray-400 font-normal text-xs">{new Date(review.createdAt ?? Date.now()).toLocaleDateString()}</span>
                            </div>
                            <p className="text-gray-500 mt-1 line-clamp-2 leading-relaxed text-xs">{review.comment ?? review.text ?? ""}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
