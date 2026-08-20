import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, Button } from '@/shared/ui/Primitives';
import { ArrowLeft } from 'lucide-react';
import { useQuery } from '@apollo/client/react';
import { ADMIN_USER_CART } from '@/shared/graphql/queries/customers';
import { GET_ORDERS } from '@/shared/graphql/queries/orders';

export const CustomerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const customerName = location.state?.customerName || 'Customer';

  const { data: cartData, loading: cartLoading } = useQuery<any>(ADMIN_USER_CART, {
    variables: { userId: id },
    skip: !id,
  });

  const { data: ordersData, loading: ordersLoading } = useQuery<any>(GET_ORDERS, {
    skip: !id,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/customers')}
          className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground m-0">Customer Insights: {customerName}</h1>
          <p className="text-xs text-muted-foreground">ID: {id}</p>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Order History */}
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-foreground">Order History</h3>
          </CardHeader>
          <CardContent className="p-4">
            {ordersLoading ? (
              <p className="text-xs text-muted-foreground">Loading orders...</p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {ordersData?.tenantOrders?.filter((o: any) => o.userId === id).length > 0 ? (
                  ordersData.tenantOrders.filter((o: any) => o.userId === id).map((order: any) => (
                    <div key={order.id} className="flex justify-between items-center p-3 bg-muted/20 border border-border rounded-md text-xs">
                      <div>
                        <span className="font-semibold block text-primary cursor-pointer hover:underline" onClick={() => navigate(`/orders/${order.id}`)}>{order.id}</span>
                        <span className="text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold block">₹{(order.grandTotal || 0).toLocaleString('en-IN')}</span>
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground">{order.orderStatus}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground p-4 bg-muted/10 rounded border border-border text-center">No orders found.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Abandoned Cart */}
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-foreground">Abandoned Cart Items</h3>
          </CardHeader>
          <CardContent className="p-4">
            {cartLoading ? (
              <p className="text-xs text-muted-foreground">Loading cart...</p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {cartData?.adminUserCart?.items?.length > 0 ? (
                  cartData.adminUserCart.items.map((item: any) => (
                    <div key={item.id} className="flex gap-3 p-3 bg-muted/20 border border-border rounded-md text-xs items-center">
                      {item.product?.media?.[0]?.mediaUrl ? (
                        <img src={item.product.media[0].mediaUrl} alt={item.product.title} className="h-10 w-10 object-cover rounded border border-border shrink-0" />
                      ) : (
                        <div className="h-10 w-10 bg-secondary rounded border border-border shrink-0 flex items-center justify-center text-[10px] text-muted-foreground">No image</div>
                      )}
                      <div>
                        <span className="font-semibold block">{item.product?.title || 'Unknown Product'}</span>
                        <span className="text-muted-foreground">Quantity: {item.quantity}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground p-4 bg-muted/10 rounded border border-border text-center">Cart is empty.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
