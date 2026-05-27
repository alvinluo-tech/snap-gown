"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Scale, 
  Info, 
  CreditCard, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2,
  Globe2
} from "lucide-react";
import COPY from "@/lib/constants/copy";

export default function RulesPage() {
  const [lang, setLang] = useState<"CN" | "EN">("CN");
  const [activeSection, setActiveSection] = useState(0);

  const sectionsCN = [
    {
      title: "1. 平台角色说明",
      icon: <Info className="h-5 w-5 text-brand" />,
      content: (
        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>本平台仅为毕业照约拍提供<strong>信息展示、摄影师档期发布、预约撮合、订单记录与基础沟通辅助服务</strong>。</p>
          <p>本平台并非摄影服务的实际提供方，也不是摄影师或学生任何一方的雇主、代理人、合伙人、收款方、支付服务提供商、托管方或担保方。</p>
          <p>摄影服务由入驻摄影师独立提供。学生与摄影师之间就拍摄时间、地点、套餐内容、交付标准、改期、退款及售后等事项形成直接服务关系。</p>
        </div>
      )
    },
    {
      title: "2. 付款方式说明",
      icon: <CreditCard className="h-5 w-5 text-brand" />,
      content: (
        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p className="font-semibold text-foreground">在确认交易前，你理解并同意：</p>
          <ul className="list-decimal pl-5 space-y-2">
            <li>本平台不收取、接收、持有、托管、转移、处理或代付任何学生支付给摄影师的款项。</li>
            <li>所有摄影服务费用均由你通过摄影师展示的个人微信收款码，直接支付至摄影师本人账户。</li>
            <li>本平台不会代表摄影师收款，也不会代表学生向摄影师付款。</li>
            <li>付款截图仅用于预约核对、订单状态确认和争议记录，不代表平台已收款或平台承担付款处理责任。</li>
            <li>如涉及退款，退款应由摄影师与你直接协商并通过双方确认的方式完成。本平台可在合理范围内协助沟通，但不承担代收、代付、垫付或强制退款义务。</li>
          </ul>
        </div>
      )
    },
    {
      title: "3. 非支付中介声明",
      icon: <ShieldAlert className="h-5 w-5 text-brand" />,
      content: (
        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p className="font-semibold text-foreground">本平台不提供以下服务：</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {[
              "不提供支付账户或电子钱包服务",
              "不提供收款、分账或清算结算",
              "不提供外汇兑换或换汇服务",
              "不控制任何学生资金的流向",
              "不作为 Escrow 或托管分账方",
              "不承担第三方支付系统异常责任"
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/40 border border-border/40">
                <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
                <span className="text-xs font-medium text-foreground">{text}</span>
              </div>
            ))}
          </div>
          <p className="text-xs pt-1">你向摄影师付款的行为，是你与摄影师之间的直接交易行为。付款完成后产生的到账核对、退款、服务争议或民事纠纷，应首先由你与摄影师直接沟通解决。</p>
        </div>
      )
    },
    {
      title: "4. 服务责任边界",
      icon: <AlertTriangle className="h-5 w-5 text-brand" />,
      content: (
        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>本平台会尽合理努力对摄影师资料、档期信息、作品展示和订单状态进行基础管理，但平台无法保证：</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>摄影师作品风格完全符合你的主观审美；</li>
            <li>天气、场地、人流、学校管理、交通或突发事件不影响拍摄；</li>
            <li>摄影师与你之间的沟通、服务履约或售后处理不存在任何争议；</li>
            <li>微信支付、银行、汇率、账户限制或第三方支付系统不会出现异常。</li>
          </ul>
          <p className="text-xs bg-destructive/5 text-destructive-foreground p-3.5 rounded-xl border border-destructive/10 leading-normal">
            在法律允许的最大范围内，本平台不对摄影师独立提供服务过程中产生的服务质量争议、退款争议、延迟交付、学生个人行程损失、服装道具准备成本、交通成本、误工损失或其他间接损失承担连带责任。但本条不排除或限制平台在适用法律下不得排除的责任，包括欺诈、故意不当行为、重大过失或法律规定不可排除的消费者权利。
          </p>
        </div>
      )
    },
    {
      title: "5. 学生下单确认",
      icon: <CheckCircle2 className="h-5 w-5 text-brand" />,
      content: (
        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p className="font-semibold text-foreground">勾选免责声明即表示你确认：</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>你已查看摄影师套餐、价格、拍摄日期、拍摄时长、交付内容、改期/退款规则；</li>
            <li>你理解付款对象为摄影师本人，而非本平台，且平台不持有你的付款资金；</li>
            <li>你同意上传付款截图用于摄影师核对到账；</li>
            <li>你同意如发生天气、改期、退款或服务争议，应优先按照平台展示的规则与摄影师协商处理；</li>
            <li>你理解平台可在争议中提供沟通记录、订单记录与基础协调，但不等同于平台成为交易一方或资金责任方。</li>
          </ul>
        </div>
      )
    }
  ];

  const sectionsEN = [
    {
      title: "1. Role of the Platform",
      icon: <Info className="h-5 w-5 text-brand" />,
      content: (
        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>This platform only provides information listing, photographer availability display, booking facilitation, order record management and basic communication support for graduation photo sessions.</p>
          <p>The platform is not the actual provider of the photography service. The platform is not the employer, agent, partner, payee, payment service provider, escrow provider, trustee or guarantor of either the student or the photographer.</p>
          <p>The photography service is independently provided by the photographer. The service relationship regarding shooting time, location, package content, delivery standard, rescheduling, refund and after-sales matters is directly formed between the student and the photographer.</p>
        </div>
      )
    },
    {
      title: "2. Payment Arrangement",
      icon: <CreditCard className="h-5 w-5 text-brand" />,
      content: (
        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p className="font-semibold text-foreground">Before making a booking and payment, you understand and agree that:</p>
          <ul className="list-decimal pl-5 space-y-2">
            <li>The platform does not collect, receive, hold, safeguard, transfer, process or pay out any money paid by students to photographers.</li>
            <li>All photography service fees are paid directly by you to the photographer's own WeChat account by scanning the photographer's personal WeChat payment QR code.</li>
            <li>The platform does not collect payment on behalf of the photographer and does not make payment on behalf of the student.</li>
            <li>The uploaded payment screenshot is used only for booking verification, order status confirmation and dispute record purposes.</li>
            <li>Any refund should be handled directly between you and the photographer through a method agreed by both parties. The platform may provide reasonable communication support, but it does not undertake any obligation to collect, pay, advance, hold or forcibly refund any money.</li>
          </ul>
        </div>
      )
    },
    {
      title: "3. No Payment Intermediary",
      icon: <ShieldAlert className="h-5 w-5 text-brand" />,
      content: (
        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p className="font-semibold text-foreground">The platform does not provide:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {[
              "No payment account or e-wallet service",
              "No collection, clearing, or settlement",
              "No foreign exchange or remittance service",
              "No control over the flow of student funds",
              "No escrow, trustee or split pay service",
              "No liability for payment system errors"
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/40 border border-border/40">
                <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
                <span className="text-xs font-medium text-foreground">{text}</span>
              </div>
            ))}
          </div>
          <p className="text-xs pt-1">Your payment to the photographer is a direct transaction between you and the photographer. Any issue relating to payment confirmation, refund, service dispute or civil claim should first be resolved directly between you and the photographer.</p>
        </div>
      )
    },
    {
      title: "4. Limitation of Platform Responsibility",
      icon: <AlertTriangle className="h-5 w-5 text-brand" />,
      content: (
        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>The platform will use reasonable efforts to manage photographer profiles, availability information, portfolio display and order status. However, the platform cannot guarantee that:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>The photographer's style will fully match your personal preference;</li>
            <li>Weather, venue conditions, crowds, university restrictions, transport or unexpected incidents will not affect the shoot;</li>
            <li>There will be no dispute between you and the photographer regarding communication, performance or after-sales matters;</li>
            <li>WeChat Pay, banks, exchange rates, account restrictions or third-party payment systems will not experience issues.</li>
          </ul>
          <p className="text-xs bg-destructive/5 text-destructive-foreground p-3.5 rounded-xl border border-destructive/10 leading-normal">
            To the fullest extent permitted by law, the platform shall not be jointly liable for service quality disputes, refund disputes, delayed delivery, personal travel losses, outfit or prop preparation costs, transport costs, loss of time or other indirect losses arising from services independently provided by photographers. Nothing in this disclaimer excludes or limits any liability that cannot be excluded under applicable law, including fraud, wilful misconduct, gross negligence or non-excludable statutory consumer rights.
          </p>
        </div>
      )
    },
    {
      title: "5. Student Confirmation",
      icon: <CheckCircle2 className="h-5 w-5 text-brand" />,
      content: (
        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p className="font-semibold text-foreground">By booking, you confirm that:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>You have reviewed the photographer's package, price, schedule, delivery content, and rescheduling/refund rules;</li>
            <li>You understand that the payment is made directly to the photographer, not the platform, and the platform does not hold your funds;</li>
            <li>You agree to upload payment screenshots for photographer verification;</li>
            <li>You agree that any dispute regarding weather, rescheduling, refunds, or services should be negotiated and resolved directly with the photographer;</li>
            <li>You understand the platform may provide records and basic coordination in a dispute, but is not a party to the transaction.</li>
          </ul>
        </div>
      )
    }
  ];

  const currentSections = lang === "CN" ? sectionsCN : sectionsEN;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden academic-grain pb-24">
      {/* Decorative top background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="academic-glass sticky top-0 z-50 transition-base border-b">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" className="tactile-btn rounded-xl hover:bg-muted text-foreground">
                <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
              </Button>
            </Link>
            <Scale className="h-5 w-5 text-brand" strokeWidth={1.5} />
            <span className="text-xl font-serif italic font-semibold text-primary">Rules & Terms</span>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-brand/20 text-brand bg-brand/5 text-[9px] uppercase tracking-widest px-2.5 py-0.5 rounded-full font-mono">
              Legal Compliance
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="tactile-btn border-brand/20 hover:bg-brand/5 text-xs font-semibold gap-1.5 h-8 px-2.5 rounded-lg text-foreground"
              onClick={() => setLang((l) => (l === "CN" ? "EN" : "CN"))}
            >
              <Globe2 className="h-3.5 w-3.5 text-brand" />
              {lang === "CN" ? "English" : "中文"}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12 relative z-10 space-y-12">
        {/* Title Capsule */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif italic font-bold text-primary tracking-tight leading-tight">
            {lang === "CN" ? "平台免责声明与服务规则" : "Platform Disclaimer & Terms of Service"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {lang === "CN" 
              ? "请在预约并付款前仔细阅读以下内容。勾选即代表你已理解并同意本平台的服务边界、付款方式及相关风险提示。"
              : "Please read the following terms carefully before booking. Your agreement confirms that you understand the platform's role, payment arrangement, and risk notices."}
          </p>
        </div>

        {/* 2-Column Desktop Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Navigation Menu */}
          <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-3">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/80 font-bold block pl-2 mb-2">
              {lang === "CN" ? "服务条款细则" : "Terms Sections"}
            </span>
            <div className="space-y-1.5">
              {currentSections.map((sec, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveSection(idx);
                    const el = document.getElementById(`section-${idx}`);
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-300 flex items-center gap-3 cursor-pointer ${
                    activeSection === idx
                      ? "bg-brand/10 border-brand/40 text-foreground font-semibold shadow-xs"
                      : "bg-card/40 border-border/50 hover:bg-card/90 text-muted-foreground"
                  }`}
                >
                  <span className="shrink-0">{sec.icon}</span>
                  <span className="text-xs truncate">{sec.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Detailed Content Area */}
          <div className="lg:col-span-8 space-y-6">
            {currentSections.map((sec, idx) => (
              <Card 
                key={idx} 
                id={`section-${idx}`}
                className={`border rounded-3xl transition-all duration-500 bg-card overflow-hidden ${
                  activeSection === idx 
                    ? "border-brand/40 shadow-md scale-[1.01]" 
                    : "border-border/60 shadow-xs"
                }`}
                onMouseEnter={() => setActiveSection(idx)}
              >
                <CardHeader className="border-b border-border/40 p-6 md:p-8 bg-muted/15 flex flex-row items-center gap-3">
                  <div className="p-2 bg-brand/10 rounded-xl">
                    {sec.icon}
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-serif-academic font-bold tracking-tight text-primary">
                    {sec.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-8">
                  {sec.content}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Footer legal claim */}
        <div className="text-center pt-8 border-t border-border/40">
          <p className="text-[10px] text-muted-foreground max-w-lg mx-auto leading-relaxed">
            {lang === "CN"
              ? "© 2026 SnapGown Graduation Photoshoot Platform. 杜伦大学约拍专属服务试点。平台致力于协助信息合规展示与履约协调，但不作为服务双方的直接交易责任方。"
              : "© 2026 SnapGown Graduation Photoshoot Platform. Durham graduation shoot pilot service. The platform facilitates compliant display and order coordination, and is not a direct transactional party."}
          </p>
        </div>
      </div>
    </div>
  );
}
