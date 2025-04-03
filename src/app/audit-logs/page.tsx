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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get('/api/audit/');
        setLogs(response.data);
      } catch (error) {
        console.error('Error fetching audit logs:', error);
        setError('Unable to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchLogs();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Audit Log History</h1>
      
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          {error && <div className="text-red-500 mb-4">{error}</div>}
          <table className="min-w-full bg-white border border-gray-300 shadow-md rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-3 text-left text-sm font-semibold">Timestamp</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">User</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Action</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Resource Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-gray-300 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{new Date(log.created_at).toLocaleString('en-US')}</td>
                  <td className="px-6 py-4 text-sm max-w-xs overflow-hidden text-ellipsis">{log.user_name}</td>
                  <td className="px-6 py-4 text-sm max-w-xs overflow-hidden text-ellipsis">{log.action}</td>
                  <td className="px-6 py-4 text-sm max-w-xs overflow-hidden text-ellipsis">{log.resource_type}</td>

                  <td className="px-6 py-4 text-sm">
                    <pre className="whitespace-pre-wrap">{log.details ? JSON.stringify(log.details, null, 2) : '-'}</pre>
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
