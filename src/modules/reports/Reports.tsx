import React from 'react';
import { Card, CardContent, CardHeader } from '@/shared/ui/Primitives';
import { Download, BarChart3, TrendingUp, Laptop, Printer, Settings } from 'lucide-react';

const mockReports = [
  { id: '1', title: 'Monthly Sales Report (IT Hardware & Accessories)', type: 'Sales', format: 'CSV', size: '1.2 MB', generated: '2026-06-01' },
  { id: '2', title: 'GST Returns summary FY26 (GSTR-1 & GSTR-3B)', type: 'Tax & Financial', format: 'PDF', size: '4.8 MB', generated: '2026-05-15' },
  { id: '3', title: 'Customer Purchase Trends (Laptops vs. Printers)', type: 'Audience', format: 'XLSX', size: '890 KB', generated: '2026-05-10' },
  { id: '4', title: 'Inventory Restock analysis & logistics log', type: 'Logistics', format: 'CSV', size: '2.4 MB', generated: '2026-05-01' },
];

const categoryBreakdown = [
  { category: 'Laptops & Desktops', share: '48%', color: 'bg-primary' },
  { category: 'Printers & Consumables', share: '24%', color: 'bg-emerald-500' },
  { category: 'Networking Equipment', share: '16%', color: 'bg-sky-500' },
  { category: 'Accessories & Peripherals', share: '12%', color: 'bg-violet-500' },
];

export const Reports: React.FC = () => {
  const handleDownload = (title: string, format: string) => {
    alert(`File download initiated: "${title}.${format.toLowerCase()}" (${format} format). Saved successfully.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground m-0">Reports & Export Hub</h1>
          <p className="text-xs text-muted-foreground">Download financial statements, GST invoices, and logistics summaries.</p>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        {/* Available Reports list - 2 Columns */}
        <div className="md:col-span-2 space-y-4">
          <Card className="bg-card">
            <CardHeader>
              <h3 className="text-sm font-semibold text-foreground font-bold">Standard Database Exports</h3>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border text-xs">
              {mockReports.map(rep => (
                <div key={rep.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-foreground block">{rep.title}</span>
                    <span className="text-[10px] text-muted-foreground">
                      Category: {rep.type} • Size: {rep.size} • Generated: {rep.generated}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDownload(rep.title, rep.format)}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded bg-secondary border border-border text-foreground hover:bg-secondary/70 text-xs font-semibold cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" /> Download {rep.format}
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Analytics Card details */}
        <div className="space-y-4">
          <Card className="bg-card">
            <CardHeader>
              <h3 className="text-sm font-semibold text-foreground">Hardware Sales Share</h3>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs">
              <div className="space-y-3">
                {categoryBreakdown.map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between font-medium">
                      <span>{item.category}</span>
                      <span className="font-bold">{item.share}</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: item.share }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-muted/20 border border-border rounded-md mt-4">
                <div className="flex items-center justify-between font-semibold">
                  <span>Gross Sales Growth</span>
                  <span className="text-emerald-500 flex items-center gap-0.5">
                    <TrendingUp className="h-3.5 w-3.5" /> +14.2%
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground block mt-1">Reflecting high volume of notebook purchases.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
