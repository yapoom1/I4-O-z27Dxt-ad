import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardFooter, Input, Select, Button, Switch } from '@/shared/ui/Primitives';
import { 
  ArrowLeft, Upload, Plus, Trash2, Tag, 
  Sparkles, Layers, Image as ImageIcon, Barcode, HelpCircle, Box 
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import { 
  CREATE_PRODUCT, 
  UPDATE_PRODUCT,
  SET_PRODUCT_CATEGORIES, 
  UPDATE_PRODUCT_STOCK, 
  SET_PRODUCT_PRICE,
  CREATE_PRICING_TYPE
} from '@/shared/graphql/mutations/products';
import {
  CREATE_ATTRIBUTE,
  CREATE_ATTRIBUTE_VALUE,
  ASSIGN_ATTRIBUTE_VALUE_TO_PRODUCT
} from '@/shared/graphql/mutations/attributes';
import { CREATE_MEDIA } from '@/shared/graphql/mutations/media';
import { useImageUpload } from '@/shared/hooks/useImageUpload';
import { 
  GET_PRODUCTS, 
  GET_CATEGORIES, 
  GET_PRICING_TYPES,
  GET_PRODUCT,
  GET_PRODUCT_PRICES
} from '@/shared/graphql/queries/products';
import { GET_MEDIA_ITEM } from '@/shared/graphql/queries/media';

interface VariantOption {
  name: string;
  values: string[];
}

interface GeneratedVariant {
  name: string;
  sku: string;
  mrp: number;
  price: number;
  stock: number;
  weight: number;
}

export const ProductCreate: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [draftId, setDraftId] = useState<string | null>(null);
  const currentProductId = id || draftId;
  const isEdit = Boolean(currentProductId);

  const [createProduct] = useMutation<any>(CREATE_PRODUCT);
  const [updateProduct] = useMutation<any>(UPDATE_PRODUCT);
  const [setProductCategories] = useMutation<any>(SET_PRODUCT_CATEGORIES);
  const [updateProductStock] = useMutation<any>(UPDATE_PRODUCT_STOCK);
  const [setProductPrice] = useMutation<any>(SET_PRODUCT_PRICE);
  const [createMedia] = useMutation<any>(CREATE_MEDIA);
  const [createAttribute] = useMutation(CREATE_ATTRIBUTE);
  const [createAttributeValue] = useMutation(CREATE_ATTRIBUTE_VALUE);
  const [assignAttributeValueToProduct] = useMutation(ASSIGN_ATTRIBUTE_VALUE_TO_PRODUCT);
  const [createPricingType] = useMutation(CREATE_PRICING_TYPE);

  const { data: categoriesData, loading: categoriesLoading, error: categoriesError } = useQuery<any>(GET_CATEGORIES);
  const { data: pricingTypesData } = useQuery<any>(GET_PRICING_TYPES, { fetchPolicy: 'network-only' });
  const { data: productData, loading: productLoading } = useQuery<any>(GET_PRODUCT, {
    variables: { id: currentProductId },
    skip: !isEdit,
    fetchPolicy: 'network-only',
  });
  const { data: pricesData } = useQuery<any>(GET_PRODUCT_PRICES, {
    variables: { productId: currentProductId },
    skip: !isEdit,
    fetchPolicy: 'network-only',
  });
  
  const existingMediaId = productData?.product?.thumbnailMediaId;
  const { data: mediaData } = useQuery<any>(GET_MEDIA_ITEM, {
    variables: { id: existingMediaId },
    skip: !isEdit || !existingMediaId,
    fetchPolicy: 'network-only',
  });

  const categories = categoriesData?.categories;

  React.useEffect(() => {
    if (categories) {
      console.log("Categories response:", categories);
    }
  }, [categories]);

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [mrp, setMrp] = useState(0);
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionLong, setDescriptionLong] = useState('');
  const [barcode, setBarcode] = useState('');
  const [brand, setBrand] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

  // Shipping & Dimensions State
  const [weight, setWeight] = useState<number>(0.5);
  const [length, setLength] = useState<number>(10.0);
  const [width, setWidth] = useState<number>(10.0);
  const [height, setHeight] = useState<number>(10.0);

  // Pre-populate fields in Edit Mode
  React.useEffect(() => {
    if (isEdit && productData?.product) {
      const p = productData.product;
      setName(p.title || '');
      setSku(p.sku || '');
      setStock(p.stock ?? 0);
      setBrand(p.subtitle || '');
      const dims = p.shippingDimensions || p.shipping;
      if (dims) {
        setWeight(dims.weight ?? 0.5);
        setLength(dims.length ?? 10.0);
        setWidth(dims.width ?? 10.0);
        setHeight(dims.height ?? 10.0);
      }
      if (p.categories && p.categories.length > 0) {
        setCategory(p.categories[0].id || '');
      }
      if (p.description) {
        setDescription(p.description);
      } else {
        setDescription('');
      }
      if (p.descriptionLong) {
        setDescriptionLong(p.descriptionLong);
      } else {
        setDescriptionLong('');
      }
    }
  }, [isEdit, productData]);

  React.useEffect(() => {
    if (isEdit && pricesData?.productPrices) {
      const prices = pricesData.productPrices;
      const sellingPriceEntry = prices.find(
        (pr: any) => {
          const typeName = (pr.pricingType?.name || pr.pricingType?.type || '').toLowerCase();
          return typeName === 'selling_price' || typeName === 'selling price' || typeName.includes('selling');
        }
      );
      if (sellingPriceEntry) {
        setPrice(Number(sellingPriceEntry.price) || 0);
      }
      const mrpEntry = prices.find(
        (pr: any) => {
          const typeName = (pr.pricingType?.name || pr.pricingType?.type || '').toLowerCase();
          return typeName === 'mrp' || typeName === 'original_price';
        }
      );
      if (mrpEntry) {
        setMrp(Number(mrpEntry.price) || 0);
      }
    }
  }, [isEdit, pricesData]);

  const creating = localLoading || (isEdit && productLoading);

  // Variants state
  const [hasVariants, setHasVariants] = useState(false);
  const [simpleVariants, setSimpleVariants] = useState([
    { name: '', sku: '', price: 0, mrp: 0, stock: 0, weight: 0.5 }
  ]);

  const handleAddVariant = () => {
    setSimpleVariants(prev => [...prev, { name: '', sku: '', price: price, mrp: mrp, stock: 0, weight: weight }]);
  };

  const handleRemoveVariant = (idx: number) => {
    setSimpleVariants(prev => prev.filter((_, i) => i !== idx));
  };

  const updateVariant = (idx: number, field: string, value: string | number) => {
    setSimpleVariants(prev => prev.map((v, i) => {
      if (i === idx) return { ...v, [field]: value };
      return v;
    }));
  };

  // Media upload simulation -> Real hook
  const [mediaList, setMediaList] = useState<string[]>([]);
  const { uploadFile, isUploading, uploadError } = useImageUpload();

  // Populate mediaList from existing media in edit mode
  React.useEffect(() => {
    if (isEdit && mediaData?.media?.mediaUrl) {
      setMediaList([mediaData.media.mediaUrl]);
    }
  }, [isEdit, mediaData]);

  const handleNameBlur = async () => {
    if (name.trim() && !currentProductId && !creating) {
      setLocalLoading(true);
      try {
        const { data } = await createProduct({
          variables: {
            input: {
              title: name.trim(),
              productType: 'GOODS',
              shippingDimensions: {
                weight: Number(weight) || 0.5,
                length: Number(length) || 10.0,
                width: Number(width) || 10.0,
                height: Number(height) || 10.0,
              }
            }
          }
        });
        if (data?.createProduct?.id) {
          setDraftId(data.createProduct.id);
        }
      } catch (err) {
        console.error("Failed to auto-draft product:", err);
      } finally {
        setLocalLoading(false);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentProductId) return;

    const oldMediaUrl = mediaList.length > 0 ? mediaList[0] : undefined;
    const uploadData = await uploadFile(file, 'product', currentProductId, oldMediaUrl);
    
    if (uploadData) {
      const { url: uploadedUrl, id: uploadedMediaId } = uploadData;
      
      // Force cache bust on the frontend just in case the backend URL hasn't updated its string
      const cacheBustedUrl = uploadedUrl.includes('?') 
        ? `${uploadedUrl}&t=${Date.now()}` 
        : `${uploadedUrl}?t=${Date.now()}`;

      // Replace the image in the list instead of appending
      setMediaList([cacheBustedUrl]);
      
      // Immediately link the image to the product so it's not lost
      try {
        if (uploadedMediaId) {
          await updateProduct({
            variables: {
              id: currentProductId,
              input: { 
                title: name.trim() || 'Draft',
                subtitle: brand.trim(),
                description: description.trim(),
                descriptionLong: descriptionLong.trim(),
                sku: sku.trim() || undefined,
                thumbnailMediaId: uploadedMediaId,
                shippingDimensions: {
                  weight: Number(weight) || 0.5,
                  length: Number(length) || 10.0,
                  width: Number(width) || 10.0,
                  height: Number(height) || 10.0,
                }
              }
            },
            refetchQueries: [
              { query: GET_PRODUCT, variables: { id: currentProductId } },
              { query: GET_PRODUCTS }
            ]
          });
        } else {
          console.error("Backend did not return an ID for the uploaded media.");
        }
      } catch (err: any) {
        console.error("Failed to link media to product:", err);
        alert("Failed to save image to product: " + err.message);
      }
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Product name is required.');
      return;
    }

    if (isNaN(price) || price < 0) {
      alert('Price must be a valid number.');
      return;
    }

    if (isNaN(mrp) || mrp < 0) {
      alert('MRP must be a valid number.');
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      alert('Stock must be an integer.');
      return;
    }

    if (isNaN(weight) || weight <= 0) {
      alert('Shipping weight is mandatory and must be greater than 0 kg.');
      return;
    }

    let categoriesUpdated = true;
    let stockUpdated = true;
    let priceUpdated = true;
    let productId = currentProductId || '';
    let productName = name.trim();

    setLocalLoading(true);
    try {
      const shippingPayload = {
        weight: Number(weight),
        length: Number(length) || 10.0,
        width: Number(width) || 10.0,
        height: Number(height) || 10.0,
      };

      if (isEdit) {
        const { data: updateData } = await updateProduct({
          variables: {
            id: productId,
            input: {
              title: name.trim(),
              subtitle: brand.trim(),
              description: description.trim(),
              descriptionLong: descriptionLong.trim(),
              sku: sku.trim() || undefined,
              shippingDimensions: shippingPayload,
            },
          },
          refetchQueries: [
            { query: GET_PRODUCTS },
            { query: GET_PRODUCT, variables: { id: productId } },
            { query: GET_PRODUCT_PRICES, variables: { productId } }
          ],
          awaitRefetchQueries: true,
        });

        const updatedProduct = updateData?.updateProduct;
        if (!updatedProduct) throw new Error('Failed to update product.');
        productName = updatedProduct.title;
      } else {
        const { data: createData } = await createProduct({
          variables: {
            input: {
              title: name.trim(),
              productType: 'GOODS',
              subtitle: brand.trim(),
              description: description.trim(),
              descriptionLong: descriptionLong.trim(),
              sku: sku.trim() || undefined,
              shippingDimensions: shippingPayload,
            },
          },
          refetchQueries: [{ query: GET_PRODUCTS }],
          awaitRefetchQueries: true,
        });

        const createdProduct = createData?.createProduct;
        if (!createdProduct || !createdProduct.id) throw new Error('Failed to create product. No ID returned.');
        productId = createdProduct.id;
        productName = createdProduct.title;
      }

      const selectedCategoryIds = category ? [category] : [];
      if (selectedCategoryIds.length > 0) {
        try {
          await setProductCategories({
            variables: { productId, categoryIds: selectedCategoryIds },
            refetchQueries: [
              { query: GET_PRODUCTS },
              { query: GET_PRODUCT, variables: { id: productId } }
            ]
          });
        } catch (catErr) {
          categoriesUpdated = false;
        }
      }

      // Determine the pricing type once for all price updates
      const pricingTypes = pricingTypesData?.pricingTypes || [];
      let sellingType = pricingTypes.find(
        (pt: any) => {
          const ptname = (pt.name || pt.type || pt.id || '').toLowerCase();
          return ptname === 'selling_price' || ptname === 'selling price' || ptname.includes('selling');
        }
      );
      let mrpType = pricingTypes.find(
        (pt: any) => {
          const ptname = (pt.name || pt.type || pt.id || '').toLowerCase();
          return ptname === 'mrp' || ptname === 'original_price';
        }
      );
      
      // Auto-create missing pricing types
      if (!sellingType) {
        try {
          const res: any = await createPricingType({ variables: { input: { type: 'selling_price' } } });
          sellingType = res.data.createPricingType;
        } catch(e) { console.error("Failed to create selling_price", e); }
      }
      
      if (!mrpType) {
        try {
          const res: any = await createPricingType({ variables: { input: { type: 'original_price' } } });
          mrpType = res.data.createPricingType;
        } catch(e) { console.error("Failed to create original_price", e); }
      }

      const pricingTypeId = sellingType ? sellingType.id : (pricingTypes[0]?.id || '');
      const mrpPricingTypeId = mrpType ? mrpType.id : '';
      
      if (!pricingTypeId) {
        alert("Warning: No pricing type found for your account! Prices will not be saved. Please contact support or create a pricing type first.");
      }

      // Always set the base/parent stock and price
      if (stock >= 0) {
        try {
          await updateProductStock({ variables: { productId, stock: Number(stock) } });
        } catch (stockErr) {
          stockUpdated = false;
        }
      }

      if (price >= 0 && pricingTypeId) {
        try {
          await setProductPrice({ 
            variables: { input: { productId, pricingTypeId, price: Number(price) } },
            refetchQueries: [{ query: GET_PRODUCT_PRICES, variables: { productId } }]
          });
        } catch (priceErr) {
          priceUpdated = false;
        }
      }

      if (mrp >= 0 && mrpPricingTypeId) {
        try {
          await setProductPrice({ 
            variables: { input: { productId, pricingTypeId: mrpPricingTypeId, price: Number(mrp) } },
            refetchQueries: [{ query: GET_PRODUCT_PRICES, variables: { productId } }]
          });
        } catch (mrpErr) {
          priceUpdated = false;
        }
      }

      if (hasVariants) {
        let attrId = '';
        try {
          const attrRes: any = await createAttribute({
            variables: { input: { name: 'variant', displayName: 'Variant' } }
          });
          attrId = attrRes.data.createAttribute.id;
        } catch (err: any) {
          console.warn(`Failed to create generic Variant attribute.`, err.message);
        }

        for (let i = 0; i < simpleVariants.length; i++) {
          const v = simpleVariants[i];
          if (!v.name) continue;

          let valueId = '';
          if (attrId) {
            try {
              const valRes: any = await createAttributeValue({
                variables: { input: { attributeId: attrId, value: v.name } }
              });
              valueId = valRes.data.createAttributeValue.id;
            } catch (err: any) {
              console.warn(`Failed to create attribute value ${v.name}`, err.message);
            }
          }

          const childTitle = `${productName} - ${v.name}`;
          
          try {
            const { data: childCreateData } = await createProduct({
              variables: {
                input: {
                  title: childTitle,
                  productType: 'GOODS',
                  sku: v.sku || undefined,
                  parentId: productId,
                  shippingDimensions: {
                    weight: Number(v.weight) || weight || 0.5,
                    length: Number(length) || 10.0,
                    width: Number(width) || 10.0,
                    height: Number(height) || 10.0,
                  }
                }
              }
            });
            
            const childId = childCreateData?.createProduct?.id;
            if (childId) {
              if (v.stock >= 0) {
                await updateProductStock({ variables: { productId: childId, stock: Number(v.stock) } });
              }
              if (v.price >= 0 && pricingTypeId) {
                await setProductPrice({ 
                  variables: { input: { productId: childId, pricingTypeId, price: Number(v.price) } },
                  refetchQueries: [{ query: GET_PRODUCT_PRICES, variables: { productId: childId } }]
                });
              }
              if (v.mrp >= 0 && mrpPricingTypeId) {
                await setProductPrice({ 
                  variables: { input: { productId: childId, pricingTypeId: mrpPricingTypeId, price: Number(v.mrp) } },
                  refetchQueries: [{ query: GET_PRODUCT_PRICES, variables: { productId: childId } }]
                });
              }
              if (valueId) {
                try {
                  await assignAttributeValueToProduct({
                    variables: { productId: childId, attributeValueId: valueId }
                  });
                } catch (err: any) {}
              }
            }
          } catch (childErr: any) {
            console.error(`Failed to create child product ${childTitle}`, childErr.message);
          }
        }
      }

      if (!categoriesUpdated || !stockUpdated || !priceUpdated) {
        alert(isEdit ? "Product updated, but category/stock/pricing update failed." : "Product created, but category/stock/pricing update failed.");
      } else {
        alert(isEdit ? `Product "${productName}" successfully updated.` : `Product "${productName}" successfully created and configured.`);
      }

      navigate('/products');
    } catch (err: any) {
      console.error('[ProductCreate] save failed:', err);
      alert('Failed to save product: ' + err.message);
    } finally {
      setLocalLoading(false);
    }
  };

  const categoryOptions = React.useMemo(() => {
    if (categoriesLoading) {
      return [{ label: 'Loading categories...', value: '' }];
    }
    if (categoriesError) {
      return [{ label: 'Failed to load categories.', value: '' }];
    }
    const list = categoriesData?.categories || [];
    if (list.length === 0) {
      return [{ label: 'No categories found. Please create category first.', value: '' }];
    }
    return [
      { label: 'Select Category', value: '' },
      ...list.map((c: any) => ({ label: c.name || c.title || c.slug, value: c.id }))
    ];
  }, [categoriesData, categoriesLoading, categoriesError]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/products')}
          className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground m-0">{isEdit ? 'Edit Product' : 'Create Product'}</h1>
          <p className="text-xs text-muted-foreground">{isEdit ? 'Update product details and pricing.' : 'Add a new item to your tenant storefront.'}</p>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        {/* Main form details */}
        <div className="md:col-span-2 space-y-6">
          {/* General Information */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-foreground">General Information</h3>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <Input
                label="Product Name"
                placeholder="e.g. Wireless Noise-Cancelling Headphones"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleNameBlur}
              />

              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Brand Name"
                  placeholder="e.g. HP, Dell, Lenovo"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-muted-foreground">Short Description</label>
                  <button 
                    onClick={() => {
                      if (!name) return alert('Enter product name first to trigger AI');
                      setDescription(`Introducing the all-new ${name}. Engineered for premium performance.`);
                    }}
                    className="text-[10px] text-violet-500 hover:text-violet-600 font-semibold flex items-center gap-1 cursor-pointer bg-violet-500/5 hover:bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20 transition-all"
                  >
                    <Sparkles className="h-3 w-3" /> Generate with AI
                  </button>
                </div>
                <textarea
                  placeholder="Brief summary for product cards..."
                  className="w-full h-20 rounded-md border border-input bg-card p-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Long Description</label>
                <textarea
                  placeholder="Full detailed description for the product page..."
                  className="w-full h-32 rounded-md border border-input bg-card p-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={descriptionLong}
                  onChange={(e) => setDescriptionLong(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Media Manager */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-foreground">Media Upload</h3>
            </CardHeader>
            <CardContent className="p-4">
              {!currentProductId ? (
                <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center bg-muted/50 text-center">
                  <Upload className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  <span className="text-xs font-semibold text-muted-foreground">
                    Please enter a Product Name first to enable image uploads.
                  </span>
                </div>
              ) : (
                <label className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/40 transition-colors text-center cursor-pointer">
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-xs font-semibold text-foreground">
                    {isUploading ? 'Uploading file...' : 'Click to upload files'}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-1">
                    Supports PNG, JPEG, WEBP up to 5MB
                  </span>
                </label>
              )}
              
              {uploadError && (
                <div className="text-xs text-destructive mt-2">{uploadError}</div>
              )}
              
              {mediaList.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="grid grid-cols-4 gap-3">
                    {mediaList.map((img, idx) => (
                      <div key={idx} className="relative group rounded-md overflow-hidden border border-border h-20 bg-muted">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setMediaList(prev => prev.filter((_, i) => i !== idx));
                          }}
                          className="absolute top-1 right-1 p-1 rounded bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px] text-muted-foreground break-all p-2 bg-muted rounded font-mono">
                    <strong>Current Image URL:</strong> {mediaList[0]}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing & Stock (Always visible so parent product gets a base price) */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-foreground">Pricing & Inventory (Base/Parent)</h3>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="number"
                label="Base MRP (₹)"
                value={mrp}
                onChange={(e) => setMrp(parseFloat(e.target.value) || 0)}
              />
              <Input
                type="number"
                label="Base Selling Price (₹)"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              />
              <Input
                type="number"
                label="Base Stock Quantity"
                value={stock}
                onChange={(e) => setStock(parseInt(e.target.value) || 0)}
              />
              <Input
                label="Base SKU"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
              />
              <Input
                label="Base Barcode"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Shipping & Package Dimensions */}
          <Card>
            <CardHeader className="flex items-center gap-2">
              <Box className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Shipping & Package Dimensions</h3>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  type="number"
                  step="0.01"
                  label="Package Weight (kg) *"
                  placeholder="e.g. 0.50"
                  value={weight}
                  onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                />
                <p className="text-[0.8rem] text-muted-foreground mt-1">Required for Shiprocket rate calculation</p>
              </div>
              <Input
                type="number"
                step="0.1"
                label="Package Length (cm)"
                placeholder="e.g. 10.0"
                value={length}
                onChange={(e) => setLength(parseFloat(e.target.value) || 0)}
              />
              <Input
                type="number"
                step="0.1"
                label="Package Width (cm)"
                placeholder="e.g. 10.0"
                value={width}
                onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
              />
              <Input
                type="number"
                step="0.1"
                label="Package Height (cm)"
                placeholder="e.g. 10.0"
                value={height}
                onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
              />
            </CardContent>
          </Card>

          {/* Product Variants Option Configurator */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Product Variants</h3>
              <Switch
                checked={hasVariants}
                onChange={setHasVariants}
                label=""
              />
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {!hasVariants ? (
                <p className="text-xs text-muted-foreground">
                  Enable variants if this product has options like size, color, or material.
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">Add variants for this product (e.g., Red XL).</p>
                    <button
                      onClick={handleAddVariant}
                      className="inline-flex items-center gap-1 h-7 px-2.5 rounded bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Variant
                    </button>
                  </div>
                  
                  {simpleVariants.length > 0 && (
                    <div className="border border-border rounded-md divide-y divide-border overflow-hidden bg-card">
                      <div className="bg-muted/50 p-2 grid grid-cols-13 gap-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider" style={{gridTemplateColumns: '2fr 2fr 1.5fr 1.5fr 1fr 1fr 0.6fr'}}>
                        <div>Variant Name</div>
                        <div>SKU</div>
                        <div>Price (₹)</div>
                        <div>MRP (₹)</div>
                        <div>Stock</div>
                        <div>Weight (kg)</div>
                        <div className="text-center">Act</div>
                      </div>
                      {simpleVariants.map((v, idx) => (
                        <div key={idx} className="p-2 grid gap-2 items-center text-xs" style={{gridTemplateColumns: '2fr 2fr 1.5fr 1.5fr 1fr 1fr 0.6fr'}}>
                          <div>
                            <input 
                              type="text" 
                              placeholder="e.g. Red - XL"
                              className="h-8 w-full px-2 border border-input bg-card rounded"
                              value={v.name}
                              onChange={e => updateVariant(idx, 'name', e.target.value)}
                            />
                          </div>
                          <div>
                            <input 
                              type="text" 
                              placeholder="SKU"
                              className="h-8 w-full px-2 border border-input bg-muted/20 rounded font-mono text-[10px]"
                              value={v.sku}
                              onChange={e => updateVariant(idx, 'sku', e.target.value)}
                            />
                          </div>
                          <div>
                            <input 
                              type="number" 
                              placeholder="Price"
                              className="h-8 w-full px-2 border border-input bg-card rounded"
                              value={v.price}
                              onChange={e => updateVariant(idx, 'price', parseFloat(e.target.value))}
                            />
                          </div>
                          <div>
                            <input 
                              type="number" 
                              placeholder="MRP"
                              className="h-8 w-full px-2 border border-input bg-card rounded"
                              value={v.mrp}
                              onChange={e => updateVariant(idx, 'mrp', parseFloat(e.target.value))}
                            />
                          </div>
                          <div>
                            <input 
                              type="number" 
                              placeholder="Stock"
                              className="h-8 w-full px-2 border border-input bg-card rounded"
                              value={v.stock}
                              onChange={e => updateVariant(idx, 'stock', parseInt(e.target.value) || 0)}
                            />
                          </div>
                          <div>
                            <input 
                              type="number"
                              step="0.01"
                              placeholder={String(weight || 0.5)}
                              className="h-8 w-full px-2 border border-input bg-card rounded"
                              value={v.weight}
                              onChange={e => updateVariant(idx, 'weight', parseFloat(e.target.value) || 0)}
                              title="Weight in kg (required for shipping)"
                            />
                          </div>
                          <div className="flex justify-center">
                            <button
                              onClick={() => handleRemoveVariant(idx)}
                              className="h-8 w-8 flex items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                              title="Remove variant"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info columns */}
        <div className="space-y-6">
          {/* Organization */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-foreground">Organization</h3>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <Select
                label="Store Category"
                options={categoryOptions}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Action buttons */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <Button variant="primary" className="w-full" onClick={handleSave} disabled={creating}>
                {creating ? 'Saving...' : isEdit ? 'Save Changes' : 'Save Product'}
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate('/products')}>
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
