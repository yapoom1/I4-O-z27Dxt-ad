import React, { useRef, useState, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Card, CardContent } from '@/shared/ui/Primitives';
import { Search, SlidersHorizontal, Eye, FileText, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { GET_ORDERS } from '@/shared/graphql/queries/orders';

export const OrderList: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data: rawData, loading, error } = useQuery<any>(GET_ORDERS, {
    variables: {
      status: status || undefined,
    }
  });

  const rawOrders = rawData?.tenantOrders ?? [];
  const orders = useMemo(() => {
    let list = rawOrders;
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter((ord: any) => 
        ord.id.toLowerCase().includes(s) || 
        ord.deliveryAddress?.customerName?.toLowerCase().includes(s)
      );
    }
    return list.map((ord: any) => ({
      id: ord.id,
      customerName: ord.user?.name || ord.deliveryAddress?.customerName || 'Walk-in Customer',
      customerEmail: ord.deliveryAddress?.phoneNumber || 'N/A',
      total: ord.grandTotal || 0,
      itemsCount: ord.items?.reduce((sum: number, it: any) => sum + (it.quantity || 0), 0) || 0,
      paymentMethod: ord.payments?.[0]?.paymentMethod || 'COD',
      gateway: ord.paymentStatus || 'PENDING',
      shippingMethod: ord.deliveryService || 'Standard Shipping',
      date: ord.createdAt || new Date().toISOString(),
      status: ord.orderStatus?.toLowerCase() || 'pending',
    }));
  }, [rawOrders, search]);

  React.useEffect(() => {
    if (orders) {
      console.log("Tenant orders:", orders);
    }
  }, [orders]);

  const parentRef = useRef<HTMLDivElement>(null);

  // Virtualizer setup
  const rowVirtualizer = useVirtualizer({
    count: orders.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 52,
    overscan: 10,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground m-0">Orders & Invoices</h1>
          <p className="text-xs text-muted-foreground">
            Monitor sales records: <span className="font-semibold text-primary">{orders.length.toLocaleString()}</span> orders synced.
          </p>
        </div>
        <button 
          onClick={() => alert('Generating aggregate sales reports in PDF format... Saved successfully.')}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-semibold border border-border cursor-pointer self-start sm:self-auto"
        >
          <Download className="h-4 w-4" /> Export Invoices
        </button>
      </div>

      {/* Filter and Search Panel */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by Order ID, customer name..."
                className="w-full h-9 pl-9 pr-4 rounded-md border border-input bg-card text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`h-9 px-3 rounded-md border text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${showFilters ? 'bg-primary/10 border-primary text-primary' : 'bg-secondary border-border text-foreground hover:bg-secondary/80'}`}
            >
              <SlidersHorizontal className="h-4 w-4" /> Filter Status
            </button>
          </div>

          {showFilters && (
            <div className="p-3 border border-border bg-muted/25 rounded-md text-xs">
              <div className="max-w-xs">
                <label className="block text-muted-foreground font-semibold mb-1">Status Type</label>
                <select
                  className="w-full h-8 rounded border border-border bg-card text-foreground px-2"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="">All Orders</option>
                  <option value="delivered">Delivered</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table container */}
      <Card className="flex flex-col max-h-[580px] overflow-hidden bg-card">
        {/* Table Head */}
        <div className="border-b border-border bg-card/85 sticky top-0 z-10 shrink-0">
          <div className="flex items-center text-xs font-semibold text-muted-foreground border-b border-border select-none uppercase tracking-wider py-3 px-4">
            <div style={{ width: '120px' }}>Order ID</div>
            <div style={{ width: '220px' }}>Customer</div>
            <div style={{ width: '130px' }} className="text-right pr-4">Total Amount</div>
            <div style={{ width: '100px' }} className="text-right pr-4">Items Count</div>
            <div style={{ width: '150px' }}>Payment Method</div>
            <div style={{ width: '140px' }}>Delivery Courier</div>
            <div style={{ width: '120px' }}>Order Date</div>
            <div style={{ width: '110px' }}>Status</div>
            <div style={{ width: '80px' }}>Details</div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div 
          ref={parentRef}
          className="overflow-y-auto min-h-[300px] max-h-[520px] divide-y divide-border"
        >
          {loading && <div className="py-12 text-center text-xs text-muted-foreground">Loading orders...</div>}
          {error && (
            <div className="py-12 text-center text-xs text-muted-foreground">
              <span className="font-semibold text-destructive block mb-1">Orders unavailable</span>
              {error.message || 'Could not load orders. Please check your backend connection.'}
            </div>
          )}
          {!loading && !error && orders.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No orders found matching filters.
            </div>
          ) : (
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const order = orders[virtualRow.index];
                if (!order) return null;
                return (
                  <div
                    key={virtualRow.key}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    className="flex items-center text-xs border-b border-border py-1 px-4 hover:bg-muted/10 transition-colors"
                  >
                    {/* ID */}
                    <div style={{ width: '120px' }} className="font-mono text-muted-foreground">
                      {order.id}
                    </div>

                    {/* Customer */}
                    <div style={{ width: '220px' }} className="font-medium text-foreground truncate pr-4">
                      <div>{order.customerName}</div>
                      <div className="text-[10px] text-muted-foreground font-normal">{order.customerEmail}</div>
                    </div>

                    {/* Total */}
                    <div style={{ width: '130px' }} className="font-semibold text-foreground text-right pr-4">
                      ₹{order.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>

                    {/* Count */}
                    <div style={{ width: '100px' }} className="text-muted-foreground text-right pr-4">
                      {order.itemsCount}x
                    </div>

                    {/* Payment */}
                    <div style={{ width: '150px' }} className="text-muted-foreground truncate pr-2">
                      {order.paymentMethod} • <span className="font-semibold">{order.gateway}</span>
                    </div>

                    {/* Courier */}
                    <div style={{ width: '140px' }} className="text-muted-foreground truncate pr-2">
                      {order.shippingMethod}
                    </div>

                    {/* Date */}
                    <div style={{ width: '120px' }} className="text-muted-foreground">
                      {order.date.split(' ')[0]}
                    </div>

                    {/* Status */}
                    <div style={{ width: '110px' }}>
                      <span className={`inline-flex px-1.5 py-0.5 text-[9px] font-bold rounded-full uppercase border ${order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : order.status === 'processing' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : order.status === 'shipped' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-red-500/10 text-red-600 border-red-500/20'}`}>
                        {order.status}
                      </span>
                    </div>

                    {/* Action */}
                    <div style={{ width: '80px' }}>
                      <button
                        onClick={() => navigate(`/orders/${order.id}`)}
                        className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
