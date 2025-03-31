'use client'
import { useState, useEffect } from 'react';
import axios from 'axios';

interface AuditLog {
  id: number;
  user_id: number;
  action: string;
  resource_type: string;
  resource_id: number;
  details: string;
  created_at: string;
  user_name: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get('/api/audit');
        setLogs(response.data);
      } catch (error) {
        console.error('Error fetching audit logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">ประวัติการเข้าถึงข้อมูล</h1>
      
      {loading ? (
        <div>กำลังโหลด...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2">เวลา</th>
                <th className="px-4 py-2">ผู้ใช้</th>
                <th className="px-4 py-2">การกระทำ</th>
                <th className="px-4 py-2">ประเภทข้อมูล</th>
                <th className="px-4 py-2">รายละเอียด</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-gray-300">
                  <td className="px-4 py-2">{new Date(log.created_at).toLocaleString('th-TH')}</td>
                  <td className="px-4 py-2">{log.user_name}</td>
                  <td className="px-4 py-2">{log.action}</td>
                  <td className="px-4 py-2">{log.resource_type}</td>
                  <td className="px-4 py-2">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}