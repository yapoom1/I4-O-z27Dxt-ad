import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/shared/ui/Primitives';
import {
  Search, ShoppingCart, Barcode, Printer, Trash2,
  Plus, Minus, CreditCard, AlertCircle, Package,
} from 'lucide-react';
import { useQuery, useMutation, useLazyQuery, useApolloClient } from '@apollo/client/react';
import { GET_PRODUCTS, GET_PRICING_TYPES, GET_PRODUCT_PRICES } from '@/shared/graphql/queries/products';
import { GET_ORDERS, GET_MY_ADDRESSES, GET_DELIVERY_QUOTES } from '@/shared/graphql/queries/orders';
import {
  CLEAR_CART, ADD_TO_CART, SELECT_DELIVERY_OPTION,
  CHECKOUT_CART, CREATE_USER_ADDRESS
} from '@/shared/graphql/mutations/orders';

import laptopImg from '@/assets/products/laptop.png';
import chargerImg from '@/assets/products/charger.png';
import keyboardImg from '@/assets/products/keyboard.png';
import phoneImg from '@/assets/products/phone.png';
import watchImg from '@/assets/products/watch.png';
import headphonesImg from '@/assets/products/headphones.png';


// ─── Module-level image resolver (no closure issues) ─────────────────────────
const PRODUCT_IMAGE_MAP: Record<string, string> = {
  'lumina ultra 14 laptop': laptopImg,
  'nova 3-in-1 wireless charging pad': chargerImg,
  'apex pro mechanical keyboard': keyboardImg,
  'velo phone 12 pro 5g': phoneImg,
  'aurawatch series 5 smartwatch': watchImg,
  'soundpulse pro anc headphones': headphonesImg,
};

