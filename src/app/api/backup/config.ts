// ค่าคงที่สำหรับการตั้งค่าระบบสำรองข้อมูล

// ตารางที่ต้องการสำรองข้อมูล
export const BACKUP_TABLES = ['users', 'patients', 'audit_logs'];

// การตั้งค่าการเก็บรักษาข้อมูล
export const RETENTION_POLICY = {
  // จำนวนวันที่จะเก็บข้อมูลสำรอง
  days: 30,
  // จำนวนไฟล์สำรองข้อมูลสูงสุดที่จะเก็บไว้
  maxBackups: 100
};

// การตั้งค่าการสำรองข้อมูลอัตโนมัติ
export const BACKUP_SCHEDULE = {
  // เวลาที่จะทำการสำรองข้อมูลในแต่ละวัน (เวลา UTC)
  dailyBackupTime: '00:00',
  // ช่วงเวลาระหว่างการสำรองข้อมูลแบบ real-time (วินาที)
  realtimeInterval: 300 // 5 นาที
};

// การตั้งค่าการเข้ารหัส
export const ENCRYPTION_CONFIG = {
  algorithm: 'AES256',
  // ขนาดไฟล์สูงสุดที่จะเข้ารหัส (bytes)
  maxFileSize: 1024 * 1024 * 100 // 100MB
};

// การตั้งค่าการแจ้งเตือน
export const NOTIFICATION_CONFIG = {
  // ประเภทการแจ้งเตือนที่เปิดใช้งาน
  enabledChannels: ['email'],
  // ระดับความสำคัญของการแจ้งเตือน
  levels: {
    error: true,    // แจ้งเตือนเมื่อเกิดข้อผิดพลาด
    warning: true,  // แจ้งเตือนเมื่อมีปัญหาที่อาจส่งผลกระทบ
    success: true   // แจ้งเตือนเมื่อสำรองข้อมูลสำเร็จ
  }
};

// การตั้งค่าการกู้คืนข้อมูล
export const RESTORE_CONFIG = {
  // จำนวนการกู้คืนพร้อมกันสูงสุดที่อนุญาต
  maxConcurrentRestores: 1,
  // เวลาที่อนุญาตให้ใช้ในการกู้คืน (วินาที)
  timeout: 3600 // 1 ชั่วโมง
};