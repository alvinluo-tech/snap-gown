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
import { Camera, Clock, ArrowLeft, QrCode, FileText, ExternalLink } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/student">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <Camera className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold">{COPY.BRAND.NAME}</span>
      </div>

      {/* Payment Reference Code */}
      <Card className="border-destructive/20 bg-destructive/10">
        <CardContent className="p-4">
          <p className="font-bold text-destructive text-lg mb-2">
            {COPY.CHECKOUT.WECHAT_PAY_INSTRUCTION(amountCNY, amountGBP)}
          </p>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-destructive">{COPY.CHECKOUT.REF_CODE_WARNING}</span>
          </div>
          <div className="bg-background border-2 border-dashed border-destructive/30 rounded-lg p-3 text-center">
            <span className="text-3xl font-mono font-bold text-destructive tracking-widest">
              {paymentRef}
            </span>
          </div>
          <p className="text-sm text-destructive mt-2">
            {COPY.CHECKOUT.REF_CODE_CONSEQUENCE}
          </p>
        </CardContent>
      </Card>

      {/* Timer Warning */}
      <Card className="border-warning/20 bg-warning/10">
        <CardContent className="flex items-center gap-3 p-4">
          <Clock className="h-5 w-5 text-warning" />
          <div>
            <p className="font-medium text-warning">
              {COPY.CHECKOUT.PAYMENT_WINDOW}
            </p>
            <p className="text-sm text-warning">
              {COPY.CHECKOUT.PAYMENT_WINDOW_DESC(amountCNY)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* WeChat QR Code */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            {COPY.CHECKOUT.WECHAT_PAYMENT_TITLE}
          </CardTitle>
          <CardDescription>
            {COPY.CHECKOUT.WECHAT_PAYMENT_SCAN(photographerName)}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          {photographerQR ? (
            <img
              src={photographerQR}
              alt={COPY.CHECKOUT.WECHAT_PAYMENT_TITLE}
              className="max-w-[250px] rounded-lg border"
            />
          ) : (
            <div className="text-center p-8 border rounded-lg text-muted-foreground">
              <QrCode className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>{COPY.CHECKOUT.QR_NOT_UPLOADED}</p>
              <p className="text-sm">
                {COPY.CHECKOUT.CONTACT_VIA_WECHAT}{photographerName}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legal Disclaimer */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            平台免责声明
          </CardTitle>
          <CardDescription>
            请在支付前阅读并同意以下条款
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-h-48 overflow-y-auto border rounded-lg p-4 text-sm text-muted-foreground bg-muted/30">
            <div className="whitespace-pre-wrap text-xs leading-relaxed">
              {DISCLAIMER_CN.split('\n').slice(0, 30).join('\n')}...
            </div>
            <button
              type="button"
              onClick={() => setShowDisclaimer(true)}
              className="text-primary hover:underline text-xs mt-2 inline-flex items-center gap-1"
            >
              查看完整条款 <ExternalLink className="h-3 w-3" />
            </button>
          </div>

          <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
            <input
              type="checkbox"
              id="disclaimer"
              checked={disclaimerAccepted}
              onChange={(e) => setDisclaimerAccepted(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-primary"
            />
            <label htmlFor="disclaimer" className="text-sm leading-relaxed cursor-pointer">
              {COPY.LEGAL.DISCLAIMER_CHECKBOX_CN}
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer Modal */}
      {showDisclaimer && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">平台免责声明及预约须知</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowDisclaimer(false)}>
                关闭
              </Button>
            </div>
            <div className="overflow-y-auto p-6">
              <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                {DISCLAIMER_CN}
              </div>
              <Separator className="my-6" />
              <div className="prose prose-sm max-w-none whitespace-pre-wrap text-muted-foreground">
                {DISCLAIMER_EN}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Proof Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{COPY.CHECKOUT.UPLOAD_PROOF}</CardTitle>
          <CardDescription>{COPY.CHECKOUT.PROOF_UPLOAD_DESC}</CardDescription>
        </CardHeader>
        <CardContent>
          <ProofUploader onUpload={handleUpload} disabled={!disclaimerAccepted} />
        </CardContent>
      </Card>

      {/* Cancel Button */}
      <Button
        variant="outline"
        className="w-full"
        onClick={handleCancel}
        disabled={cancelling}
      >
        {cancelling ? COPY.COMMON.CANCELLING : COPY.CHECKOUT.CANCEL_BOOKING}
      </Button>
    </div>
  );
}
