import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { GET_MY_TENANT_CONFIG } from '@/shared/graphql/queries/tenant';
import { useAppStore } from '@/shared/stores/useAppStore';
import { CommandPalette } from '@/shared/components/CommandPalette';
import { 
  LayoutDashboard, ShoppingBag, FolderTree, FileSpreadsheet, Users, 
  Settings, Bot, HelpCircle, ShieldCheck, CreditCard, ChevronLeft, 
  ChevronRight, Search, Bell, Sun, Moon, Sparkles, Store, Compass, 
  Truck, Target, FileLock2, BarChart3, Palette, Blocks, LogOut,
  AlertTriangle
} from 'lucide-react';
import { Badge, Button } from '@/shared/ui/Primitives';
import { clearStoredAuth, getStoredUser } from '@/shared/auth';

export const AdminLayout: React.FC = () => {
  const { 
    theme, 
    setTheme, 
    toggleTheme,
    sidebarCollapsed, 
    setSidebarCollapsed,
    activeStore, 
    setActiveStore,
    notifications,
    markAsRead,
    markAllAsRead,
    user,
    setCommandPaletteOpen
  } = useAppStore();

  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarCollapsed(true);
    }
  }, [setSidebarCollapsed]);

  const { data: tenantData } = useQuery<any>(GET_MY_TENANT_CONFIG, {
    fetchPolicy: 'network-only' // always fetch fresh branding on layout mount
  });

  useEffect(() => {
    if (tenantData?.tenant) {
      setActiveStore({
        id: tenantData.tenant.id,
        name: tenantData.tenant.businessName,
        plan: 'Enterprise', // Defaults or add to DB later
        logo: tenantData.tenant.logoUrl,
        currency: 'INR',
        locale: 'en-IN',
        themeColor: tenantData.tenant.primaryColor || '#000000',
      });
    }
  }, [tenantData, setActiveStore]);
  const [connectionError, setConnectionError] = useState<{ message: string; url: string } | null>(null);

  useEffect(() => {
    const handleConnectionError = (e: Event) => {
      const customEvent = e as CustomEvent;
      setConnectionError(customEvent.detail);
    };

    window.addEventListener('backend-connection-error', handleConnectionError);
    return () => {
      window.removeEventListener('backend-connection-error', handleConnectionError);
    };
  }, []);

  // Read stored user info via centralized auth utility
  const storedUser = getStoredUser();
  const displayName = storedUser?.name || user.name;
  const displayEmail = storedUser?.email || storedUser?.mobilenumber || user.email;

  const handleLogout = () => {
    clearStoredAuth();
    navigate('/login', { replace: true });
  };

  // Inject tenant primary color dynamically into CSS
  useEffect(() => {
    if (activeStore && activeStore.themeColor) {
      // Convert hex to HSL or apply directly
      document.documentElement.style.setProperty('--primary', hexToHsl(activeStore.themeColor));
    }
  }, [activeStore]);

  // Helper to convert hex to HSL string representation
  function hexToHsl(hex: string): string {
    hex = hex.replace(/#/g, '');
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  }

  // Navigation Items
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Products', path: '/products', icon: ShoppingBag },
    { label: 'Categories & Tree', path: '/categories', icon: FolderTree },
    { label: 'Orders & Sales', path: '/orders', icon: FileSpreadsheet },
    { label: 'Customers Hub', path: '/customers', icon: Users },
    { label: 'Delivery', path: '/delivery', icon: Truck },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  // Breadcrumb generator
  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(x => x);
    if (paths.length === 0) return [{ label: 'Dashboard', path: '/dashboard' }];
    return paths.map((path, idx) => {
      const url = `/${paths.slice(0, idx + 1).join('/')}`;
      const label = path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ');
      return { label, path: url };
    });
  };

  const breadcrumbs = getBreadcrumbs();
  const unreadNotifs = notifications.filter(n => !n.read).length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Dynamic Command Palette */}
      <CommandPalette />

      {/* Mobile overlay */}
      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Sidebar navigation */}
      <aside 
        className={`fixed lg:relative z-40 h-full flex flex-col bg-card border-r border-border shrink-0 transition-transform duration-300 ${sidebarCollapsed ? '-translate-x-full lg:translate-x-0 w-64 lg:w-16' : 'translate-x-0 w-64'}`}
      >
        {/* Sidebar Header / Tenant Switcher */}
        <div className="h-14 border-b border-border px-3 flex items-center justify-between relative">
          {!sidebarCollapsed ? (
            <div className="w-full relative">
              <div 
                className="w-full flex items-center justify-between gap-2 p-1.5 rounded-md text-left"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="h-10 w-10 shrink-0 bg-secondary/50 rounded-md flex items-center justify-center overflow-hidden">
                    {activeStore?.logo ? (
                      <img src={activeStore.logo} alt={activeStore?.name || "Store"} className="h-full w-full object-contain" />
                    ) : (
                      <span className="text-xs font-bold text-muted-foreground">
                        {activeStore?.name ? activeStore.name.charAt(0).toUpperCase() : ''}
                      </span>
                    )}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold text-foreground truncate">{activeStore?.name || ""}</div>
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <span>Admin panel</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setSidebarCollapsed(false)}
              className="h-10 w-10 mx-auto hover:bg-secondary flex items-center justify-center cursor-pointer text-foreground bg-secondary/50 rounded-md overflow-hidden"
              title="Expand Sidebar"
            >
              {activeStore?.logo ? (
                <img src={activeStore.logo} alt={activeStore?.name || "Store"} className="h-full w-full object-contain" />
              ) : (
                <span className="text-xs font-bold text-muted-foreground">
                  {activeStore?.name ? activeStore.name.charAt(0).toUpperCase() : ''}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) setSidebarCollapsed(true);
                }}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-3 py-2 rounded-md transition-all text-sm group cursor-pointer ${isActive ? 'bg-primary text-primary-foreground font-medium shadow-sm' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`
                }
              >
                <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-105" />
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer User Info + Logout */}
        <div className="p-3 border-t border-border bg-muted/20 flex flex-col gap-2">
          {!sidebarCollapsed ? (
            <>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                  {displayName ? displayName[0].toUpperCase() : 'A'}
                </div>
                <div className="truncate flex-1">
                  <div className="text-xs font-semibold text-foreground truncate">{displayName}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{displayEmail}</div>
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Online Session" />
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="h-8 w-8 mx-auto rounded-md hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar bar */}
        <header className="h-14 border-b border-border bg-card/50 backdrop-blur-md px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
            
            {/* Breadcrumbs */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground select-none">
              <span className="hover:text-foreground cursor-pointer">{activeStore?.name || ""}</span>
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb.path}>
                  <span>/</span>
                  <span className={idx === breadcrumbs.length - 1 ? 'font-medium text-foreground' : 'hover:text-foreground cursor-pointer'}>
                    {crumb.label}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Global Search and command palette trigger */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary border border-border text-muted-foreground text-xs hover:text-foreground transition-all cursor-pointer w-40 sm:w-56 justify-between"
            >
              <span className="flex items-center gap-2 truncate">
                <Search className="h-3.5 w-3.5" />
                <span className="truncate">Search commands...</span>
              </span>
              <kbd className="border border-border/70 bg-card px-1 rounded select-none shrink-0 text-[10px]">
                ⌘K
              </kbd>
            </button>

            {/* AI Assistant Glow shortcut */}
            <NavLink
              to="/ai"
              className="p-2 rounded-md hover:bg-secondary text-amber-900 hover:text-amber-950 dark:text-amber-700 dark:hover:text-amber-600 transition-colors cursor-pointer relative group"
              title="Open AI Copilot"
            >
              <Sparkles className="h-4 w-4 animate-pulse" />
            </NavLink>

            {/* Notification Menu */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer relative"
              >
                <Bell className="h-4 w-4" />
                {unreadNotifs > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-card border border-border shadow-xl rounded-md p-2 z-50 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between border-b border-border pb-2 px-1">
                    <span className="text-xs font-semibold text-foreground">Notifications</span>
                    {unreadNotifs > 0 && (
                      <button 
                        onClick={markAllAsRead} 
                        className="text-[10px] text-primary hover:underline font-semibold cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto flex flex-col gap-1">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-muted-foreground">
                        All caught up!
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          onClick={() => markAsRead(notif.id)}
                          className={`p-2 rounded-md transition-colors cursor-pointer text-xs flex flex-col gap-1 ${notif.read ? 'opacity-65 hover:bg-muted/50' : 'bg-primary/5 hover:bg-primary/10 border-l-2 border-primary'}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-foreground truncate">{notif.title}</span>
                            <span className="text-[9px] text-muted-foreground">{notif.time}</span>
                          </div>
                          <p className="text-muted-foreground line-clamp-2 leading-normal">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Light / Dark toggler */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
          </div>
        </header>

        {/* Content view with viewport boundaries */}
        <main className="flex-1 overflow-y-auto bg-background p-4 relative min-h-0">
          {connectionError && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-md flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <div className="text-xs">
                  <span className="font-semibold block text-foreground">Backend Connection Error</span>
                  Unable to connect to the backend at <code className="font-mono bg-destructive/15 px-1 py-0.5 rounded">{connectionError.url}</code>. {connectionError.message}
                </div>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="shrink-0 text-xs font-semibold px-3 py-1.5 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md transition-colors cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
};
