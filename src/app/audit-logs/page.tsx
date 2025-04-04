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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Audit Log History</h1>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200 h-[500px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Resource</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Old Details
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                New Details
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <span className="font-medium">{log.user_name}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-medium
                    ${
                      log.action === 'DELETE' ? 'bg-red-100 text-red-800' : 
                      log.action === 'EDIT' ? 'bg-yellow-100 text-yellow-800' : 
                      log.action === 'CREATE' ? 'bg-emerald-100 text-emerald-800' : 'text-gray-100'}
                    `
                  }>
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                    {log.resource_type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-50">
                    {renderDetails(log.old_details, log.details)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-50">
                    {renderDetails(log.details, log.old_details)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
