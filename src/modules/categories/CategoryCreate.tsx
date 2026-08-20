import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/shared/ui/Primitives';
import { ArrowLeft, Save, Loader2, ImagePlus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import { CREATE_CATEGORY, UPDATE_CATEGORY } from '@/shared/graphql/mutations/categories';
import { GET_CATEGORIES, GET_CATEGORY } from '@/shared/graphql/queries/categories';
import { useImageUpload } from '@/shared/hooks/useImageUpload';

export const CategoryCreate: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const { data: catData, loading: catLoading } = useQuery<any>(GET_CATEGORIES, {
    fetchPolicy: 'cache-first'
  });
  
  const { data: singleCatData, loading: singleCatLoading } = useQuery<any>(GET_CATEGORY, {
    variables: { id },
    skip: !isEdit,
    fetchPolicy: 'network-only'
  });

  const [createCategory, { loading: creating }] = useMutation<any>(CREATE_CATEGORY);
  const [updateCategory, { loading: updating }] = useMutation<any>(UPDATE_CATEGORY);
  
  const isSaving = creating || updating;

  const [formData, setFormData] = useState({
    title: '',
    sku: '',
    parentId: '',
    subtitle: '',
    description: '',
    descriptionLong: '',
    thumbnailMediaId: ''
  });

  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string | null>(null);
  const { uploadFile, isUploading } = useImageUpload();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEdit && singleCatData?.category) {
      const c = singleCatData.category;
      setFormData({
        title: c.title || '',
        sku: c.sku || '',
        parentId: c.parentId || '',
        subtitle: c.subtitle || '',
        description: c.description || '',
        descriptionLong: c.descriptionLong || '',
        thumbnailMediaId: c.thumbnailMediaId || ''
      });
      if (c.thumbnail?.mediaUrl) {
        setSelectedMediaUrl(c.thumbnail.mediaUrl);
      }
    }
  }, [singleCatData, isEdit]);

  const rawCategories = catData?.categories ?? [];
  const categories = React.useMemo(() => {
    return rawCategories.map((c: any) => ({
      id: c.id,
      title: c.title
    }));
  }, [rawCategories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const result = await uploadFile(file, 'category');
      if (result) {
        setFormData(prev => ({ ...prev, thumbnailMediaId: result.id || '' }));
        setSelectedMediaUrl(result.url);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Title is required.");
      return;
    }

    const sku = formData.sku.trim() || formData.title.trim().toLowerCase().replace(/\s+/g, '-');

    try {
      if (isEdit) {
        await updateCategory({
          variables: {
            id,
            input: {
              title: formData.title.trim(),
              sku: sku,
              parentId: formData.parentId ? formData.parentId : null,
              subtitle: formData.subtitle.trim() || null,
              description: formData.description.trim() || null,
              descriptionLong: formData.descriptionLong.trim() || null,
              thumbnailMediaId: formData.thumbnailMediaId || null,
            }
          },
          refetchQueries: [{ query: GET_CATEGORIES }]
        });
        alert('Success! Category updated.');
      } else {
        await createCategory({
          variables: {
            input: {
              title: formData.title.trim(),
              sku: sku,
              parentId: formData.parentId ? formData.parentId : null,
              subtitle: formData.subtitle.trim() || null,
              description: formData.description.trim() || null,
              descriptionLong: formData.descriptionLong.trim() || null,
              thumbnailMediaId: formData.thumbnailMediaId || null,
            }
          },
          refetchQueries: [{ query: GET_CATEGORIES }]
        });
        alert('Success! Category created.');
      }
      navigate('/categories');
    } catch (err: any) {
      console.error('Full Error:', err);
      alert('Error creating category: ' + (err.message || JSON.stringify(err)));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/categories')}
            className="p-2 hover:bg-secondary rounded-md text-muted-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground m-0">{isEdit ? 'Edit Category' : 'Create Category'}</h1>
            <p className="text-xs text-muted-foreground">{isEdit ? 'Update category details and settings.' : 'Add a new category with full configuration and SEO.'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/categories')}
            className="h-9 px-4 text-xs font-semibold rounded-md border border-border bg-card hover:bg-secondary text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="h-9 px-4 text-xs font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isEdit ? 'Update Category' : 'Save Category'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        {/* Left Form Content */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-foreground">Basic Information</h3>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Title <span className="text-destructive">*</span>
                </label>
                <input
                  name="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Audio & Headphones"
                  className="w-full h-9 px-3 rounded-md border border-input bg-card text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    SKU / Slug
                  </label>
                  <input
                    name="sku"
                    type="text"
                    value={formData.sku}
                    onChange={handleChange}
                    placeholder="Leave blank to auto-generate"
                    className="w-full h-9 px-3 rounded-md border border-input bg-card text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Parent Category
                  </label>
                  <select
                    name="parentId"
                    value={formData.parentId}
                    onChange={handleChange}
                    className="w-full h-9 px-3 rounded-md border border-input bg-card text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="">None (Top Level)</option>
                    {!catLoading && categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>{cat.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Brief description for catalog display..."
                  className="w-full p-3 rounded-md border border-input bg-card text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Long Description (Optional)
                </label>
                <textarea
                  name="descriptionLong"
                  value={formData.descriptionLong}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Detailed description..."
                  className="w-full p-3 rounded-md border border-input bg-card text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-y"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Form Content */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-foreground">Thumbnail Image</h3>
            </CardHeader>
            <CardContent className="p-4 flex flex-col items-center justify-center border-t border-border">
              <div className="w-full flex flex-col gap-2 relative">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />
                
                {selectedMediaUrl ? (
                  <div className="w-full relative group rounded-md overflow-hidden border border-border">
                    <img src={selectedMediaUrl} alt="Thumbnail" className="w-full h-auto object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={(e) => { e.preventDefault(); fileInputRef.current?.click(); }}
                        disabled={isUploading}
                        className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-md flex items-center gap-2"
                      >
                        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Change'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    className={`w-full h-32 border-2 border-dashed border-border rounded-md flex flex-col items-center justify-center text-muted-foreground transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-secondary hover:text-foreground cursor-pointer'}`}
                  >
                    {isUploading ? (
                      <Loader2 className="h-6 w-6 mb-2 animate-spin" />
                    ) : (
                      <ImagePlus className="h-6 w-6 mb-2" />
                    )}
                    <span className="text-xs font-medium">{isUploading ? 'Uploading...' : 'Upload Thumbnail'}</span>
                  </div>
                )}
                
                <div className="mt-2">
                  <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">
                    Or Paste Media ID
                  </label>
                  <input
                    name="thumbnailMediaId"
                    type="text"
                    value={formData.thumbnailMediaId}
                    onChange={handleChange}
                    placeholder="Enter UUID of media"
                    className="w-full h-8 px-2 rounded-md border border-input bg-card text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-foreground">SEO Configuration</h3>
            </CardHeader>
            <CardContent className="p-4 space-y-4 border-t border-border">
              <div>
                <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">
                  Meta Subtitle / Title
                </label>
                <input
                  name="subtitle"
                  type="text"
                  value={formData.subtitle}
                  onChange={handleChange}
                  placeholder="SEO Title"
                  className="w-full h-9 px-3 rounded-md border border-input bg-card text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
