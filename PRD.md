```markdown
# Product Requirement Document (PRD) & System Architecture v1.0
## Project Name: UK Graduation Photoshoot Booking Platform (Durham Pilot)
## Target Framework: Next.js 16+ (App Router) | Package Manager: pnpm

---

## 1. Project Metadata & Technical Stack

*   **Target Market:** Chinese international students at UK universities (Initial Pilot: Durham University, 2026 graduation season).
*   **Core Philosophy:** Availability-First Supply Control (Photographers list slots, students instantly book without back-and-forth messaging).
*   **Monetization Mode:** Photographer-direct collection via WeChat QR code with a platform commission tracking and credit-limit auto-suspension (熔断机制).
*   **Technical Stack:**
    *   **Framework:** Next.js 16+ (Strict TypeScript, App Router, Server Actions natively optimized)
    *   **Package Manager:** `pnpm`
    *   **Database & Auth:** Supabase (PostgreSQL, Realtime, Storage)
    *   **UI Components:** Tailwind CSS + Shadcn/ui + Lucide-react
    *   **Notification Engine:** Resend API (Transactional Email)
    *   **Runtime Environment:** Node.js v22+ compatible

---

## 2. Project Initialization & Setup Flow

The Mimo Agent must strictly follow these initialization steps in sequence using `pnpm`:

```bash
# Step 1: Initialize Next.js 16+ Project with modern defaults
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbo

# Step 2: Install core production dependencies
pnpm add @supabase/supabase-js resend clsx tailwind-merge lucide-react date-fns react-day-picker

# Step 3: Initialize and add Shadcn/ui components via dlx
pnpm dlx shadcn@latest init -d

# Step 4: Component block allocation (Add required shadcn atomic elements)
pnpm dlx shadcn@latest add button calendar dialog form input select toast table tabs card avatar badge

```

*Developer Note on Next.js 16 Compliance:* Ensure all dynamically evaluated route parameters (`params` and `searchParams`) are treated strictly as **Promises** within Server Components and layout definitions. Synchronous access is deprecated and will fail build compilation.

---

## 3. Database Schema (PostgreSQL / Supabase)

Execute this script directly within the Supabase SQL Editor to construct the transactional foundation. All financial figures are explicitly stored as **Integers in Pence (100 pence = £1)** to bypass floating-point mutations.

```sql
-- ====================================================================
-- 1. TYPE DECLARATIONS & ENUMS
-- ====================================================================
CREATE TYPE user_role AS ENUM ('STUDENT', 'PHOTOGRAPHER', 'ADMIN');
CREATE TYPE approval_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE account_status AS ENUM ('ACTIVE', 'SUSPENDED');
CREATE TYPE slot_status AS ENUM ('AVAILABLE', 'HELD', 'BOOKED', 'BLOCKED', 'RESCHEDULED');
CREATE TYPE order_status AS ENUM ('PENDING_PAYMENT', 'PROOF_SUBMITTED', 'CONFIRMED', 'VERIFICATION_OVERDUE', 'COMPLETED', 'CANCELLED');

-- ====================================================================
-- 2. CORE TABLE CONFIGURATIONS
-- ====================================================================

-- User & Photographer Profile Extension
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    full_name TEXT NOT NULL,
    wechat_id TEXT NOT NULL,
    uk_phone TEXT,
    role user_role NOT NULL DEFAULT 'STUDENT',
    
    -- Photographer Specific Operational Domains
    approval_status approval_status DEFAULT 'PENDING',
    account_status account_status DEFAULT 'ACTIVE',
    wechat_qr_url TEXT,                      -- Link to uploaded WeChat QR payment code
    gowns_json JSONB DEFAULT '[]'::jsonb,     -- Array of objects: [{"degree": "MSc", "size": "M"}]
    commission_owed_pence INT DEFAULT 0,     -- Accumulative unpaid commission debt to platform
    bio TEXT
);

