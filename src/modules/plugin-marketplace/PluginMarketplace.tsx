import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/shared/ui/Primitives';
import { Blocks, Key, ToggleLeft, ToggleRight, Check } from 'lucide-react';

interface PluginApp {
  id: string;
  name: string;
  desc: string;
  installed: boolean;
  apiKeyLabel?: string;
}

export const PluginMarketplace: React.FC = () => {
  const [plugins, setPlugins] = useState<PluginApp[]>([
    { id: 'p1', name: 'Google Tag Manager', desc: 'Sync sitemaps and trigger custom Core Web Vitals audit tags.', installed: true, apiKeyLabel: 'GTM-ID (e.g. GTM-XXXX)' },
    { id: 'p2', name: 'Mailchimp Newsletter Sync', desc: 'Sync customer list segment tags directly into newsletter groups.', installed: false, apiKeyLabel: 'Mailchimp API Token' },
    { id: 'p3', name: 'Shiprocket Logistics Sync', desc: 'Automate Courier rules assignments for own courier vs DTDC hybrid delivery.', installed: true, apiKeyLabel: 'Shiprocket Client Secret' },
    { id: 'p4', name: 'OpenAI Content Optimizer', desc: 'Generate SEO meta tags descriptions and review sentiments forecast.', installed: false, apiKeyLabel: 'OpenAI Secret Token' },
  ]);

  const handleToggle = (id: string, name: string) => {
    setPlugins(prev => prev.map(p => {
      if (p.id === id) {
        const nextState = !p.installed;
        alert(`${name} ${nextState ? 'installed' : 'uninstalled'} successfully.`);
        return { ...p, installed: nextState };
      }
      return p;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground m-0">Plugin Marketplace</h1>
        <p className="text-xs text-muted-foreground">Extend store features with analytics integrations, chat scripts, and third-party logistics.</p>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {plugins.map(plug => (
          <Card key={plug.id}>
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Blocks className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">{plug.name}</h3>
              </div>
              <button 
                onClick={() => handleToggle(plug.id, plug.name)}
                className="cursor-pointer text-muted-foreground hover:text-foreground"
              >
                {plug.installed ? (
                  <ToggleRight className="h-7 w-7 text-primary" />
                ) : (
                  <ToggleLeft className="h-7 w-7" />
                )}
              </button>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs">
              <p className="text-muted-foreground leading-normal">{plug.desc}</p>
              
              {plug.installed && plug.apiKeyLabel && (
                <div className="p-3 bg-muted/20 border border-border rounded-md space-y-2">
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    <Key className="h-3.5 w-3.5 text-muted-foreground" />
                    Configure integration credentials
                  </div>
                  <input
                    type="password"
                    placeholder={`Enter ${plug.apiKeyLabel}`}
                    className="w-full h-8 px-2 rounded border border-input bg-card text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    defaultValue="••••••••••••••••"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
