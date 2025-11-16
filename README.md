# LINE LIFF App with Next.js

แอปพลิเคชัน LINE LIFF (LINE Front-end Framework) ที่สร้างด้วย Next.js

> **หมายเหตุเกี่ยวกับ Next.js Version:**
>
> - โปรเจกต์นี้ใช้ **Next.js 15** ซึ่งเป็นเวอร์ชันล่าสุด
> - Next.js 15 รองรับ LINE LIFF SDK ได้ดี (ไม่มีปัญหาเรื่อง compatibility)
> - หากต้องการใช้ **Next.js 14** (เวอร์ชันที่เสถียรกว่า) สามารถเปลี่ยนได้โดยแก้ไข `package.json`:
>   ```json
>   "next": "^14.2.0",
>   "eslint-config-next": "^14.2.0"
>   ```
> - **แนะนำ**: Next.js 15 ใช้งานได้ดีและมีฟีเจอร์ใหม่ ๆ แต่ Next.js 14 มีความเสถียรมากกว่า

## คุณสมบัติ

- ✅ เชื่อมต่อกับ LINE LIFF SDK
- ✅ เข้าสู่ระบบด้วย LINE Login
- ✅ แสดงข้อมูลโปรไฟล์ผู้ใช้
- ✅ ส่งข้อความผ่าน LINE (ในแอป LINE เท่านั้น)
- ✅ ตรวจสอบสถานะการเข้าสู่ระบบและการเปิดในแอป LINE
- ✅ รองรับ Built-in Features ของ LINE MINI App

## Built-in Features ของ LINE MINI App

โปรเจกต์นี้รองรับและใช้งาน Built-in Features ของ LINE MINI App โดยอัตโนมัติ:

### 1. Action Button (ปุ่มเมนู)

- **ทำงานอัตโนมัติ**: ปุ่มเมนู (⋮) จะปรากฏใน header ของ LINE MINI App โดยอัตโนมัติ
- **ไม่ต้องเขียนโค้ด**: ไม่ต้องเพิ่มโค้ดใดๆ ปุ่มจะทำงานเอง
- **การใช้งาน**: ผู้ใช้สามารถแตะปุ่มเพื่อเข้าถึงเมนู Options และ Recently used services

### 2. Multi-tab View (มุมมองหลายแท็บ)

- **LINE 15.12.0+**: แสดง Multi-tab view พร้อม Options และ Recently used services
- **LINE ต่ำกว่า 15.12.0**: แสดงเมนู Options แทน

#### Options (ตัวเลือกในเมนู)

- **Refresh**: รีเฟรชหน้าเว็บปัจจุบัน
- **Share**: แชร์ URL ของหน้าเว็บปัจจุบันหรือ LIFF URL ของ LINE MINI App
  - ใช้ metadata จาก `layout.tsx` สำหรับ title และ description
  - รูปภาพใช้ Channel icon จาก LINE Developers Console
- **Add to Home**: เพิ่ม shortcut ไปยังหน้าจอหลัก (สำหรับ verified MINI Apps, LINE 14.3.0+)
- **Favorites**: เพิ่ม LINE MINI App ไปยัง Favorites (สำหรับ verified MINI Apps, ญี่ปุ่น, LINE 15.18.0+)
- **Minimize browser**: ย่อ LIFF browser (สำหรับ verified MINI Apps)
- **Permission settings**: จัดการสิทธิ์กล้องและไมโครโฟน (LINE 14.6.0+)
- **About the service**: แสดง Provider page (สำหรับ verified MINI Apps)

#### Recently used services (บริการที่ใช้ล่าสุด)

- แสดง LINE MINI Apps และ LIFF apps ที่ใช้ล่าสุด (สูงสุด 50 รายการ)
- ผู้ใช้สามารถเปิดใช้งาน LINE MINI App ที่เคยใช้ได้จากที่นี่

### 3. Channel Consent Screen (หน้าจอขอความยินยอม)

- **ทำงานอัตโนมัติ**: ปรากฏเมื่อผู้ใช้เปิด LINE MINI App เป็นครั้งแรก
- **ไม่ต้องเขียนโค้ด**: หน้าจอจะแสดงโดยอัตโนมัติ
- **สิทธิ์ที่ขอ**:
  - สิทธิ์ในการเข้าถึงข้อมูลโปรไฟล์ LINE ของผู้ใช้
  - สิทธิ์ในการส่งข้อความไปยังแชท

### การใช้งาน Built-in Features ในโค้ด

#### ตรวจสอบความพร้อมของ Features

