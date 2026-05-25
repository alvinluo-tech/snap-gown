import { WEATHER_POLICY_CN, WEATHER_POLICY_EN } from "@/lib/constants/copy";
import { Separator } from "@/components/ui/separator";
import { Camera } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function WeatherPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <Camera className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">SnapGown</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">天气与改期政策 / Weather & Reschedule Policy</h1>

        <section className="mb-10">
          <div className="prose prose-sm max-w-none whitespace-pre-wrap">
            {WEATHER_POLICY_CN}
          </div>
        </section>

        <Separator className="my-8" />

        <section>
          <div className="prose prose-sm max-w-none whitespace-pre-wrap text-muted-foreground">
            {WEATHER_POLICY_EN}
          </div>
        </section>
      </div>
    </div>
  );
}