function fallbackProductImage(name: string): string {
  console.log("Product Name:", name);

  const lower = name.toLowerCase().trim();

  if (lower.includes("laptop")) return laptopImg;
  if (lower.includes("headphones")) return headphonesImg;
  if (lower.includes("keyboard")) return keyboardImg;
  if (lower.includes("pad")) return chargerImg;
  if (lower.includes("watch")) return watchImg;
  if (lower.includes("phone")) return phoneImg;

  console.log("No Match:", lower);

  return phoneImg;
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface CartItem {
  id: string;
  name: string;
  sku: string;
  /** null = price not available from backend */
  price: number | null;
  qty: number;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const POSTerminal: React.FC = () => {
  const [catalogSearch, setCatalogSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptDetails, setReceiptDetails] = useState<any>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Mutations
  const [clearCart] = useMutation<any>(CLEAR_CART);
  const [addToCart] = useMutation<any>(ADD_TO_CART);
  const [selectDeliveryOption] = useMutation<any>(SELECT_DELIVERY_OPTION);
  const [checkoutCart] = useMutation<any>(CHECKOUT_CART);
  const [createUserAddress] = useMutation<any>(CREATE_USER_ADDRESS);

  // Queries
  const { data: addressesData, refetch: refetchAddresses } = useQuery<any>(GET_MY_ADDRESSES);
  const [getDeliveryQuotes] = useLazyQuery<any>(GET_DELIVERY_QUOTES, {
    fetchPolicy: 'network-only'
  });

  // ── Fetch real products from backend ────────────────────────────────────────
  const { data, loading, error } = useQuery<any>(GET_PRODUCTS, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  const client = useApolloClient();
  const { data: pricingTypesData } = useQuery<any>(GET_PRICING_TYPES);
  const [productPrices, setProductPrices] = useState<Record<string, any[]>>({});

  React.useEffect(() => {
    if (!data?.products) return;

    const fetchAllPrices = async () => {
      const pricesMap: Record<string, any[]> = {};
      await Promise.all(
        data.products.map(async (p: any) => {
          try {
            const res = await client.query({
              query: GET_PRODUCT_PRICES,
              variables: { productId: p.id },
              fetchPolicy: 'network-only',
            });
            console.log(`[POS] Product ${p.id} prices response:`, (res.data as any)?.productPrices);
            pricesMap[p.id] = (res.data as any)?.productPrices ?? [];
          } catch (err) {
            console.error(`Failed to fetch prices for product ${p.id}:`, err);
            pricesMap[p.id] = [];
          }
        })
      );
      setProductPrices(pricesMap);
    };

    fetchAllPrices();
  }, [data?.products, client]);

  const sellingPriceType = useMemo(() => {
    return pricingTypesData?.pricingTypes?.find(
      (pt: any) => {
        const name = (pt.name || pt.type || pt.id || '').toLowerCase();
        return name === 'selling_price' || name === 'selling price' || name.includes('selling');
      }
    );
  }, [pricingTypesData]);


  // ── Build catalog from backend data, filter client-side by search ───────────
  const catalog = useMemo(() => {
    const raw: any[] = data?.products ?? [];
    console.log("All Products:", raw);
    const mapped = raw.map((p: any) => {
      const prices = productPrices[p.id] || [];
      const sellingPriceEntry = prices.find(
        (priceObj: any) => {
          const typeName = (priceObj.pricingType?.name || priceObj.pricingType?.type || '').toLowerCase();
          return (
            typeName === 'selling_price' ||
            typeName === 'selling price' ||
            typeName.includes('selling') ||
            (sellingPriceType?.id && priceObj.pricingTypeId === sellingPriceType.id)
          );
        }
      );
      const price = sellingPriceEntry ? sellingPriceEntry.price : null;

      const dynamicUrl = p.thumbnail?.mediaUrl;

      return {
        id: p.id as string,
        name: p.title || '—',
        sku: p.sku || p.id.slice(0, 8).toUpperCase(),
        productType: p.productType || 'GOODS',
        stock: p.stock ?? null,
        price,
        thumbnailUrl: dynamicUrl || fallbackProductImage(p.title || ''),
      };
    });

    if (!catalogSearch.trim()) return mapped;
    const s = catalogSearch.toLowerCase();
    return mapped.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.sku.toLowerCase().includes(s)
    );
  }, [data, catalogSearch, productPrices, sellingPriceType]);

  // ── Cart actions ─────────────────────────────────────────────────────────────
  const handleAddToCart = (product: typeof catalog[0]) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [
        ...prev,
        { id: product.id, name: product.name, sku: product.sku, price: product.price, qty: 1 },
      ];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0)
    );
  };

  // ── Totals ──────────────────────────────────────────────────────────────────
  const priceUnavailable = cart.some((item) => item.price === null);
  const subtotal = priceUnavailable
    ? null
    : cart.reduce((sum, item) => sum + (item.price as number) * item.qty, 0);
  const tax = subtotal !== null ? subtotal * 0.08 : null;
  const total = subtotal !== null && tax !== null ? subtotal + tax : null;

  // ── Checkout ──────────────────────────────────────────────────────────────
  const handleCheckout = async (method: string) => {
    if (cart.length === 0) return alert('Cart is empty.');
    if (priceUnavailable) {
      alert('Cannot checkout: Selling price not configured for this product.');
      return;
    }

    setCheckoutLoading(true);
    try {
      // Step 1: Clear backend cart first to prevent mixing with stale sessions
      await clearCart();

      // Step 2: Sequentially add all local cart items to the backend cart
      for (const item of cart) {
        await addToCart({
          variables: {
            productId: item.id,
            quantity: item.qty
          }
        });
      }

      // Step 3: Get first address or create a default primary address
      let addressId = addressesData?.myAddresses?.[0]?.id;
      if (!addressId) {
        const { data: addressRes } = await createUserAddress({
          variables: {
            input: {
              addressLine1: "POS Counter 1",
              pincode: "400001",
              state: "Maharashtra",
              district: "Mumbai",
              customerName: "Walk-in Customer",
              phoneNumber: "9876543210",
              isPrimary: true
            }
          }
        });
        addressId = addressRes?.createUserAddress?.id;
        if (refetchAddresses) {
          await refetchAddresses();
        }
      }

      if (!addressId) {
        throw new Error("Could not retrieve or create a delivery address.");
      }

      // Step 4: Fetch available delivery quotes and select delivery option if available
      let serviceName: string | null = null;
      try {
        const { data: quotesRes } = await getDeliveryQuotes({
          variables: { addressId }
        });
        const quotes = quotesRes?.deliveryQuotes || [];
        if (quotes.length > 0) {
          serviceName = quotes[0].serviceName;
        }
      } catch (quoteErr) {
        console.warn("Failed to fetch delivery quotes:", quoteErr);
      }

      if (serviceName) {
        await selectDeliveryOption({
          variables: {
            addressId,
            serviceName
          }
        });
      } else {
        console.log("No valid delivery service option found or backend allows skipping. Proceeding without selectDeliveryOption.");
      }

      // Step 5: Checkout cart with payment method
      const paymentMethod = method === 'Cash' ? 'CASH' : 'COD';
      const { data: checkoutRes } = await checkoutCart({
        variables: {
          paymentMethod
        },
        refetchQueries: [{ query: GET_ORDERS }],
        awaitRefetchQueries: true
      });

      const order = checkoutRes?.checkoutCart;
      if (!order) {
        throw new Error("Checkout failed on backend. No order was generated.");
      }

      setReceiptDetails({
        id: order.id,
        items: [...cart],
        subtotal,
        tax,
        total,
        paymentMethod: method,
        date: new Date().toLocaleString(),
      });
      setCart([]);
      setShowReceipt(true);
    } catch (err: any) {
      console.error("[POS checkout failed]:", err);
      alert("Checkout failed: " + (err.graphQLErrors?.[0]?.message || err.message));
    } finally {
      setCheckoutLoading(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground m-0">POS Terminal</h1>
          <p className="text-xs text-muted-foreground">
            In-store billing · real catalog from backend ·{' '}
            {loading ? 'loading…' : `${data?.products?.length ?? 0} products`}
          </p>
        </div>

        {/* Barcode scan — disabled until backend barcode lookup is available */}
        <button
          disabled
          title="Barcode lookup endpoint not yet available on backend"
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md bg-muted text-muted-foreground text-xs font-semibold border border-border cursor-not-allowed opacity-60"
        >
          <Barcode className="h-4 w-4" /> Barcode Scan (Coming Soon)
        </button>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">

        {/* ── Left: Product Catalog ────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="p-3">
              <div className="relative w-full">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by product name or SKU…"
                  className="w-full h-9 pl-9 pr-4 rounded-md border border-input bg-card text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                />
              </div>
            </CardHeader>

            <CardContent className="p-4 overflow-y-auto max-h-[460px]">

              {/* Loading */}
              {loading && (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-30 animate-pulse" />
                  Loading products from backend…
                </div>
              )}

              {/* Error */}
              {error && !loading && (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  <AlertCircle className="h-6 w-6 mx-auto mb-2 text-destructive/60" />
                  <span className="font-semibold text-foreground block mb-1">Failed to load products</span>
                  {(error as any).graphQLErrors?.[0]?.message || error.message}
                </div>
              )}

              {/* Empty */}
              {!loading && !error && catalog.length === 0 && (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  {catalogSearch.trim()
                    ? 'No products match your search.'
                    : 'No products available in backend.'}
                </div>
              )}

              {/* Product grid */}
              {!loading && !error && catalog.length > 0 && (
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                  {catalog.map((product) => (

                    console.log(product.name, product.thumbnailUrl),
                    <div
                      key={product.id}
                      onClick={() => handleAddToCart(product)}
                      className="p-2 border border-border bg-card hover:border-primary rounded-lg cursor-pointer transition-all flex flex-col justify-between h-40 group hover:shadow-md"
                    >
                      {/* Product image — always shown, falls back to local asset */}
                      <img
                        src={product.thumbnailUrl ?? laptopImg}
                        alt={product.name}
                        className="h-20 w-full object-cover rounded bg-muted shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = laptopImg;
                        }}
                      />

                      <div className="pt-2">
                        <div className="text-[10px] font-bold text-foreground truncate" title={product.name}>
                          {product.name}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] text-muted-foreground font-mono truncate">
                            {product.sku}
                          </span>
                          {/* Price: show actual configured selling price if available */}
                          <span className="text-[10px] font-semibold text-foreground ml-1 shrink-0">
                            {product.price !== null ? `$${Number(product.price).toFixed(2)}` : '—'}
                          </span>
                        </div>
                        {product.stock !== null && (
                          <div className={`text-[9px] mt-0.5 ${product.stock < 5 ? 'text-red-500 font-semibold' : 'text-muted-foreground'}`}>
                            Stock: {product.stock}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Right: Cart & Checkout ───────────────────────────────────────── */}
        <div className="space-y-4">
          <Card className="flex flex-col h-[520px]">
            <CardHeader>
              <div className="flex items-center gap-1.5">
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Current Bill</h3>
                {cart.length > 0 && (
                  <span className="ml-auto text-[10px] text-muted-foreground">
                    {cart.reduce((s, i) => s + i.qty, 0)} item(s)
                  </span>
                )}
              </div>
            </CardHeader>

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto p-4 divide-y divide-border min-h-0 text-xs">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground gap-1">
                  <AlertCircle className="h-8 w-8 opacity-40" />
                  <span>Cart is empty.</span>
                  <span className="text-[10px]">Click a product to add it.</span>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="truncate flex-1">
                      <span className="font-semibold text-foreground block truncate">{item.name}</span>
                      <span className="text-muted-foreground text-[10px] font-mono">{item.sku}</span>
                      <span className="text-muted-foreground text-[10px] block">
                        Price: {item.price !== null ? `$${item.price.toFixed(2)}` : '—'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center border border-border rounded bg-secondary h-7">
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="h-full px-2 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-1 text-xs font-semibold text-foreground">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="h-full px-2 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => updateQty(item.id, -item.qty)}
                        className="text-muted-foreground hover:text-destructive cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Totals & checkout */}
            <div className="p-4 bg-muted/15 border-t border-border space-y-3 text-xs shrink-0">
              {/* Price unavailable notice */}
              {priceUnavailable && cart.length > 0 && (
                <div className="flex gap-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-destructive text-[10px]">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span>Selling price not configured for this product</span>
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{subtotal !== null ? `$${subtotal.toFixed(2)}` : '—'}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>VAT (8%)</span>
                  <span>{tax !== null ? `$${tax.toFixed(2)}` : '—'}</span>
                </div>
                <div className="flex justify-between text-foreground font-bold text-sm border-t border-border pt-1.5">
                  <span>Total Bill</span>
                  <span>{total !== null ? `$${total.toFixed(2)}` : '—'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleCheckout('Credit Card')}
                  disabled={cart.length === 0 || checkoutLoading || priceUnavailable}
                  className="h-9 rounded bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-semibold shadow cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkoutLoading ? 'Processing...' : (
                    <>
                      <CreditCard className="h-4 w-4" /> Card Pay
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleCheckout('Cash')}
                  disabled={cart.length === 0 || checkoutLoading || priceUnavailable}
                  className="h-9 rounded bg-secondary hover:bg-secondary/80 border border-border text-foreground text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkoutLoading ? 'Processing...' : 'Cash Pay'}
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ── Receipt Modal ──────────────────────────────────────────────────── */}
      {showReceipt && receiptDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-card border border-border shadow-2xl rounded-lg p-5 flex flex-col">
            <div className="text-center space-y-1.5 border-b border-border pb-3">
              <Printer className="h-6 w-6 text-primary mx-auto" />
              <h2 className="text-base font-bold text-foreground">Transaction Receipt</h2>
              <p className="text-[10px] text-muted-foreground">{receiptDetails.date}</p>
            </div>

            <div className="py-4 space-y-3 border-b border-border text-xs">
              <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
                <span>Receipt Ref:</span>
                <span>{receiptDetails.id}</span>
              </div>
              <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
                <span>Payment Mode:</span>
                <span>{receiptDetails.paymentMethod}</span>
              </div>
              <div className="space-y-1.5 pt-2 border-t border-dashed border-border">
                {receiptDetails.items.map((item: CartItem) => (
                  <div key={item.id} className="flex justify-between text-xs text-foreground">
                    <span className="truncate max-w-[200px]">{item.name} ×{item.qty}</span>
                    <span className="font-semibold">
                      {item.price !== null ? `$${(item.price * item.qty).toFixed(2)}` : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="py-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal:</span>
                <span>{receiptDetails.subtotal !== null ? `$${receiptDetails.subtotal.toFixed(2)}` : '—'}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax VAT:</span>
                <span>{receiptDetails.tax !== null ? `$${receiptDetails.tax.toFixed(2)}` : '—'}</span>
              </div>
              <div className="flex justify-between text-foreground font-bold text-sm border-t border-border pt-1.5">
                <span>Total Amount:</span>
                <span>{receiptDetails.total !== null ? `$${receiptDetails.total.toFixed(2)}` : '—'}</span>
              </div>
            </div>

            <button
              onClick={() => setShowReceipt(false)}
              className="w-full h-9 bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-semibold rounded cursor-pointer mt-4"
            >
              Close & New Sale
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
