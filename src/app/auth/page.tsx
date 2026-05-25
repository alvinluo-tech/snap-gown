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
import COPY from "@/lib/constants/copy";
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
    if (score <= 1) return { text: COPY.AUTH.PASSWORD_STRENGTH.WEAK, color: "text-red-500", bg: "bg-red-500" };
    if (score <= 2) return { text: COPY.AUTH.PASSWORD_STRENGTH.FAIR, color: "text-orange-500", bg: "bg-orange-500" };
    if (score <= 3) return { text: COPY.AUTH.PASSWORD_STRENGTH.GOOD, color: "text-yellow-500", bg: "bg-yellow-500" };
    return { text: COPY.AUTH.PASSWORD_STRENGTH.STRONG, color: "text-green-600", bg: "bg-green-600" };
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

    // Pre-check: server-side email existence check (requires service role key)
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
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">{COPY.AUTH.CHECK_EMAIL}</h2>
              <p className="text-muted-foreground">
                {COPY.AUTH.CHECK_EMAIL_DESC(regEmail)}
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground text-left space-y-2">
              <p className="font-medium text-foreground">{COPY.AUTH.NEXT_STEPS}</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>{COPY.AUTH.STEP_1}</li>
                <li>{COPY.AUTH.STEP_2}</li>
                <li>{COPY.AUTH.STEP_3}</li>
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
                {COPY.AUTH.BACK_TO_LOGIN}
              </Button>
              <p className="text-xs text-muted-foreground">
                {COPY.AUTH.DIDNT_RECEIVE_EMAIL}{" "}
                <button
                  onClick={async () => {
                    await supabase.auth.resend({ type: "signup", email: regEmail });
                    toast.success(COPY.AUTH.VERIFICATION_EMAIL_RESENT);
                  }}
                  className="text-primary hover:underline"
                >
                  {COPY.AUTH.RESEND_EMAIL}
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
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">{COPY.AUTH.EMAIL_SENT}</h2>
              <p className="text-muted-foreground">
                {COPY.AUTH.EMAIL_SENT_DESC(forgotEmail)}
              </p>
            </div>
            <Button
              className="w-full"
              onClick={() => {
                setView("auth");
                setForgotEmail("");
              }}
            >
              {COPY.AUTH.BACK_TO_LOGIN}
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
              <CardTitle className="text-2xl">{COPY.BRAND.NAME}</CardTitle>
            </div>
            <CardDescription>{COPY.AUTH.RESET_PASSWORD}</CardDescription>
          </CardHeader>
          <CardContent>
            <button
              onClick={() => setView("auth")}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> {COPY.AUTH.BACK_TO_LOGIN}
            </button>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">{COPY.AUTH.EMAIL}</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder={COPY.AUTH.EMAIL_PLACEHOLDER2}
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {COPY.AUTH.ENTER_EMAIL_FOR_RESET}
              </p>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? COPY.AUTH.SENDING : COPY.AUTH.SEND_RESET_LINK}
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
            <CardTitle className="text-2xl">{COPY.BRAND.NAME}</CardTitle>
          </div>
          <CardDescription>{COPY.BRAND.TAGLINE}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={defaultTab} onValueChange={() => resetRegisterForm()}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{COPY.AUTH.LOGIN_TITLE}</TabsTrigger>
              <TabsTrigger value="register">{COPY.AUTH.REGISTER_TITLE}</TabsTrigger>
            </TabsList>

            {/* ── LOGIN TAB ──────────────────────────────────────────── */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">{COPY.AUTH.EMAIL}</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder={COPY.AUTH.EMAIL_PLACEHOLDER2}
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">{COPY.AUTH.PASSWORD}</Label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(loginEmail);
                        setView("forgot");
                      }}
                      className="text-xs text-primary hover:underline"
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
                  {loading ? COPY.AUTH.SIGNING_IN : COPY.AUTH.SIGN_IN}
                </Button>
              </form>
            </TabsContent>

            {/* ── REGISTER TAB ───────────────────────────────────────── */}
            <TabsContent value="register">
              {/* Step indicator */}
              <div className="flex items-center gap-2 mt-4 mb-6">
                <div className={`flex items-center gap-1.5 text-sm font-medium ${regStep >= 1 ? "text-primary" : "text-muted-foreground"}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${regStep >= 1 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>1</span>
                  {COPY.AUTH.ACCOUNT_STEP}
                </div>
                <div className="flex-1 h-px bg-border" />
                <div className={`flex items-center gap-1.5 text-sm font-medium ${regStep >= 2 ? "text-primary" : "text-muted-foreground"}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${regStep >= 2 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>2</span>
                  {COPY.AUTH.DETAILS_STEP}
                </div>
              </div>

              <form onSubmit={handleRegister}>
                {/* Step 1: Role + Name + Email + Password */}
                {regStep === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>{COPY.AUTH.I_AM_A}</Label>
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
                          <span className="text-sm font-medium">{COPY.AUTH.ROLE_STUDENT}</span>
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
                          <span className="text-sm font-medium">{COPY.AUTH.ROLE_PHOTOGRAPHER}</span>
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-name">{COPY.AUTH.FULL_NAME}</Label>
                      <Input
                        id="reg-name"
                        placeholder={COPY.AUTH.FULL_NAME_PLACEHOLDER}
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-email">{COPY.AUTH.EMAIL}</Label>
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder={COPY.AUTH.EMAIL_PLACEHOLDER2}
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password">{COPY.AUTH.PASSWORD}</Label>
                      <div className="relative">
                        <Input
                          id="reg-password"
                          type={showRegPassword ? "text" : "password"}
                          placeholder={COPY.AUTH.PASSWORD_PLACEHOLDER}
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
                      {COPY.COMMON.SUBMIT} <ArrowRight className="h-4 w-4 ml-1" />
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
                      <ArrowLeft className="h-4 w-4" /> {COPY.COMMON.BACK}
                    </button>
                    <div className="space-y-2">
                      <Label htmlFor="reg-wechat">{COPY.AUTH.WECHAT_ID}</Label>
                      <Input
                        id="reg-wechat"
                        placeholder={COPY.AUTH.WECHAT_ID_PLACEHOLDER}
                        value={regWechat}
                        onChange={(e) => setRegWechat(e.target.value)}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        {COPY.AUTH.WECHAT_ID_HINT_ROLE(regRole === "STUDENT" ? COPY.AUTH.ROLE_PHOTOGRAPHER : COPY.AUTH.ROLE_STUDENT)}
                      </p>
                    </div>
                    {regRole === "PHOTOGRAPHER" && (
                      <div className="space-y-2">
                        <Label htmlFor="reg-slug">{COPY.AUTH.CUSTOM_PROFILE_URL}</Label>
                        <div className="flex items-center gap-0">
                          <span className="inline-flex items-center px-3 h-10 rounded-l-md border border-r-0 bg-muted text-sm text-muted-foreground">
                            /photographers/
                          </span>
                          <Input
                            id="reg-slug"
                            placeholder={COPY.AUTH.CUSTOM_PROFILE_URL_PLACEHOLDER}
                            value={regSlug}
                            onChange={(e) => setRegSlug(e.target.value.replace(/[^a-zA-Z0-9]/g, "").toLowerCase())}
                            className="rounded-l-none"
                            maxLength={30}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {COPY.AUTH.CUSTOM_PROFILE_URL_HINT}
                        </p>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="reg-phone">{COPY.AUTH.UK_PHONE}</Label>
                      <Input
                        id="reg-phone"
                        type="tel"
                        placeholder={COPY.AUTH.UK_PHONE_PLACEHOLDER}
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-confirm-password">{COPY.AUTH.CONFIRM_PASSWORD}</Label>
                      <Input
                        id="reg-confirm-password"
                        type="password"
                        placeholder={COPY.AUTH.RE_ENTER_PASSWORD}
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        required
                      />
                      {regConfirmPassword && regPassword !== regConfirmPassword && (
                        <p className="text-xs text-red-500">{COPY.AUTH.PASSWORDS_NOT_MATCH}</p>
                      )}
                    </div>

                    {/* Summary */}
                    <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{COPY.AUTH.I_AM_A}</span>
                        <span className="font-medium">{regRole === "STUDENT" ? COPY.AUTH.ROLE_STUDENT : COPY.AUTH.ROLE_PHOTOGRAPHER}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{COPY.COMMON.NAME}</span>
                        <span className="font-medium">{regName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{COPY.AUTH.EMAIL}</span>
                        <span className="font-medium">{regEmail}</span>
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading || !regStep2Valid}>
                      {loading ? COPY.AUTH.CREATING_ACCOUNT : COPY.AUTH.CREATE_ACCOUNT}
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
