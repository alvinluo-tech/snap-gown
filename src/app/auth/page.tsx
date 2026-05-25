"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { checkEmailExists } from "@/app/actions/auth-check";
import {
  Camera,
  GraduationCap,
  ArrowLeft,
  ArrowRight,
  Mail,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";

type View = "auth" | "forgot" | "forgot-success" | "verify-email";

export default function AuthPage() {
  return (
    <Suspense>
      <AuthContent />
    </Suspense>
  );
}

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") === "register" ? "register" : "login";
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<View>("auth");

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Forgot password form
  const [forgotEmail, setForgotEmail] = useState("");

  // Register form - multi-step
  const [regStep, setRegStep] = useState(1);
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regWechat, setRegWechat] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regSlug, setRegSlug] = useState("");
  const [regRole, setRegRole] = useState<"STUDENT" | "PHOTOGRAPHER" | "">("");
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Password strength
  function getPasswordStrength(pw: string) {
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score; // 0-5
  }

  function getPasswordStrengthLabel(score: number) {
    if (score <= 1) return { text: "Weak", color: "text-red-500", bg: "bg-red-500" };
    if (score <= 2) return { text: "Fair", color: "text-orange-500", bg: "bg-orange-500" };
    if (score <= 3) return { text: "Good", color: "text-yellow-500", bg: "bg-yellow-500" };
    return { text: "Strong", color: "text-green-600", bg: "bg-green-600" };
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Logged in successfully");
      router.push("/");
      router.refresh();
    }
    setLoading(false);
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (regPassword !== regConfirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    // Pre-check: server-side email existence check (requires service role key)
    const exists = await checkEmailExists(regEmail);
    if (exists) {
      toast.error("This email is already registered. Please log in instead.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: regEmail,
      password: regPassword,
      options: {
        data: {
          full_name: regName,
          wechat_id: regWechat,
          uk_phone: regPhone || "",
          role: regRole,
          slug: regSlug || "",
        },
      },
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
        toast.error("This email is already registered. Please log in instead.");
      } else {
        toast.error(error.message);
      }
    } else if (
      data.user &&
      (!data.user.identities || data.user.identities.length === 0)
    ) {
      toast.error("This email is already registered. Please log in instead.");
    } else {
      setView("verify-email");
    }
    setLoading(false);
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });

    if (error) {
      toast.error(error.message);
    } else {
      setView("forgot-success");
    }
    setLoading(false);
  }

  function resetRegisterForm() {
    setRegStep(1);
    setRegRole("");
    setRegName("");
    setRegEmail("");
    setRegPassword("");
    setRegConfirmPassword("");
    setRegWechat("");
    setRegPhone("");
    setRegSlug("");
  }

  const regStep1Valid = regRole && regName.trim() && regEmail.trim();
  const regStep2Valid = regPassword.length >= 6 && regPassword === regConfirmPassword && regWechat.trim();
  const pwStrength = getPasswordStrength(regPassword);
  const pwStrengthInfo = getPasswordStrengthLabel(pwStrength);

  // ─── Verify Email Success ────────────────────────────────────────────
  if (view === "verify-email") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Check your email</h2>
              <p className="text-muted-foreground">
                We&apos;ve sent a verification link to{" "}
                <span className="font-medium text-foreground">{regEmail}</span>
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground text-left space-y-2">
              <p className="font-medium text-foreground">Next steps:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Open your email inbox</li>
                <li>Click the verification link</li>
                <li>Return here to log in</li>
              </ol>
            </div>
            <div className="space-y-2">
              <Button
                className="w-full"
                onClick={() => {
                  setView("auth");
                  resetRegisterForm();
                }}
              >
                Back to Login
              </Button>
              <p className="text-xs text-muted-foreground">
                Didn&apos;t receive the email? Check your spam folder or{" "}
                <button
                  onClick={async () => {
                    await supabase.auth.resend({ type: "signup", email: regEmail });
                    toast.success("Verification email resent!");
                  }}
                  className="text-primary hover:underline"
                >
                  resend
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Forgot Password Success ─────────────────────────────────────────
  if (view === "forgot-success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Email sent</h2>
              <p className="text-muted-foreground">
                If an account exists for{" "}
                <span className="font-medium text-foreground">{forgotEmail}</span>,
                you&apos;ll receive a password reset link shortly.
              </p>
            </div>
            <Button
              className="w-full"
              onClick={() => {
                setView("auth");
                setForgotEmail("");
              }}
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Forgot Password Form ────────────────────────────────────────────
  if (view === "forgot") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Camera className="h-8 w-8 text-primary" />
              <CardTitle className="text-2xl">SnapGown</CardTitle>
            </div>
            <CardDescription>Reset your password</CardDescription>
          </CardHeader>
          <CardContent>
            <button
              onClick={() => setView("auth")}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to login
            </button>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email address</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="you@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Enter the email address you used to register. We&apos;ll send you a
                link to reset your password.
              </p>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Main Auth View (Login / Register) ───────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Camera className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl">SnapGown</CardTitle>
          </div>
          <CardDescription>Book your graduation photoshoot</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={defaultTab} onValueChange={() => resetRegisterForm()}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            {/* ── LOGIN TAB ──────────────────────────────────────────── */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">Password</Label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(loginEmail);
                        setView("forgot");
                      }}
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showLoginPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            {/* ── REGISTER TAB ───────────────────────────────────────── */}
            <TabsContent value="register">
              {/* Step indicator */}
              <div className="flex items-center gap-2 mt-4 mb-6">
                <div className={`flex items-center gap-1.5 text-sm font-medium ${regStep >= 1 ? "text-primary" : "text-muted-foreground"}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${regStep >= 1 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>1</span>
                  Account
                </div>
                <div className="flex-1 h-px bg-border" />
                <div className={`flex items-center gap-1.5 text-sm font-medium ${regStep >= 2 ? "text-primary" : "text-muted-foreground"}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${regStep >= 2 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>2</span>
                  Details
                </div>
              </div>

              <form onSubmit={handleRegister}>
                {/* Step 1: Role + Name + Email + Password */}
                {regStep === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>I am a</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setRegRole("STUDENT")}
                          className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                            regRole === "STUDENT"
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-muted-foreground/50"
                          }`}
                        >
                          <GraduationCap className={`h-6 w-6 ${regRole === "STUDENT" ? "text-primary" : "text-muted-foreground"}`} />
                          <span className="text-sm font-medium">Student</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRegRole("PHOTOGRAPHER")}
                          className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                            regRole === "PHOTOGRAPHER"
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-muted-foreground/50"
                          }`}
                        >
                          <Camera className={`h-6 w-6 ${regRole === "PHOTOGRAPHER" ? "text-primary" : "text-muted-foreground"}`} />
                          <span className="text-sm font-medium">Photographer</span>
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-name">Full Name</Label>
                      <Input
                        id="reg-name"
                        placeholder="John Smith"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-email">Email</Label>
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="you@example.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="reg-password"
                          type={showRegPassword ? "text" : "password"}
                          placeholder="Min. 6 characters"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {regPassword.length > 0 && (
                        <div className="space-y-1.5 mt-2">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4].map((i) => (
                              <div
                                key={i}
                                className={`h-1 flex-1 rounded-full transition-colors ${
                                  i <= pwStrength ? pwStrengthInfo.bg : "bg-muted"
                                }`}
                              />
                            ))}
                          </div>
                          <p className={`text-xs ${pwStrengthInfo.color}`}>
                            {pwStrengthInfo.text}
                          </p>
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      className="w-full"
                      onClick={() => setRegStep(2)}
                      disabled={!regStep1Valid}
                    >
                      Continue <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}

                {/* Step 2: WeChat + Phone + Confirm */}
                {regStep === 2 && (
                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={() => setRegStep(1)}
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" /> Back
                    </button>
                    <div className="space-y-2">
                      <Label htmlFor="reg-wechat">WeChat ID</Label>
                      <Input
                        id="reg-wechat"
                        placeholder="your_wechat_id"
                        value={regWechat}
                        onChange={(e) => setRegWechat(e.target.value)}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Used for payment communication with {regRole === "STUDENT" ? "photographers" : "students"}
                      </p>
                    </div>
                    {regRole === "PHOTOGRAPHER" && (
                      <div className="space-y-2">
                        <Label htmlFor="reg-slug">Custom Profile URL</Label>
                        <div className="flex items-center gap-0">
                          <span className="inline-flex items-center px-3 h-10 rounded-l-md border border-r-0 bg-muted text-sm text-muted-foreground">
                            /photographers/
                          </span>
                          <Input
                            id="reg-slug"
                            placeholder="alvin"
                            value={regSlug}
                            onChange={(e) => setRegSlug(e.target.value.replace(/[^a-zA-Z0-9]/g, "").toLowerCase())}
                            className="rounded-l-none"
                            maxLength={30}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Your shareable profile link. English letters and numbers only.
                        </p>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="reg-phone">UK Phone (optional)</Label>
                      <Input
                        id="reg-phone"
                        type="tel"
                        placeholder="+44 7xxx xxx xxx"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-confirm-password">Confirm Password</Label>
                      <Input
                        id="reg-confirm-password"
                        type="password"
                        placeholder="Re-enter your password"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        required
                      />
                      {regConfirmPassword && regPassword !== regConfirmPassword && (
                        <p className="text-xs text-red-500">Passwords do not match</p>
                      )}
                    </div>

                    {/* Summary */}
                    <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Role</span>
                        <span className="font-medium">{regRole === "STUDENT" ? "Student" : "Photographer"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name</span>
                        <span className="font-medium">{regName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email</span>
                        <span className="font-medium">{regEmail}</span>
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading || !regStep2Valid}>
                      {loading ? "Creating account..." : "Create Account"}
                    </Button>
                  </div>
                )}
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
