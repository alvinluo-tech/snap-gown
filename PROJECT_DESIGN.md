# SnapGown 项目设计文档

## 目录

1. [项目概述](#1-项目概述)
2. [技术栈](#2-技术栈)
3. [系统架构](#3-系统架构)
4. [数据库设计](#4-数据库设计)
5. [用户角色与权限](#5-用户角色与权限)
6. [前端设计](#6-前端设计)
7. [后端设计](#7-后端设计)
8. [核心业务流程](#8-核心业务流程)
9. [支付流程](#9-支付流程)
10. [认证与安全](#10-认证与安全)
11. [部署与环境配置](#11-部署与环境配置)
12. [国际化与文案管理](#12-国际化与文案管理)

---

## 1. 项目概述

### 1.1 项目简介

SnapGown 是一个面向英国大学（以杜伦大学为主）的毕业照拍摄预约平台。平台连接学生和专业摄影师，提供从预约、支付到订单完成的完整服务流程。

### 1.2 核心功能

- **学生端**：浏览摄影师、预约档期、微信支付、上传付款凭证
- **摄影师端**：管理可用档期、审核付款凭证、管理订单、个人资料展示
- **管理员端**：审核摄影师、管理订单、佣金结算、数据分析

### 1.3 目标用户

- **学生**：英国大学毕业生，需要预约毕业照拍摄
- **摄影师**：专业摄影服务提供商
- **管理员**：平台运营人员

---

## 2. 技术栈

### 2.1 前端技术

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 16.2.6 | React 全栈框架（App Router） |
| React | 19.2.4 | UI 库 |
| TypeScript | 5.x | 类型安全 |
| Tailwind CSS | 4.x | 原子化 CSS 框架 |
| shadcn/ui | 4.8.0 | 组件库 |
| date-fns | 4.3.0 | 日期处理 |
| react-day-picker | 10.0.1 | 日历组件 |
| sonner | 2.0.7 | Toast 通知 |
| lucide-react | 1.16.0 | 图标库 |

### 2.2 后端技术

| 技术 | 用途 |
|------|------|
| Supabase | BaaS 平台（数据库、认证、存储、边缘函数） |
| PostgreSQL | 关系型数据库 |
| Resend | 邮件服务 |
| Next.js Server Actions | 服务端逻辑 |

### 2.3 开发工具

| 工具 | 用途 |
|------|------|
| ESLint | 代码规范 |
| pnpm | 包管理器 |
| Git | 版本控制 |

---

## 3. 系统架构

### 3.1 整体架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        客户端 (Browser)                         │
├─────────────────────────────────────────────────────────────────┤
│  Next.js App Router (SSR/CSR Hybrid)                          │
│  ├── 首页 (学生/摄影师/管理员视图)                               │
│  ├── 认证页面 (登录/注册/重置密码)                                │
│  ├── 摄影师公共页面                                              │
│  ├── 支付结账页面                                               │
│  └── 仪表板 (学生/摄影师/管理员)                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js Server Layer                         │
├─────────────────────────────────────────────────────────────────┤
│  ├── Server Components (RSC) - 页面数据获取                      │
│  ├── Server Actions - 业务逻辑处理                               │
│  ├── Middleware - 路由保护、认证检查                               │
│  └── API Routes - Auth Callback 处理                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┤
│                    Supabase Backend                             │
├─────────────────────────────────────────────────────────────────┤
│  ├── Auth - 用户认证、会话管理                                    │
│  ├── Database - PostgreSQL 数据存储                              │
│  │   ├── RLS Policies - 行级安全                                 │
│  │   ├── RPC Functions - 业务逻辑函数                            │
│  │   └── Triggers - 自动化触发器                                  │
│  ├── Storage - 文件存储 (头像、微信收款码、付款凭证)                │
│  └── Edge Functions - 定时任务 (过期槽位清理)                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┤
│                    外部服务                                      │
├─────────────────────────────────────────────────────────────────┤
│  ├── Resend - 邮件通知服务                                       │
│  └── 微信支付 - 线下转账 (非在线支付)                              │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 数据流

```
学生预约流程:
学生 → 浏览摄影师 → 选择档期 → bookSlot() → 创建订单 → 支付页面
     → 微信转账 → 上传凭证 → 摄影师审核 → 确认/拒绝 → 完成

摄影师管理流程:
摄影师 → 登录 → 管理档期 (创建/删除) → 接收订单通知
     → 审核付款凭证 → 确认/拒绝 → 标记完成 → 佣金计算

管理员运营流程:
管理员 → 登录 → 审核摄影师申请 → 管理订单 → 佣金结算
     → 监控平台数据 → 处理异常订单
```

---

## 4. 数据库设计

### 4.1 ER 图

```
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│     profiles     │       │ availability_slots│       │      orders      │
├──────────────────┤       ├──────────────────┤       ├──────────────────┤
│ id (PK, UUID)    │◄──┐   │ id (PK, UUID)    │◄──┐   │ id (PK, UUID)    │
│ full_name        │   │   │ photographer_id  │───┘   │ order_no         │
│ wechat_id        │   │   │ school_slug      │       │ user_id          │
│ uk_phone         │   │   │ slot_date        │       │ photographer_id  │
│ role             │   │   │ start_time       │       │ slot_id          │
│ approval_status  │   │   │ end_time         │       │ total_amount_pence│
│ account_status   │   │   │ status           │       │ commission_rate_pct│
│ wechat_qr_url    │   │   │ price_pence      │       │ platform_fee_pence│
│ gowns_json       │   │   │ hold_expires_at  │       │ status           │
│ commission_owed  │   │   │ created_at       │       │ payment_proof_url│
│ bio              │   │   └──────────────────┘       │ proof_submitted_at│
│ avatar_url       │   │                              │ confirmed_at     │
│ slug             │   │                              │ created_at       │
│ updated_at       │   │                              │ payment_ref      │
└──────────────────┘   │                              └──────────────────┘
                       │                                       │
                       │         ┌──────────────────┐          │
                       │         │ order_status_logs │          │
                       │         ├──────────────────┤          │
                       │         │ id (PK, UUID)    │◄─────────┘
                       │         │ order_id         │
                       │         │ actor_id         │
                       │         │ from_status      │
                       │         │ to_status        │
                       │         │ note             │
                       │         │ created_at       │
                       │         └──────────────────┘
                       │
                       │         ┌──────────────────┐
                       │         │ commission_ledger │
                       │         ├──────────────────┤
                       └────────►│ id (PK, UUID)    │
                                 │ order_id         │
                                 │ photographer_id  │
                                 │ platform_fee_pence│
                                 │ ledger_status    │
                                 │ note             │
                                 │ settled_at       │
                                 │ settled_by       │
                                 │ created_at       │
                                 └──────────────────┘
```

### 4.2 表结构详细设计

#### 4.2.1 profiles 表 (用户资料)

```sql
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    full_name TEXT NOT NULL,
    wechat_id TEXT NOT NULL,
    uk_phone TEXT,
    role user_role NOT NULL DEFAULT 'STUDENT',
    approval_status approval_status DEFAULT 'PENDING',
    account_status account_status DEFAULT 'ACTIVE',
    wechat_qr_url TEXT,
    gowns_json JSONB DEFAULT '[]'::jsonb,
    commission_owed_pence INT DEFAULT 0,
    bio TEXT,
    avatar_url TEXT,
    slug TEXT UNIQUE
);
```

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 关联 auth.users，主键 |
| full_name | TEXT | 用户全名 |
| wechat_id | TEXT | 微信 ID，用于联系和支付 |
| uk_phone | TEXT | 英国手机号（选填） |
| role | ENUM | 用户角色：STUDENT / PHOTOGRAPHER / ADMIN |
| approval_status | ENUM | 审核状态：PENDING / APPROVED / REJECTED |
| account_status | ENUM | 账户状态：ACTIVE / SUSPENDED |
| wechat_qr_url | TEXT | 微信收款二维码 URL（摄影师） |
| gowns_json | JSONB | 学士服信息数组 |
| commission_owed_pence | INT | 待付佣金（便士） |
| bio | TEXT | 个人简介 |
| avatar_url | TEXT | 头像 URL |
| slug | TEXT | 自定义主页链接标识 |

#### 4.2.2 availability_slots 表 (档期)

```sql
CREATE TABLE availability_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    photographer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    school_slug TEXT NOT NULL DEFAULT 'durham',
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status slot_status DEFAULT 'AVAILABLE' NOT NULL,
    hold_expires_at TIMESTAMP WITH TIME ZONE,
    price_pence INT DEFAULT 15000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| photographer_id | UUID | 关联摄影师 |
| school_slug | TEXT | 学校标识（默认 durham） |
| slot_date | DATE | 日期 |
| start_time | TIME | 开始时间 |
| end_time | TIME | 结束时间 |
| status | ENUM | 状态：AVAILABLE / HELD / BOOKED / BLOCKED / RESCHEDULED |
| hold_expires_at | TIMESTAMP | 持有截止时间（30分钟） |
| price_pence | INT | 价格（便士） |

#### 4.2.3 orders 表 (订单)

```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_no VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    photographer_id UUID REFERENCES profiles(id) NOT NULL,
    slot_id UUID REFERENCES availability_slots(id) NOT NULL,
    total_amount_pence INT NOT NULL,
    commission_rate_pct NUMERIC(4,2) NOT NULL DEFAULT 10.00,
    platform_fee_pence INT NOT NULL,
    status order_status DEFAULT 'PENDING_PAYMENT' NOT NULL,
    payment_proof_url TEXT,
    proof_submitted_at TIMESTAMP WITH TIME ZONE,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    payment_ref VARCHAR(50) NOT NULL
);
```

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| order_no | VARCHAR(50) | 订单号（格式：ORD-YYYYMMDD-XXXXXX） |
| user_id | UUID | 关联学生 |
| photographer_id | UUID | 关联摄影师 |
| slot_id | UUID | 关联档期 |
| total_amount_pence | INT | 总金额（便士） |
| commission_rate_pct | NUMERIC | 佣金比例（默认 15%） |
| platform_fee_pence | INT | 平台佣金（便士） |
| status | ENUM | 订单状态 |
| payment_proof_url | TEXT | 付款凭证 URL |
| payment_ref | VARCHAR(50) | 支付参考码（格式：D-XXXX） |

#### 4.2.4 order_status_logs 表 (订单状态日志)

```sql
CREATE TABLE order_status_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) NOT NULL,
    actor_id UUID REFERENCES profiles(id) NOT NULL,
    from_status order_status,
    to_status order_status NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 4.2.5 commission_ledger 表 (佣金账本)

```sql
CREATE TABLE commission_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) NOT NULL,
    photographer_id UUID REFERENCES profiles(id) NOT NULL,
    platform_fee_pence INT NOT NULL,
    ledger_status ledger_status DEFAULT 'PENDING',
    note TEXT,
    settled_at TIMESTAMP WITH TIME ZONE,
    settled_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4.3 枚举类型

```sql
-- 用户角色
CREATE TYPE user_role AS ENUM ('STUDENT', 'PHOTOGRAPHER', 'ADMIN');

-- 审核状态
CREATE TYPE approval_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- 账户状态
CREATE TYPE account_status AS ENUM ('ACTIVE', 'SUSPENDED');

-- 档期状态
CREATE TYPE slot_status AS ENUM ('AVAILABLE', 'HELD', 'BOOKED', 'BLOCKED', 'RESCHEDULED');

-- 订单状态
CREATE TYPE order_status AS ENUM (
    'PENDING_PAYMENT',      -- 待支付
    'PROOF_SUBMITTED',      -- 已提交凭证
    'CONFIRMED',            -- 已确认
    'VERIFICATION_OVERDUE', -- 审核超时
    'COMPLETED',            -- 已完成
    'CANCELLED'             -- 已取消
);

-- 佣金状态
CREATE TYPE ledger_status AS ENUM ('PENDING', 'SETTLED', 'WAIVED');
```

### 4.4 索引设计

```sql
-- 档期查询优化
CREATE INDEX idx_slots_lookup ON availability_slots (school_slug, slot_date, status);

-- 订单查询优化
CREATE INDEX idx_orders_matching ON orders (photographer_id, status);

-- 过期档期清理优化
CREATE INDEX idx_slots_expiry_sweep ON availability_slots (status, hold_expires_at) 
WHERE status = 'HELD';
```

### 4.5 RPC 函数

#### 4.5.1 increment_commission_owed - 增加佣金欠款

```sql
CREATE OR REPLACE FUNCTION increment_commission_owed(
    target_photographer_id UUID, 
    amount_pence INT
)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET commission_owed_pence = commission_owed_pence + amount_pence,
      updated_at = NOW()
  WHERE id = target_photographer_id;
END;
$$ LANGUAGE plpgsql;
```

#### 4.5.2 release_expired_holds - 释放过期持有

```sql
CREATE OR REPLACE FUNCTION release_expired_holds()
RETURNS void AS $$
BEGIN
  UPDATE availability_slots
  SET status = 'AVAILABLE', hold_expires_at = NULL
  WHERE status = 'HELD' AND hold_expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
```

#### 4.5.3 admin_confirm_order - 管理员确认订单

```sql
CREATE OR REPLACE FUNCTION admin_confirm_order(
    target_order_id UUID,
    admin_id UUID
)
RETURNS void AS $$
BEGIN
  -- 更新订单状态
  UPDATE orders 
  SET status = 'CONFIRMED', confirmed_at = NOW()
  WHERE id = target_order_id;
  
  -- 更新档期状态
  UPDATE availability_slots
  SET status = 'BOOKED'
  WHERE id = (SELECT slot_id FROM orders WHERE id = target_order_id);
  
  -- 记录日志
  INSERT INTO order_status_logs (order_id, actor_id, to_status, note)
  VALUES (target_order_id, admin_id, 'CONFIRMED', 'Admin override');
END;
$$ LANGUAGE plpgsql;
```

#### 4.5.4 admin_reject_order - 管理员拒绝订单

```sql
CREATE OR REPLACE FUNCTION admin_reject_order(
    target_order_id UUID,
    admin_id UUID,
    reason TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- 更新订单状态
  UPDATE orders 
  SET status = 'CANCELLED', payment_proof_url = NULL, proof_submitted_at = NULL
  WHERE id = target_order_id;
  
  -- 释放档期
  UPDATE availability_slots
  SET status = 'AVAILABLE', hold_expires_at = NULL
  WHERE id = (SELECT slot_id FROM orders WHERE id = target_order_id);
  
  -- 记录日志
  INSERT INTO order_status_logs (order_id, actor_id, from_status, to_status, note)
  VALUES (target_order_id, admin_id, 'PROOF_SUBMITTED', 'CANCELLED', 
          'Admin rejected: ' || COALESCE(reason, 'No reason provided'));
END;
$$ LANGUAGE plpgsql;
```

### 4.6 触发器

```sql
-- 自动更新 updated_at 字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 5. 用户角色与权限

### 5.1 角色定义

| 角色 | 说明 | 主要功能 |
|------|------|----------|
| STUDENT | 学生用户 | 浏览摄影师、预约档期、支付、查看订单 |
| PHOTOGRAPHER | 摄影师 | 管理档期、审核付款、管理订单、个人资料 |
| ADMIN | 管理员 | 审核摄影师、管理订单、佣金结算、数据分析 |

### 5.2 权限矩阵

| 功能 | STUDENT | PHOTOGRAPHER | ADMIN |
|------|---------|--------------|-------|
| 浏览摄影师列表 | ✅ | ✅ | ✅ |
| 预约档期 | ✅ | ❌ | ❌ |
| 上传付款凭证 | ✅ | ❌ | ❌ |
| 审核付款凭证 | ❌ | ✅ | ✅ |
| 确认订单 | ❌ | ✅ | ✅ |
| 管理档期 | ❌ | ✅ | ❌ |
| 审核摄影师申请 | ❌ | ❌ | ✅ |
| 暂停/恢复摄影师 | ❌ | ❌ | ✅ |
| 佣金结算 | ❌ | ❌ | ✅ |
| 查看所有订单 | ❌ | ❌ | ✅ |
| 查看佣金账本 | ❌ | ❌ | ✅ |

### 5.3 Row Level Security (RLS) 策略

```sql
-- Profiles: 公开可读，本人可写
CREATE POLICY "Profiles viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Slots: 公开可读，摄影师管理自己的
CREATE POLICY "Slots viewable by everyone" ON availability_slots FOR SELECT USING (true);
CREATE POLICY "Photographers can insert own slots" ON availability_slots FOR INSERT WITH CHECK (auth.uid() = photographer_id);
CREATE POLICY "Photographers can update own slots" ON availability_slots FOR UPDATE USING (auth.uid() = photographer_id);
CREATE POLICY "Photographers can delete own slots" ON availability_slots FOR DELETE USING (auth.uid() = photographer_id);

-- Orders: 参与者可查看，学生创建，摄影师更新
CREATE POLICY "Participants can view orders" ON orders FOR SELECT 
  USING (auth.uid() = user_id OR auth.uid() = photographer_id);
CREATE POLICY "Students can create orders" ON orders FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Participants can update orders" ON orders FOR UPDATE 
  USING (auth.uid() = user_id OR auth.uid() = photographer_id);
```

### 5.4 存储桶权限

```sql
-- payment-proofs 存储桶
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-proofs', 'payment-proofs', false);

CREATE POLICY "Authenticated users can upload payment proofs" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'payment-proofs' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view own payment proofs" ON storage.objects
  FOR SELECT USING (bucket_id = 'payment-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- avatars 存储桶
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- wechat-qr 存储桶
INSERT INTO storage.buckets (id, name, public) VALUES ('wechat-qr', 'wechat-qr', true);
```

---

## 6. 前端设计

### 6.1 页面路由结构

```
src/app/
├── page.tsx                          # 首页
├── layout.tsx                        # 根布局
├── globals.css                       # 全局样式
├── middleware.ts                      # 中间件
├── auth/
│   ├── page.tsx                      # 登录/注册页面
│   ├── callback/
│   │   └── route.ts                  # OAuth 回调
│   └── reset-password/
│       └── page.tsx                  # 重置密码页面
├── photographers/
│   └── [slug]/
│       ├── page.tsx                  # 摄影师公共页面
│       └── PhotographerBookingClient.tsx
├── checkout/
│   └── [orderId]/
│       ├── page.tsx                  # 支付结账页面
│       └── CheckoutClient.tsx
├── dashboard/
│   ├── student/
│   │   └── page.tsx                  # 学生仪表板
│   ├── photographer/
│   │   ├── layout.tsx                # 摄影师仪表板布局
│   │   ├── orders/
│   │   │   ├── page.tsx              # 订单管理
│   │   │   └── OrdersClient.tsx
│   │   └── slots/
│   │       ├── page.tsx              # 档期管理
│   │       └── SlotsClient.tsx
│   ├── admin/
│   │   ├── layout.tsx                # 管理员仪表板布局
│   │   ├── page.tsx                  # 管理员概览
│   │   ├── photographers/
│   │   │   ├── page.tsx              # 摄影师管理
│   │   │   └── PhotographersClient.tsx
│   │   ├── orders/
│   │   │   ├── page.tsx              # 订单管理
│   │   │   └── AdminOrdersClient.tsx
│   │   ├── commission/
│   │   │   ├── page.tsx              # 佣金管理
│   │   │   └── CommissionClient.tsx
│   │   └── students/
│   │       ├── page.tsx              # 学生管理
│   │       └── StudentsClient.tsx
│   └── profile/
│       ├── page.tsx                  # 个人资料设置
│       └── ProfileSettingsClient.tsx
└── actions/
    ├── auth-check.ts                 # 认证检查
    ├── booking.ts                    # 预约相关
    ├── slots.ts                      # 档期相关
    ├── verification.ts               # 验证相关
    ├── profile.ts                    # 个人资料相关
    └── payment.ts                    # 支付相关
```

### 6.2 组件设计

#### 6.2.1 UI 组件 (shadcn/ui)

```
src/components/ui/
├── avatar.tsx        # 头像组件
├── badge.tsx         # 徽章组件
├── button.tsx        # 按钮组件
├── calendar.tsx      # 日历组件
├── card.tsx          # 卡片组件
├── dialog.tsx        # 对话框组件
├── dropdown-menu.tsx # 下拉菜单组件
├── input.tsx         # 输入框组件
├── label.tsx         # 标签组件
├── select.tsx        # 选择器组件
├── separator.tsx     # 分隔线组件
├── sonner.tsx        # Toast 组件
├── table.tsx         # 表格组件
├── tabs.tsx          # 标签页组件
└── textarea.tsx      # 文本域组件
```

#### 6.2.2 业务组件

```
src/components/
├── CalendarScheduler.tsx    # 日历调度器（档期选择/管理）
├── ImageUploader.tsx        # 图片上传组件
├── ProofUploader.tsx        # 付款凭证上传组件
├── LogoutButton.tsx         # 退出登录按钮
├── ThemeProvider.tsx         # 主题提供者
├── ThemeToggle.tsx           # 主题切换按钮
└── ThemeToggle.tsx           # 主题切换
```

### 6.3 主题系统

项目使用 `next-themes` 实现深色/浅色主题切换：

```tsx
// ThemeProvider.tsx
"use client";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children, ...props }) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

### 6.4 响应式设计

项目使用 Tailwind CSS 实现响应式布局：

- 移动端：< 768px（单列布局）
- 平板端：768px - 1024px（两列布局）
- 桌面端：> 1024px（三列或更多布局）

---

## 7. 后端设计

### 7.1 Server Actions

所有业务逻辑通过 Next.js Server Actions 实现：

#### 7.1.1 预约相关 (booking.ts)

```typescript
// bookSlot - 预约档期
export async function bookSlot(slotId: string, photographerId: string)

// cancelBooking - 取消预约
export async function cancelBooking(orderId: string)

// getStudentOrders - 获取学生订单
export async function getStudentOrders()
```

#### 7.1.2 档期相关 (slots.ts)

```typescript
// getAvailableSlots - 获取可用档期
export async function getAvailableSlots(schoolSlug: string, date: string)

// getPhotographerSlots - 获取摄影师档期
export async function getPhotographerSlots(photographerId: string)

// createSlot - 创建档期
export async function createSlot(formData: FormData)

// deleteSlot - 删除档期
export async function deleteSlot(slotId: string)

// batchCreateSlots - 批量创建档期
export async function batchCreateSlots(formData: FormData)
```

#### 7.1.3 验证相关 (verification.ts)

```typescript
// confirmPayment - 确认付款
export async function confirmPayment(orderId: string)

// completeOrder - 完成订单
export async function completeOrder(orderId: string)

// rejectPayment - 拒绝付款
export async function rejectPayment(orderId: string, reason: string)

// markOverdue - 标记超时
export async function markOverdue(orderId: string)

// adminConfirmOrder - 管理员确认
export async function adminConfirmOrder(orderId: string)

// adminRejectOrder - 管理员拒绝
export async function adminRejectOrder(orderId: string, reason: string)
```

#### 7.1.4 个人资料相关 (profile.ts)

```typescript
// getMyProfile - 获取个人资料
export async function getMyProfile()

// updateProfile - 更新个人资料
export async function updateProfile(formData: FormData)

// uploadAvatar - 上传头像
export async function uploadAvatar(file: File)

// uploadWeChatQR - 上传微信收款码
export async function uploadWeChatQR(file: File)
```

### 7.2 Supabase 客户端

#### 7.2.1 浏览器客户端

```typescript
// src/lib/supabase.ts
import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowser() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

#### 7.2.2 服务器客户端

```typescript
// src/lib/supabase-server.ts
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

// 普通用户客户端（受 RLS 限制）
export async function createSupabaseServer() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    supabaseUrl, 
    supabaseAnonKey, 
    { cookies: { getAll, setAll } }
  );
}

// 管理员客户端（绕过 RLS）
export function createSupabaseAdmin() {
  return createClient<Database>(supabaseUrl, supabaseServiceKey);
}
```

### 7.3 中间件

```typescript
// src/middleware.ts
export async function middleware(request: NextRequest) {
  // 1. 创建 Supabase 客户端
  // 2. 获取用户会话
  // 3. 检查受保护路由
  // 4. 未登录则重定向到 /auth
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]
};
```

---

## 8. 核心业务流程

### 8.1 学生预约流程

```
┌─────────────────────────────────────────────────────────────────┐
│                     学生预约流程                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. 浏览摄影师                                                  │
│     └── 首页展示已审核通过的摄影师列表                             │
│                                                                 │
│  2. 选择摄影师                                                  │
│     └── 点击摄影师卡片，进入摄影师详情页                           │
│                                                                 │
│  3. 选择档期                                                    │
│     ├── 展示可用日期的日历                                       │
│     ├── 选择日期后显示可用时间段                                  │
│     └── 点击"立即预约"                                          │
│                                                                 │
│  4. 锁定档期 (bookSlot)                                        │
│     ├── 检查摄影师账户状态                                       │
│     ├── 将档期状态从 AVAILABLE → HELD                           │
│     ├── 设置 30 分钟过期时间                                     │
│     └── 创建订单 (PENDING_PAYMENT)                              │
│                                                                 │
│  5. 支付页面                                                    │
│     ├── 显示订单详情（金额、摄影师信息）                           │
│     ├── 显示摄影师微信收款码                                     │
│     └── 生成支付参考码 (D-XXXX)                                 │
│                                                                 │
│  6. 微信转账                                                    │
│     └── 学生通过微信向摄影师转账（备注参考码）                      │
│                                                                 │
│  7. 上传付款凭证                                                │
│     ├── 上传微信支付截图                                         │
│     └── 订单状态：PENDING_PAYMENT → PROOF_SUBMITTED             │
│                                                                 │
│  8. 等待审核                                                    │
│     └── 摄影师有 12 小时审核                                      │
│                                                                 │
│  9. 审核结果                                                    │
│     ├── 确认：PROOF_SUBMITTED → CONFIRMED → 档期 BOOKED        │
│     └── 拒绝：PROOF_SUBMITTED → CANCELLED → 档期 AVAILABLE     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 摄影师管理流程

```
┌─────────────────────────────────────────────────────────────────┐
│                     摄影师管理流程                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. 档期管理                                                    │
│     ├── 创建单个档期                                            │
│     │   ├── 选择日期、时间、价格                                  │
│     │   └── 验证摄影师已审核通过                                  │
│     ├── 批量创建档期                                            │
│     │   ├── 选择日期范围                                         │
│     │   ├── 设置统一时间                                         │
│     │   └── 批量插入                                            │
│     └── 删除档期                                                │
│         └── 仅可删除 AVAILABLE 状态的档期                        │
│                                                                 │
│  2. 订单管理                                                    │
│     ├── 查看待审核订单                                          │
│     ├── 审核付款凭证                                            │
│     │   ├── 确认付款                                            │
│     │   │   └── PROOF_SUBMITTED → CONFIRMED                    │
│     │   └── 拒绝付款                                            │
│     │       └── PROOF_SUBMITTED → CANCELLED                    │
│     └── 标记完成                                                │
│         └── CONFIRMED → COMPLETED + 计算佣金                    │
│                                                                 │
│  3. 个人资料                                                    │
│     ├── 更新基本信息                                            │
│     ├── 上传头像                                                │
│     ├── 上传微信收款码                                           │
│     ├── 管理学士服信息                                           │
│     └── 设置个人主页链接                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 8.3 管理员运营流程

```
┌─────────────────────────────────────────────────────────────────┐
│                     管理员运营流程                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. 摄影师审核                                                  │
│     ├── 查看待审核列表                                          │
│     ├── 批准：PENDING → APPROVED                                │
│     └── 拒绝：PENDING → REJECTED                                │
│                                                                 │
│  2. 订单管理                                                    │
│     ├── 查看所有订单                                            │
│     ├── 筛选紧急订单（超时未审核）                                 │
│     ├── 管理员确认订单（强制）                                    │
│     └── 管理员拒绝订单（强制）                                    │
│                                                                 │
│  3. 佣金管理                                                    │
│     ├── 查看佣金账本                                            │
│     ├── 结算佣金                                                │
│     │   └── PENDING → SETTLED                                  │
│     └── 免除佣金                                                │
│         └── PENDING → WAIVED + 减少欠款                         │
│                                                                 │
│  4. 摄影师管理                                                  │
│     ├── 暂停账户                                                │
│     │   └── ACTIVE → SUSPENDED（阻止接收新预约）                  │
│     ├── 恢复账户                                                │
│     │   └── SUSPENDED → ACTIVE                                 │
│     └── 清除欠款                                                │
│         └── commission_owed = 0 + ACTIVE                       │
│                                                                 │
│  5. 学生管理                                                    │
│     ├── 查看学生列表                                            │
│     ├── 搜索学生                                                │
│     └── 查看订单统计                                            │
│                                                                 │
│  6. 数据概览                                                    │
│     ├── 订单统计（各状态数量）                                    │
│     ├── 佣金统计                                                │
│     ├── 用户统计                                                │
│     └── 最近订单/待审核摄影师                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. 支付流程

### 9.1 支付方式

本平台采用**微信线下转账**方式，而非在线支付：

1. 摄影师上传微信收款二维码
2. 学生扫码向摄影师转账
3. 学生上传付款截图作为凭证
4. 摄影师审核确认

### 9.2 支付参考码

每个订单生成唯一支付参考码（格式：`D-XXXX`），学生转账时必须备注，以便摄影师核对。

### 9.3 佣金计算

```
订单金额 = 档期价格 (price_pence)
佣金比例 = 15% (commission_rate_pct)
平台佣金 = 订单金额 × 佣金比例
摄影师收入 = 订单金额 - 平台佣金
```

### 9.4 佣金阈值机制

当摄影师佣金欠款超过 £30.00 (3000 pence) 时：
1. 自动暂停摄影师账户
2. 发送暂停通知邮件
3. 阻止接收新预约

### 9.5 支付状态机

```
                    ┌─────────────┐
                    │   创建订单   │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ PENDING_    │
                    │ PAYMENT     │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
       ┌──────────┐ ┌──────────┐ ┌──────────┐
       │ 上传凭证  │ │  取消    │ │  超时    │
       └────┬─────┘ └────┬─────┘ └────┬─────┘
            │            │            │
            ▼            ▼            ▼
     ┌──────────┐ ┌──────────┐ ┌──────────┐
     │ PROOF_   │ │CANCELLED │ │VERIFICA- │
     │ SUBMITTED│ └──────────┘ │TION_     │
     └────┬─────┘              │OVERDUE   │
          │                    └──────────┘
    ┌─────┴─────┐
    │           │
    ▼           ▼
┌────────┐ ┌────────┐
│  确认   │ │  拒绝  │
└───┬────┘ └───┬────┘
    │          │
    ▼          ▼
┌────────┐ ┌────────┐
│CONFIRMED│ │CANCELLED│
└───┬────┘ └────────┘
    │
    ▼
┌────────┐
│  完成   │
└───┬────┘
    │
    ▼
┌────────┐
│COMPLETED│
└────────┘
```

---

## 10. 认证与安全

### 10.1 认证流程

使用 Supabase Auth 进行用户认证：

1. **注册流程**
   - 第一步：选择角色 + 姓名 + 邮箱 + 密码
   - 第二步：微信 ID + 手机号（选填）+ 确认密码
   - 验证邮箱后完成注册

2. **登录流程**
   - 邮箱 + 密码登录
   - 支持忘记密码/重置密码

3. **会话管理**
   - 使用 JWT Token
   - 通过 Cookie 存储
   - 自动刷新 Token

### 10.2 安全措施

1. **行级安全 (RLS)**
   - 所有表启用 RLS
   - 用户只能访问自己的数据
   - 摄影师只能管理自己的档期和订单

2. **认证检查**
   - Server Actions 验证用户身份
   - 检查用户角色和权限
   - 管理员操作需要额外验证

3. **数据验证**
   - 前端表单验证
   - 后端数据验证
   - SQL 约束（NOT NULL, UNIQUE, FOREIGN KEY）

4. **文件上传安全**
   - 限制文件类型（仅图片）
   - 限制文件大小
   - 使用用户 ID 作为文件夹隔离

### 10.3 环境变量

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# 汇率
NEXT_PUBLIC_EXCHANGE_RATE=9.30

# Resend (邮件)
RESEND_API_KEY=

# 应用
NEXT_PUBLIC_APP_URL=
```

---

## 11. 部署与环境配置

### 11.1 开发环境

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建
pnpm build

# 启动生产服务器
pnpm start
```

### 11.2 Supabase 配置

1. 创建 Supabase 项目
2. 运行数据库迁移
3. 配置存储桶
4. 设置环境变量

### 11.3 数据库迁移

```bash
# 初始化 Supabase
supabase init

# 创建迁移
supabase migration new <migration_name>

# 应用迁移
supabase db push

# 本地开发
supabase start
supabase db push --local
```

### 11.4 生产环境检查清单

- [ ] 环境变量配置正确
- [ ] 数据库迁移已应用
- [ ] 存储桶已创建并配置权限
- [ ] RLS 策略已启用
- [ ] 邮件服务已配置
- [ ] 域名和 SSL 证书已配置

---

## 12. 国际化与文案管理

### 12.1 文案字典

项目使用集中式文案管理，所有前端文本通过 `src/lib/constants/copy.ts` 引用：

```typescript
export const COPY = {
  BRAND: {
    NAME: "SnapGown",
    TAGLINE: "预约你的毕业照拍摄",
  },
  COMMON: {
    LOGIN: "登录",
    DASHBOARD: "控制台",
  },
  HOME: {
    HERO_TITLE: "预约你的毕业照拍摄",
  },
  // ... 更多文案
};
```

### 12.2 使用规范

1. **严禁硬编码**：所有中文文本必须通过 `COPY` 字典引用
2. **按模块分组**：文案按功能模块组织
3. **动态文案**：使用函数生成动态内容
4. **类型安全**：TypeScript 类型检查

### 12.3 示例

```typescript
// ❌ 错误
<Button>登录</Button>

// ✅ 正确
<Button>{COPY.COMMON.LOGIN}</Button>

// ✅ 动态文案
<p>{COPY.HOME.WELCOME_BACK(profile.full_name)}</p>
```

---

## 附录

### A. 工具函数

```typescript
// penceToPounds - 便士转英镑
penceToPounds(15000) // "150.00"

// penceToRMB - 便士转人民币
penceToRMB(15000) // "1395.00" (基于汇率 9.30)

// generateOrderNo - 生成订单号
generateOrderNo() // "ORD-20260524-A1B2C3"

// generatePaymentRef - 生成支付参考码
generatePaymentRef() // "D-8A39"

// cn - 合并 Tailwind 类名
cn("class1", "class2") // "class1 class2"
```

### B. 数据库类型

项目使用 Supabase 自动生成的 TypeScript 类型（`src/lib/database.types.ts`），确保类型安全。

### C. 相关资源

- [Next.js 文档](https://nextjs.org/docs)
- [Supabase 文档](https://supabase.com/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [shadcn/ui 文档](https://ui.shadcn.com)

---

**文档版本**: 1.0  
**最后更新**: 2026-05-25  
**维护者**: Alvin
