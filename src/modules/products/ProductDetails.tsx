import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { Card, CardContent, CardHeader } from '@/shared/ui/Primitives';
import {
  ArrowLeft, Edit, Package, Clock, Tag, Layers,
  AlertCircle, Box, FileText,
} from 'lucide-react';
import { GET_PRODUCT, GET_PRODUCT_PRICES } from '@/shared/graphql/queries/products';

// ─── helper: format ISO date string ─────────────────────────────────────────
const formatDate = (iso?: string) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
};

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, loading, error } = useQuery<any>(GET_PRODUCT, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  const { data: pricesData } = useQuery<any>(GET_PRODUCT_PRICES, {
    variables: { productId: id },
    skip: !id,
    fetchPolicy: 'cache-first',
  });

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
        <Package className="h-8 w-8 animate-pulse opacity-40" />
        <span className="text-xs">Loading product…</span>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    const e = error as any;
    const msg =
      e.graphQLErrors?.[0]?.message ||
      e.networkError?.message ||
      error.message ||
      'Unknown error';
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <AlertCircle className="h-8 w-8 text-destructive/60" />
        <span className="text-sm font-semibold text-foreground">Failed to load product</span>
        <span className="text-xs text-muted-foreground max-w-md text-center">{msg}</span>
        <button
          onClick={() => navigate('/products')}
          className="mt-2 text-xs text-primary hover:underline font-semibold"
        >
          ← Back to Products
        </button>
      </div>
    );
  }

  // ── Not found ──────────────────────────────────────────────────────────────
  const raw = data?.product;
  if (!raw) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Package className="h-8 w-8 opacity-30" />
        <span className="text-sm font-semibold text-foreground">Product not found</span>
        <span className="text-xs text-muted-foreground">
          No product exists with ID: <code className="font-mono text-[10px] bg-secondary px-1 rounded">{id}</code>
        </span>
        <button
          onClick={() => navigate('/products')}
          className="mt-2 text-xs text-primary hover:underline font-semibold"
        >
          ← Back to Products
        </button>
      </div>
    );
  }

  let mrpText = '—';
  let priceText = '—';
  
  if (pricesData?.productPrices) {
    const prices = pricesData.productPrices;
    const mrpEntry = prices.find((pr: any) => {
      const typeName = (pr.pricingType?.name || pr.pricingType?.type || '').toLowerCase();
      return typeName === 'mrp' || typeName === 'original_price';
    });
    const sellingEntry = prices.find((pr: any) => {
      const typeName = (pr.pricingType?.name || pr.pricingType?.type || '').toLowerCase();
      return typeName === 'selling_price' || typeName === 'selling price' || typeName.includes('selling');
    });
    
    if (mrpEntry?.price != null) {
      mrpText = `₹${Number(mrpEntry.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    }
    if (sellingEntry?.price != null) {
      priceText = `₹${Number(sellingEntry.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    }
  }

  // ── Map backend fields to display shape ────────────────────────────────────
  // Only use fields actually returned by the safe GET_PRODUCT query.
  // Fields not in query → show "—" explicitly.
  const product = {
    id:              raw.id as string,
    name:            raw.title || '—',
    subtitle:        raw.subtitle || '',
    sku:             raw.sku   || '—',
    productType:     raw.productType || '—',
    description:     raw.description || '—',
    descriptionLong: raw.descriptionLong || '',
    stock:           raw.stock ?? 0,
    createdAt:       formatDate(raw.createdAt),
    updatedAt:       formatDate(raw.updatedAt),
    mrp:             mrpText,
    price:           priceText,
    status:          'Active', // backend has no status field
    category:        '—',   // categories not in current query
    thumbnailUrl:    raw.thumbnailMediaId
                       ? `${import.meta.env.VITE_API_BASE_URL}/media/${raw.thumbnailMediaId}`
                       : null,
  };

  return (
    <div className="space-y-6 max-w-5xl">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/products')}
            className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground m-0">{product.name}</h1>
            <p className="text-xs text-muted-foreground">
              SKU: <span className="font-mono">{product.sku}</span>
              {product.subtitle && <> · {product.subtitle}</>}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/products/${product.id}/edit`)}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-secondary text-foreground hover:bg-secondary/80 border border-border text-xs font-semibold cursor-pointer"
        >
          <Edit className="h-3.5 w-3.5" /> Edit Product
        </button>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">

        {/* ── Left / Main column ──────────────────────────────────────────── */}
        <div className="md:col-span-2 space-y-6">

          {/* Product overview card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-6">

                {/* Thumbnail */}
                <div className="shrink-0">
                  {product.thumbnailUrl ? (
                    <img
                      src={product.thumbnailUrl}
                      alt=""
                      className="w-40 h-40 rounded-lg border border-border object-cover bg-muted"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.removeAttribute('style');
                      }}
                    />
                  ) : null}
                  <div
                    className="w-40 h-40 rounded-lg border border-border bg-muted flex items-center justify-center"
                    style={product.thumbnailUrl ? { display: 'none' } : {}}
                  >
                    <Package className="h-12 w-12 text-muted-foreground opacity-30" />
                  </div>
                </div>

                {/* Main info grid */}
                <div className="flex-1 space-y-4">
                  {/* Status / Type badges */}
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex px-2.5 py-1 text-[10px] font-semibold rounded-full border bg-emerald-500/10 text-emerald-600 border-emerald-500/20 uppercase">
                      {product.status}
                    </span>
                    <span className="inline-flex px-2.5 py-1 text-[10px] font-semibold rounded-full border bg-sky-500/10 text-sky-600 border-sky-500/20 uppercase">
                      {product.productType}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>

                  {/* KPI grid */}
                  <div className="grid grid-cols-4 gap-4 pt-2 border-t border-border">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase block font-medium mb-0.5">MRP</span>
                      <span className="text-sm font-bold text-foreground line-through opacity-70">{product.mrp}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase block font-medium mb-0.5">Selling Price</span>
                      <span className="text-sm font-bold text-foreground">{product.price}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase block font-medium mb-0.5">Stock</span>
                      <span className={`text-sm font-bold ${product.stock < 10 ? 'text-red-500' : 'text-foreground'}`}>
                        {product.stock.toLocaleString()} units
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase block font-medium mb-0.5">Category</span>
                      <span className="text-sm font-bold text-foreground">{product.category}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Long Description */}
          {product.descriptionLong && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold text-foreground">Full Description</h3>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {product.descriptionLong}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Low stock warning */}
          {product.stock < 10 && (
            <div className="flex gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-md text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>Inventory critical — only <strong>{product.stock}</strong> units remaining. Consider restocking.</span>
            </div>
          )}
        </div>

        {/* ── Right / Sidebar column ───────────────────────────────────────── */}
        <div className="space-y-6">

          {/* Product metadata */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-1.5">
                <Box className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Product Info</h3>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              {[
                { label: 'Product ID', value: product.id, mono: true },
                { label: 'SKU',        value: product.sku, mono: true },
                { label: 'Type',       value: product.productType },
                { label: 'Stock',      value: `${product.stock.toLocaleString()} units` },
                { label: 'MRP',        value: product.mrp },
                { label: 'Selling Price', value: product.price },
                { label: 'Category',   value: product.category },
              ].map(({ label, value, mono }) => (
                <div key={label} className="flex justify-between gap-2 pb-2 border-b border-border last:border-0 last:pb-0">
                  <span className="text-muted-foreground shrink-0">{label}</span>
                  <span
                    className={`font-semibold text-foreground text-right truncate ${mono ? 'font-mono text-[10px]' : ''}`}
                    title={value}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Shipping & Dimensions */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-1.5">
                <Box className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Shipping & Dimensions</h3>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              {[
                { label: 'Weight', value: `${(raw.shippingDimensions?.weight ?? raw.shipping?.weight) ?? 0.5} kg` },
                { label: 'Length', value: `${(raw.shippingDimensions?.length ?? raw.shipping?.length) ?? 10.0} cm` },
                { label: 'Width',  value: `${(raw.shippingDimensions?.width ?? raw.shipping?.width) ?? 10.0} cm` },
                { label: 'Height', value: `${(raw.shippingDimensions?.height ?? raw.shipping?.height) ?? 10.0} cm` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between gap-2 pb-2 border-b border-border last:border-0 last:pb-0">
                  <span className="text-muted-foreground shrink-0">{label}</span>
                  <span className="font-semibold text-foreground text-right">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Timestamps</h3>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-medium">Created</span>
                <p className="text-foreground font-medium">{product.createdAt}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-medium">Last Updated</span>
                <p className="text-foreground font-medium">{product.updatedAt}</p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};