```tsx
import { useMiniAppFeatures } from "@/hooks/useMiniAppFeatures";

function MyComponent() {
  const { features, loading, isFeatureAvailable } = useMiniAppFeatures();

  if (loading) return <div>Loading...</div>;

  // ตรวจสอบว่าเปิดใน LINE MINI App หรือไม่
  if (features?.isInMiniApp) {
    // Features ต่างๆ พร้อมใช้งาน
  }

  // ตรวจสอบ feature เฉพาะ
  if (isFeatureAvailable("supportsMultiTabView")) {
    // Multi-tab view พร้อมใช้งาน
  }
}
```

#### ใช้ Utility Functions

```tsx
import {
  isInMiniApp,
  getMiniAppFeaturesInfo,
  shareCurrentPage,
  addToHomeScreen,
} from "@/lib/miniAppFeatures";

// ตรวจสอบว่าเปิดใน LINE MINI App
const inMiniApp = isInMiniApp();

// ดูข้อมูล features ทั้งหมด
const featuresInfo = getMiniAppFeaturesInfo();
```

### หมายเหตุสำคัญ

1. **Built-in Features ทำงานอัตโนมัติ**: ไม่ต้องเขียนโค้ดเพิ่มเติมสำหรับ Action button, Multi-tab view, และ Channel consent screen
2. **Verified MINI App**: ฟีเจอร์บางอย่าง (Add to Home, Favorites, Minimize browser, About the service) ต้องเป็น verified MINI App
3. **Share Feature**:
   - ใช้ metadata จาก `app/layout.tsx` สำหรับ title และ description
   - ตั้งค่า Channel icon ใน LINE Developers Console เพื่อใช้เป็นรูปภาพในการแชร์
   - ตั้งค่า LIFF app name ใน LINE Developers Console → Web app settings
4. **URL Structure**: สำหรับ Add to Home feature หน้าเว็บต้องเริ่มต้นด้วย endpoint URL ของ LINE MINI App

### เอกสารเพิ่มเติม

