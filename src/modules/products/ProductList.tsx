import React, { useRef, useState, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Card, CardContent } from '@/shared/ui/Primitives';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  Search, SlidersHorizontal, Plus, Download, Edit,
  Trash2, Eye, Tag, Package,
} from 'lucide-react';
import { GET_PRODUCTS, GET_PRODUCT_PRICES } from '@/shared/graphql/queries/products';
import { DELETE_PRODUCT } from '@/shared/graphql/mutations/products';
import { useNavigate } from 'react-router-dom';

import laptopImg from '@/assets/products/laptop.png';
import chargerImg from '@/assets/products/charger.png';
import keyboardImg from '@/assets/products/keyboard.png';
import phoneImg from '@/assets/products/phone.png';
import watchImg from '@/assets/products/watch.png';
import headphonesImg from '@/assets/products/headphones.png';

const ProductPriceCell: React.FC<{ productId: string, type?: 'mrp' | 'selling_price' }> = ({ productId, type = 'selling_price' }) => {
  const { data, loading, error } = useQuery<any>(GET_PRODUCT_PRICES, {
    variables: { productId },
    fetchPolicy: 'cache-first',
  });

  if (loading) return <span className="text-[10px] text-muted-foreground">loading...</span>;
  if (error) return <span className="text-destructive font-semibold">—</span>;

  const productPrices = data?.productPrices || [];
  
  const priceEntry = productPrices.find((pr: any) => {
    const typeName = (pr.pricingType?.name || pr.pricingType?.type || '').toLowerCase();
    if (type === 'mrp') return typeName === 'mrp' || typeName === 'original_price';
    return typeName === 'selling_price' || typeName === 'selling price' || typeName.includes('selling');
  });

  const price = priceEntry?.price;
  return <span>{price != null ? `₹${Number(price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}</span>;
};

import { GET_MEDIA_ITEM } from '@/shared/graphql/queries/media';

const ProductThumbnail: React.FC<{ mediaId: string }> = ({ mediaId }) => {
  const { data } = useQuery<any>(GET_MEDIA_ITEM, {
    variables: { id: mediaId },
    fetchPolicy: 'cache-first',
  });

  const url = data?.media?.mediaUrl;

  if (!url) {
    return (
      <div className="h-8 w-8 rounded border border-border bg-muted flex items-center justify-center">
        <Package className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt=""
      className="h-8 w-8 rounded border border-border object-cover"
      loading="lazy"
      onError={(e) => {
        const t = e.target as HTMLImageElement;
        t.style.display = 'none';
        t.nextElementSibling?.removeAttribute('style');
      }}
    />
  );
};

// ─── Column widths (px) – keep consistent between header and body rows ────
const COL = {
  image:   48,
  name:    180,
  brand:   100,
  sku:     110,
  category:100,
  mrp:     80,
  price:   80,
  stock:   70,
  status:  80,
  actions: 96,
} as const;

export const ProductList: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch]     = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // ─── visible columns toggle ──────────────────────────────────────────────
  const [visibleColumns, setVisibleColumns] = useState({
    image:    true,
    name:     true,
    brand:    true,
    sku:      true,
    category: true,
    mrp:      true,
    price:    true,
    stock:    true,
    status:   true,
    actions:  true,
  });

  const [deleteProduct] = useMutation<any>(DELETE_PRODUCT);

  const { data, loading, error, refetch } = useQuery<any>(GET_PRODUCTS, {
    variables: { search: search.trim() || undefined },
    fetchPolicy: 'cache-and-network',
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await deleteProduct({ variables: { id } });
      refetch();
    } catch (err: any) {
      alert('Error deleting product: ' + err.message);
    }
  };

  const fallbackProductImage = (name: string): string => {
    const n = name.toLowerCase();
    if (n.includes('laptop') || n.includes('notebook') || n.includes('lumina'))
      return laptopImg;
    if (n.includes('phone') || n.includes('mobile') || n.includes('velo'))
      return phoneImg;
    if (n.includes('keyboard') || n.includes('mechanical') || n.includes('apex'))
      return keyboardImg;
    if (n.includes('watch') || n.includes('smart') || n.includes('aura'))
      return watchImg;
    if (n.includes('headphone') || n.includes('headset') || n.includes('sound') || n.includes('anc'))
      return headphonesImg;
    if (n.includes('charger') || n.includes('wireless') || n.includes('charge') || n.includes('nova'))
      return chargerImg;
    if (n.includes('mouse') || n.includes('trackpad'))
      return laptopImg;
    if (n.includes('monitor') || n.includes('display') || n.includes('screen'))
      return laptopImg;
    if (n.includes('tablet') || n.includes('ipad'))
      return phoneImg;
    if (n.includes('speaker') || n.includes('bluetooth'))
      return headphonesImg;
    if (n.includes('camera') || n.includes('webcam'))
      return laptopImg;
    if (n.includes('printer') || n.includes('scanner'))
      return laptopImg;
    return laptopImg;
  };

  // ─── map raw backend fields to display shape ─────────────────────────────
  const items = useMemo(() => {
    const raw: any[] = data?.products ?? [];
    return raw.map((p: any) => {
      const baseUrl = import.meta.env.VITE_GRAPHQL_ENDPOINT ? import.meta.env.VITE_GRAPHQL_ENDPOINT.replace('/graphql', '') : 'http://localhost:8000';
      const backendThumb = p.thumbnailMediaId
        ? `${baseUrl}/api/media/${p.thumbnailMediaId}`
        : null;
      return {
        id:          p.id as string,
        name:        p.title || '—',
        brand:       p.subtitle || '—',
        sku:         p.sku   || '—',
        category:    Array.isArray(p.categories) && p.categories.length > 0
                       ? p.categories.map((c: any) => c.title || c.name).join(', ')
                       : '—',
        stock:       p.stock ?? 0,
        status:      p.stock < 15 ? 'Low Stock' : 'Active',
        thumbnailMediaId: p.thumbnailMediaId,
        thumbnailUrl: fallbackProductImage(p.title || ''),
      };
    });
  }, [data]);

  const totalCount = items.length;

  // ─── virtualizer ─────────────────────────────────────────────────────────
  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count:           items.length,
    getScrollElement: () => parentRef.current,
    estimateSize:    () => 52,
    overscan:        10,
  });

  // ─── shared cell style: fixed width, no wrapping, ellipsis overflow ──────
  const cell = (w: number, extra = '') =>
    ({ style: { width: w, minWidth: w, maxWidth: w } as React.CSSProperties,
       className: `shrink-0 overflow-hidden text-ellipsis whitespace-nowrap pr-3 ${extra}` });

  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground m-0">Products</h1>
          <p className="text-xs text-muted-foreground">
            Manage catalog:{' '}
            <span className="font-semibold text-primary">{totalCount.toLocaleString()}</span>{' '}
            {loading ? 'loading…' : 'products synced from backend.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/products/create')}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Product
          </button>
          <button
            onClick={() => alert('Export to CSV – coming soon.')}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-semibold border border-border cursor-pointer"
          >
            <Download className="h-4 w-4" /> Export
          </button>
        </div>
      </div>

      {/* ── Search / Filter bar ─────────────────────────────────────────── */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by product name or SKU…"
                className="w-full h-9 pl-9 pr-4 rounded-md border border-input bg-card text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 self-end md:self-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`h-9 px-3 rounded-md border text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${showFilters ? 'bg-primary/10 border-primary text-primary' : 'bg-secondary border-border text-foreground hover:bg-secondary/80'}`}
              >
                <SlidersHorizontal className="h-4 w-4" /> Columns
              </button>
            </div>
          </div>

          {/* Column visibility picker */}
          {showFilters && (
            <div className="p-3 border border-border bg-muted/20 rounded-md flex flex-wrap gap-3 text-xs">
              {(Object.keys(visibleColumns) as (keyof typeof visibleColumns)[]).map((col) => (
                <label key={col} className="flex items-center gap-1.5 cursor-pointer capitalize select-none">
                  <input
                    type="checkbox"
                    checked={visibleColumns[col]}
                    onChange={() => setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }))}
                    className="rounded border-input"
                  />
                  {col}
                </label>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <Card className="overflow-hidden">

        {/* Table header */}
        <div className="border-b border-border bg-muted/30 shrink-0">
          <div className="flex items-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider py-2.5 px-4 select-none">
            {visibleColumns.image    && <div {...cell(COL.image)}>Image</div>}
            {visibleColumns.name     && <div {...cell(COL.name)}>Product Name</div>}
            {visibleColumns.brand    && <div {...cell(COL.brand)}>Brand</div>}
            {visibleColumns.sku      && <div {...cell(COL.sku)}>SKU</div>}
            {visibleColumns.category && <div {...cell(COL.category)}>Category</div>}
            {visibleColumns.mrp      && <div {...cell(COL.mrp, 'text-right')}>MRP</div>}
            {visibleColumns.price    && <div {...cell(COL.price, 'text-right')}>Price</div>}
            {visibleColumns.stock    && <div {...cell(COL.stock, 'text-right')}>Stock</div>}
            {visibleColumns.status   && <div {...cell(COL.status)}>Status</div>}
            {visibleColumns.actions  && <div {...cell(COL.actions)}>Actions</div>}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-12 text-center text-xs text-muted-foreground">
            Loading products…
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="py-12 text-center text-xs text-muted-foreground">
            <span className="font-semibold text-foreground block mb-1">Failed to load products</span>
            {(error as any).graphQLErrors?.[0]?.message || error.message}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && items.length === 0 && (
          <div className="py-16 flex flex-col items-center gap-3 text-xs text-muted-foreground">
            <Package className="h-8 w-8 opacity-30" />
            <span>No products yet.</span>
            <button
              onClick={() => navigate('/products/create')}
              className="text-primary hover:underline font-semibold"
            >
              Create your first product →
            </button>
          </div>
        )}

        {/* Virtualised rows */}
        {!loading && !error && items.length > 0 && (
          <div
            ref={parentRef}
            className="overflow-y-auto"
            style={{ maxHeight: '520px' }}
          >
            <div
              style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}
            >
              {rowVirtualizer.getVirtualItems().map((vRow) => {
                const p = items[vRow.index];
                return (
                  <div
                    key={vRow.key}
                    style={{
                      position:  'absolute',
                      top:       0,
                      left:      0,
                      width:     '100%',
                      height:    vRow.size,
                      transform: `translateY(${vRow.start}px)`,
                    }}
                    className="flex items-center text-xs border-b border-border px-4 hover:bg-muted/10 transition-colors"
                  >
                      <div {...cell(COL.image)}>
                        {p.thumbnailMediaId ? (
                          <ProductThumbnail mediaId={p.thumbnailMediaId} />
                        ) : (
                          <div className="h-8 w-8 rounded border border-border bg-muted flex items-center justify-center">
                            <Package className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                    {/* Product Name */}
                    {visibleColumns.name && (
                      <div
                        {...cell(COL.name)}
                        className={`${cell(COL.name).className} font-medium text-foreground`}
                        title={p.name}
                      >
                        {p.name}
                      </div>
                    )}

                    {/* Brand */}
                    {visibleColumns.brand && (
                      <div
                        {...cell(COL.brand)}
                        className={`${cell(COL.brand).className} text-muted-foreground`}
                        title={p.brand}
                      >
                        {p.brand}
                      </div>
                    )}

                    {/* SKU */}
                    {visibleColumns.sku && (
                      <div
                        {...cell(COL.sku)}
                        className={`${cell(COL.sku).className} font-mono text-muted-foreground`}
                        title={p.sku}
                      >
                        {p.sku}
                      </div>
                    )}

                    {/* Category */}
                    {visibleColumns.category && (
                      <div
                        {...cell(COL.category)}
                        className={`${cell(COL.category).className} text-muted-foreground`}
                        title={p.category}
                      >
                        {p.category}
                      </div>
                    )}

                    {/* MRP */}
                    {visibleColumns.mrp && (
                      <div {...cell(COL.mrp, 'text-right text-muted-foreground')}>
                        <ProductPriceCell productId={p.id} type="mrp" />
                      </div>
                    )}

                    {/* Price */}
                    {visibleColumns.price && (
                      <div {...cell(COL.price, 'text-right text-muted-foreground')}>
                        <ProductPriceCell productId={p.id} />
                      </div>
                    )}

                    {/* Stock */}
                    {visibleColumns.stock && (
                      <div
                        {...cell(COL.stock, 'text-right font-medium')}
                        className={`${cell(COL.stock, 'text-right font-medium').className} ${
                          p.stock < 15 ? 'text-red-500 font-bold' : 'text-foreground'
                        }`}
                      >
                        {p.stock.toLocaleString()}
                      </div>
                    )}

                    {/* Status */}
                    {visibleColumns.status && (
                      <div {...cell(COL.status)}>
                        <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full border ${p.stock < 15 ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'}`}>
                          {p.status}
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    {visibleColumns.actions && (
                      <div {...cell(COL.actions, 'flex items-center gap-1')}>
                        <button
                          onClick={() => navigate(`/products/${p.id}`)}
                          className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
                          title="View"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => navigate(`/products/${p.id}/edit`)}
                          className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-destructive cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
