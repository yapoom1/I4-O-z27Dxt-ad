import React, { useState } from 'react';
import { Card, CardContent, CardHeader, Input, Select } from '@/shared/ui/Primitives';
import { Mail, MessageSquare, Send, Plus, ArrowRight, Play, Compass, Activity } from 'lucide-react';

export const MarketingHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'email' | 'whatsapp' | 'nodes'>('email');
  
  // Node automation flow builder data
  const [flowNodes, setFlowNodes] = useState([
    { id: '1', type: 'trigger', label: 'Trigger: Checkout Abandoned', desc: 'Runs when user leaves cart unpaid.' },
    { id: '2', type: 'delay', label: 'Wait Interval: 30 Minutes', desc: 'Holds process to avoid spam complaints.' },
    { id: '3', type: 'action', label: 'Action: Send WhatsApp Discount', desc: 'Dispatches 15% coupon using templates.' },
  ]);

  const handleAddNode = () => {
    setFlowNodes(prev => [
      ...prev,
      { id: Math.random().toString(36).substr(2, 9), type: 'action', label: 'Action: Add Email Tag "Abandoned-Cart"', desc: 'Updates customer profile list tags.' }
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground m-0">Marketing Hub</h1>
          <p className="text-xs text-muted-foreground">Launch cross-channel campaigns, define customer segment lists, and construct flow builders.</p>
        </div>
        
        <div className="flex items-center gap-1 bg-secondary p-1 rounded-md border border-border">
          <button 
            onClick={() => setActiveTab('email')}
            className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer ${activeTab === 'email' ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Email Campaign
          </button>
          <button 
            onClick={() => setActiveTab('whatsapp')}
            className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer ${activeTab === 'whatsapp' ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            WhatsApp Template
          </button>
          <button 
            onClick={() => setActiveTab('nodes')}
            className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer ${activeTab === 'nodes' ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Automation Flow
          </button>
        </div>
      </div>

      {activeTab === 'email' && (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <h3 className="text-sm font-semibold text-foreground">Draft Email Campaign</h3>
              </CardHeader>
              <CardContent className="p-4 space-y-4 text-xs">
                <Input
                  label="Campaign Name"
                  placeholder="e.g. Black Friday Launch Phase 1"
                />
                
                <Input
                  label="Subject Line"
                  placeholder="Don't miss out! Premium discounts end tonight."
                />
                
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">HTML Email Content</label>
                  <textarea 
                    className="w-full h-36 p-3 rounded border border-input bg-card text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="<p>Dear customer, we are thrilled to announce...</p>"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <h3 className="text-sm font-semibold text-foreground">Target Segment</h3>
              </CardHeader>
              <CardContent className="p-4 space-y-4 text-xs">
                <Select
                  label="Select Segment List"
                  options={[
                    { label: 'All Users (104,200)', value: 'all' },
                    { label: 'VIP Shoppers (12,940)', value: 'vip' },
                    { label: 'Inactive 30+ Days (8,290)', value: 'inactive' }
                  ]}
                  onChange={() => {}}
                />

                <button 
                  onClick={() => alert('Newsletter broadcast campaign successfully queued to CRM server.')}
                  className="w-full h-9 bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-semibold rounded flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Send className="h-4 w-4" /> Send Broadcast
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'whatsapp' && (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <h3 className="text-sm font-semibold text-foreground">WhatsApp Broadcast Builder</h3>
              </CardHeader>
              <CardContent className="p-4 space-y-4 text-xs">
                <Input
                  label="Template Name Identifier"
                  placeholder="e.g. order_shipment_receipt"
                />
                
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Template Content Message</label>
                  <textarea
                    className="w-full h-24 p-3 rounded border border-input bg-card text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="Hello {{1}}, your order #{{2}} has been shipped! Track delivery at {{3}}."
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Use double braces matching database variable triggers.</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <h3 className="text-sm font-semibold text-foreground">API Sync status</h3>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Meta API Integration</span>
                  <span className="font-semibold text-emerald-500">Linked</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Monthly Message Quota</span>
                  <span className="font-semibold text-foreground">24,912 / 50,000</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'nodes' && (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Automation Flow Builder</h3>
              <p className="text-xs text-muted-foreground">Visually trace sequence nodes and database updates.</p>
            </div>
            <button
              onClick={handleAddNode}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded bg-secondary border border-border text-foreground hover:bg-secondary/70 text-xs font-semibold cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Append Step
            </button>
          </CardHeader>
          <CardContent className="p-6 overflow-x-auto">
            <div className="flex flex-col md:flex-row items-center gap-4 justify-center py-6 min-w-[700px]">
              {flowNodes.map((node, idx) => (
                <React.Fragment key={node.id}>
                  {idx > 0 && <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0 rotate-90 md:rotate-0" />}
                  
                  <div className={`p-4 border rounded-lg w-56 flex flex-col justify-between shrink-0 shadow-sm transition-all ${node.type === 'trigger' ? 'border-amber-500/30 bg-amber-500/5' : node.type === 'delay' ? 'border-sky-500/30 bg-sky-500/5' : 'border-amber-900/30 bg-amber-900/5'}`}>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] uppercase tracking-wider font-bold ${node.type === 'trigger' ? 'text-amber-500' : node.type === 'delay' ? 'text-sky-500' : 'text-amber-900'}`}>
                          {node.type} node
                        </span>
                        <button 
                          onClick={() => setFlowNodes(prev => prev.filter(x => x.id !== node.id))}
                          className="text-muted-foreground hover:text-destructive cursor-pointer text-xs"
                        >
                          ×
                        </button>
                      </div>
                      <div className="text-xs font-bold text-foreground mt-2 truncate">{node.label}</div>
                      <p className="text-[10px] text-muted-foreground mt-1 leading-normal">{node.desc}</p>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