-- Time-Slot Availability Architecture (Availability-First Blueprint)
CREATE TABLE availability_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    photographer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    school_slug TEXT NOT NULL DEFAULT 'durham',
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status slot_status DEFAULT 'AVAILABLE' NOT NULL,
    hold_expires_at TIMESTAMP WITH TIME ZONE, -- Hard cutoff line for 30-minute reservation locks
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consolidated Order Ledger
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_no VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    photographer_id UUID REFERENCES profiles(id) NOT NULL,
    slot_id UUID REFERENCES availability_slots(id) NOT NULL,
    
    -- Financial Tracking Core (Pence Infrastructure)
    total_amount_pence INT NOT NULL,                  -- Total gig fee (e.g., £150.00 = 15000)
    commission_rate_pct NUMERIC(4,2) NOT NULL DEFAULT 10.00, -- Dynamic or default 10% rate
    platform_fee_pence INT NOT NULL,                  -- Pre-calculated share owed to platform
    
    status order_status DEFAULT 'PENDING_PAYMENT' NOT NULL,
    payment_proof_url TEXT,                           -- Supabase Storage asset URL for proof screenshot
    proof_submitted_at TIMESTAMP WITH TIME ZONE,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 3. SPEED & ISOLATION PERFORMANCE INDEXES
-- ====================================================================
CREATE INDEX idx_slots_lookup ON availability_slots (school_slug, slot_date, status);
CREATE INDEX idx_orders_matching ON orders (photographer_id, status);
CREATE INDEX idx_slots_expiry_sweep ON availability_slots (status, hold_expires_at) WHERE status = 'HELD';

```

---

## 4. Next.js 16+ Directory Architecture

Mimo Agent must enforce the following explicit App Router structure. Code generation inside legacy `pages/` paradigms is strictly unauthorized.

```text
src/
├── app/
│   ├── layout.tsx                       # Global configuration, Provider state bindings
│   ├── page.tsx                         # Core landing pad, varsity selectors, Bento showcase
│   ├── auth/
│   │   └── page.tsx                     # Authentication gateway (Supabase Auth custom integration)
│   ├── photographers/
│   │   └── [id]/
│   │       └── page.tsx                 # Dynamic detailed showcase with Async Params evaluation
│   ├── checkout/
│   │   └── [orderId]/
│   │       └── page.tsx                 # Payment terminal, fixed exchange rate rendering, proof upload
│   ├── dashboard/
│   │   ├── student/
│   │   │   └── page.tsx                 # Booking history logs for students
│   │   └── photographer/
│   │       ├── slots/
│   │       │   └── page.tsx             # Interactive grid scheduling manager
│   │       └── orders/
│   │           └── page.tsx             # Transaction verification and order processing board
│   └── actions/                         # Next.js 16 Native Server Actions (No direct API routes unless necessary)
│       ├── slots.ts                     # Slot generation, mutations, and batch template actions
│       ├── booking.ts                   # Transactional pessimistic reservation engine
│       ├── payment.ts                   # Storage ingestion hooks for payment proofs
│       └── verification.ts              # Financial accounting confirmation and rejection paths
├── components/
│   ├── ui/                              # Automatically populated atomic shadcn/ui library components
│   ├── CalendarScheduler.tsx            # Context-aware reactive booking calendar controller
│   └── ProofUploader.tsx                # Drag-and-drop file ingestion portal for screenshots
└── lib/
    ├── supabase.ts                      # Instantiated isomorphic Supabase client configuration
    ├── resend.ts                        # Unified mail template dispatch handlers
    └── utils.ts                         # Mathematical transformers (Pence-to-Pounds, FX Conversions)

```

---

## 5. Core Workflows & Dual-Stage State Machine

```
[AVAILABLE Slot] 
       │ (Student clicks 'Book Now' -> Server Action locks row)
       ▼
  [HELD Slot] ──► Order Status: PENDING_PAYMENT (30-Min Countdown Active)
       │
       ├─► (Timeout reached without proof) ──► Reset to [AVAILABLE], Order: CANCELLED
       │
       └─► (Student uploads WeChat Proof Screenshot)
               ▼
          Order Status: PROOF_SUBMITTED (30-Min Timer Destroyed, Slot locked continuously)
               │
               ├─► [Resend Triggered] Mail dispatched notifying Photographer of pending check (12-Hr Window)
               │
               ├──► (Photographer confirms RMB arrival) ──► Slot: [BOOKED], Order: CONFIRMED
               │
               └──► (12 Hours Pass with No Action) ──► Order: VERIFICATION_OVERDUE 
                                                       (Slot remains locked, Admin alert sent)

