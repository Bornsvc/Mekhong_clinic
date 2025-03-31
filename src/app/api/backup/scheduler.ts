import cron from 'node-cron';
import { performBackup } from './route';
import { cleanupOldBackups } from './retention';
import { BACKUP_SCHEDULE } from './config'

// ฟังก์ชันสำหรับเริ่มต้นการทำงานของ scheduler
export function initializeBackupScheduler() {
  // ตั้งค่า cron job สำหรับการสำรองข้อมูลรายวัน
  const [hour, minute] = BACKUP_SCHEDULE.dailyBackupTime.split(':');
  cron.schedule(`${minute} ${hour} * * *`, async () => {
    try {
      console.log('Starting daily backup...');
      await performBackup();
      console.log('Daily backup completed successfully');
    } catch (error) {
      console.error('Error during daily backup:', error);
    }
  });

  // ตั้งค่า cron job สำหรับการทำความสะอาดไฟล์สำรองข้อมูลเก่า (ทำทุกวันเวลา 01:00)
  cron.schedule('0 1 * * *', async () => {
    try {
      console.log('Starting backup cleanup...');
      const backups = await listBackups();
      const result = await cleanupOldBackups(backups);
      console.log('Backup cleanup completed:', result);
    } catch (error) {
      console.error('Error during backup cleanup:', error);
    }
  });

  // ตั้งค่าการสำรองข้อมูลแบบ real-time
  setInterval(async () => {
    try {
      console.log('Starting real-time backup...');
      await performBackup();
      console.log('Real-time backup completed successfully');
    } catch (error) {
      console.error('Error during real-time backup:', error);
    }
  }, BACKUP_SCHEDULE.realtimeInterval * 1000);
}

// ฟังก์ชันสำหรับดึงรายการไฟล์สำรองข้อมูล
async function listBackups() {
  try {
    const response = await fetch('/api/backup');
    if (!response.ok) {
      throw new Error('Failed to fetch backups');
    }
    return await response.json();
  } catch (error) {
    console.error('Error listing backups:', error);
    return [];
  }
}