"use client";

import { useState } from "react";
import { uploadPaymentProof } from "@/app/actions/payment";
import { cancelBooking } from "@/app/actions/booking";
import { ProofUploader } from "@/components/ProofUploader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Camera, Clock, ArrowLeft, QrCode } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import COPY from "@/lib/constants/copy";

interface CheckoutProps {
  order: {
    id: string;
    order_no: string;
    payment_ref: string;
    status: string;
    total_amount_pence: number;
    payment_proof_url: string | null;
  };
  photographer: {
    full_name: string;
    wechat_qr_url: string | null;
  };
  slot: {
    slot_date: string;
    start_time: string;
    end_time: string;
  };
  amountGBP: string;
  amountRMB: string;
}

export function CheckoutClient({
  order,
  photographer,
  slot,
  amountGBP,
  amountRMB,
}: CheckoutProps) {
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);

  const handleUpload = async (file: File) => {
    await uploadPaymentProof(order.id, file);
    router.refresh();
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelBooking(order.id);
      toast.success(COPY.CHECKOUT.BOOKING_CANCELLED);
      router.push("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : COPY.CHECKOUT.CANCEL_FAILED);
    }
    setCancelling(false);
  };

  const isPending = order.status === "PENDING_PAYMENT";
  const isProofSubmitted = order.status === "PROOF_SUBMITTED";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard/student">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <Camera className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">{COPY.BRAND.NAME}</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Order Status */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">{COPY.CHECKOUT.TITLE}</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {COPY.CHECKOUT.ORDER_NUMBER}：{order.order_no}
            </span>
            <Badge
              variant={
                order.status === "CONFIRMED"
                  ? "default"
                  : order.status === "CANCELLED"
                    ? "destructive"
                    : "secondary"
              }
            >
              {order.status.replace(/_/g, " ")}
            </Badge>
          </div>
        </div>

        {/* Booking Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">{COPY.CHECKOUT.BOOKING_DETAILS}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{COPY.CHECKOUT.PHOTOGRAPHER_LABEL}</span>
              <span className="font-medium">{photographer.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{COPY.COMMON.DATE}</span>
              <span className="font-medium">{slot.slot_date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{COPY.COMMON.TIME}</span>
              <span className="font-medium">
                {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>{COPY.CHECKOUT.TOTAL}</span>
              <span>
                £{amountGBP} (¥{amountRMB})
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Section */}
        {isPending && (
          <>
            {/* Payment Reference Code */}
            <Card className="mb-6 border-destructive/20 bg-destructive/10">
              <CardContent className="p-4">
                <p className="font-bold text-destructive text-lg mb-2">
                  {COPY.CHECKOUT.WECHAT_PAY_INSTRUCTION(amountRMB, amountGBP)}
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-destructive">{COPY.CHECKOUT.REF_CODE_WARNING}</span>
                </div>
                <div className="bg-background border-2 border-dashed border-destructive/30 rounded-lg p-3 text-center">
                  <span className="text-3xl font-mono font-bold text-destructive tracking-widest">
                    {order.payment_ref}
                  </span>
                </div>
                <p className="text-sm text-destructive mt-2">
                  {COPY.CHECKOUT.REF_CODE_CONSEQUENCE}
                </p>
              </CardContent>
            </Card>

            {/* Timer Warning */}
            <Card className="mb-6 border-warning/20 bg-warning/10">
              <CardContent className="flex items-center gap-3 p-4">
                <Clock className="h-5 w-5 text-warning" />
                <div>
                  <p className="font-medium text-warning">
                    {COPY.CHECKOUT.PAYMENT_WINDOW}
                  </p>
                  <p className="text-sm text-warning">
                    {COPY.CHECKOUT.PAYMENT_WINDOW_DESC(amountRMB)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* WeChat QR Code */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  {COPY.CHECKOUT.WECHAT_PAYMENT_TITLE}
                </CardTitle>
                <CardDescription>
                  {COPY.CHECKOUT.WECHAT_PAYMENT_SCAN(photographer.full_name)}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                {photographer.wechat_qr_url ? (
                  <img
                    src={photographer.wechat_qr_url}
                    alt={COPY.CHECKOUT.WECHAT_PAYMENT_TITLE}
                    className="max-w-[250px] rounded-lg border"
                  />
                ) : (
                  <div className="text-center p-8 border rounded-lg text-muted-foreground">
                    <QrCode className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>{COPY.CHECKOUT.QR_NOT_UPLOADED}</p>
                    <p className="text-sm">
                      {COPY.CHECKOUT.CONTACT_VIA_WECHAT}{photographer.full_name}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Proof Upload */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">
                  {COPY.CHECKOUT.UPLOAD_PROOF}
                </CardTitle>
                <CardDescription>
                  {COPY.CHECKOUT.PROOF_UPLOAD_DESC}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProofUploader onUpload={handleUpload} />
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
          </>
        )}

        {isProofSubmitted && (
          <Card className="border-primary/20 bg-primary/10">
            <CardContent className="p-6 text-center">
              <Clock className="h-10 w-10 mx-auto mb-3 text-primary" />
              <h3 className="text-lg font-bold text-primary mb-2">
                {COPY.CHECKOUT.PROOF_SUBMITTED}
              </h3>
              <p className="text-primary">
                {COPY.CHECKOUT.PROOF_SUBMITTED_DESC}
              </p>
              {order.payment_proof_url && (
                <img
                  src={order.payment_proof_url}
                  alt={COPY.CHECKOUT.PROOF_PREVIEW_ALT}
                  className="max-w-[200px] mx-auto mt-4 rounded-lg border"
                />
              )}
            </CardContent>
          </Card>
        )}

        {order.status === "CONFIRMED" && (
          <Card className="border-primary/20 bg-primary/10">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-bold text-primary mb-2">
                {COPY.CHECKOUT.BOOKING_CONFIRMED}
              </h3>
              <p className="text-primary">
                {COPY.CHECKOUT.BOOKING_CONFIRMED_DESC(slot.slot_date)}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
