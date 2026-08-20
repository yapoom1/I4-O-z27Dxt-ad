import React, { useState } from 'react';
import { Card, CardContent, CardHeader, Badge } from '@/shared/ui/Primitives';
import { Palette, Eye, ArrowDownToLine, Check } from 'lucide-react';

const mockThemes = [
  { id: 't1', name: 'Stripe Sleek', author: 'Vy Design Group', price: 'Free', rating: 4.9, active: true },
  { id: 't2', name: 'Midnight Charcoal', author: 'SaaS Templates', price: '$49.00', rating: 4.8, active: false },
  { id: 't3', name: 'Cyberpunk Neon Glow', author: 'Linear Themes', price: '$79.00', rating: 4.5, active: false },
  { id: 't4', name: 'Shopify Clean Minimalist', author: 'Gubera Lab', price: 'Free', rating: 4.7, active: false },
];

export const ThemeMarketplace: React.FC = () => {
  const [activeThemeId, setActiveThemeId] = useState('t1');

  const handleInstall = (id: string, name: string) => {
    setActiveThemeId(id);
    alert(`Theme "${name}" activated. Apply styling variables to storefront.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground m-0">Theme Customizer</h1>
        <p className="text-xs text-muted-foreground">Browse layout templates for your storefront and configure color styling variables.</p>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {mockThemes.map(th => {
          const isActive = activeThemeId === th.id;
          return (
            <Card key={th.id} className={`hover:border-primary/50 transition-all ${isActive ? 'border-2 border-primary shadow-md' : ''}`}>
              <CardContent className="p-4 flex flex-col justify-between h-44 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Palette className="h-5 w-5 text-primary" />
                    <span className="font-bold text-foreground">{th.price}</span>
                  </div>
                  <h3 className="font-bold text-foreground text-sm">{th.name}</h3>
                  <p className="text-muted-foreground mt-0.5">Author: {th.author}</p>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <span className="text-[10px] text-muted-foreground">Rating: ★ {th.rating}</span>
                  
                  {isActive ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
                      <Check className="h-3.5 w-3.5" /> Active
                    </span>
                  ) : (
                    <button
                      onClick={() => handleInstall(th.id, th.name)}
                      className="h-7 px-3 bg-primary text-primary-foreground hover:bg-primary/95 text-[10px] font-semibold rounded cursor-pointer flex items-center gap-1 shadow-sm"
                    >
                      <ArrowDownToLine className="h-3 w-3" /> Install
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
