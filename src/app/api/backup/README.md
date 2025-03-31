# ระบบสำรองข้อมูล EMR

ระบบสำรองข้อมูลอัตโนมัติสำหรับระบบ EMR ที่รองรับการสำรองข้อมูลรายวัน, การสำรองข้อมูลแบบ real-time และการจัดเก็บบน cloud storage

## คุณสมบัติ

- สำรองข้อมูลอัตโนมัติรายวัน
- สำรองข้อมูลแบบ real-time สำหรับข้อมูลใหม่
- จัดเก็บข้อมูลบน AWS S3 พร้อมการเข้ารหัส
- ระบบแจ้งเตือนผ่านอีเมลเมื่อการสำรองข้อมูลล้มเหลว
- ระบบจัดการการเก็บรักษาข้อมูลอัตโนมัติ
- ระบบกู้คืนข้อมูลที่ใช้งานง่าย

## การติดตั้ง

1. ติดตั้ง dependencies ที่จำเป็น:
```bash
npm install @aws-sdk/client-s3 node-cron nodemailer
```

2. ตั้งค่าตัวแปรสภาพแวดล้อมใน .env:
```env
# AWS Configuration
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=your_bucket_name

# SMTP Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email
SMTP_PASS=your_password
SMTP_FROM=noreply@example.com
ADMIN_EMAIL=admin@example.com
```

## การใช้งาน

### การเริ่มต้นระบบสำรองข้อมูลอัตโนมัติ

เพิ่มโค้ดต่อไปนี้ใน `src/app/layout.tsx` หรือไฟล์ที่เหมาะสม:

```typescript
import { initializeBackupScheduler } from './api/backup/scheduler';

// เริ่มต้นระบบสำรองข้อมูลอัตโนมัติ
initializeBackupScheduler();
```

### API Endpoints

#### สำรองข้อมูลด้วยตนเอง
```http
POST /api/backup
```

#### ดูรายการไฟล์สำรองข้อมูล
```http
GET /api/backup
```

### การปรับแต่งการตั้งค่า

สามารถปรับแต่งการตั้งค่าได้ในไฟล์ `config.ts`:
- ระยะเวลาการเก็บรักษาข้อมูล
- เวลาที่ทำการสำรองข้อมูลรายวัน
- ความถี่ในการสำรองข้อมูลแบบ real-time
- การตั้งค่าการแจ้งเตือน

## การกู้คืนข้อมูล

ใช้ฟังก์ชัน `restoreFromBackup` ใน `retention.ts` เพื่อกู้คืนข้อมูลจากไฟล์สำรอง:

```typescript
import { restoreFromBackup } from './api/backup/retention';

// กู้คืนข้อมูลจากไฟล์สำรอง
await restoreFromBackup('backup_2024-01-01T00:00:00.000Z.json');
```

## ความปลอดภัย

- ข้อมูลทั้งหมดถูกเข้ารหัสด้วย AES-256 ก่อนจัดเก็บบน S3
- รองรับมาตรฐาน HIPAA สำหรับการจัดการข้อมูลทางการแพทย์
- การเข้าถึง API ถูกป้องกันด้วยระบบยืนยันตัวตน

## การแก้ไขปัญหา

1. ตรวจสอบ logs สำหรับข้อผิดพลาด
2. ตรวจสอบการตั้งค่า AWS และ SMTP
3. ตรวจสอบการเชื่อมต่อกับฐานข้อมูล
4. ตรวจสอบสิทธิ์การเข้าถึง S3 bucket