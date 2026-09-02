import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, Badge, Button } from '@/shared/ui/Primitives';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_ORDER } from '@/shared/graphql/queries/orders';
import { UPDATE_ORDER_DELIVERY_STATUS, UPDATE_ORDER_PAYMENT_STATUS } from '@/shared/graphql/mutations/orders';
import {
  ArrowLeft, FileText, Printer, CheckCircle, Package, 
  Truck, ShieldAlert, CreditCard, RefreshCw 
} from 'lucide-react';

export const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, loading, error } = useQuery<any>(GET_ORDER, {
    variables: { id },
  });

  const [updateStatus, { loading: updating }] = useMutation(UPDATE_ORDER_DELIVERY_STATUS);
  const [updatePayment, { loading: updatingPayment }] = useMutation(UPDATE_ORDER_PAYMENT_STATUS);

  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('');

  const rawOrder = data?.order;
  const order = useMemo(() => {
    if (!rawOrder) return null;
    const activeAddress = rawOrder.deliveryAddress || (rawOrder.user?.addresses?.length > 0 ? rawOrder.user.addresses[0] : null);
    const customerName = activeAddress?.customerName || rawOrder.user?.name || 'Walk-in Customer';
    const customerEmail = rawOrder.user?.email || 'N/A';
    const customerPhone = activeAddress?.phoneNumber || rawOrder.user?.mobilenumber || 'N/A';

    return {
      id: rawOrder.id,
      userId: rawOrder.userId || rawOrder.user?.id,
      customerName,
      customerEmail,
      customerPhone,
      total: rawOrder.grandTotal || 0,
      itemTotal: rawOrder.itemTotal || 0,
      discountApplied: rawOrder.discountApplied || 0,
      tax: rawOrder.tax || 0,
      deliveryFee: rawOrder.deliveryFee || 0,
      itemsCount: rawOrder.items?.reduce((sum: number, it: any) => sum + (it.quantity || 0), 0) || 0,
      paymentMethod: rawOrder.paymentStatus || 'COD',
      gateway: rawOrder.paymentStatus || 'PENDING',
      shippingMethod: rawOrder.deliveryService || 'Standard Shipping',
      date: rawOrder.createdAt || new Date().toISOString(),
      status: rawOrder.orderStatus?.toLowerCase() || 'pending',
      deliveryAddress: activeAddress,
      items: rawOrder.items || [],
      user: rawOrder.user,
    };
  }, [rawOrder]);

  const steps = useMemo(() => {
    if (!order) return [];
    console.log("Raw Order Data from Backend:", rawOrder);
    
    const status = order.status;
    const orderDate = new Date(order.date);
    const dateStr = !isNaN(orderDate.getTime()) 
      ? orderDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : order.date;
    const timeStr = !isNaN(orderDate.getTime())
      ? orderDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      : '';

    const isProcessing = ['processing', 'shipped', 'delivered'].includes(status);
    const isShipped = ['shipped', 'delivered'].includes(status);
    const isDelivered = status === 'delivered';
    const isCancelled = status === 'cancelled';

    if (isCancelled) {
      return [
        { title: 'Order Placed', time: `${dateStr} ${timeStr}`.trim(), desc: 'Order was placed by client.', icon: CreditCard, done: true },
        { title: 'Order Cancelled', time: 'Cancelled', desc: 'This order has been cancelled.', icon: ShieldAlert, done: true },
      ];
    }

    return [
      { title: 'Order Placed', time: `${dateStr} ${timeStr}`.trim(), desc: 'Order placed by client.', icon: CreditCard, done: true },
      { title: 'Processing', time: isProcessing ? 'Completed' : 'Pending', desc: isProcessing ? 'Order is being processed.' : 'Awaiting fulfillment.', icon: Package, done: isProcessing },
      { title: 'Shipped', time: isShipped ? 'Dispatched' : 'Pending', desc: `Shipping via ${order.shippingMethod}.`, icon: Truck, done: isShipped },
      { title: 'Delivered', time: isDelivered ? 'Delivered' : 'Pending', desc: isDelivered ? 'Delivered to customer.' : 'Awaiting courier delivery confirmation.', icon: CheckCircle, done: isDelivered },
    ];
  }, [order]);

  if (loading) return <div className="p-4 text-center text-xs text-muted-foreground">Loading order details...</div>;
  if (error) {
    return (
      <div className="p-4 text-center text-xs text-red-500">
        <span className="font-semibold block mb-1">Error loading order</span>
        {error.message || 'Please check your connection and try again.'}
      </div>
    );
  }
  if (!order) return <div className="p-4 text-center text-xs text-muted-foreground">Order not found.</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/orders')}
            className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground m-0">Order: {order.id}</h1>
            <p className="text-xs text-muted-foreground">
              Date: {new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} • Payment: {order.gateway} • Delivery: {order.shippingMethod}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowInvoice(true)}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md bg-secondary text-foreground hover:bg-secondary/80 border border-border text-xs font-semibold cursor-pointer"
          >
            <Printer className="h-4 w-4" /> Invoice Preview
          </button>
          <select
            className="h-9 px-2 rounded-md border border-border bg-card text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
            value={selectedStatus || order.status}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
          <Button 
            variant="primary" 
            size="sm" 
            className="h-9"
            disabled={updating || (selectedStatus !== '' && selectedStatus === order.status)}
            onClick={async () => {
              const statusToSave = selectedStatus || order.status;
              try {
                await updateStatus({ variables: { orderId: order.id, status: statusToSave } });
                window.dispatchEvent(new CustomEvent('toast', { detail: { message: 'Order status updated successfully', type: 'success' } }));
              } catch (err: any) {
                console.error(err);
                window.dispatchEvent(new CustomEvent('toast', { detail: { message: 'Failed to update status', type: 'error' } }));
              }
            }}
          >
            {updating ? 'Saving...' : 'Save'}
          </Button>

          {/* Payment Status Dropdown */}
          <div className="flex items-center gap-2 border-l border-border pl-2 ml-1">
            <select
              className="h-9 px-2 rounded-md border border-border bg-card text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
              value={selectedPaymentStatus || order.gateway}
              onChange={(e) => setSelectedPaymentStatus(e.target.value)}
            >
              <option value="UNPAID">Unpaid</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
              <option value="REFUNDED">Refunded</option>
              <option value="FAILED">Failed</option>
            </select>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9"
              disabled={updatingPayment || (selectedPaymentStatus !== '' && selectedPaymentStatus === order.gateway)}
              onClick={async () => {
                const statusToSave = selectedPaymentStatus || order.gateway;
                try {
                  await updatePayment({ variables: { orderId: order.id, status: statusToSave } });
                  window.dispatchEvent(new CustomEvent('toast', { detail: { message: 'Payment status updated successfully', type: 'success' } }));
                } catch (err: any) {
                  console.error(err);
                  window.dispatchEvent(new CustomEvent('toast', { detail: { message: 'Failed to update payment status', type: 'error' } }));
                }
              }}
            >
              {updatingPayment ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        {/* Left Side Billing, Items */}
        <div className="md:col-span-2 space-y-6">
          {/* Order items List */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-foreground">Items Ordered</h3>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border">
              {order.items.map((item: any) => (
                <div key={item.id} className="p-4 flex justify-between items-center text-xs">
                  <div className="flex gap-3">
                    {item.product?.thumbnail?.mediaUrl ? (
                      <img 
                        src={item.product.thumbnail.mediaUrl} 
                        alt={item.product.title} 
                        className="h-10 w-10 object-cover rounded border border-border shrink-0"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-secondary rounded border border-border shrink-0 flex items-center justify-center text-[10px] text-muted-foreground">
                        No image
                      </div>
                    )}
                    <div>
                      <span className="font-semibold text-foreground block">{item.product?.title || 'Unknown Product'}</span>
                      <span className="text-muted-foreground">SKU: {item.product?.sku || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-foreground block">₹{(item.unitPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    <span className="text-muted-foreground">{item.quantity}x Qty</span>
                  </div>
                </div>
              ))}

              {/* Summary calculations */}
              <div className="p-4 space-y-2 text-xs bg-muted/10">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{order.itemTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                {order.discountApplied > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Discount Applied</span>
                    <span>-₹{order.discountApplied.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>CGST (9%)</span>
                  <span>₹{(order.tax / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>SGST (9%)</span>
                  <span>₹{(order.tax / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping ({order.shippingMethod})</span>
                  <span>₹{order.deliveryFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-foreground font-bold text-sm pt-1 border-t border-border">
                  <span>Total Amount Paid</span>
                  <span>₹{order.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline Process */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-foreground">Fulfilment Timeline</h3>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative border-l-2 border-border pl-6 space-y-6">
                {steps.map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <div key={idx} className="relative">
                      {/* Timeline Dot Indicator */}
                      <span className={`absolute -left-[31px] top-0.5 h-4 w-4 rounded-full flex items-center justify-center border-2 ${step.done ? 'bg-primary border-primary text-primary-foreground' : 'bg-card border-border'}`}>
                        {step.done && <span className="h-1.5 w-1.5 rounded-full bg-background" />}
                      </span>
                      <div className="text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-semibold ${step.done ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>
                            {step.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground">• {step.time}</span>
                        </div>
                        <p className="text-muted-foreground mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side Customer details */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Client / Customer Profile</h3>
              {order.userId && (
                <button
                  onClick={() => navigate(`/customers/${order.userId}`, { state: { customerName: order.customerName } })}
                  className="text-xs text-primary hover:underline font-medium cursor-pointer"
                >
                  View Profile
                </button>
              )}
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-medium">Customer Name</span>
                <span className="text-foreground block font-semibold">{order.customerName}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-medium">Contact Email</span>
                <span className="text-foreground block">{order.customerEmail}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-medium">Phone Number</span>
                <span className="text-foreground block">{order.customerPhone}</span>
              </div>
              <div className="border-t border-border pt-3">
                <span className="text-[10px] text-muted-foreground uppercase font-medium block">Shipping Address</span>
                {order.deliveryAddress ? (
                  <span className="text-foreground block leading-relaxed">
                    {order.deliveryAddress.customerName && order.deliveryAddress.customerName !== order.customerName && (
                      <span className="font-semibold text-foreground block">{order.deliveryAddress.customerName}</span>
                    )}
                    {order.deliveryAddress.addressLine1}
                    {order.deliveryAddress.addressLine2 && <><br />{order.deliveryAddress.addressLine2}</>}
                    {order.deliveryAddress.landmark && <><br />Landmark: {order.deliveryAddress.landmark}</>}
                    <br />
                    {order.deliveryAddress.district && `${order.deliveryAddress.district}, `}
                    {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                    {order.deliveryAddress.phoneNumber && (
                      <span className="text-muted-foreground block mt-1">Delivery Contact: {order.deliveryAddress.phoneNumber}</span>
                    )}
                  </span>
                ) : (
                  <span className="text-muted-foreground block">No shipping address provided.</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-foreground">Courier Logistics</h3>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-medium">Fulfillment Provider</span>
                <span className="text-foreground block font-semibold">{order.shippingMethod}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-medium">Order Reference ID</span>
                <span className="text-primary font-mono block">
                  {order.id}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Invoice Modal Overlay */}
      {showInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-card border border-border shadow-2xl rounded-lg p-6 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span className="text-base font-bold text-foreground">Invoice #{order.id}</span>
              </div>
              <button 
                onClick={() => setShowInvoice(false)}
                className="text-xs text-muted-foreground hover:text-foreground font-semibold cursor-pointer border border-border px-2 py-1 rounded hover:bg-secondary"
              >
                Close Preview
              </button>
            </div>
            
            {/* Invoice Layout */}
            <div className="overflow-y-auto p-4 space-y-6 text-xs text-foreground bg-white text-black rounded border border-gray-200 mt-4 font-sans">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 m-0">Store Invoice</h2>
                  <p className="text-gray-500">Order Ref: {order.id}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">INVOICE</div>
                  <p className="text-gray-500">Date: {new Date(order.date).toLocaleDateString('en-IN')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-b border-gray-200 py-4">
                <div>
                  <span className="text-gray-400 font-bold block">BILLED TO:</span>
                  <span className="text-gray-800 font-semibold block">{order.customerName}</span>
                  {order.customerEmail !== 'N/A' && <span className="text-gray-600 block">{order.customerEmail}</span>}
                  {order.customerPhone !== 'N/A' && <span className="text-gray-600 block">Phone: {order.customerPhone}</span>}
                  {order.deliveryAddress && (
                    <span className="text-gray-500 block text-[11px] mt-1 leading-snug">
                      {order.deliveryAddress.addressLine1}
                      {order.deliveryAddress.addressLine2 && `, ${order.deliveryAddress.addressLine2}`}
                      <br />
                      {order.deliveryAddress.district && `${order.deliveryAddress.district}, `}
                      {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-gray-400 font-bold block">SHIPPED VIA:</span>
                  <span className="text-gray-800 block font-semibold">{order.shippingMethod}</span>
                  <span className="text-gray-500 block">Status: {order.status.toUpperCase()}</span>
                  <span className="text-gray-500 block">Payment: {order.gateway}</span>
                </div>
              </div>

              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 font-bold">
                    <th className="py-2">Description</th>
                    <th className="py-2 text-right">Qty</th>
                    <th className="py-2 text-right">Unit Price</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item: any) => (
                    <tr key={item.id} className="border-b border-gray-100 text-gray-700">
                      <td className="py-3 font-semibold">{item.product?.title || 'Unknown Product'}</td>
                      <td className="py-3 text-right">{item.quantity}</td>
                      <td className="py-3 text-right">₹{(item.unitPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="py-3 text-right font-semibold">₹{(item.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end pt-4">
                <div className="w-48 space-y-2">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal:</span>
                    <span>₹{order.itemTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  {order.discountApplied > 0 && (
                    <div className="flex justify-between text-gray-500">
                      <span>Discount:</span>
                      <span>-₹{order.discountApplied.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-500">
                    <span>CGST (9%):</span>
                    <span>₹{(order.tax / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>SGST (9%):</span>
                    <span>₹{(order.tax / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Shipping fee:</span>
                    <span>₹{order.deliveryFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-gray-900 font-bold text-sm border-t border-gray-200 pt-2">
                    <span>Amount Due:</span>
                    <span>₹{order.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
              <button 
                onClick={() => {
                  window.print();
                }}
                className="h-8 px-4 bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-semibold rounded cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="h-3.5 w-3.5" /> Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
