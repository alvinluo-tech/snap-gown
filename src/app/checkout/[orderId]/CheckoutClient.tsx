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
      toast.success("Booking cancelled");
      router.push("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Cancel failed");
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
          <span className="text-xl font-bold">SnapGown</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Order Status */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Checkout</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Order: {order.order_no}
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
            <CardTitle className="text-lg">Booking Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Photographer</span>
              <span className="font-medium">{photographer.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">{slot.slot_date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time</span>
              <span className="font-medium">
                {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
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
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="font-bold text-red-800 text-lg mb-2">
                  请扫描下方微信二维码支付共计 ¥{amountRMB} 元（折合 £{amountGBP}）
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-red-700">【极重要警告】请务必在微信转账的【添加备注/说明】中填写此参考码：</span>
                </div>
                <div className="bg-white border-2 border-dashed border-red-300 rounded-lg p-3 text-center">
                  <span className="text-3xl font-mono font-bold text-red-600 tracking-widest">
                    {order.payment_ref}
                  </span>
                </div>
                <p className="text-sm text-red-600 mt-2">
                  否则摄影师将无法为您确认档期！
                </p>
              </CardContent>
            </Card>

            {/* Timer Warning */}
            <Card className="mb-6 border-orange-200 bg-orange-50">
              <CardContent className="flex items-center gap-3 p-4">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-800">
                    30-Minute Payment Window
                  </p>
                  <p className="text-sm text-orange-700">
                    Transfer ¥{amountRMB} via WeChat to the photographer, then
                    upload your payment screenshot below.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* WeChat QR Code */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  WeChat Payment
                </CardTitle>
                <CardDescription>
                  Scan the QR code below to pay ¥{amountRMB} to{" "}
                  {photographer.full_name}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                {photographer.wechat_qr_url ? (
                  <img
                    src={photographer.wechat_qr_url}
                    alt="WeChat Payment QR"
                    className="max-w-[250px] rounded-lg border"
                  />
                ) : (
                  <div className="text-center p-8 border rounded-lg text-muted-foreground">
                    <QrCode className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Photographer has not uploaded a QR code yet.</p>
                    <p className="text-sm">
                      Contact via WeChat: {photographer.full_name}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Proof Upload */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">
                  Upload Payment Proof
                </CardTitle>
                <CardDescription>
                  Upload a screenshot of your WeChat payment confirmation
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
              {cancelling ? "Cancelling..." : "Cancel Booking"}
            </Button>
          </>
        )}

        {isProofSubmitted && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6 text-center">
              <Clock className="h-10 w-10 mx-auto mb-3 text-blue-600" />
              <h3 className="text-lg font-bold text-blue-800 mb-2">
                Payment Proof Submitted
              </h3>
              <p className="text-blue-700">
                The photographer has 12 hours to verify your payment. You will
                be notified once confirmed.
              </p>
              {order.payment_proof_url && (
                <img
                  src={order.payment_proof_url}
                  alt="Submitted proof"
                  className="max-w-[200px] mx-auto mt-4 rounded-lg border"
                />
              )}
            </CardContent>
          </Card>
        )}

        {order.status === "CONFIRMED" && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-bold text-green-800 mb-2">
                Booking Confirmed!
              </h3>
              <p className="text-green-700">
                Your graduation photoshoot is confirmed. See you on{" "}
                {slot.slot_date}!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
