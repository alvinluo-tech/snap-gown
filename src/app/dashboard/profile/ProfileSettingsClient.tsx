"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Camera,
  Save,
  Plus,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import COPY from "@/lib/constants/copy";
import { updateProfile, uploadAvatar, uploadWeChatQR } from "@/app/actions/profile";

export interface Profile {
  id: string;
  role: string;
  full_name: string;
  bio: string | null;
  wechat_id: string;
  uk_phone: string | null;
  avatar_url: string | null;
  wechat_qr_url: string | null;
  gowns_json: unknown;
  slug: string | null;
}

interface ProfileSettingsClientProps {
  profile: Profile;
}

export function ProfileSettingsClient({ profile }: ProfileSettingsClientProps) {
  const router = useRouter();

  const [fullName, setFullName] = useState(profile.full_name);
  const [bio, setBio] = useState(profile.bio || "");
  const [wechatId, setWechatId] = useState(profile.wechat_id);
  const [ukPhone, setUkPhone] = useState(profile.uk_phone || "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [wechatQrUrl, setWechatQrUrl] = useState(profile.wechat_qr_url);
  const [gowns, setGowns] = useState<{ degree: string; size: string }[]>(
    (profile.gowns_json as { degree: string; size: string }[] | null) || []
  );

  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingQR, setUploadingQR] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);

  const isPhotographer = profile.role === "PHOTOGRAPHER";

  const backHref =
    profile.role === "PHOTOGRAPHER"
      ? "/dashboard/photographer/orders"
      : profile.role === "ADMIN"
        ? "/dashboard/admin"
        : "/dashboard/student";

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const result = await uploadAvatar(file);
      setAvatarUrl(result.publicUrl);
      toast.success(COPY.PROFILE.AVATAR_UPLOAD_SUCCESS);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : COPY.PROFILE.AVATAR_UPLOAD_FAILED
      );
    }
    setUploadingAvatar(false);
  };

  const handleQRUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingQR(true);
    try {
      const result = await uploadWeChatQR(file);
      setWechatQrUrl(result.publicUrl);
      toast.success(COPY.PROFILE.WECHAT_QR_UPLOAD_SUCCESS);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : COPY.PROFILE.WECHAT_QR_UPLOAD_FAILED
      );
    }
    setUploadingQR(false);
  };

  const addGown = () => {
    setGowns([...gowns, { degree: "", size: "" }]);
  };

  const removeGown = (index: number) => {
    setGowns(gowns.filter((_, i) => i !== index));
  };

  const updateGown = (
    index: number,
    field: "degree" | "size",
    value: string
  ) => {
    const updated = [...gowns];
    updated[index] = { ...updated[index], [field]: value };
    setGowns(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.set("full_name", fullName);
      formData.set("bio", bio);
      formData.set("wechat_id", wechatId);
      formData.set("uk_phone", ukPhone);
      if (gowns.length > 0) {
        formData.set("gowns_json", JSON.stringify(gowns));
      } else {
        formData.set("gowns_json", "[]");
      }
      await updateProfile(formData);
      toast.success(COPY.PROFILE.PROFILE_UPDATED);
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : COPY.PROFILE.PROFILE_UPDATE_FAILED
      );
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden academic-grain pb-20">
      {/* Decorative luxury backgrounds */}
      <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-gradient-to-bl from-brand/8 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-gradient-to-tr from-brand/4 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="academic-glass sticky top-0 z-50 transition-base border-b">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={backHref}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="tactile-btn hover:bg-brand/10 hover:text-brand-foreground rounded-xl transition-all h-10 w-10 flex items-center justify-center border border-transparent hover:border-brand/20"
              >
                <ArrowLeft className="h-5 w-5 text-foreground" />
              </Button>
            </Link>
            <div className="h-10 w-10 rounded-xl bg-brand/10 dark:bg-brand/5 border border-brand/20 flex items-center justify-center text-brand">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-serif-academic font-bold tracking-tight text-foreground">
                {COPY.PROFILE.TITLE}
              </h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
                Manage your graduation photoshoots, gowns, and contact credentials
              </p>
            </div>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="tactile-btn bg-brand hover:bg-brand/90 text-brand-foreground font-serif-academic tracking-wide rounded-xl px-5 py-2 font-semibold shadow-lg hover-glow transition-all"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? COPY.COMMON.UPDATING : COPY.COMMON.SAVE}
          </Button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-8 relative z-10">
        {/* Avatar Section */}
        <Card className="academic-glass hover-lift border border-border/60 rounded-2xl shadow-lg hover:shadow-xl overflow-hidden transition-all duration-300">
          <CardHeader className="border-b border-border/40 pb-4 bg-muted/20">
            <CardTitle className="text-lg sm:text-xl font-serif-academic font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="w-1.5 h-5 bg-brand rounded-full inline-block" />
              {COPY.PROFILE.AVATAR_LABEL}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 pb-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <div 
                className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-brand/20 group-hover:border-brand/60 cursor-pointer shadow-lg transition-all duration-300 scale-100 hover:scale-105 active:scale-95"
                onClick={() => avatarInputRef.current?.click()}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={COPY.PROFILE.AVATAR_LABEL}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/5 dark:bg-primary/2 flex items-center justify-center text-4xl font-serif-academic font-bold text-brand">
                    {fullName.charAt(0)}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Camera className="h-6 w-6 text-brand mb-1 animate-pulse" />
                  <span className="text-[10px] text-brand uppercase tracking-wider font-bold">Upload</span>
                </div>
              </div>
              <div className="absolute -inset-1 rounded-full border border-brand/30 opacity-0 group-hover:opacity-100 animate-ping pointer-events-none transition-opacity duration-500" />
            </div>
            
            <div className="flex-1 text-center sm:text-left space-y-2">
              <h3 className="text-lg font-serif-academic font-semibold text-foreground">{fullName || "Grad Student"}</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                {COPY.PROFILE.AVATAR_HINT}
              </p>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              {uploadingAvatar && (
                <div className="flex items-center gap-2 justify-center sm:justify-start text-xs text-brand animate-pulse">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand animate-ping" />
                  {COPY.COMMON.UPDATING}...
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Basic Info Card */}
        <Card className="academic-glass hover-lift border border-border/60 rounded-2xl shadow-lg hover:shadow-xl overflow-hidden transition-all duration-300">
          <CardHeader className="border-b border-border/40 pb-4 bg-muted/20">
            <CardTitle className="text-lg sm:text-xl font-serif-academic font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="w-1.5 h-5 bg-brand rounded-full inline-block" />
              {COPY.PROFILE.EDIT_PROFILE}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-xs sm:text-sm font-serif-academic font-semibold text-foreground/80 flex items-center gap-1">
                  {COPY.PROFILE.FULL_NAME_LABEL} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="full_name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="rounded-xl border-border bg-background/50 focus:border-brand focus:ring-brand/30 transition-all font-sans text-sm sm:text-base h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wechat_id" className="text-xs sm:text-sm font-serif-academic font-semibold text-foreground/80 flex items-center gap-1">
                  {COPY.PROFILE.WECHAT_ID_LABEL} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="wechat_id"
                  value={wechatId}
                  onChange={(e) => setWechatId(e.target.value)}
                  required
                  className="rounded-xl border-border bg-background/50 focus:border-brand focus:ring-brand/30 transition-all font-sans text-sm sm:text-base h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="uk_phone" className="text-xs sm:text-sm font-serif-academic font-semibold text-foreground/80">
                {COPY.PROFILE.UK_PHONE_LABEL}
              </Label>
              <Input
                id="uk_phone"
                value={ukPhone}
                onChange={(e) => setUkPhone(e.target.value)}
                className="rounded-xl border-border bg-background/50 focus:border-brand focus:ring-brand/30 transition-all font-sans text-sm sm:text-base h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-xs sm:text-sm font-serif-academic font-semibold text-foreground/80">
                {COPY.PROFILE.BIO_LABEL}
              </Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={COPY.PROFILE.BIO_PLACEHOLDER}
                rows={4}
                className="rounded-xl border-border bg-background/50 focus:border-brand focus:ring-brand/30 transition-all font-sans text-sm sm:text-base resize-none p-3"
              />
            </div>
          </CardContent>
        </Card>

        {/* Photographer-Only Sections */}
        {isPhotographer && (
          <>
            {/* WeChat QR Card */}
            <Card className="academic-glass hover-lift border border-border/60 rounded-2xl shadow-lg hover:shadow-xl overflow-hidden transition-all duration-300">
              <CardHeader className="border-b border-border/40 pb-4 bg-muted/20">
                <CardTitle className="text-lg sm:text-xl font-serif-academic font-bold tracking-tight text-foreground flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-brand rounded-full inline-block" />
                  {COPY.PROFILE.WECHAT_QR_LABEL}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 pb-8 space-y-6">
                {wechatQrUrl ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative group w-44 h-44 rounded-2xl overflow-hidden border border-brand/20 shadow-lg bg-white dark:bg-zinc-950 p-2 transition-transform duration-300 hover:scale-[1.02]">
                      <img
                        src={wechatQrUrl}
                        alt={COPY.PROFILE.WECHAT_QR_LABEL}
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="tactile-btn border-brand bg-brand text-brand-foreground hover:bg-brand/90"
                          onClick={() => qrInputRef.current?.click()}
                          disabled={uploadingQR}
                        >
                          {COPY.COMMON.EDIT}
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="tactile-btn text-muted-foreground hover:text-brand border-dashed hover:border-brand/50 rounded-xl"
                      onClick={() => qrInputRef.current?.click()}
                      disabled={uploadingQR}
                    >
                      {COPY.COMMON.EDIT}
                    </Button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-brand/20 hover:border-brand/60 rounded-2xl p-10 text-center cursor-pointer bg-brand/5 dark:bg-brand/2 hover:bg-brand/10 transition-all duration-300 hover-lift group"
                    onClick={() => qrInputRef.current?.click()}
                  >
                    <div className="h-12 w-12 rounded-2xl bg-brand/10 dark:bg-brand/5 flex items-center justify-center mx-auto mb-4 border border-brand/20 text-brand transition-transform duration-500 group-hover:rotate-12">
                      <Camera className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-serif-academic font-bold text-foreground mb-1">
                      {COPY.PROFILE.WECHAT_QR_HINT}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {COPY.PROFILE.WECHAT_QR_MAX_SIZE}
                    </p>
                  </div>
                )}
                <input
                  ref={qrInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleQRUpload}
                  className="hidden"
                />
                {uploadingQR && (
                  <div className="flex items-center gap-2 justify-center text-xs text-brand animate-pulse">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand animate-ping" />
                    {COPY.COMMON.UPDATING}...
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Gowns Card */}
            <Card className="academic-glass hover-lift border border-border/60 rounded-2xl shadow-lg hover:shadow-xl overflow-hidden transition-all duration-300">
              <CardHeader className="border-b border-border/40 pb-4 bg-muted/20">
                <CardTitle className="text-lg sm:text-xl font-serif-academic font-bold tracking-tight text-foreground flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-brand rounded-full inline-block" />
                  {COPY.PROFILE.GOWNS_LABEL}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {gowns.length === 0 ? (
                  <p className="text-xs sm:text-sm text-muted-foreground text-center py-6">
                    No gowns added yet. Showcase what graduation dress sizes you support for shoots.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {gowns.map((gown, index) => (
                      <div key={index} className="flex items-end gap-3 p-4 rounded-xl border border-border/60 bg-muted/10 relative group hover:border-brand/40 transition-all duration-300">
                        <div className="flex-1 space-y-2">
                          <Label className="text-[10px] sm:text-xs font-serif-academic font-semibold text-foreground/80">
                            {COPY.PROFILE.DEGREE_LABEL}
                          </Label>
                          <Input
                            value={gown.degree}
                            onChange={(e) =>
                              updateGown(index, "degree", e.target.value)
                            }
                            placeholder="e.g. Durham Bachelor of Arts"
                            className="rounded-xl border-border bg-background/50 focus:border-brand focus:ring-brand/30 transition-all text-xs sm:text-sm h-10"
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <Label className="text-[10px] sm:text-xs font-serif-academic font-semibold text-foreground/80">
                            {COPY.PROFILE.SIZE_LABEL}
                          </Label>
                          <Input
                            value={gown.size}
                            onChange={(e) =>
                              updateGown(index, "size", e.target.value)
                            }
                            placeholder="e.g. Size M (165-175cm)"
                            className="rounded-xl border-border bg-background/50 focus:border-brand focus:ring-brand/30 transition-all text-xs sm:text-sm h-10"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeGown(index)}
                          className="tactile-btn h-10 w-10 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all flex items-center justify-center"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <Button 
                  variant="outline" 
                  onClick={addGown} 
                  className="tactile-btn w-full rounded-xl border-dashed border-brand/30 hover:border-brand/60 hover:bg-brand/5 text-brand flex items-center justify-center gap-2 h-11 transition-all"
                >
                  <Plus className="h-4 w-4" />
                  <span className="font-serif-academic font-bold text-xs sm:text-sm">{COPY.PROFILE.ADD_GOWN}</span>
                </Button>
              </CardContent>
            </Card>

            {/* Slug Display */}
            {profile.slug && (
              <Card className="academic-glass hover-lift border border-border/60 rounded-2xl shadow-lg hover:shadow-xl overflow-hidden transition-all duration-300">
                <CardHeader className="border-b border-border/40 pb-4 bg-muted/20">
                  <CardTitle className="text-lg sm:text-xl font-serif-academic font-bold tracking-tight text-foreground flex items-center gap-2">
                    <span className="w-1.5 h-5 bg-brand rounded-full inline-block" />
                    {COPY.PROFILE.SLUG_LABEL}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-brand/20 bg-brand/5 dark:bg-brand/2">
                    <div className="space-y-1">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Your Public Photographer Profile URL</p>
                      <p className="font-mono text-xs sm:text-sm text-foreground break-all font-semibold">
                        /photographers/{profile.slug}
                      </p>
                    </div>
                    <Link
                      href={`/photographers/${profile.slug}`}
                      target="_blank"
                      className="w-full sm:w-auto"
                    >
                      <Button variant="outline" className="tactile-btn w-full sm:w-auto rounded-xl border-brand text-brand hover:bg-brand hover:text-brand-foreground transition-all flex items-center gap-2 font-serif-academic font-semibold">
                        <ExternalLink className="h-4 w-4" />
                        View Live Page
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Save Button (Bottom) */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="tactile-btn w-full bg-brand hover:bg-brand/90 text-brand-foreground font-serif-academic font-bold tracking-wide rounded-xl py-6 text-base sm:text-lg shadow-xl hover-glow transition-all"
          size="lg"
        >
          <Save className="h-5 w-5 mr-2" />
          {saving ? COPY.COMMON.UPDATING : COPY.PROFILE.SAVE_PROFILE}
        </Button>
      </div>
    </div>
  );
}

