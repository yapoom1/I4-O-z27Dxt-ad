import React from 'react';
import { Card, CardContent, CardHeader } from '@/shared/ui/Primitives';

const auditEvents = [
  { id: '1', event: 'User Login', description: 'Alex Mercer (Owner) authenticated from IP 192.168.1.1.', time: '2 mins ago', severity: 'low' },
  { id: '2', event: 'Theme Customization', description: 'Store theme colors updated for Vy Agency Apparel.', time: '1 hour ago', severity: 'low' },
  { id: '3', event: 'Secret API Key Rotated', description: 'Production API Key was revoked and rotated.', time: '4 hours ago', severity: 'high' },
  { id: '4', event: 'Fulfillment Rules Updated', description: 'Condition Weight rule changed for Delhivery assignment.', time: '1 day ago', severity: 'medium' },
  { id: '5', event: 'Database Backup Complete', description: 'Automatic snapshot of 100k products successfully zipped.', time: '1 day ago', severity: 'low' },
];

export const AuditLogs: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground m-0">Audit & Security Logs</h1>
        <p className="text-xs text-muted-foreground">Trace administrative updates, config adjustments, and login histories.</p>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-foreground font-bold">Activity Logs</h3>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-left text-xs divide-y divide-border">
            <thead className="bg-muted/40 select-none">
              <tr className="text-muted-foreground font-bold">
                <th className="p-3">Event Type</th>
                <th className="p-3">Log Description</th>
                <th className="p-3">Time</th>
                <th className="p-3">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {auditEvents.map(evt => (
                <tr key={evt.id} className="hover:bg-muted/5 transition-colors">
                  <td className="p-3 font-semibold">{evt.event}</td>
                  <td className="p-3 text-muted-foreground">{evt.description}</td>
                  <td className="p-3">{evt.time}</td>
                  <td className="p-3">
                    <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${evt.severity === 'high' ? 'bg-red-500/10 text-red-600 border-red-500/20' : evt.severity === 'medium' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 'bg-secondary text-secondary-foreground border-border'}`}>
                      {evt.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};
