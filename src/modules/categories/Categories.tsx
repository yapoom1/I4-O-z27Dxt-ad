import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, Button, Input } from '@/shared/ui/Primitives';
import { 
  Folder, FolderPlus, Trash2, ChevronRight, ChevronDown, 
  ArrowUp, ArrowDown, HelpCircle, Tag, Sparkles, Pencil, Eye, Package
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_CATEGORIES } from '@/shared/graphql/queries/categories';
import { GET_PRODUCTS } from '@/shared/graphql/queries/products';
import { UPDATE_CATEGORY, DELETE_CATEGORY } from '@/shared/graphql/mutations/categories';

interface CategoryNode {
  id: string;
  originalId: string;
  name: string;
  slug: string;
  depth: number;
  seoTitle?: string;
  seoKeywords?: string;
  thumbnailUrl?: string | null;
  type: 'category' | 'product';
  parentId?: string | null;
  hasChildren?: boolean;
}

export const Categories: React.FC = () => {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useQuery<any>(GET_CATEGORIES, {
    fetchPolicy: 'network-only',
  });
  const { data: prodData } = useQuery<any>(GET_PRODUCTS, { fetchPolicy: 'cache-and-network' });
  const [updateCategory] = useMutation<any>(UPDATE_CATEGORY);
  const [deleteCategory] = useMutation<any>(DELETE_CATEGORY);

  const [activeCatId, setActiveCatId] = useState<string>('');
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});

  const toggleCat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCats(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const rawCategories = data?.categories ?? [];
  const rawProducts = prodData?.products ?? [];

  const categories = useMemo(() => {
    const parentMap = new Map<string, string | null>();
    rawCategories.forEach((cat: any) => {
      parentMap.set(cat.id, cat.parentId);
    });

    const getDepth = (id: string): number => {
      let depth = 0;
      let curr = parentMap.get(id);
      while (curr) {
        depth++;
        curr = parentMap.get(curr);
        if (depth > 10) break;
      }
      return depth;
    };

    const result: CategoryNode[] = [];
    
    rawCategories.forEach((cat: any) => {
      const catDepth = getDepth(cat.id);
      result.push({
        id: cat.id,
        originalId: cat.id,
        name: cat.title,
        slug: cat.sku || cat.title.toLowerCase().replace(/\s+/g, '-'),
        depth: catDepth,
        seoTitle: cat.subtitle || '',
        seoKeywords: cat.description || '',
        thumbnailUrl: cat.thumbnail?.mediaUrl || null,
        type: 'category',
        parentId: cat.parentId || null,
        hasChildren: rawCategories.some((c: any) => c.parentId === cat.id) || 
                     rawProducts.some((p: any) => p.categories && p.categories.some((c: any) => c.id === cat.id))
      });

      // Find products for this category
      const catProducts = rawProducts.filter((p: any) => 
        p.categories && p.categories.some((c: any) => c.id === cat.id)
      );

      catProducts.forEach((p: any) => {
        result.push({
          id: `prod_${p.id}_${cat.id}`,
          originalId: p.id,
          name: p.title || 'Unknown Product',
          slug: p.sku || '',
          depth: catDepth + 1,
          type: 'product',
          thumbnailUrl: p.thumbnail?.mediaUrl || null,
          parentId: cat.id,
          hasChildren: false,
        });
      });
    });

    return result;
  }, [rawCategories, rawProducts]);

  // Set initial active category if none selected
  const activeCategory = useMemo(() => {
    const catsOnly = categories.filter((c: CategoryNode) => c.type === 'category');
    if (catsOnly.length === 0) return null;
    return catsOnly.find((c: CategoryNode) => c.id === activeCatId) || catsOnly[0];
  }, [categories, activeCatId]);




  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await deleteCategory({ variables: { id } });
      refetch();
      if (activeCatId === id) {
        setActiveCatId('');
      }
    } catch (err: any) {
      alert('Error deleting category: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground m-0">Category Hierarchy</h1>
        <p className="text-xs text-muted-foreground">Manage nested category trees, drag order priorities, and page SEO tags.</p>
      </div>

      <div className="grid gap-6 grid-cols-1">
        {/* Main Tree View */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Interactive Tree View</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate('/categories/create')}
                  className="h-8 px-4 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold rounded-md shadow-sm flex items-center gap-1.5"
                >
                  <FolderPlus className="h-4 w-4" />
                  Create Category
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-1">
              {loading && <div className="p-4 text-center text-xs text-muted-foreground">Loading categories...</div>}
              {error && (
                <div className="p-4 text-center text-xs text-muted-foreground border border-border rounded-md bg-muted/20">
                  <span className="font-semibold text-destructive block mb-1">Categories unavailable</span>
                  {error.message || 'The backend is temporarily unable to fetch categories (database maintenance). Try refreshing.'}
                </div>
              )}
              {!loading && !error && categories.length === 0 && (
                <div className="p-4 text-center text-xs text-muted-foreground">No categories found. Add a category above.</div>
              )}
              {!loading && !error && categories.filter((cat: CategoryNode) => {
                let currParent = cat.parentId;
                while (currParent) {
                  if (!expandedCats[currParent]) return false;
                  const parent = categories.find((c: CategoryNode) => c.id === currParent || c.originalId === currParent);
                  currParent = parent ? parent.parentId : null;
                }
                return true;
              }).map((cat: any, idx: number) => {
                const isCategory = cat.type === 'category';
                const isActive = activeCatId === cat.id || (!activeCatId && idx === 0 && isCategory);

                return (
                <div
                  key={cat.id}
                  onClick={() => isCategory && setActiveCatId(cat.id)}
                  style={{ paddingLeft: `${cat.depth * 28}px` }}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all border group backdrop-blur-md ${
                    isActive 
                      ? 'bg-primary/10 border-primary/50 shadow-md ring-1 ring-primary/20' 
                      : isCategory
                        ? 'border-border/30 bg-background/40 hover:bg-background/60 hover:border-primary/50 hover:shadow-sm text-foreground'
                        : 'border-dashed border-border/30 bg-muted/20 hover:bg-muted/40 text-muted-foreground'
                  } ${isCategory ? 'cursor-pointer my-2' : 'cursor-default my-1'}`}
                >
                  <div className="flex items-center gap-3 truncate">
                    {cat.type === 'category' && cat.hasChildren ? (
                      <button 
                        onClick={(e) => toggleCat(cat.id, e)}
                        className="p-1 hover:bg-secondary rounded text-muted-foreground shrink-0 transition-transform"
                      >
                        {expandedCats[cat.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                    ) : (
                      <div className="w-6 shrink-0" />
                    )}
                    <div className={`p-2 rounded-lg shrink-0 transition-colors ${isCategory ? 'bg-primary/15 text-primary shadow-sm' : 'bg-muted/50 text-muted-foreground'}`}>
                      {cat.thumbnailUrl ? (
                        <img src={cat.thumbnailUrl} alt={cat.name} className="h-4 w-4 rounded-sm object-cover" />
                      ) : isCategory ? (
                        <Folder className="h-4 w-4" />
                      ) : (
                        <Package className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex flex-col truncate">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`truncate ${isCategory ? 'font-bold text-sm tracking-tight' : 'font-medium text-sm'}`}>
                          {cat.name}
                        </span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-md font-extrabold uppercase tracking-widest shadow-sm ${
                          isCategory 
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border border-indigo-700/50' 
                            : 'bg-gradient-to-r from-orange-500 to-rose-500 text-white border border-orange-600/50'
                        }`}>
                          {isCategory ? 'Category' : 'Product'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground/70 truncate">{cat.slug}</span>
                    </div>
                  </div>
                  
                  {/* Indentation and position controls */}
                  <div className="flex items-center gap-1">
                    {cat.type === 'category' ? (
                      <>
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/categories/${cat.originalId}/edit`); }}
                          className="p-1 hover:bg-secondary text-muted-foreground hover:text-foreground rounded cursor-pointer"
                          title="Edit Category"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/categories/${cat.originalId}`); }}
                          className="p-1 hover:bg-secondary text-muted-foreground hover:text-foreground rounded cursor-pointer"
                          title="View Category"
                        >
                          <Eye className="h-3 w-3" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(cat.originalId); }}
                          className="p-1 hover:bg-secondary text-muted-foreground hover:text-destructive rounded cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/products/${cat.originalId}/edit`); }}
                          className="p-1 hover:bg-secondary text-muted-foreground hover:text-foreground rounded cursor-pointer"
                          title="Edit Product"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/products/${cat.originalId}`); }}
                          className="p-1 hover:bg-secondary text-muted-foreground hover:text-foreground rounded cursor-pointer"
                          title="View Product"
                        >
                          <Eye className="h-3 w-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};
