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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={backHref}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <Camera className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">{COPY.PROFILE.TITLE}</span>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? COPY.COMMON.UPDATING : COPY.COMMON.SAVE}
          </Button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Avatar Section */}
        <Card>
          <CardHeader>
            <CardTitle>{COPY.PROFILE.AVATAR_LABEL}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div
              className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-border cursor-pointer group"
              onClick={() => avatarInputRef.current?.click()}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={COPY.PROFILE.AVATAR_LABEL}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center text-3xl font-bold text-muted-foreground">
                  {fullName.charAt(0)}
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
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
              <p className="text-sm text-muted-foreground">
                {COPY.COMMON.UPDATING}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Basic Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>{COPY.PROFILE.EDIT_PROFILE}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">{COPY.PROFILE.FULL_NAME_LABEL}</Label>
              <Input
                id="full_name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">{COPY.PROFILE.BIO_LABEL}</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={COPY.PROFILE.BIO_PLACEHOLDER}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wechat_id">{COPY.PROFILE.WECHAT_ID_LABEL}</Label>
              <Input
                id="wechat_id"
                value={wechatId}
                onChange={(e) => setWechatId(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="uk_phone">{COPY.PROFILE.UK_PHONE_LABEL}</Label>
              <Input
                id="uk_phone"
                value={ukPhone}
                onChange={(e) => setUkPhone(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Photographer-Only Sections */}
        {isPhotographer && (
          <>
            {/* WeChat QR Card */}
            <Card>
              <CardHeader>
                <CardTitle>{COPY.PROFILE.WECHAT_QR_LABEL}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {wechatQrUrl ? (
                  <div className="relative w-48 h-48 mx-auto">
                    <img
                      src={wechatQrUrl}
                      alt={COPY.PROFILE.WECHAT_QR_LABEL}
                      className="w-full h-full object-contain rounded-lg border"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => qrInputRef.current?.click()}
                      disabled={uploadingQR}
                    >
                      {COPY.COMMON.EDIT}
                    </Button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => qrInputRef.current?.click()}
                  >
                    <Camera className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {COPY.PROFILE.WECHAT_QR_HINT}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
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
                  <p className="text-sm text-center text-muted-foreground">
                    {COPY.COMMON.UPDATING}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Gowns Card */}
            <Card>
              <CardHeader>
                <CardTitle>{COPY.PROFILE.GOWNS_LABEL}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {gowns.map((gown, index) => (
                  <div key={index} className="flex items-end gap-3">
                    <div className="flex-1 space-y-2">
                      <Label>{COPY.PROFILE.DEGREE_LABEL}</Label>
                      <Input
                        value={gown.degree}
                        onChange={(e) =>
                          updateGown(index, "degree", e.target.value)
                        }
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label>{COPY.PROFILE.SIZE_LABEL}</Label>
                      <Input
                        value={gown.size}
                        onChange={(e) =>
                          updateGown(index, "size", e.target.value)
                        }
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeGown(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" onClick={addGown} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  {COPY.PROFILE.ADD_GOWN}
                </Button>
              </CardContent>
            </Card>

            {/* Slug Display */}
            {profile.slug && (
              <Card>
                <CardHeader>
                  <CardTitle>{COPY.PROFILE.SLUG_LABEL}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link
                    href={`/photographers/${profile.slug}`}
                    target="_blank"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    /photographers/{profile.slug}
                  </Link>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Save Button (Bottom) */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full"
          size="lg"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? COPY.COMMON.UPDATING : COPY.PROFILE.SAVE_PROFILE}
        </Button>
      </div>
    </div>
  );
}
