"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { checkEmailExists } from "@/app/actions/auth-check";
import COPY, { REGISTRATION_TERMS } from "@/lib/constants/copy";
import {
  Camera,
  GraduationCap,
  ArrowLeft,
  ArrowRight,
  Mail,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  ExternalLink,
} from "lucide-react";

type View = "auth" | "forgot" | "forgot-success" | "verify-email";

const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-background academic-grain relative overflow-hidden">
      {/* Left Side Pane - Scholastic Branding (Hidden on mobile) */}
      <div className="lg:col-span-5 hidden lg:flex flex-col justify-between p-16 bg-[#060a16] text-white relative overflow-hidden border-r border-white/5 group">
        {/* Elegant background photo overlay with dark velvet mask for maximum contrast */}
        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-[2000ms] ease-out opacity-65 scale-105 group-hover:scale-100" style={{ backgroundImage: "url('/images/durham_graduation_hero.png')" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#060a16]/95 via-[#060a16]/90 to-[#060a16]/80 backdrop-blur-[2px] pointer-events-none" />
        
        <Link href="/" className="flex items-center gap-3 relative z-10 group self-start">
          <div className="p-2 rounded-xl bg-brand/20 text-brand transform group-hover:rotate-6 transition-all duration-300">
            <Camera className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <span className="text-2xl font-serif italic font-semibold tracking-tight text-white">
            {COPY.BRAND.NAME}
          </span>
        </Link>

        <div className="space-y-6 relative z-10 my-auto">
          <Badge variant="outline" className="border-brand/40 text-brand bg-brand/10 uppercase tracking-widest text-[9px] px-2.5 py-0.5 animate-pulse">
            Durham Collection · 2026
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-serif italic text-white font-bold leading-tight tracking-tight">
            记录您的<span className="text-brand not-italic font-sans font-bold ml-1">英伦快门</span>瞬间
          </h2>
          <p className="text-sm text-white/90 max-w-[34ch] font-sans leading-relaxed">
            预约杜伦本校专业摄影师，尊享微信安全预留档期，让光影定格巍峨的帕拉廷大教堂。
          </p>
        </div>

        <div className="text-xs text-white/60 relative z-10 border-t border-white/10 pt-6 flex justify-between items-center">
          <span>Durham University Pilot</span>
          <span className="font-mono text-[10px]">v1.2</span>
        </div>
      </div>

      {/* Right Side Pane - Actual Cards */}
      <div className="lg:col-span-7 flex items-center justify-center p-6 sm:p-12 relative z-10">
        {/* Subtle responsive ambient light */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand/5 blur-[100px] rounded-full pointer-events-none lg:hidden" />
        {children}
      </div>
    </div>
  );
};

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
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

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
    if (score <= 1) return { text: COPY.AUTH.PASSWORD_STRENGTH.WEAK, color: "text-red-500", bg: "bg-red-500" };
    if (score <= 2) return { text: COPY.AUTH.PASSWORD_STRENGTH.FAIR, color: "text-orange-500", bg: "bg-orange-500" };
    if (score <= 3) return { text: COPY.AUTH.PASSWORD_STRENGTH.GOOD, color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-500" };
    return { text: COPY.AUTH.PASSWORD_STRENGTH.STRONG, color: "text-green-600 dark:text-green-400", bg: "bg-green-600" };
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
      toast.success(COPY.AUTH.LOGIN_SUCCESS);
      router.push("/");
      router.refresh();
    }
    setLoading(false);
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (regPassword !== regConfirmPassword) {
      toast.error(COPY.AUTH.PASSWORDS_NOT_MATCH);
      return;
    }

    setLoading(true);

    // Pre-check: server-side email existence check
    const exists = await checkEmailExists(regEmail);
    if (exists) {
      toast.error(COPY.AUTH.ALREADY_REGISTERED);
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
          role: regRole || undefined,
          slug: regSlug || undefined,
        },
      },
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
        toast.error(COPY.AUTH.ALREADY_REGISTERED);
      } else {
        toast.error(error.message);
      }
    } else if (
      data.user &&
      (!data.user.identities || data.user.identities.length === 0)
    ) {
      toast.error(COPY.AUTH.ALREADY_REGISTERED);
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
    setTermsAccepted(false);
    setShowTerms(false);
  }

  const regStep1Valid = regRole && regName.trim() && regEmail.trim();
  const regStep2Valid = regPassword.length >= 6 && regPassword === regConfirmPassword && regWechat.trim();
  const pwStrength = getPasswordStrength(regPassword);
  const pwStrengthInfo = getPasswordStrengthLabel(pwStrength);

  // ─── Verify Email Success ────────────────────────────────────────────
  if (view === "verify-email") {
    return (
      <LayoutWrapper>
        <Card className="w-full max-w-md academic-glass border border-border/80 rounded-2xl shadow-xl overflow-hidden">
          <CardContent className="pt-8 text-center space-y-6 px-8 pb-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center border border-brand/20">
              <Mail className="h-7 w-7 text-brand" strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-serif italic font-bold text-primary">{COPY.AUTH.CHECK_EMAIL}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {COPY.AUTH.CHECK_EMAIL_DESC(regEmail)}
              </p>
            </div>
            <div className="bg-muted/50 rounded-xl p-5 text-sm text-muted-foreground text-left space-y-2 border border-border/50">
              <p className="font-semibold text-foreground text-xs uppercase tracking-wider">{COPY.AUTH.NEXT_STEPS}</p>
              <ol className="list-decimal list-inside space-y-1.5 text-xs">
                <li>{COPY.AUTH.STEP_1}</li>
                <li>{COPY.AUTH.STEP_2}</li>
                <li>{COPY.AUTH.STEP_3}</li>
              </ol>
            </div>
            <div className="space-y-3">
              <Button
                className="w-full tactile-btn bg-primary text-primary-foreground hover:bg-primary/95"
                onClick={() => {
                  setView("auth");
                  resetRegisterForm();
                }}
              >
                {COPY.AUTH.BACK_TO_LOGIN}
              </Button>
              <p className="text-xs text-muted-foreground pt-2">
                {COPY.AUTH.DIDNT_RECEIVE_EMAIL}{" "}
                <button
                  onClick={async () => {
                    await supabase.auth.resend({ type: "signup", email: regEmail });
                    toast.success(COPY.AUTH.VERIFICATION_EMAIL_RESENT);
                  }}
                  className="text-brand font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer"
                >
                  {COPY.AUTH.RESEND_EMAIL}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </LayoutWrapper>
    );
  }

  // ─── Forgot Password Success ─────────────────────────────────────────
  if (view === "forgot-success") {
    return (
      <LayoutWrapper>
        <Card className="w-full max-w-md academic-glass border border-border/80 rounded-2xl shadow-xl overflow-hidden">
          <CardContent className="pt-8 text-center space-y-6 px-8 pb-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center border border-brand/20">
              <CheckCircle2 className="h-7 w-7 text-brand" strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-serif italic font-bold text-primary">{COPY.AUTH.EMAIL_SENT}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {COPY.AUTH.EMAIL_SENT_DESC(forgotEmail)}
              </p>
            </div>
            <Button
              className="w-full tactile-btn bg-primary text-primary-foreground hover:bg-primary/95"
              onClick={() => {
                setView("auth");
                setForgotEmail("");
              }}
            >
              {COPY.AUTH.BACK_TO_LOGIN}
            </Button>
          </CardContent>
        </Card>
      </LayoutWrapper>
    );
  }

  // ─── Forgot Password Form ────────────────────────────────────────────
  if (view === "forgot") {
    return (
      <LayoutWrapper>
        <Card className="w-full max-w-md academic-glass border border-border/80 rounded-2xl shadow-xl overflow-hidden">
          <CardHeader className="text-center pt-8 px-8">
            <div className="flex items-center justify-center gap-2 mb-2 lg:hidden">
              <Camera className="h-6 w-6 text-brand" strokeWidth={1.5} />
              <CardTitle className="text-xl font-serif italic font-bold">{COPY.BRAND.NAME}</CardTitle>
            </div>
            <CardTitle className="text-2xl font-serif italic font-bold text-primary">{COPY.AUTH.RESET_PASSWORD}</CardTitle>
            <CardDescription className="text-xs">请输入您的邮箱重设密码</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8 pt-4">
            <button
              onClick={() => setView("auth")}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors font-medium"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> {COPY.AUTH.BACK_TO_LOGIN}
            </button>
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="forgot-email" className="text-xs font-semibold text-foreground/80">{COPY.AUTH.EMAIL}</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder={COPY.AUTH.EMAIL_PLACEHOLDER2}
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="rounded-xl border-border/80 h-10 bg-background/50 focus:bg-background transition-colors"
                  required
                  autoFocus
                />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {COPY.AUTH.ENTER_EMAIL_FOR_RESET}
              </p>
              <Button type="submit" className="w-full tactile-btn bg-primary text-primary-foreground hover:bg-primary/95 h-10" disabled={loading}>
                {loading ? COPY.AUTH.SENDING : COPY.AUTH.SEND_RESET_LINK}
              </Button>
            </form>
          </CardContent>
        </Card>
      </LayoutWrapper>
    );
  }

  // ─── Main Auth View (Login / Register) ───────────────────────────────
  return (
    <LayoutWrapper>
      <Card className="w-full max-w-md academic-glass border border-border/80 rounded-2xl shadow-xl overflow-hidden">
        <CardHeader className="text-center pt-8 px-8 pb-4">
          <div className="flex items-center justify-center gap-2 mb-2 lg:hidden">
            <Camera className="h-6 w-6 text-brand" strokeWidth={1.5} />
            <span className="text-xl font-serif italic font-bold text-primary">{COPY.BRAND.NAME}</span>
          </div>
          <CardTitle className="text-2xl font-serif italic font-bold text-primary">{COPY.BRAND.TAGLINE}</CardTitle>
          <CardDescription className="text-xs">{COPY.BRAND.DESCRIPTION}</CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <Tabs defaultValue={defaultTab} onValueChange={() => resetRegisterForm()}>
            <TabsList className="grid w-full grid-cols-2 rounded-xl p-1 bg-muted/60 h-11 border border-border/40">
              <TabsTrigger value="login" className="rounded-lg text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                {COPY.AUTH.LOGIN_TITLE}
              </TabsTrigger>
              <TabsTrigger value="register" className="rounded-lg text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                {COPY.AUTH.REGISTER_TITLE}
              </TabsTrigger>
            </TabsList>

            {/* ── LOGIN TAB ──────────────────────────────────────────── */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-xs font-semibold text-foreground/80">{COPY.AUTH.EMAIL}</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder={COPY.AUTH.EMAIL_PLACEHOLDER2}
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="rounded-xl border-border/80 h-10 bg-background/50 focus:bg-background transition-colors"
                    required
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password" className="text-xs font-semibold text-foreground/80">{COPY.AUTH.PASSWORD}</Label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(loginEmail);
                        setView("forgot");
                      }}
                      className="text-[11px] text-brand hover:underline font-semibold"
                    >
                      {COPY.AUTH.FORGOT_PASSWORD}
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showLoginPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="rounded-xl border-border/80 h-10 bg-background/50 focus:bg-background transition-colors pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showLoginPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full tactile-btn bg-primary text-primary-foreground hover:bg-primary/95 h-10 shadow-sm pt-2.5 mt-2" disabled={loading}>
                  {loading ? COPY.AUTH.SIGNING_IN : COPY.AUTH.SIGN_IN}
                </Button>
              </form>
            </TabsContent>

            {/* ── REGISTER TAB ───────────────────────────────────────── */}
            <TabsContent value="register">
              {/* Step indicator */}
              <div className="flex items-center gap-2 mt-6 mb-6">
                <div className={`flex items-center gap-2 text-xs font-semibold ${regStep >= 1 ? "text-primary" : "text-muted-foreground"}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${regStep >= 1 ? "bg-primary text-primary-foreground font-bold" : "bg-muted"}`}>1</span>
                  {COPY.AUTH.ACCOUNT_STEP}
                </div>
                <div className="flex-1 h-px bg-border/80" />
                <div className={`flex items-center gap-2 text-xs font-semibold ${regStep >= 2 ? "text-primary" : "text-muted-foreground"}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${regStep >= 2 ? "bg-primary text-primary-foreground font-bold" : "bg-muted"}`}>2</span>
                  {COPY.AUTH.DETAILS_STEP}
                </div>
              </div>

              <form onSubmit={handleRegister}>
                {/* Step 1: Role + Name + Email + Password */}
                {regStep === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-foreground/80">{COPY.AUTH.I_AM_A}</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setRegRole("STUDENT")}
                          className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all duration-300 ${
                            regRole === "STUDENT"
                              ? "border-brand bg-brand-light/30 text-brand-foreground dark:text-brand"
                              : "border-border/60 hover:border-muted-foreground/30 hover:bg-muted/10 bg-background/30"
                          }`}
                        >
                          <GraduationCap className={`h-6 w-6 ${regRole === "STUDENT" ? "text-brand" : "text-muted-foreground"}`} strokeWidth={1.5} />
                          <span className="text-xs font-semibold">{COPY.AUTH.ROLE_STUDENT}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRegRole("PHOTOGRAPHER")}
                          className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all duration-300 ${
                            regRole === "PHOTOGRAPHER"
                              ? "border-brand bg-brand-light/30 text-brand-foreground dark:text-brand"
                              : "border-border/60 hover:border-muted-foreground/30 hover:bg-muted/10 bg-background/30"
                          }`}
                        >
                          <Camera className={`h-6 w-6 ${regRole === "PHOTOGRAPHER" ? "text-brand" : "text-muted-foreground"}`} strokeWidth={1.5} />
                          <span className="text-xs font-semibold">{COPY.AUTH.ROLE_PHOTOGRAPHER}</span>
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-name" className="text-xs font-semibold text-foreground/80">{COPY.AUTH.FULL_NAME}</Label>
                      <Input
                        id="reg-name"
                        placeholder={COPY.AUTH.FULL_NAME_PLACEHOLDER}
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="rounded-xl border-border/80 h-10 bg-background/50 focus:bg-background transition-colors"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-email" className="text-xs font-semibold text-foreground/80">{COPY.AUTH.EMAIL}</Label>
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder={COPY.AUTH.EMAIL_PLACEHOLDER2}
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="rounded-xl border-border/80 h-10 bg-background/50 focus:bg-background transition-colors"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password" className="text-xs font-semibold text-foreground/80">{COPY.AUTH.PASSWORD}</Label>
                      <div className="relative">
                        <Input
                          id="reg-password"
                          type={showRegPassword ? "text" : "password"}
                          placeholder={COPY.AUTH.PASSWORD_PLACEHOLDER}
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="rounded-xl border-border/80 h-10 bg-background/50 focus:bg-background transition-colors pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showRegPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
                        </button>
                      </div>
                      {regPassword.length > 0 && (
                        <div className="space-y-1.5 mt-2 bg-muted/20 p-2 rounded-lg border border-border/30">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4].map((i) => (
                              <div
                                key={i}
                                className={`h-1 flex-1 rounded-full transition-all ${
                                  i <= pwStrength ? pwStrengthInfo.bg : "bg-muted/80"
                                }`}
                              />
                            ))}
                          </div>
                          <p className={`text-[10px] font-semibold ${pwStrengthInfo.color}`}>
                            密码强度：{pwStrengthInfo.text}
                          </p>
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      className="w-full tactile-btn bg-primary text-primary-foreground hover:bg-primary/95 h-10 mt-2"
                      onClick={() => setRegStep(2)}
                      disabled={!regStep1Valid}
                    >
                      {COPY.COMMON.SUBMIT} <ArrowRight className="h-4 w-4 ml-1.5" strokeWidth={1.75} />
                    </Button>
                  </div>
                )}

                {/* Step 2: WeChat + Phone + Confirm */}
                {regStep === 2 && (
                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={() => setRegStep(1)}
                      className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors font-medium"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" /> {COPY.COMMON.BACK}
                    </button>
                    <div className="space-y-2">
                      <Label htmlFor="reg-wechat" className="text-xs font-semibold text-foreground/80">{COPY.AUTH.WECHAT_ID}</Label>
                      <Input
                        id="reg-wechat"
                        placeholder={COPY.AUTH.WECHAT_ID_PLACEHOLDER}
                        value={regWechat}
                        onChange={(e) => setRegWechat(e.target.value)}
                        className="rounded-xl border-border/80 h-10 bg-background/50 focus:bg-background transition-colors"
                        required
                      />
                      <p className="text-[10px] text-muted-foreground/80">
                        {COPY.AUTH.WECHAT_ID_HINT_ROLE(regRole === "STUDENT" ? COPY.AUTH.ROLE_PHOTOGRAPHER : COPY.AUTH.ROLE_STUDENT)}
                      </p>
                    </div>
                    {regRole === "PHOTOGRAPHER" && (
                      <div className="space-y-2">
                        <Label htmlFor="reg-slug" className="text-xs font-semibold text-foreground/80">{COPY.AUTH.CUSTOM_PROFILE_URL}</Label>
                        <div className="flex items-center gap-0">
                          <span className="inline-flex items-center px-3.5 h-10 rounded-l-xl border border-r-0 bg-muted/50 border-border/80 text-xs text-muted-foreground font-medium">
                            /photographers/
                          </span>
                          <Input
                            id="reg-slug"
                            placeholder={COPY.AUTH.CUSTOM_PROFILE_URL_PLACEHOLDER}
                            value={regSlug}
                            onChange={(e) => setRegSlug(e.target.value.replace(/[^a-zA-Z0-9]/g, "").toLowerCase())}
                            className="rounded-r-xl rounded-l-none border-border/80 h-10 bg-background/50 focus:bg-background transition-colors"
                            maxLength={30}
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground/80">
                          {COPY.AUTH.CUSTOM_PROFILE_URL_HINT}
                        </p>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="reg-phone" className="text-xs font-semibold text-foreground/80">{COPY.AUTH.UK_PHONE}</Label>
                      <Input
                        id="reg-phone"
                        type="tel"
                        placeholder={COPY.AUTH.UK_PHONE_PLACEHOLDER}
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="rounded-xl border-border/80 h-10 bg-background/50 focus:bg-background transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-confirm-password" className="text-xs font-semibold text-foreground/80">{COPY.AUTH.CONFIRM_PASSWORD}</Label>
                      <Input
                        id="reg-confirm-password"
                        type="password"
                        placeholder={COPY.AUTH.RE_ENTER_PASSWORD}
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        className="rounded-xl border-border/80 h-10 bg-background/50 focus:bg-background transition-colors"
                        required
                      />
                      {regConfirmPassword && regPassword !== regConfirmPassword && (
                        <p className="text-xs text-red-500 font-medium">{COPY.AUTH.PASSWORDS_NOT_MATCH}</p>
                      )}
                    </div>

                    {/* Summary Card */}
                    <div className="bg-muted/40 rounded-xl p-4 text-xs space-y-1.5 border border-border/30">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{COPY.AUTH.I_AM_A}</span>
                        <span className="font-semibold text-primary">{regRole === "STUDENT" ? COPY.AUTH.ROLE_STUDENT : COPY.AUTH.ROLE_PHOTOGRAPHER}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{COPY.COMMON.NAME}</span>
                        <span className="font-semibold text-primary">{regName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{COPY.AUTH.EMAIL}</span>
                        <span className="font-semibold text-primary">{regEmail}</span>
                      </div>
                    </div>

                    {/* Registration Terms Box */}
                    <div className="border border-border/80 bg-background/30 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-brand" strokeWidth={1.5} />
                        <span className="text-xs font-semibold text-primary">注册及服务条款</span>
                      </div>
                      <div className="max-h-24 overflow-y-auto border border-border/50 rounded-lg p-3 text-[10px] text-muted-foreground/90 bg-muted/20">
                        <div className="whitespace-pre-wrap leading-relaxed">
                          {REGISTRATION_TERMS.split('\n').slice(0, 10).join('\n')}...
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowTerms(true)}
                          className="text-brand hover:underline text-[10px] font-semibold mt-2 inline-flex items-center gap-1.5 bg-transparent border-none p-0 cursor-pointer"
                        >
                          查看完整条款 <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
                        </button>
                      </div>
                      <div className="flex items-start gap-3 pt-1">
                        <input
                          type="checkbox"
                          id="reg-terms"
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded border-border text-brand focus:ring-brand"
                        />
                        <label htmlFor="reg-terms" className="text-xs leading-relaxed cursor-pointer font-medium text-foreground/80">
                          我已阅读并同意《SnapGown 用户注册条款》，包括账户安全、佣金规则、隐私授权及平台免责服务协议
                        </label>
                      </div>
                    </div>

                    {/* Terms Modal */}
                    {showTerms && (
                      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-background border rounded-2xl max-w-xl max-h-[75vh] overflow-hidden flex flex-col shadow-2xl">
                          <div className="flex items-center justify-between p-5 border-b">
                            <h3 className="font-serif italic font-bold text-lg text-primary">SnapGown 用户注册条款</h3>
                            <Button variant="ghost" size="sm" onClick={() => setShowTerms(false)} className="tactile-btn text-xs font-medium">
                              关闭
                            </Button>
                          </div>
                          <div className="overflow-y-auto p-6 text-xs text-muted-foreground leading-relaxed space-y-4">
                            <div className="whitespace-pre-wrap font-sans">
                              {REGISTRATION_TERMS}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <Button type="submit" className="w-full tactile-btn bg-brand text-brand-foreground hover:bg-brand/90 h-10 shadow-md shadow-brand/10" disabled={loading || !regStep2Valid || !termsAccepted}>
                      {loading ? COPY.AUTH.CREATING_ACCOUNT : COPY.AUTH.CREATE_ACCOUNT}
                    </Button>
                  </div>
                )}
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </LayoutWrapper>
  );
}
