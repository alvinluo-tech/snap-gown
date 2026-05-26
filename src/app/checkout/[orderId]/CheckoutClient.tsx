'use client';

import { useState, useEffect } from 'react';
import { uploadPaymentProof } from '@/app/actions/payment';
import { cancelBooking } from '@/app/actions/booking';
import { ProofUploader } from '@/components/ProofUploader';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Camera,
  Clock,
  ArrowLeft,
  QrCode,
  FileText,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import COPY, { DISCLAIMER_CN, DISCLAIMER_EN } from '@/lib/constants/copy';
import clsx from 'clsx';

interface CheckoutClientProps {
  orderId: string;
  amountCNY: string;
  amountGBP: string;
  paymentRef: string;
  photographerQR: string | null;
  photographerName: string;
  expiresAt: string | null;
}

function CountdownTimer({ expiresAt }: { expiresAt: string }) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
  );

  useEffect(() => {
    if (remaining <= 0) return;
    const interval = setInterval(() => {
      const secs = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setRemaining(secs);
      if (secs <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, remaining]);

  if (remaining <= 0) return null;

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const urgent = remaining < 300;

  return (
    <span className={clsx(
      "font-mono font-bold text-sm tabular-nums",
      urgent ? "text-destructive animate-pulse" : "text-brand"
    )}>
      {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
    </span>
  );
}

export function CheckoutClient({
  orderId,
  amountCNY,
  amountGBP,
  paymentRef,
  photographerQR,
  photographerName,
  expiresAt,
}: CheckoutClientProps) {
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const expired = expiresAt ? new Date(expiresAt).getTime() <= Date.now() : false;

  const handleUpload = async (file: File) => {
    await uploadPaymentProof(orderId, file);
    router.refresh();
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelBooking(orderId);
      toast.success(COPY.CHECKOUT.BOOKING_CANCELLED);
      router.push('/');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : COPY.CHECKOUT.CANCEL_FAILED);
      setCancelling(false);
    }
  };

  const handleBack = () => {
    router.push('/dashboard/student');
  };

  return (
    <div className="min-h-[100dvh] bg-background academic-grain relative overflow-x-hidden pb-24">
      {/* Ambient glow — pointer-events-none, fixed position so they don't cause overflow */}
      <div className="pointer-events-none fixed top-0 right-0 w-[500px] h-[500px] bg-brand/6 blur-[120px] rounded-full" />
      <div className="pointer-events-none fixed bottom-0 left-0 w-[400px] h-[400px] bg-brand/4 blur-[100px] rounded-full" />

      {/* ── Header ── */}
      <header className="academic-glass sticky top-0 z-50 border-b transition-base">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="tactile-btn shrink-0 rounded-xl hover:bg-brand/10 hover:text-brand border border-transparent hover:border-brand/20 transition-all"
            onClick={handleBack}
            disabled={cancelling}
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
          </Button>

          <div className="h-8 w-8 shrink-0 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
            <Camera className="h-4 w-4" strokeWidth={1.5} />
          </div>

          <span className="font-serif-academic font-bold text-base sm:text-lg text-foreground tracking-tight truncate">
            {COPY.BRAND.NAME}
          </span>

          <div className="ml-auto flex items-center gap-2 shrink-0">
            {expiresAt && !expired && <CountdownTimer expiresAt={expiresAt} />}
            <Badge
              variant="outline"
              className={clsx(
                "border-brand/30 text-brand bg-brand/8 text-[9px] uppercase tracking-widest px-2.5 py-1 font-semibold",
                expired && "border-destructive/30 text-destructive bg-destructive/8"
              )}
            >
              {expired ? "已过期" : COPY.CHECKOUT.PAYMENT_WINDOW}
            </Badge>
          </div>
        </div>
      </header>

      {/* ── Page shell — strictly centred ── */}
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">

        {/* Expired state */}
        {expired && (
          <div className="text-center py-16 space-y-4">
            <Clock className="h-12 w-12 mx-auto text-destructive/60" strokeWidth={1.5} />
            <h2 className="text-xl font-serif-academic font-bold text-foreground">支付窗口已过期</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              30 分钟支付窗口已结束，该档期已自动释放。你可以返回预约管理页面重新预约。
            </p>
            <Button
              className="tactile-btn bg-brand text-brand-foreground hover:bg-brand/90 font-semibold shadow-sm"
              onClick={() => router.push('/dashboard/student')}
            >
              返回预约管理
            </Button>
          </div>
        )}

        {/* Page title — centre-aligned editorial announcement (override for this special case) */}
        {!expired && (
        <div className="text-center mb-8 sm:mb-10 space-y-2">
          <h1 className="text-2xl sm:text-3xl font-serif-academic font-bold text-foreground tracking-tight">
            结算 &amp; 服务确认
          </h1>
          <p className="text-sm text-muted-foreground">
            请在 30 分钟内扫码付款，并上传支付截图
          </p>
        </div>
        )}

        {/* ── Two-column grid — 7/5 split on lg ── */}
        {!expired && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ═══ LEFT: Instructions (7 cols on lg) ═══ */}
          <div className="lg:col-span-7 space-y-5">

            {/* Payment instruction + amount */}
            <Card className="border border-brand/25 rounded-2xl overflow-hidden shadow-sm bg-card">
              {/* Gold top accent line */}
              <div className="h-[3px] bg-gradient-to-r from-brand to-brand/20" />

              <CardContent className="p-5 sm:p-6 space-y-5">
                {/* Instruction sentence */}
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5 p-2 rounded-lg bg-brand/10 border border-brand/20 text-brand">
                    <QrCode className="h-4 w-4" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-serif-academic font-bold text-foreground leading-snug">
                      请扫描右侧微信二维码完成付款
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      向摄影师{' '}
                      <span className="font-semibold text-foreground">{photographerName}</span>{' '}
                      支付以下金额
                    </p>
                  </div>
                </div>

                {/* Amount block — responsive, no overflow */}
                <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-brand/6 border border-brand/15">
                  <div className="text-center min-w-0">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1.5">
                      人民币
                    </p>
                    <p className="text-2xl sm:text-3xl font-mono font-bold text-brand leading-none break-all">
                      ¥{amountCNY}
                    </p>
                  </div>
                  <div className="text-center min-w-0 border-l border-brand/20">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1.5">
                      英镑
                    </p>
                    <p className="text-2xl sm:text-3xl font-mono font-bold text-foreground/70 leading-none break-all">
                      £{amountGBP}
                    </p>
                  </div>
                </div>

                {/* Payment reference */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-brand" strokeWidth={1.5} />
                    {COPY.CHECKOUT.REF_CODE_WARNING}
                  </p>
                  <div className="border-2 border-dashed border-brand/40 rounded-xl py-4 px-3 text-center hover:bg-brand/5 hover:border-brand/60 transition-all duration-300">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-semibold">
                      支付参考码 / Payment Reference
                    </p>
                    <span className="text-xl sm:text-2xl font-mono font-bold text-brand tracking-[0.2em] break-all">
                      {paymentRef}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-destructive flex items-center gap-1">
                    ⚠ {COPY.CHECKOUT.REF_CODE_CONSEQUENCE}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Timer */}
            <Card className="border border-brand/15 bg-gradient-to-r from-brand/5 to-transparent rounded-2xl">
              <CardContent className="flex items-start gap-3 p-5">
                <div className="shrink-0 p-2 rounded-lg bg-brand/10 border border-brand/20 text-brand animate-pulse">
                  <Clock className="h-4 w-4" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-serif-academic font-bold text-sm text-foreground">
                    30 分钟限时安全预留
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                    {COPY.CHECKOUT.PAYMENT_WINDOW_DESC(amountCNY)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Legal disclaimer */}
            <Card className="border border-border/60 rounded-2xl overflow-hidden shadow-sm">
              <CardHeader className="py-4 px-5 sm:px-6 bg-muted/20 border-b border-border/40">
                <CardTitle className="text-sm font-serif-academic font-bold text-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0 text-brand" strokeWidth={1.5} />
                  平台安全及免责条款
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  学生与摄影师直接扫码核对，平台严格遵照无代理直付中介条约
                </CardDescription>
              </CardHeader>
              <CardContent className="px-5 sm:px-6 pb-5 space-y-4 pt-4">
                <div className="max-h-36 overflow-y-auto border border-border/60 rounded-xl p-4 text-xs text-muted-foreground/90 bg-muted/20 leading-relaxed">
                  <div className="whitespace-pre-wrap font-sans">
                    {DISCLAIMER_CN.split('\n').slice(0, 16).join('\n')}...
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDisclaimer(true)}
                    className="text-brand hover:underline font-semibold text-[11px] mt-3 inline-flex items-center gap-1.5 bg-transparent border-none p-0 cursor-pointer"
                  >
                    查看完整条款{' '}
                    <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                </div>

                <div className="flex items-start gap-3 p-4 bg-brand/5 rounded-xl border border-brand/15">
                  <input
                    type="checkbox"
                    id="disclaimer"
                    checked={disclaimerAccepted}
                    onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-brand/30 accent-brand cursor-pointer shrink-0"
                  />
                  <label
                    htmlFor="disclaimer"
                    className="text-xs leading-relaxed cursor-pointer font-medium text-foreground/80"
                  >
                    {COPY.LEGAL.DISCLAIMER_CHECKBOX_CN}
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Cancel */}
            <Button
              variant="outline"
              className="w-full tactile-btn h-11 border-border/60 text-muted-foreground hover:text-foreground text-xs font-semibold rounded-xl transition-all"
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? COPY.COMMON.CANCELLING : COPY.CHECKOUT.CANCEL_BOOKING}
            </Button>
          </div>

          {/* ═══ RIGHT: QR + Proof upload (5 cols on lg, sticky) ═══ */}
          <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-[72px]">

            {/* WeChat QR */}
            <Card className="border border-border/60 rounded-2xl shadow-sm overflow-hidden">
              <CardHeader className="py-4 px-5 sm:px-6 bg-muted/20 border-b border-border/40">
                <CardTitle className="text-sm font-serif-academic font-bold text-foreground flex items-center gap-2">
                  <QrCode className="h-4 w-4 shrink-0 text-brand" strokeWidth={1.5} />
                  {COPY.CHECKOUT.WECHAT_PAYMENT_TITLE}
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  {COPY.CHECKOUT.WECHAT_PAYMENT_SCAN(photographerName)}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 sm:p-6 flex flex-col items-center gap-4">
                {photographerQR ? (
                  <>
                    <div className="relative group p-3 rounded-2xl border-2 border-brand/20 bg-white shadow-md hover:border-brand/50 hover:shadow-lg hover:shadow-brand/10 transition-all duration-300">
                      <img
                        src={photographerQR}
                        alt={COPY.CHECKOUT.WECHAT_PAYMENT_TITLE}
                        className="w-full max-w-[180px] rounded-lg transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    </div>
                    <p className="text-[11px] text-center text-muted-foreground px-2 leading-relaxed">
                      使用微信扫一扫，向{' '}
                      <span className="font-bold text-foreground">{photographerName}</span>{' '}
                      转账{' '}
                      <span className="text-brand font-bold">¥{amountCNY}</span>
                    </p>
                  </>
                ) : (
                  <div className="w-full text-center p-8 border-2 border-dashed border-border/60 rounded-2xl text-muted-foreground bg-muted/10">
                    <QrCode
                      className="h-12 w-12 mx-auto mb-3 opacity-30 text-brand"
                      strokeWidth={1}
                    />
                    <p className="text-sm font-serif-academic font-semibold text-foreground/60">
                      {COPY.CHECKOUT.QR_NOT_UPLOADED}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {COPY.CHECKOUT.CONTACT_VIA_WECHAT}
                      <span className="font-bold text-foreground">{photographerName}</span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Proof upload */}
            <Card className="border border-border/60 rounded-2xl shadow-sm overflow-hidden">
              <CardHeader className="py-4 px-5 sm:px-6 bg-muted/20 border-b border-border/40">
                <CardTitle className="text-sm font-serif-academic font-bold text-foreground">
                  {COPY.CHECKOUT.UPLOAD_PROOF}
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  {COPY.CHECKOUT.PROOF_UPLOAD_DESC}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 sm:p-6 space-y-4">
                {!disclaimerAccepted && (
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/50 text-xs text-muted-foreground text-center">
                    请先阅读并勾选左侧条款，再上传截图
                  </div>
                )}
                <ProofUploader onUpload={handleUpload} disabled={!disclaimerAccepted} />
              </CardContent>
            </Card>

          </div>
        </div>
        )}
      </div>

      {/* ── Disclaimer Modal ── */}
      {showDisclaimer && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background border border-border/80 rounded-2xl w-full max-w-xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 shrink-0">
              <h3 className="font-serif-academic font-bold text-base text-foreground">
                平台免责声明及预约须知
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDisclaimer(false)}
                className="tactile-btn text-xs font-medium rounded-xl hover:bg-muted"
              >
                关闭
              </Button>
            </div>
            <div className="overflow-y-auto p-5 sm:p-6 text-xs text-muted-foreground leading-relaxed space-y-6">
              <div className="whitespace-pre-wrap font-sans">{DISCLAIMER_CN}</div>
              <Separator className="border-border/60" />
              <div className="whitespace-pre-wrap font-sans text-muted-foreground/70">
                {DISCLAIMER_EN}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
