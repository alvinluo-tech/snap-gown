"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { toast } from "sonner";
import COPY from "@/lib/constants/copy";
import { Camera, CheckCircle2, Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

  function getPasswordStrength(pw: string) {
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  }

  function getPasswordStrengthLabel(score: number) {
    if (score <= 1) return { text: COPY.AUTH.PASSWORD_STRENGTH.WEAK, color: "text-red-500", bg: "bg-red-500" };
    if (score <= 2) return { text: COPY.AUTH.PASSWORD_STRENGTH.FAIR, color: "text-orange-500", bg: "bg-orange-500" };
    if (score <= 3) return { text: COPY.AUTH.PASSWORD_STRENGTH.GOOD, color: "text-yellow-500", bg: "bg-yellow-500" };
    return { text: COPY.AUTH.PASSWORD_STRENGTH.STRONG, color: "text-green-600", bg: "bg-green-600" };
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error(COPY.AUTH.PASSWORDS_NOT_MATCH);
      return;
    }
    if (password.length < 6) {
      toast.error(COPY.AUTH.PASSWORD_MIN_LENGTH);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      // Auto-redirect countdown
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            supabase.auth.signOut().then(() => router.push("/auth"));
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }

  const pwStrength = getPasswordStrength(password);
  const pwStrengthInfo = getPasswordStrengthLabel(pwStrength);
  const passwordsMatch = password === confirmPassword;
  const canSubmit = password.length >= 6 && passwordsMatch && !loading;

  // ─── Success State ───────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">{COPY.AUTH.PASSWORD_UPDATED}</h2>
              <p className="text-muted-foreground">
                {COPY.AUTH.PASSWORD_UPDATED_DESC}
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
              {COPY.AUTH.REDIRECTING(countdown)}
            </div>
            <Button className="w-full" onClick={() => router.push("/auth")}>
              {COPY.AUTH.GO_TO_LOGIN}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Reset Form ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Camera className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl">{COPY.BRAND.NAME}</CardTitle>
          </div>
          <CardDescription>{COPY.AUTH.SET_NEW_PASSWORD}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">{COPY.AUTH.NEW_PASSWORD}</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder={COPY.AUTH.PASSWORD_PLACEHOLDER}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password.length > 0 && (
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
            <div className="space-y-2">
              <Label htmlFor="confirm-password">{COPY.AUTH.CONFIRM_PASSWORD}</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder={COPY.AUTH.RE_ENTER_PASSWORD}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {confirmPassword && !passwordsMatch && (
                <p className="text-xs text-red-500">{COPY.AUTH.PASSWORDS_NOT_MATCH}</p>
              )}
              {confirmPassword && passwordsMatch && confirmPassword.length >= 6 && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> {COPY.AUTH.PASSWORDS_MATCH}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={!canSubmit}>
              {loading ? COPY.AUTH.UPDATING : COPY.AUTH.UPDATE_PASSWORD}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