- [LINE MINI App Built-in Features](https://developers.line.biz/en/docs/line-mini-app/discover/builtin-features/)
- [LINE MINI App Introduction](https://developers.line.biz/en/docs/line-mini-app/discover/introduction/)

## การติดตั้ง

### 0. Git Repository (พร้อมใช้งานแล้ว)

โปรเจกต์นี้มี Git repository initialize แล้ว พร้อมกับ:

- ✅ `.gitignore` - ไฟล์ที่ Git จะ ignore
- ✅ `.gitattributes` - ตั้งค่าการจัดการ line endings

**คำสั่ง Git พื้นฐาน:**

```bash
# ตรวจสอบสถานะ
git status

# เพิ่มไฟล์ทั้งหมด
git add .

# Commit การเปลี่ยนแปลง
git commit -m "Your commit message"

# เชื่อมต่อกับ remote repository
git remote add origin <your-repo-url>

# Push ขึ้น remote
git push -u origin main
```

### 1. ติดตั้ง Dependencies

```bash
yarn install
# หรือ
npm install
```

### 2. สร้าง LIFF App ใน LINE Developers Console

1. ไปที่ [LINE Developers Console](https://developers.line.biz/)
2. สร้าง Provider ใหม่ (ถ้ายังไม่มี)
3. สร้าง Channel ใหม่ (เลือก Messaging API)
4. ไปที่แท็บ "LIFF" และคลิก "Add"
5. ตั้งค่า LIFF App:

   - **LIFF app name**: ชื่อแอปของคุณ
   - **Size**: Full (หรือ Compact/ Tall ตามต้องการ)
   - **Endpoint URL**: `https://your-domain.com` (สำหรับ development ใช้ ngrok หรือ tunnel)
   - **Scope**: `profile`, `openid`
   - **Bot feature**: เปิดใช้งาน (ถ้าต้องการส่งข้อความ)

6. คัดลอก **LIFF ID** ที่ได้

### 3. ตั้งค่า Environment Variables

สร้างไฟล์ `.env.local`:

```bash
cp .env.local.example .env.local
```

แก้ไขไฟล์ `.env.local` และเพิ่ม LIFF ID:

```env
NEXT_PUBLIC_LIFF_ID=your-liff-id-here
```

### 4. รัน Development Server

```bash
yarn dev
# หรือ
npm run dev
```

เปิดเบราว์เซอร์ไปที่ [http://localhost:3000](http://localhost:3000)

### 5. ทดสอบใน LINE App

เนื่องจาก LIFF ทำงานได้เฉพาะใน LINE app คุณต้อง:

1. ใช้ ngrok หรือ tunnel เพื่อเปิด localhost ให้ LINE เข้าถึงได้:

```bash
# ใช้ ngrok
ngrok http 3000
```

2. อัปเดต Endpoint URL ใน LINE Developers Console เป็น URL จาก ngrok
3. เปิด LIFF URL ใน LINE app (ผ่านเมนู Rich Menu หรือ Flex Message)

## โครงสร้างโปรเจกต์

```
.
├── app/
│   ├── layout.tsx          # Root layout with LIFF SDK script
│   ├── page.tsx            # หน้าแรกพร้อมตัวอย่างการใช้งาน
│   ├── globals.css         # Global styles
│   └── page.module.css     # Component styles
├── hooks/
│   └── useLiff.ts          # Custom hook สำหรับใช้งาน LIFF
├── lib/
│   └── liff.ts             # LIFF utility functions
├── package.json
├── tsconfig.json
└── next.config.js
```

## การใช้งาน

### ใช้ Hook useLiff

```tsx
import { useLiff } from "@/hooks/useLiff";

function MyComponent() {
  const { liff, loading, error, isLoggedIn, isInClient } = useLiff();

  // ...
}
```

### ใช้ LIFF Functions

```tsx
import { getProfile, login, logout, sendMessages } from "@/lib/liff";

// ดึงข้อมูลโปรไฟล์
const profile = await getProfile();

// เข้าสู่ระบบ
login();

// ออกจากระบบ
logout();

// ส่งข้อความ
await sendMessages([{ type: "text", text: "Hello!" }]);
```

## Build สำหรับ Production

```bash
yarn build
yarn start
# หรือ
npm run build
npm start
```

## Deploy บน Vercel

### วิธีที่ 1: Deploy ผ่าน Vercel Dashboard (แนะนำ)

1. **Push โค้ดขึ้น GitHub/GitLab/Bitbucket**

   ```bash
   # Git repository ถูก initialize แล้ว
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **เชื่อมต่อกับ Vercel**

   - ไปที่ [vercel.com](https://vercel.com)
   - คลิก "Add New..." → "Project"
   - Import repository จาก GitHub/GitLab/Bitbucket
   - Vercel จะตรวจจับ Next.js อัตโนมัติ

3. **ตั้งค่า Environment Variables**

   - ในหน้า Project Settings → Environment Variables
   - เพิ่ม `NEXT_PUBLIC_LIFF_ID` และใส่ค่า LIFF ID ของคุณ
   - เลือกทั้ง Production, Preview, และ Development

4. **Deploy**

   - คลิก "Deploy"
   - รอให้ build เสร็จ (ประมาณ 1-2 นาที)

5. **อัปเดต LIFF Endpoint URL**
   - คัดลอก URL ที่ Vercel ให้มา (เช่น `https://your-app.vercel.app`)
   - ไปที่ LINE Developers Console → LIFF → แก้ไข Endpoint URL

### วิธีที่ 2: Deploy ผ่าน Vercel CLI

1. **ติดตั้ง Vercel CLI**

   ```bash
   npm i -g vercel
   ```

2. **Login**

   ```bash
   vercel login
   ```

3. **Deploy**

   ```bash
   vercel
   ```

   - จะถามว่าต้องการเชื่อมต่อกับ project ใหม่หรือไม่ → กด Enter
   - ตั้งค่า Environment Variables เมื่อถาม

4. **Deploy Production**
   ```bash
   vercel --prod
   ```

### การตั้งค่า Domain Custom (ถ้าต้องการ)

1. ไปที่ Project Settings → Domains
2. เพิ่ม domain ที่ต้องการ
3. ทำตามคำแนะนำในการตั้งค่า DNS

### Environment Variables ที่ต้องตั้งค่าใน Vercel

- `NEXT_PUBLIC_LIFF_ID` - LIFF ID จาก LINE Developers Console

## หมายเหตุ

- LIFF ทำงานได้เฉพาะใน LINE app เท่านั้น (ไม่สามารถทดสอบในเบราว์เซอร์ปกติได้)
- สำหรับ development ใช้ ngrok หรือ tunnel เพื่อเปิด localhost ให้ LINE เข้าถึงได้
- ตรวจสอบให้แน่ใจว่า Endpoint URL ใน LINE Developers Console ตรงกับ URL ที่ deploy

## เอกสารเพิ่มเติม

- [LINE LIFF Documentation](https://developers.line.biz/en/docs/liff/)
- [Next.js Documentation](https://nextjs.org/docs)
- [LINE Developers Console](https://developers.line.biz/)

## License

MIT
