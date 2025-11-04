# Supabase Setup Guide

คู่มือการตั้งค่า Supabase สำหรับระบบจองวันลา

## ขั้นตอนการตั้งค่า

### 1. สร้างโปรเจกต์ Supabase

1. ไปที่ [https://supabase.com](https://supabase.com)
2. สร้างบัญชีและโปรเจกต์ใหม่
3. ตั้งชื่อโปรเจกต์และเลือก Region (แนะนำ: Southeast Asia - Singapore)

### 2. สร้าง Database Tables

1. ไปที่ **SQL Editor** ใน Supabase Dashboard
2. คัดลอกและรัน SQL จากไฟล์ `supabase-schema.sql`
3. ตรวจสอบว่ามี tables 2 ตาราง:
   - `bookings` - เก็บข้อมูลการจองวันลา
   - `booking_history` - เก็บประวัติการสร้าง แก้ไข และลบ

### 3. ตั้งค่า Environment Variables

1. สร้างไฟล์ `.env.local` ใน root directory ของโปรเจกต์
2. เพิ่ม environment variables ต่อไปนี้:

```env
# LINE LIFF Configuration
NEXT_PUBLIC_LIFF_ID=your_liff_id_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 4. ดึง Supabase Credentials

1. ไปที่ **Settings** > **API** ใน Supabase Dashboard
2. คัดลอก:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 5. ตั้งค่า Row Level Security (RLS)

RLS policies ถูกตั้งค่าไว้แล้วใน SQL schema เพื่อให้:

- ทุกคนสามารถอ่านข้อมูลได้ (public read access)
- ทุกคนสามารถสร้าง แก้ไข และลบข้อมูลได้ (สำหรับ demo)

> **หมายเหตุ**: สำหรับ production ควรปรับ RLS policies ให้เหมาะสมกับความต้องการด้านความปลอดภัย

### 6. ทดสอบการเชื่อมต่อ

1. รันโปรเจกต์: `npm run dev`
2. ตรวจสอบ console ว่ามีการเชื่อมต่อ Supabase สำเร็จ
3. ลองสร้างการจองวันลาและตรวจสอบว่าข้อมูลถูกบันทึกใน Supabase

## Database Schema

### Table: `users`

| Column            | Type      | Description                          |
| ----------------- | --------- | ------------------------------------ |
| line_user_id      | TEXT      | Primary key (LINE User ID)           |
| full_name         | TEXT      | ชื่อ-นามสกุล (บังคับ)                |
| phone             | TEXT      | เบอร์โทรศัพท์ (บังคับ)                |
| email             | TEXT      | อีเมล (ไม่บังคับ)                     |
| line_display_name | TEXT      | ชื่อที่แสดงใน LINE (ไม่บังคับ)        |
| line_picture_url  | TEXT      | URL รูปภาพโปรไฟล์ LINE (ไม่บังคับ)   |
| created_at        | TIMESTAMP | วันที่สร้าง                          |
| updated_at        | TIMESTAMP | วันที่อัปเดต (nullable)              |

### Table: `bookings`

| Column     | Type      | Description                          |
| ---------- | --------- | ------------------------------------ |
| id         | UUID      | Primary key                          |
| date       | DATE      | วันที่เริ่มต้น                       |
| end_date   | DATE      | วันที่สิ้นสุด (nullable)             |
| user_id    | TEXT      | LINE User ID                         |
| user_name  | TEXT      | ชื่อผู้ใช้                           |
| category   | TEXT      | ประเภทการลา (domestic/international) |
| reason     | TEXT      | เหตุผลการลา (nullable)               |
| created_at | TIMESTAMP | วันที่สร้าง                          |
| updated_at | TIMESTAMP | วันที่อัปเดต (nullable)              |

### Table: `booking_history`

| Column       | Type      | Description                           |
| ------------ | --------- | ------------------------------------- |
| id           | UUID      | Primary key                           |
| action       | TEXT      | ประเภทการกระทำ (create/update/delete) |
| booking_id   | TEXT      | ID การจอง                             |
| user_id      | TEXT      | LINE User ID                          |
| user_name    | TEXT      | ชื่อผู้ใช้                            |
| timestamp    | TIMESTAMP | เวลาที่ทำการกระทำ                     |
| old_data     | JSONB     | ข้อมูลเก่า (สำหรับ update/delete)     |
| new_data     | JSONB     | ข้อมูลใหม่ (สำหรับ update)            |
| booking_data | JSONB     | ข้อมูลการจอง (สำหรับ create)          |

## Migration จาก localStorage

หากมีข้อมูลเดิมใน localStorage ต้องการ migrate ไป Supabase:

1. เปิด Developer Tools ใน browser
2. เรียกใช้ script ต่อไปนี้ใน Console:

```javascript
// ดึงข้อมูลจาก localStorage
const bookings = JSON.parse(localStorage.getItem("line_liff_bookings") || "[]");
const history = JSON.parse(
  localStorage.getItem("line_liff_booking_history") || "[]"
);

// แสดงข้อมูล
console.log("Bookings:", bookings);
console.log("History:", history);
```

3. ใช้ Supabase Dashboard หรือ API เพื่อ import ข้อมูล

## Troubleshooting

### ปัญหา: "Missing Supabase environment variables"

**วิธีแก้**: ตรวจสอบว่าไฟล์ `.env.local` มีค่าที่ถูกต้องและ restart dev server

### ปัญหา: "Failed to get bookings"

**วิธีแก้**:

- ตรวจสอบว่า Supabase URL และ API key ถูกต้อง
- ตรวจสอบ RLS policies ใน Supabase Dashboard
- ตรวจสอบ Network tab ใน Browser DevTools

### ปัญหา: Tables ไม่ถูกสร้าง

**วิธีแก้**:

- ตรวจสอบว่ามีสิทธิ์ในการสร้าง tables
- ตรวจสอบ SQL syntax ในไฟล์ `supabase-schema.sql`
- ดู error logs ใน Supabase Dashboard

## Production Considerations

1. **Security**: ปรับ RLS policies ให้เหมาะสม (เช่น จำกัดการเข้าถึงตาม user_id)
2. **Backup**: ตั้งค่า automated backups ใน Supabase
3. **Monitoring**: ใช้ Supabase Dashboard เพื่อ monitor database performance
4. **Indexes**: Indexes ถูกสร้างไว้แล้วใน schema เพื่อเพิ่มประสิทธิภาพ

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
