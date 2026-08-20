import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/shared/ui/Primitives';
import { 
  Plus, Trash2, ArrowUp, ArrowDown, 
  Settings, Eye, Send
} from 'lucide-react';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_HOMEPAGE_CONFIG } from '@/shared/graphql/queries/cms';
import { CREATE_OR_UPDATE_HOMEPAGE_CONFIG } from '@/shared/graphql/mutations/cms';

interface BlockSection {
  id: string;
  type: 'hero' | 'features' | 'testimonials' | 'footer' | 'cta';
  title: string;
  description: string;
  theme: 'dark' | 'light' | 'gradient';
}

export const CMSBuilder: React.FC = () => {
  const [blocks, setBlocks] = useState<BlockSection[]>([
    { id: 'b1', type: 'hero', title: 'Summer Collection Launch', description: 'Unlock premium products with up to 40% discount today.', theme: 'gradient' },
    { id: 'b2', type: 'features', title: 'Curated Benefits', description: 'Free shipping on orders above $50. 24/7 customer support.', theme: 'light' },
    { id: 'b3', type: 'cta', title: 'Join our Newsletter', description: 'Subscribe to receive the latest drops and discounts.', theme: 'dark' },
  ]);

  const [activeBlockId, setActiveBlockId] = useState<string>('b1');
  const [currentPage, setCurrentPage] = useState('home');
  const [initFailed, setInitFailed] = useState(false);

  const { data, loading, error, refetch } = useQuery<any>(GET_HOMEPAGE_CONFIG, {
    skip: currentPage !== 'home',
  });

  const [publishConfig, { loading: publishing }] = useMutation<any>(CREATE_OR_UPDATE_HOMEPAGE_CONFIG);

  useEffect(() => {
    if (currentPage === 'home' && data?.homepageConfig?.sections) {
      try {
        const loadedSections = data.homepageConfig.sections.map((sec: any) => {
          const obj = typeof sec === 'string' ? JSON.parse(sec) : sec;
          const configObj = typeof obj.config === 'string' ? JSON.parse(obj.config) : (obj.config || {});
          return {
            id: obj.id || Math.random().toString(36).substr(2, 9),
            type: obj.type || 'hero',
            title: obj.title || '',
            description: obj.description || configObj.description || '',
            theme: obj.theme || configObj.theme || 'light',
          };
        });
        setBlocks(loadedSections);
        if (loadedSections.length > 0) {
          setActiveBlockId(loadedSections[0].id);
        }
      } catch (e) {
        console.error('Failed to parse CMS homepage sections', e);
      }
    }
  }, [data, currentPage]);

  useEffect(() => {
    const handleNotFound = async () => {
      const isNotFound = error && (
        error.message.toLowerCase().includes('not found') ||
        error.message.toLowerCase().includes('homepage configuration not found')
      );
      if (isNotFound && !initFailed) {
        console.log("Homepage config not found on backend. Attempting to initialize default config...");
        try {
          await publishConfig({
            variables: {
              input: {
                status: 'DRAFT',
                sections: []
              }
            }
          });
          refetch();
        } catch (initErr) {
          console.error("Failed to initialize default homepage config:", initErr);
          setInitFailed(true);
        }
      }
    };
    if (currentPage === 'home') {
      handleNotFound();
    }
  }, [error, currentPage, publishConfig, refetch, initFailed]);

  const activeBlock = blocks.find(b => b.id === activeBlockId) || blocks[0];

  const handleAddBlock = (type: BlockSection['type']) => {
    const defaultData = {
      hero: { title: 'Modern Gear Showcase', description: 'Discover new tech accessories designed for professionals.', theme: 'gradient' as const },
      features: { title: 'High Performance Guarantee', description: 'Engineered for reliability. 30-day money-back guarantee.', theme: 'light' as const },
      testimonials: { title: 'What Our Customers Say', description: 'Over 10,000 positive reviews globally.', theme: 'light' as const },
      cta: { title: 'Ready to Upgrade?', description: 'Get started today and save 15% on your first purchase.', theme: 'dark' as const },
      footer: { title: 'Gubera Store LLC', description: 'All rights reserved. © 2026.', theme: 'light' as const },
    };

    const newBlock: BlockSection = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title: defaultData[type].title,
      description: defaultData[type].description,
      theme: defaultData[type].theme,
    };

    setBlocks(prev => [...prev, newBlock]);
    setActiveBlockId(newBlock.id);
  };

  const handleMove = (index: number, dir: 'up' | 'down') => {
    if (dir === 'up' && index === 0) return;
    if (dir === 'down' && index === blocks.length - 1) return;
    
    const targetIndex = dir === 'up' ? index - 1 : index + 1;
    const newBlocks = [...blocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIndex];
    newBlocks[targetIndex] = temp;
    setBlocks(newBlocks);
  };

  const handleUpdateActiveBlock = (fields: Partial<BlockSection>) => {
    setBlocks(prev => prev.map(b => b.id === activeBlock.id ? { ...b, ...fields } : b));
  };

  const handlePublish = async () => {
    if (currentPage !== 'home') {
      alert(`Publishing for page "${currentPage}" is a TODO.`);
      return;
    }

    try {
      const sectionsInput = blocks.map((b, idx) => ({
        id: b.id,
        type: b.type,
        title: b.title,
        order: idx,
        config: {
          description: b.description,
          theme: b.theme,
        },
      }));

      await publishConfig({
        variables: {
          input: {
            status: 'PUBLISHED',
            sections: sectionsInput,
          }
        }
      });
      alert('CMS changes successfully compiled and deployed to global CDN endpoints.');
      refetch();
    } catch (err: any) {
      console.error('Failed to publish homepage config', err);
      alert('Failed to publish: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground m-0">Website Builder</h1>
          <p className="text-xs text-muted-foreground">Drag and reorder homepage layout modules with live preview panel.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <select 
            className="h-9 px-2 rounded-md border border-border bg-card text-xs font-semibold text-foreground"
            value={currentPage}
            onChange={(e) => setCurrentPage(e.target.value)}
          >
            <option value="home">Home Page (Draft)</option>
            <option value="about">About Us Page</option>
            <option value="faq">FAQs Support Page</option>
            <option value="privacy">Privacy Policy</option>
          </select>
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Send className="h-4 w-4" /> {publishing ? 'Publishing...' : 'Publish Live'}
          </button>
        </div>
      </div>

      {error && currentPage === 'home' && (!error.message.toLowerCase().includes('not found') || initFailed) ? (
        <div className="py-12 text-center text-xs text-muted-foreground border border-border rounded-md bg-muted/20">
          <span className="font-semibold text-destructive block mb-1">Failed to load website builder config</span>
          {initFailed ? 'No homepage config found. Please initialize homepage config.' : (error.message || 'Could not fetch homepage layout blocks. Please check backend connection.')}
        </div>
      ) : loading && currentPage === 'home' && !data?.homepageConfig ? (
        <div className="py-12 text-center text-xs text-muted-foreground">Loading homepage layout blocks...</div>
      ) : (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
          {/* Left Side: Blocks collection library */}
          <div className="space-y-4 lg:col-span-1">
            <Card>
              <CardHeader>
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Components Library</h3>
              </CardHeader>
              <CardContent className="p-3 flex flex-col gap-2">
                <button 
                  onClick={() => handleAddBlock('hero')}
                  className="w-full h-9 border border-dashed border-border bg-card hover:bg-secondary rounded text-xs font-semibold text-foreground flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Hero Banner
                </button>
                <button 
                  onClick={() => handleAddBlock('features')}
                  className="w-full h-9 border border-dashed border-border bg-card hover:bg-secondary rounded text-xs font-semibold text-foreground flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Benefits Grid
                </button>
                <button 
                  onClick={() => handleAddBlock('testimonials')}
                  className="w-full h-9 border border-dashed border-border bg-card hover:bg-secondary rounded text-xs font-semibold text-foreground flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Customer Reviews
                </button>
                <button 
                  onClick={() => handleAddBlock('cta')}
                  className="w-full h-9 border border-dashed border-border bg-card hover:bg-secondary rounded text-xs font-semibold text-foreground flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Action Callout (CTA)
                </button>
              </CardContent>
            </Card>

            {/* Active outline tree */}
            <Card>
              <CardHeader>
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Page Structure</h3>
              </CardHeader>
              <CardContent className="p-3 flex flex-col gap-1.5 max-h-[300px] overflow-y-auto">
                {blocks.map((b, idx) => (
                  <div
                    key={b.id}
                    onClick={() => setActiveBlockId(b.id)}
                    className={`p-2 rounded border text-xs flex items-center justify-between cursor-pointer transition-colors ${activeBlockId === b.id ? 'bg-primary/5 border-primary text-primary font-semibold' : 'border-border text-foreground hover:bg-secondary'}`}
                  >
                    <span className="capitalize">{b.type} block</span>
                    
                    <div className="flex items-center gap-0.5">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleMove(idx, 'up'); }}
                        className="p-0.5 hover:bg-secondary rounded text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleMove(idx, 'down'); }}
                        className="p-0.5 hover:bg-secondary rounded text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setBlocks(prev => prev.filter(x => x.id !== b.id)); }}
                        className="p-0.5 hover:bg-secondary rounded text-muted-foreground hover:text-destructive cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Middle Column: Live HTML Visual Preview */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="flex flex-col h-[520px] overflow-hidden">
              <CardHeader className="bg-muted/15 flex items-center justify-between p-3 shrink-0">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span>Responsive Visual Preview (Shop Viewport)</span>
                </div>
                <span className="h-2 w-2 rounded-full bg-emerald-500" title="Connected" />
              </CardHeader>
              
              <div className="flex-1 overflow-y-auto p-4 bg-muted/20 space-y-4 min-h-0 select-none">
                {blocks.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-xs text-muted-foreground">
                    Your page has no blocks. Add sections from the catalog library.
                  </div>
                ) : (
                  blocks.map((b) => {
                    const isSelected = b.id === activeBlockId;
                    
                    if (b.type === 'hero') {
                      return (
                        <div 
                          key={b.id} 
                          onClick={() => setActiveBlockId(b.id)}
                          className={`p-6 rounded-lg text-center cursor-pointer transition-all border ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border'} ${b.theme === 'gradient' ? 'bg-gradient-to-r from-amber-900 to-stone-900 text-white' : b.theme === 'dark' ? 'bg-stone-950 text-white' : 'bg-card text-card-foreground shadow-sm'}`}
                        >
                          <h2 className="text-lg font-extrabold tracking-tight m-0 text-inherit leading-tight">{b.title}</h2>
                          <p className="text-xs opacity-85 mt-2 max-w-sm mx-auto leading-normal">{b.description}</p>
                          <button className="mt-4 px-4 py-1.5 bg-background text-foreground rounded-md text-[10px] font-bold shadow-sm">
                            Shop Collection
                          </button>
                        </div>
                      );
                    }

                    if (b.type === 'features') {
                      return (
                        <div 
                          key={b.id}
                          onClick={() => setActiveBlockId(b.id)}
                          className={`p-5 rounded-lg border cursor-pointer transition-all ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border'} ${b.theme === 'dark' ? 'bg-stone-950 text-white' : 'bg-card text-card-foreground shadow-sm'}`}
                        >
                          <h3 className="text-xs font-bold uppercase tracking-wider text-primary text-center mb-4">{b.title}</h3>
                          <div className="grid grid-cols-2 gap-3 text-center text-[10px]">
                            <div className="p-2.5 bg-muted/40 rounded border border-border">
                              <span className="font-bold block text-foreground">Worldwide Delivery</span>
                              <span className="text-muted-foreground">{b.description}</span>
                            </div>
                            <div className="p-2.5 bg-muted/40 rounded border border-border">
                              <span className="font-bold block text-foreground">Secure Payments</span>
                              <span className="text-muted-foreground">Certified SSL transactions.</span>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    if (b.type === 'cta') {
                      return (
                        <div
                          key={b.id}
                          onClick={() => setActiveBlockId(b.id)}
                          className={`p-6 rounded-lg text-center cursor-pointer transition-all border ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border'} ${b.theme === 'dark' ? 'bg-stone-950 text-white' : b.theme === 'gradient' ? 'bg-gradient-to-r from-amber-900 to-stone-900 text-white' : 'bg-card text-card-foreground shadow-sm'}`}
                        >
                          <h3 className="text-sm font-bold m-0 text-inherit">{b.title}</h3>
                          <p className="text-[10px] opacity-80 mt-1">{b.description}</p>
                          <div className="flex gap-1.5 max-w-xs mx-auto mt-4 justify-center">
                            <input type="text" placeholder="name@email.com" className="h-7 px-2 rounded border border-border bg-card text-[10px] flex-1 text-foreground" disabled />
                            <button className="h-7 px-3 bg-primary text-primary-foreground rounded text-[10px] font-semibold">Join</button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div 
                        key={b.id} 
                        onClick={() => setActiveBlockId(b.id)}
                        className={`p-4 rounded-lg border text-center cursor-pointer transition-all ${isSelected ? 'border-primary' : 'border-border'} bg-card`}
                      >
                        <h4 className="text-xs font-semibold text-foreground capitalize">{b.type} block</h4>
                        <p className="text-[10px] text-muted-foreground">{b.title}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>

          {/* Right Side: Component configuration fields */}
          <div className="lg:col-span-1 space-y-4">
            {activeBlock ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-1 text-xs font-semibold text-foreground">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span>Configure Section</span>
                  </div>
                </CardHeader>
                <CardContent className="p-3 space-y-3 text-xs">
                  <div>
                    <label className="block text-muted-foreground font-semibold mb-1">Block Title</label>
                    <input
                      type="text"
                      className="w-full h-8 px-2 rounded border border-input bg-card text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                      value={activeBlock.title}
                      onChange={(e) => handleUpdateActiveBlock({ title: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-muted-foreground font-semibold mb-1">Description Paragraph</label>
                    <textarea
                      className="w-full h-20 p-2 rounded border border-input bg-card text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                      value={activeBlock.description}
                      onChange={(e) => handleUpdateActiveBlock({ description: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-muted-foreground font-semibold mb-1">Color Theme Preset</label>
                    <select
                      className="w-full h-8 rounded border border-border bg-card text-foreground px-2"
                      value={activeBlock.theme}
                      onChange={(e) => handleUpdateActiveBlock({ theme: e.target.value as any })}
                    >
                      <option value="light">Light Background</option>
                      <option value="dark">Dark Charcoal</option>
                      <option value="gradient">Brand Gradient</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="p-4 text-xs text-center text-muted-foreground">
                Select a section to configure its fields.
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
