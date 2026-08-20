import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/shared/ui/Primitives';
import { 
  TrendingUp, DollarSign, ShoppingCart, Users, 
  Wallet, AlertTriangle, ChevronRight, Layers, Package
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip as ChartTooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { useQuery } from '@apollo/client/react';
import { GET_DASHBOARD_PRODUCTS, GET_DASHBOARD_CATEGORIES, GET_DASHBOARD_ORDERS } from '@/shared/graphql/queries/dashboard';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // cache-first: use cached data instantly on re-visits; only hits network on first load.
  const { data: productsData, loading: productsLoading, error: productsError } = useQuery<any>(GET_DASHBOARD_PRODUCTS, {
    fetchPolicy: 'cache-first',
    errorPolicy: 'all',
  });
  const { data: categoriesData, loading: categoriesLoading, error: categoriesError } = useQuery<any>(GET_DASHBOARD_CATEGORIES, {
    fetchPolicy: 'cache-first',
    errorPolicy: 'all',
  });
  const { data: ordersData, loading: ordersLoading, error: ordersError } = useQuery<any>(GET_DASHBOARD_ORDERS, {
    fetchPolicy: 'cache-first',
    errorPolicy: 'all',
  });

  if (productsError) console.error("Dashboard products query error:", productsError);
  if (categoriesError) console.error("Dashboard categories query error:", categoriesError);
  if (ordersError) console.error("Dashboard orders query error:", ordersError);

  const products = productsData?.products ?? [];
  const categories = categoriesData?.categories ?? [];
  const tenantOrders = ordersData?.tenantOrders ?? [];

  const isLoading = productsLoading || categoriesLoading || ordersLoading;

  // Group orders by month of current year for charts
  const chartData = useMemo(() => {
    const monthlyGroups: Record<string, { sales: number; revenue: number; customers: Set<string> }> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();

    months.forEach((m) => {
      monthlyGroups[m] = { sales: 0, revenue: 0, customers: new Set() };
    });

    tenantOrders.forEach((ord: any) => {
      if (!ord.createdAt) return;
      const date = new Date(ord.createdAt);
      if (date.getFullYear() === currentYear) {
        const monthName = months[date.getMonth()];
        if (monthlyGroups[monthName]) {
          monthlyGroups[monthName].sales += 1;
          monthlyGroups[monthName].revenue += ord.grandTotal || 0;
          if (ord.deliveryAddress?.customerName) {
            monthlyGroups[monthName].customers.add(ord.deliveryAddress.customerName);
          }
        }
      }
    });

    return months.map((m) => ({
      name: m,
      sales: monthlyGroups[m].sales,
      revenue: monthlyGroups[m].revenue,
      customers: monthlyGroups[m].customers.size,
    }));
  }, [tenantOrders]);

  // Derived KPI aggregates
  const totalRevenue = useMemo(() => {
    return tenantOrders.reduce((sum: number, ord: any) => sum + (ord.grandTotal || 0), 0);
  }, [tenantOrders]);

  const uniqueCustomersCount = useMemo(() => {
    return new Set(
      tenantOrders
        .map((ord: any) => ord.deliveryAddress?.customerName)
        .filter(Boolean)
    ).size;
  }, [tenantOrders]);

  // Dynamic low stock alerts
  const lowStockAlerts = useMemo(() => {
    return products
      .filter((p: any) => p.stock !== undefined && p.stock < 15)
      .slice(0, 5)
      .map((p: any) => ({
        id: p.id,
        name: p.title,
        sku: p.sku || 'N/A',
        stock: p.stock,
        status: p.stock < 5 ? 'critical' : 'warning',
      }));
  }, [products]);

  // Dynamic recent orders
  const recentOrders = useMemo(() => {
    return [...tenantOrders]
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map((ord: any) => ({
        id: ord.id,
        customer: ord.deliveryAddress?.customerName || 'Walk-in Customer',
        items: ord.items ? `${ord.items.length} item(s)` : '0 items',
        total: `₹${(ord.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
        status: ord.orderStatus?.toLowerCase() || 'pending',
      }));
  }, [tenantOrders]);

  // Count pending orders
  const pendingOrdersCount = useMemo(() => {
    return tenantOrders.filter((ord: any) => {
      const st = (ord.orderStatus || '').toLowerCase();
      return st === 'pending' || st === 'processing';
    }).length;
  }, [tenantOrders]);

  if (isLoading && !productsData && !ordersData) {
    return <div className="py-12 text-center text-xs text-muted-foreground">Loading dashboard data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Page Title Header */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground m-0">Dashboard</h1>
          <p className="text-xs text-muted-foreground">
            Admin Console. Real-time store performance, products, and sales logs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Showing stats for: </span>
          <span className="text-xs font-semibold px-2.5 py-1 bg-secondary rounded-md border border-border flex items-center gap-1.5 text-foreground">
            <span className="h-2 w-2 rounded-full bg-primary" />
            Current Year ({new Date().getFullYear()})
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Revenue Card */}
        <Card className="hover:border-primary/50 transition-colors bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Revenue</span>
              <div className="text-2xl font-bold text-foreground">₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-500 font-medium">
                <TrendingUp className="h-3 w-3" />
                <span>Live store synced</span>
              </div>
            </div>
            <div className="h-10 w-10 bg-emerald-500/10 border border-emerald-500/20 rounded-md flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Orders Card */}
        <Card className="hover:border-primary/50 transition-colors bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Orders</span>
              <div className="text-2xl font-bold text-foreground">{tenantOrders.length.toLocaleString()}</div>
              <div className="flex items-center gap-1 text-[11px] text-amber-500 font-medium">
                <span>{pendingOrdersCount} Pending / Processing</span>
              </div>
            </div>
            <div className="h-10 w-10 bg-primary/10 border border-primary/20 rounded-md flex items-center justify-center text-primary">
              <ShoppingCart className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Customers Card */}
        <Card className="hover:border-primary/50 transition-colors bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Customers</span>
              <div className="text-2xl font-bold text-foreground">{uniqueCustomersCount.toLocaleString()}</div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-500 font-medium">
                <TrendingUp className="h-3 w-3" />
                <span>Unique purchasers</span>
              </div>
            </div>
            <div className="h-10 w-10 bg-amber-900/10 border border-amber-900/20 rounded-md flex items-center justify-center text-amber-900 dark:text-amber-700">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Low Stock count Card */}
        <Card className="hover:border-primary/50 transition-colors bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Low Stock Items</span>
              <div className="text-2xl font-bold text-red-500">{products.filter((p: any) => p.stock !== undefined && p.stock < 15).length}</div>
              <div className="flex items-center gap-1 text-[11px] text-red-500 font-medium animate-pulse">
                <AlertTriangle className="h-3 w-3" />
                <span>Requires restocking</span>
              </div>
            </div>
            <div className="h-10 w-10 bg-red-500/10 border border-red-500/20 rounded-md flex items-center justify-center text-red-500">
              <Package className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid Section */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Sales & Revenue Chart */}
        <Card className="lg:col-span-2 bg-card">
          <CardHeader>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Revenue Analytics</h3>
              <p className="text-xs text-muted-foreground">Monthly sales volume and earnings distribution.</p>
            </div>
          </CardHeader>
          <CardContent className="p-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0052CC" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0052CC" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <ChartTooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))', 
                    borderRadius: '8px', 
                    color: 'hsl(var(--foreground))',
                    fontSize: '12px'
                  }} 
                />
                <Area type="monotone" dataKey="revenue" stroke="#0052CC" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Customer Growth & Conversion */}
        <Card>
          <CardHeader>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Customer Growth</h3>
              <p className="text-xs text-muted-foreground">Volume of unique shoppers registered monthly.</p>
            </div>
          </CardHeader>
          <CardContent className="p-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <ChartTooltip
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))', 
                    borderRadius: '8px', 
                    color: 'hsl(var(--foreground))',
                    fontSize: '12px'
                  }} 
                />
                <Bar dataKey="customers" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Widgets & Lists Grid */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {/* Recent Orders Widget */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Recent Orders</h3>
                <p className="text-xs text-muted-foreground">Latest transactions processed across store.</p>
              </div>
              <button 
                onClick={() => navigate('/orders')}
                className="text-xs text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                View All <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentOrders.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">No recent orders.</div>
              ) : (
                recentOrders.map((order: any) => (
                  <div key={order.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span 
                          className="text-xs font-bold text-foreground cursor-pointer hover:underline"
                          onClick={() => navigate(`/orders/${order.id}`)}
                        >
                          {order.id}
                        </span>
                        <span className="text-xs text-muted-foreground">{order.customer}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate max-w-[250px]">{order.items}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-xs font-semibold text-foreground">{order.total}</div>
                      <span className={`inline-flex px-1.5 py-0.5 text-[9px] font-semibold rounded-full uppercase ${order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : order.status === 'processing' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' : order.status === 'shipped' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts & System Health */}
        <Card>
          <CardHeader>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Low Stock Inventory Alerts</h3>
              <p className="text-xs text-muted-foreground">Critical alert warnings requiring stock replenishment.</p>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {lowStockAlerts.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">All items fully stocked.</div>
              ) : (
                lowStockAlerts.map((alert: any) => (
                  <div key={alert.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-foreground">{alert.name}</div>
                      <div className="text-[10px] text-muted-foreground">{alert.sku}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs font-bold text-foreground">{alert.stock} left</div>
                        <span className="text-[9px] text-muted-foreground">Threshold: 15</span>
                      </div>
                      <span className={`h-8 w-8 rounded-md flex items-center justify-center shrink-0 ${alert.status === 'critical' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                        <AlertTriangle className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
