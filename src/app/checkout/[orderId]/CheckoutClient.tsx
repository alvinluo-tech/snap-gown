'use client';

import { useState } from 'react';
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
import { Camera, Clock, ArrowLeft, QrCode, FileText, ExternalLink, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import COPY, { DISCLAIMER_CN, DISCLAIMER_EN } from '@/lib/constants/copy';

interface CheckoutClientProps {
  orderId: string;
  amountCNY: string;
  amountGBP: string;
  paymentRef: string;
  photographerQR: string | null;
  photographerName: string;
}

export function CheckoutClient({
  orderId,
  amountCNY,
  amountGBP,
  paymentRef,
  photographerQR,
  photographerName,
}: CheckoutClientProps) {
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

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
    }
    setCancelling(false);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden academic-grain pb-24">
      {/* Ambient background lights */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand/5 blur-[100px] rounded-full pointer-events-none" />
      
      {/* Header */}
      <header className="academic-glass sticky top-0 z-50 transition-base border-b mb-8">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/dashboard/student">
            <Button variant="ghost" size="icon" className="tactile-btn rounded-xl hover:bg-muted text-foreground">
              <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
            </Button>
          </Link>
          <Camera className="h-5 w-5 text-brand" strokeWidth={1.5} />
          <span className="text-xl font-serif italic font-semibold text-primary">{COPY.BRAND.NAME}</span>
          <Badge variant="outline" className="ml-auto border-brand/20 text-brand bg-brand/5 text-[9px] uppercase tracking-widest px-2.5">
            Booking Checkout
          </Badge>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6">
        {/* Responsive Grid Split (Left Details / Right Payment actions) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Booking instruction details (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Title Eyebrow */}
            <div className="space-y-2">
              <Badge className="bg-brand/10 text-brand border border-brand/20 font-medium">
                {COPY.CHECKOUT.PAYMENT_WINDOW}
              </Badge>
              <h1 className="text-3xl font-serif italic font-bold text-primary tracking-tight">
                {COPY.CHECKOUT.TITLE}与服务确认
              </h1>
            </div>

            {/* Payment Reference alert banner */}
            <Card className="border-brand/30 bg-gradient-to-br from-brand-light/30 to-card rounded-2xl overflow-hidden shadow-sm relative group p-1">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-brand" />
              <CardContent className="p-6 space-y-4">
                <p className="font-serif italic font-semibold text-brand-foreground text-lg leading-relaxed">
                  {COPY.CHECKOUT.WECHAT_PAY_INSTRUCTION(amountCNY, amountGBP)}
                </p>
                <div className="space-y-2">
                  <span className="text-xs text-muted-foreground/90 font-medium flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-brand" strokeWidth={1.5} />
                    {COPY.CHECKOUT.REF_CODE_WARNING}
                  </span>
                  <div className="bg-background border-2 border-dashed border-brand/35 rounded-xl py-4.5 text-center transition-all duration-300 group-hover:bg-brand-light/20">
                    <span className="text-3xl font-mono font-bold text-brand tracking-widest">
                      {paymentRef}
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-destructive mt-1">
                    {COPY.CHECKOUT.REF_CODE_CONSEQUENCE}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Timer countdown pulse alert */}
            <Card className="border-brand/15 bg-brand-light/10 rounded-2xl">
              <CardContent className="flex items-start gap-4 p-5">
                <div className="p-2 rounded-xl bg-brand/10 text-brand animate-pulse mt-0.5">
                  <Clock className="h-4 w-4" strokeWidth={1.5} />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-sm text-primary">
                    30分钟限时安全预留
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {COPY.CHECKOUT.PAYMENT_WINDOW_DESC(amountCNY)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Legal Disclaimer Box */}
            <Card className="border-border/80 rounded-2xl overflow-hidden shadow-sm">
              <CardHeader className="pt-6 px-6 pb-2">
                <CardTitle className="text-base font-serif italic font-bold text-primary flex items-center gap-2">
                  <FileText className="h-4.5 w-4.5 text-brand" strokeWidth={1.5} />
                  平台安全及免责条款
                </CardTitle>
                <CardDescription className="text-xs">
                  学生与摄影师直接扫码核对，平台严格遵照无代理直付中介条约
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6 space-y-4">
                <div className="max-h-40 overflow-y-auto border border-border/60 rounded-xl p-4 text-xs text-muted-foreground/90 bg-muted/20">
                  <div className="whitespace-pre-wrap leading-relaxed font-sans">
                    {DISCLAIMER_CN.split('\n').slice(0, 16).join('\n')}...
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDisclaimer(true)}
                    className="text-brand hover:underline font-semibold text-[11px] mt-3.5 inline-flex items-center gap-1.5 bg-transparent border-none p-0 cursor-pointer"
                  >
                    查看完整条款 <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                </div>

                <div className="flex items-start gap-3 p-4 bg-muted/40 rounded-xl border border-border/30">
                  <input
                    type="checkbox"
                    id="disclaimer"
                    checked={disclaimerAccepted}
                    onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-border text-brand focus:ring-brand"
                  />
                  <label htmlFor="disclaimer" className="text-xs leading-relaxed cursor-pointer font-medium text-foreground/80">
                    {COPY.LEGAL.DISCLAIMER_CHECKBOX_CN}
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Cancel Button */}
            <Button
              variant="outline"
              className="w-full tactile-btn h-10 border-border/80 text-muted-foreground hover:text-foreground text-xs font-semibold"
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? COPY.COMMON.CANCELLING : COPY.CHECKOUT.CANCEL_BOOKING}
            </Button>

          </div>

          {/* RIGHT COLUMN: Pinned WeChat QR scanner & Screenshot proof uploader (5 cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            
            {/* WeChat QR Code Panel */}
            <Card className="border border-border/80 rounded-2xl shadow-sm overflow-hidden text-center">
              <CardHeader className="pt-6 px-6 pb-2 text-left bg-muted/20 border-b border-border/40">
                <CardTitle className="text-base font-serif italic font-bold text-primary flex items-center gap-2">
                  <QrCode className="h-4.5 w-4.5 text-brand" strokeWidth={1.5} />
                  {COPY.CHECKOUT.WECHAT_PAYMENT_TITLE}
                </CardTitle>
                <CardDescription className="text-xs">
                  {COPY.CHECKOUT.WECHAT_PAYMENT_SCAN(photographerName)}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 flex justify-center bg-card">
                {photographerQR ? (
                  <div className="relative group p-2 rounded-2xl border border-border/60 bg-white">
                    <img
                      src={photographerQR}
                      alt={COPY.CHECKOUT.WECHAT_PAYMENT_TITLE}
                      className="max-w-[200px] w-full rounded-xl transition-transform duration-300 group-hover:scale-101"
                    />
                  </div>
                ) : (
                  <div className="text-center p-8 border rounded-xl text-muted-foreground bg-muted/20 w-full max-w-[250px]">
                    <QrCode className="h-10 w-10 mx-auto mb-2 opacity-40 text-brand" strokeWidth={1.5} />
                    <p className="text-xs font-semibold">{COPY.CHECKOUT.QR_NOT_UPLOADED}</p>
                    <p className="text-[11px] text-muted-foreground mt-1.5">
                      {COPY.CHECKOUT.CONTACT_VIA_WECHAT}{photographerName}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Proof Upload card */}
            <Card className="border border-border/80 rounded-2xl shadow-sm overflow-hidden">
              <CardHeader className="pt-6 px-6 pb-2 bg-muted/20 border-b border-border/40">
                <CardTitle className="text-base font-serif italic font-bold text-primary">{COPY.CHECKOUT.UPLOAD_PROOF}</CardTitle>
                <CardDescription className="text-xs">{COPY.CHECKOUT.PROOF_UPLOAD_DESC}</CardDescription>
              </CardHeader>
              <CardContent className="p-6 bg-card">
                <ProofUploader onUpload={handleUpload} disabled={!disclaimerAccepted} />
              </CardContent>
            </Card>

          </div>

        </div>
      </div>

      {/* Disclaimer Modal */}
      {showDisclaimer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-background border rounded-2xl max-w-xl max-h-[75vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-serif italic font-bold text-lg text-primary">平台免责声明及预约须知</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowDisclaimer(false)} className="tactile-btn text-xs font-medium">
                关闭
              </Button>
            </div>
            <div className="overflow-y-auto p-6 text-xs text-muted-foreground leading-relaxed space-y-6">
              <div className="whitespace-pre-wrap font-sans">
                {DISCLAIMER_CN}
              </div>
              <Separator className="border-border/60" />
              <div className="whitespace-pre-wrap font-sans text-muted-foreground/80">
                {DISCLAIMER_EN}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