```

### Deep-Dive Specification Requirements

#### Stage 1: Dynamic Rate Calculation & The 30-Minute Allocation Window

* **Action Boundary:** When a student picks a slot and clicks submit, the reservation transaction locks the row. The slot status updates to `HELD` and assigns `hold_expires_at = NOW() + INTERVAL '30 minutes'`.
* **RMB Translation Infrastructure:** Because transactions occur off-chain via direct WeChat transfer, the system injects an operational exchange rate parameter (e.g., hardcoded at `1 : 9.30`). An entry priced at £150.00 (`15000` pence) automatically presents a localized terminal statement demanding exactly **¥1395.00 RMB** alongside the target photographer's personal payment QR code.

#### Stage 2: Immediate Timer Destruction & The 12-Hour Verification Grace Window

* **Action Boundary:** The exact millisecond a file payload lands inside the execution scope of `actions/payment.ts`, the database system **purges** the `hold_expires_at` value. The slot status remains pinned as `HELD` to isolate it from external pool fetch requests.
* **Mail Loop Automation:** Resend deploys a transaction notice directly to the photographer's inbox. The system grants a maximum 12-hour grace window for bank/wallet reconciliation.
* **The Overdue Intercept Fallback:** If the photographer remains unresponsive at hour 12, the system changes the status to `VERIFICATION_OVERDUE`. The slot **remains protected and locked** to eliminate customer despair over double-bookings. Resend fires an administrative distress signal containing order metadata straight to the platform owner for manual chat intervention.

---

## 6. Business Logic: Credit-Limit Auto-Suspension (熔断机制)

To retain monetization integrity across detached off-chain settlement streams, the engine enforces strict self-governing collection loops:

```typescript
// Conceptual logic enforced inside actions/verification.ts upon gig finalization
if (order.status === 'COMPLETED') {
  // 1. Calculate platform fee based on tracked integer pence values
  const platformFee = Math.round(order.total_amount_pence * (order.commission_rate_pct / 100));
  
  // 2. Increment photographer's outstanding balance
  await supabase.rpc('increment_commission_owed', { 
    target_photographer_id: order.photographer_id, 
    amount_pence: platformFee 
  });
  
  // 3. Evaluate safety limits (Threshold set to £30.00 / 3000 pence)
  const currentDebt = await getPhotographerDebt(order.photographer_id);
  if (currentDebt > 3000) {
    await supabase
      .from('profiles')
      .update({ account_status: 'SUSPENDED' })
      .eq('id', order.photographer_id);
      
    await dispatchResendSuspensionNotice(order.photographer_id);
  }
}

```

* **Operational Effect:** Any photographer flagged as `SUSPENDED` is completely scrubbed from frontend consumer fetch lookups. Existing active reservations persist, but their generation pipeline for new slots drops to zero until manual administration zeroes out the `commission_owed_pence` register after verifying off-line collection.

---

## 7. Interface Requirements & Boundary Controls for Mimo Agent

Mimo must rigorously conform to these syntactic boundaries during script output generation:

### Async Parameter Enforcement (Next.js 16 Architecture)

Dynamic page components must extract props asynchronously. Synchronous parsing will crash execution.

```typescript
// Correct Next.js 16+ execution layout example
interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PhotographerProfilePage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedQuery = await searchParams;
  const photographerId = resolvedParams.id;
  
  // Proceed with execution logic...
}

```

### Lazy Validation Anti-Concurrency Engine

To prevent stale states where a slot appears `HELD` indefinitely because a user closed their laptop during the 30-minute checkout, slots query functions inside `actions/slots.ts` must execute an internal cleanup update before returning data arrays to the viewport UI:

```sql
-- Every standard read routine enforces this auto-release validation query first
UPDATE availability_slots 
SET status = 'AVAILABLE', hold_expires_at = NULL 
WHERE status = 'HELD' AND hold_expires_at < NOW();

```

### ID Modification Guardrails (Secure Row-Level Enforcement)

Every state update action (such as confirming a payment proof arrival) must validate the session ownership server-side. Under no circumstances should the system alter an entry based solely on arguments passed from client-side state parameters.

```typescript
// Inside server actions, always extract identity from server session auth context
const { data: { user }, error } = await supabase.auth.getUser();
if (!user || error) throw new Error("Unauthorized Session Context");

// Match user.id strictly against target record photographer_id/user_id inside the database

```

```

```