"use server";

import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";

export async function getMyProfile() {
  const supabase = await createSupabaseServer();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (!user || error) throw new Error("Unauthorized");

  const { data, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) throw new Error(profileError.message);
  return data;
}

export async function updateProfile(formData: FormData) {
  const supabase = await createSupabaseServer();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (!user || error) throw new Error("Unauthorized");

  const fullName = (formData.get("full_name") as string)?.trim();
  const bio = (formData.get("bio") as string)?.trim() || null;
  const wechatId = (formData.get("wechat_id") as string)?.trim();
  const ukPhone = (formData.get("uk_phone") as string)?.trim() || null;
  const gownsRaw = formData.get("gowns_json") as string | null;
  const portfolioRaw = formData.get("portfolio_json") as string | null;

  if (!fullName) throw new Error("姓名不能为空");
  if (!wechatId) throw new Error("微信 ID 不能为空");

  const updates: {
    full_name: string;
    bio: string | null;
    wechat_id: string;
    uk_phone: string | null;
    gowns_json?: unknown;
    portfolio_json?: unknown;
  } = {
    full_name: fullName,
    bio,
    wechat_id: wechatId,
    uk_phone: ukPhone,
  };

  if (gownsRaw) {
    try {
      updates.gowns_json = JSON.parse(gownsRaw);
    } catch {
      throw new Error("学士服信息格式错误");
    }
  }

  if (portfolioRaw) {
    try {
      updates.portfolio_json = JSON.parse(portfolioRaw);
    } catch {
      throw new Error("作品集信息格式错误");
    }
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update(updates as never)
    .eq("id", user.id);

  if (updateError) throw new Error(updateError.message);
  return { success: true };
}

export async function uploadAvatar(file: File) {
  const supabase = await createSupabaseServer();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (!user || error) throw new Error("Unauthorized");

  // Validate file
  if (!file.type.startsWith("image/")) throw new Error("请上传图片文件");
  if (file.size > 2 * 1024 * 1024) throw new Error("图片大小不能超过 2MB");

  // Delete old avatar if exists
  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .single();

  if (profile?.avatar_url) {
    try {
      const url = new URL(profile.avatar_url);
      const pathParts = url.pathname.split("/");
      const bucketIndex = pathParts.indexOf("avatars");
      if (bucketIndex !== -1) {
        const oldPath = pathParts.slice(bucketIndex + 1).join("/");
        await supabase.storage.from("avatars").remove([oldPath]);
      }
    } catch {
      // Ignore if URL parsing fails
    }
  }

  // Upload new avatar
  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${user.id}/avatar-${Date.now()}.${ext}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(fileName, file);

  if (uploadError) throw new Error("上传失败: " + uploadError.message);

  const { data: { publicUrl } } = supabase.storage
    .from("avatars")
    .getPublicUrl(uploadData.path);

  // Update profile
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", user.id);

  if (updateError) throw new Error(updateError.message);
  return { success: true, publicUrl };
}

export async function uploadWeChatQR(file: File) {
  const supabase = await createSupabaseServer();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (!user || error) throw new Error("Unauthorized");

  if (!file.type.startsWith("image/")) throw new Error("请上传图片文件");
  if (file.size > 5 * 1024 * 1024) throw new Error("图片大小不能超过 5MB");

  // Delete old QR if exists
  const { data: profile } = await supabase
    .from("profiles")
    .select("wechat_qr_url")
    .eq("id", user.id)
    .single();

  if (profile?.wechat_qr_url) {
    try {
      const url = new URL(profile.wechat_qr_url);
      const pathParts = url.pathname.split("/");
      const bucketIndex = pathParts.indexOf("wechat-qr");
      if (bucketIndex !== -1) {
        const oldPath = pathParts.slice(bucketIndex + 1).join("/");
        await supabase.storage.from("wechat-qr").remove([oldPath]);
      }
    } catch {
      // Ignore
    }
  }

  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${user.id}/qr-${Date.now()}.${ext}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("wechat-qr")
    .upload(fileName, file);

  if (uploadError) throw new Error("上传失败: " + uploadError.message);

  const { data: { publicUrl } } = supabase.storage
    .from("wechat-qr")
    .getPublicUrl(uploadData.path);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ wechat_qr_url: publicUrl })
    .eq("id", user.id);

  if (updateError) throw new Error(updateError.message);
  return { success: true, publicUrl };
}

export async function uploadPortfolioImage(file: File) {
  const supabase = await createSupabaseServer();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (!user || error) throw new Error("Unauthorized");

  if (!file.type.startsWith("image/")) throw new Error("请上传图片文件");
  if (file.size > 8 * 1024 * 1024) throw new Error("图片大小不能超过 8MB");

  const admin = createSupabaseAdmin();

  // Self-healing: Pre-create storage bucket if it doesn't exist on remote instance
  try {
    const { data: bucket } = await admin.storage.getBucket("portfolios");
    if (!bucket) {
      await admin.storage.createBucket("portfolios", {
        public: true,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
      });
    }
  } catch {
    // Ignore error if already created
  }

  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const { data: uploadData, error: uploadError } = await admin.storage
    .from("portfolios")
    .upload(fileName, file);

  if (uploadError) throw new Error("上传失败: " + uploadError.message);

  const { data: { publicUrl } } = admin.storage
    .from("portfolios")
    .getPublicUrl(uploadData.path);

  return { success: true, publicUrl };
}

export async function deletePortfolioImage(imageUrl: string) {
  const supabase = await createSupabaseServer();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (!user || error) throw new Error("Unauthorized");

  try {
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split("/");
    const bucketIndex = pathParts.indexOf("portfolios");
    if (bucketIndex !== -1) {
      const oldPath = pathParts.slice(bucketIndex + 1).join("/");
      const admin = createSupabaseAdmin();
      await admin.storage.from("portfolios").remove([oldPath]);
    }
    return { success: true };
  } catch {
    throw new Error("无效的图片 URL");
  }
}

export async function savePortfolio(portfolioUrls: string[]) {
  const supabase = await createSupabaseServer();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (!user || error) throw new Error("Unauthorized");

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ portfolio_json: portfolioUrls } as never)
    .eq("id", user.id);

  if (updateError) throw new Error(updateError.message);
  return { success: true };
}

export interface PhotographerSettings {
  default_price_pounds?: number;
  camera_model?: string;
  delivery_promise?: string;
}

export async function saveSettings(settings: PhotographerSettings) {
  const supabase = await createSupabaseServer();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (!user || error) throw new Error("Unauthorized");

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ settings_json: settings } as never)
    .eq("id", user.id);

  if (updateError) throw new Error(updateError.message);
  return { success: true };
}
