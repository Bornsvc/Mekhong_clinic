'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface AuditLog {
  id: number;
  user_id: number;
  action: string;
  resource_type: string;
  resource_id: number;
  details: string;
  old_details: string;
  timestamp: string;
  user_name: string;
}
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

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get('/api/audit/');
        setLogs(response.data);
      } catch (error) {
        console.error('Error fetching audit logs:', error);
      }
    };

    fetchLogs();
  }, []);

  

  const renderDetails = (details: string | undefined, otherDetails?: string) => {
    if (!details) return null;
    try {
      const data: AuditDetails = typeof details === 'string' ? JSON.parse(details) : details;
      const changes = data?.changes ?? {};

      let otherChanges: AuditDetails['changes'] = {};
      if (otherDetails) {
        const otherData: AuditDetails = typeof otherDetails === 'string' ? JSON.parse(otherDetails) : otherDetails;
        otherChanges = otherData?.changes ?? {};
      }

      const formatValue = (value: string | number | object | null | undefined) => {
        if (value === null || value === undefined) return '-';
        return typeof value === 'object' ? JSON.stringify(value) : String(value);
      };

      return (
        <div className="text-sm">
          {Object.entries(changes).map(([key, value]) => {
            const otherValue = (otherChanges as Record<string, string | number | null | undefined>)[key] ?? undefined;
            const isChanged = otherDetails && formatValue(value) !== formatValue(otherValue);
            return (
              <div key={key} className="grid grid-cols-2 gap-1 py-1 border-b border-gray-100">
                <span className="font-medium text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                <span className={`text-gray-800 break-words ${isChanged ? 'bg-yellow-100 font-semibold' : ''}`}>
                  {formatValue(value)}
                </span>
              </div>
            );
          })}
        </div>
      );
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Audit Log History</h1>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Old Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                New Details
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.timestamp}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.user_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 py-1 rounded 
                    ${
                      log.action === 'DELETE' ? 'bg-red-100 text-red-800' : 
                      log.action === 'EDIT' ? 'bg-yellow-100 text-yellow-800' : 'text-gray-500'}
                    `
                  }>
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.resource_type}</td>
                <td className="px-6 py-4">{renderDetails(log.old_details, log.details)}</td>
                <td className="px-6 py-4">{renderDetails(log.details, log.old_details)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
