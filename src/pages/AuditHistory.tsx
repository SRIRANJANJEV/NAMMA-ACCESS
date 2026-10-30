import React from 'react';
import { nammaStorage } from '@/services/nammaStorage';

interface AuditHistoryProps {
  onNavigate: (page: string) => void;
}

export function AuditHistory({ onNavigate }: AuditHistoryProps) {
  const logs = nammaStorage.getAuditLogs();

  const exportCSV = () => {
    const csvRows = [
      ['Timestamp', 'Category', 'Action', 'Details', 'Actor', 'Outcome'],
      ...logs.map(log => [
        new Date(log.timestamp).toLocaleString(),
        log.category,
        log.action,
        log.details,
        log.actor,
        log.outcome
      ])
    ];
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `NammaAccess_History_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    nammaStorage.addAudit('security', 'History Export', 'User exported history logs to CSV');
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 animate-fade-in">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
            <button onClick={() => onNavigate('home')} className="text-teal-600 text-sm font-semibold hover:underline mb-4 block">
                &larr; Back to Home
            </button>
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-extrabold text-stone-900">Personal Activity History</h1>
                <button onClick={exportCSV} className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-xl text-sm">Download CSV Export</button>
            </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-stone-50 border-b border-stone-200">
                    <tr>
                        <th className="p-4 font-bold text-stone-700">Timestamp</th>
                        <th className="p-4 font-bold text-stone-700">Category</th>
                        <th className="p-4 font-bold text-stone-700">Action</th>
                        <th className="p-4 font-bold text-stone-700">Outcome</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                    {logs.map(log => (
                        <tr key={log.id} className="hover:bg-stone-50">
                            <td className="p-4 text-stone-600">{new Date(log.timestamp).toLocaleString()}</td>
                            <td className="p-4 font-medium uppercase text-teal-800">{log.category}</td>
                            <td className="p-4 text-stone-900">{log.action}<br/><span className="text-xs text-stone-400">{log.details}</span></td>
                            <td className="p-4">
                                <span className={`px-2 py-0.5 rounded font-bold text-xs ${log.outcome === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {log.outcome.toUpperCase()}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
}
