import React, { useEffect, useState, useRef } from 'react';
import { useAppStore } from '@/shared/stores/useAppStore';
import { Search, Monitor, Moon, Sun, ArrowRight, ShoppingBag, Users, Settings, FileText, LayoutDashboard, Truck, Bot, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CommandPalette: React.FC = () => {
  const { 
    isCommandPaletteOpen, 
    setCommandPaletteOpen, 
    toggleTheme 
  } = useAppStore();
  
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Command items
  const commands = [
    { id: 'dash', title: 'Go to Dashboard', icon: LayoutDashboard, category: 'Navigation', action: () => navigate('/dashboard') },
    { id: 'prod', title: 'Go to Products', icon: ShoppingBag, category: 'Navigation', action: () => navigate('/products') },
    { id: 'orders', title: 'Go to Orders', icon: FileText, category: 'Navigation', action: () => navigate('/orders') },
    { id: 'cust', title: 'Go to Customers', icon: Users, category: 'Navigation', action: () => navigate('/customers') },
    { id: 'pos', title: 'Open POS Terminal', icon: CreditCard, category: 'Navigation', action: () => navigate('/pos') },
    { id: 'cms', title: 'Go to Website Page Builder', icon: FileText, category: 'Navigation', action: () => navigate('/cms') },
    { id: 'delivery', title: 'Delivery Rule Configurator', icon: Truck, category: 'Navigation', action: () => navigate('/delivery') },
    { id: 'ai', title: 'AI Copilot Engine', icon: Bot, category: 'Navigation', action: () => navigate('/ai') },
    { id: 'settings', title: 'Open Store Settings', icon: Settings, category: 'Navigation', action: () => navigate('/settings') },
    { id: 'theme', title: 'Toggle Theme (Light / Dark)', icon: Monitor, category: 'Action', action: () => toggleTheme() },
  ];

  const allItems = [...commands];
  const filteredItems = allItems.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  // Auto-focus input when opened
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
      setQuery('');
    }
  }, [isCommandPaletteOpen]);

  // Bind keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
      
      if (!isCommandPaletteOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        setCommandPaletteOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredItems.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
          setCommandPaletteOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, filteredItems, selectedIndex]);

  if (!isCommandPaletteOpen) return null;

  // Group items by category for visual styling
  const categories = Array.from(new Set(filteredItems.map(item => item.category)));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="fixed inset-0 cursor-default" 
        onClick={() => setCommandPaletteOpen(false)}
      />
      <div className="relative w-full max-w-lg bg-card border border-border shadow-2xl rounded-xl overflow-hidden flex flex-col max-h-[500px]">
        {/* Search input bar */}
        <div className="flex items-center px-4 border-b border-border">
          <Search className="h-4 w-4 text-muted-foreground mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search modules..."
            className="w-full h-12 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <span className="text-[10px] border border-border bg-muted/50 px-1.5 py-0.5 rounded text-muted-foreground select-none">
            ESC
          </span>
        </div>

        {/* Action list */}
        <div className="overflow-y-auto p-2 flex-1">
          {filteredItems.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No results found for "{query}"
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.action();
                    setCommandPaletteOpen(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer transition-colors text-sm ${isSelected ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-secondary'}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isSelected ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                    <span>{item.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      {item.category}
                    </span>
                    {isSelected && <ArrowRight className="h-3.5 w-3.5" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="p-3 border-t border-border bg-muted/20 flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="border border-border bg-card px-1 rounded">↑↓</kbd> to navigate
            </span>
            <span>
              <kbd className="border border-border bg-card px-1 rounded">↵</kbd> to select
            </span>
          </div>
          <span>Press <kbd className="border border-border bg-card px-1 rounded">⌘K</kbd> to close</span>
        </div>
      </div>
    </div>
  );
};
