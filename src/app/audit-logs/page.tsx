'use client'
import { useState, useEffect } from 'react';
import axios from 'axios';
// import { formatChanges } from '@/utils/formatters';

interface AuditLog {
  id: number;
  user_id: number;
  action: string;
  resource_type: string;
  resource_id: number;
  details: string;
  old_details: string;  // เพิ่ม old_details
  timestamp: string;    // เพิ่ม timestamp แทน created_at
  user_name: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get('/api/audit/');
        setLogs(response.data);
      } catch (error) {
        console.error('Error fetching audit logs:', error);
        // setError('Unable to load data. Please try again.');
      } finally {
        // setLoading(false);
      }
    };
  
    fetchLogs();
  }, []);

  interface AuditDetails {
    changes?: {
      id?: string;
      first_name?: string;
      last_name?: string;
      birth_date?: string;
      age?: number;
      address?: string;
      phone_number?: string;
      purpose?: string;
      medication?: string;
      created_at?: string;
      gender?: string;
      balance?: number;
      diagnosis?: string;
    };
  }
  
  const renderDetails = (details: string | undefined) => {
    if (!details) return null;
    try {
      const data: AuditDetails = typeof details === 'string' ? JSON.parse(details) : details;
      const changes = data?.changes || {};
  
      const formatValue = (value: string | number | object | null | undefined) => {
        if (value === null || value === undefined) return '-';
        return typeof value === 'object' ? JSON.stringify(value) : String(value);
      };
  
      return (
        <div className="text-sm">
          {Object.entries(changes).map(([key, value]) => (
            <div key={key} className="grid grid-cols-2 gap-1 py-1 border-b border-gray-100">
              <span className="font-medium text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
              <span className="text-gray-800 break-words">
                {formatValue(value)}
              </span>
            </div>
          ))}
        </div>
      );
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  // ในส่วน return ของ component
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Audit Log History</h1>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Old Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Details</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.timestamp}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.user_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.action}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.resource_type}</td>
                <td className="px-6 py-4">{renderDetails(log.old_details)}</td>
                <td className="px-6 py-4">{renderDetails(log.details)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
