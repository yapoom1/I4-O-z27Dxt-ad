import React, { useState } from 'react';
import { Card, CardContent, CardHeader, Input, Button } from '@/shared/ui/Primitives';
import { Bot, Sparkles, Send, TrendingUp, BarChart3, MessageSquare, ThumbsUp, Search } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const forecastData = [
  { name: 'Jan', actual: 4000, forecast: 4000 },
  { name: 'Feb', actual: 4800, forecast: 4800 },
  { name: 'Mar', actual: 6300, forecast: 6300 },
  { name: 'Apr', actual: 8000, forecast: 8000 },
  { name: 'May', actual: 7500, forecast: 7500 },
  { name: 'Jun', actual: null, forecast: 9500, rangeMax: 11000, rangeMin: 8000 },
  { name: 'Jul', actual: null, forecast: 11200, rangeMax: 13500, rangeMin: 9100 },
  { name: 'Aug', actual: null, forecast: 13000, rangeMax: 15400, rangeMin: 10400 },
];

export const AICopilot: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'copilot' | 'forecaster' | 'sentiment'>('copilot');

  // AI Description Generator State
  const [promptInput, setPromptInput] = useState('');
  const [generationOutput, setGenerationOutput] = useState('');
  const [loading, setLoading] = useState(false);

  // Chat Assistant State
  const [chatMessages, setChatMessages] = useState([
    { id: '1', sender: 'ai', text: 'Hello! I am your Gubera AI Copilot. I can write marketing campaigns, analyze customer reviews, or outline product sales. Try asking me "Write a marketing email for summer sale".' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleGenerateDescription = () => {
    if (!promptInput.trim()) return;
    setLoading(true);
    setGenerationOutput('');
    
    setTimeout(() => {
      setGenerationOutput(`**Title**: Premium Leather Keyboard Pad & Wrist Rest\n\n**Generated Description**: Elevate your workspaces configuration with the Gubera custom-crafted leather desk mat. Constructed from genuine full-grain leather, this pad features a water-resistant top layer and non-slip felt backing. Designed with ergonomic padding to support natural wrist alignment, mitigating strain during long coding sessions.\n\n**Meta Title**: Ergonomic Leather Desk Keyboard Pad | Gubera Store\n**Meta Keywords**: desk mat, wrist pad, office accessories, work desk pad`);
      setLoading(false);
    }, 1500);
  };

  const handleSendChatMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg = { id: Math.random().toString(), sender: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    
    setTimeout(() => {
      let replyText = 'I am scanning store data records. Could you clarify which store node you are requesting reports for?';
      if (chatInput.toLowerCase().includes('email') || chatInput.toLowerCase().includes('campaign')) {
        replyText = `Here is a custom email copy template based on your active campaign rules: \n\n"Subject: 🚀 Unlocked: Exclusive Storewide 15% discount!\n\nDear customer,\nWe noticed you had your eye on some items. Enter code GUBERA15 at checkout to enjoy a 15% discount. Valid for 48 hours only!"`;
      } else if (chatInput.toLowerCase().includes('sale') || chatInput.toLowerCase().includes('top')) {
        replyText = 'Based on procedural metrics, your top-performing product is the "Pro Keyboard Stand v3" generating $48,290.00 in aggregate monthly sales volume.';
      }
      setChatMessages(prev => [...prev, { id: Math.random().toString(), sender: 'ai', text: replyText }]);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary animate-bounce shrink-0" />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground m-0">AI Copilot Engine</h1>
            <p className="text-xs text-muted-foreground">Predictive forecasting, AI-assisted content writing, and sentiment analysis dashboard.</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-secondary p-1 rounded-md border border-border">
          <button 
            onClick={() => setActiveTab('copilot')}
            className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer ${activeTab === 'copilot' ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Chat Copilot
          </button>
          <button 
            onClick={() => setActiveTab('forecaster')}
            className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer ${activeTab === 'forecaster' ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Sales Forecast
          </button>
          <button 
            onClick={() => setActiveTab('sentiment')}
            className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer ${activeTab === 'sentiment' ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Reviews Sentiment
          </button>
        </div>
      </div>

      {activeTab === 'copilot' && (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          {/* AI Writer Panel */}
          <div className="md:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground uppercase tracking-wider">
                  <Sparkles className="h-4 w-4 text-violet-500" />
                  <span>Meta Generator</span>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Product keyword topic</label>
                  <input
                    type="text"
                    className="w-full h-8 px-2 rounded border border-input bg-card text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="e.g. ergonomic leather desk mat"
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                  />
                </div>

                <button
                  onClick={handleGenerateDescription}
                  className="w-full h-8 bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-semibold rounded cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Generate Meta Tags
                </button>

                {loading && (
                  <div className="py-6 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                    <span className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <span>Writing copy models...</span>
                  </div>
                )}

                {generationOutput && (
                  <div className="p-3 border border-border bg-muted/20 rounded-md whitespace-pre-wrap leading-normal font-mono text-[10px] text-foreground max-h-56 overflow-y-auto">
                    {generationOutput}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* AI Chat Copilot Assistant */}
          <div className="md:col-span-2 space-y-4">
            <Card className="flex flex-col h-[400px]">
              <CardHeader className="bg-muted/10 p-3 shrink-0 flex items-center gap-2 border-b border-border">
                <Bot className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-foreground">Interactive Assistant</span>
              </CardHeader>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 text-xs">
                {chatMessages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`p-3 rounded-lg max-w-sm whitespace-pre-wrap leading-normal ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground border border-border'}`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-muted/20 border-t border-border flex gap-2 shrink-0">
                <input
                  type="text"
                  placeholder="Ask copilot: 'Write product copy'..."
                  className="h-8 px-2 rounded border border-input bg-card text-xs flex-1 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendChatMessage();
                  }}
                />
                <button
                  onClick={handleSendChatMessage}
                  className="h-8 w-8 rounded bg-primary text-primary-foreground hover:bg-primary/95 flex items-center justify-center cursor-pointer shrink-0"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'forecaster' && (
        <Card>
          <CardHeader>
            <div>
              <h3 className="text-sm font-semibold text-foreground">AI Sales Forecasting</h3>
              <p className="text-xs text-muted-foreground">Machine learning forecasting model projecting sales outcomes with confidence bands.</p>
            </div>
          </CardHeader>
          <CardContent className="p-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))', 
                    borderRadius: '8px', 
                    color: 'hsl(var(--foreground))',
                    fontSize: '12px'
                  }} 
                />
                <Area type="monotone" dataKey="actual" stroke="hsl(var(--primary))" strokeWidth={2} fill="none" name="Actual Revenue" />
                <Area type="monotone" dataKey="forecast" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" fill="none" name="Projected Forecast" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {activeTab === 'sentiment' && (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {/* Sentiment overview */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-foreground">Sentiment Score Distribution</h3>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between font-semibold">
                  <span className="text-emerald-500">Positive (84%)</span>
                  <span>8,290 reviews</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '84%' }} />
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between font-semibold">
                  <span className="text-amber-500">Neutral (11%)</span>
                  <span>1,080 reviews</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '11%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-semibold">
                  <span className="text-red-500">Negative (5%)</span>
                  <span>490 reviews</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: '5%' }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
