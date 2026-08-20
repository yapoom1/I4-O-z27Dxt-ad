import React from 'react';
import { Card, CardContent, CardHeader } from '@/shared/ui/Primitives';
import { ArrowLeft, Edit, ImagePlus, Folder } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { GET_CATEGORY } from '@/shared/graphql/queries/categories';

export const CategoryDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data, loading, error } = useQuery<any>(GET_CATEGORY, {
    variables: { id },
    fetchPolicy: 'cache-and-network'
  });

  if (loading) {
    return <div className="p-8 text-center text-sm text-muted-foreground">Loading category details...</div>;
  }

  if (error || !data?.category) {
    return (
      <div className="p-8 text-center text-sm text-destructive">
        Error loading category.
        <div className="mt-4">
          <button onClick={() => navigate('/categories')} className="text-primary hover:underline">Return to Categories</button>
        </div>
      </div>
    );
  }

  const category = data.category;

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
            <h1 className="text-xl font-bold tracking-tight text-foreground m-0">View Category</h1>
            <p className="text-xs text-muted-foreground">Category details and configuration.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/categories/${id}/edit`)}
            className="h-9 px-4 text-xs font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Category
          </button>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        {/* Left Content */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-foreground">Basic Information</h3>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Title</label>
                  <div className="text-sm font-medium">{category.title || '—'}</div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">SKU / Slug</label>
                  <div className="text-sm font-medium">{category.sku || '—'}</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Description</label>
                <div className="text-sm whitespace-pre-wrap">{category.description || '—'}</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Long Description</label>
                <div className="text-sm whitespace-pre-wrap">{category.descriptionLong || '—'}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Content */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-foreground">Thumbnail Image</h3>
            </CardHeader>
            <CardContent className="p-4 flex flex-col items-center justify-center border-t border-border">
              <div className="w-full flex flex-col gap-2 relative">
                {category.thumbnail?.mediaUrl ? (
                  <div className="w-full relative rounded-md overflow-hidden border border-border">
                    <img src={category.thumbnail.mediaUrl} alt="Thumbnail" className="w-full h-auto object-cover" />
                  </div>
                ) : (
                  <div className="w-full h-32 border-2 border-dashed border-border rounded-md flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
                    <ImagePlus className="h-6 w-6 mb-2 opacity-50" />
                    <span className="text-xs font-medium">No Image</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-foreground">SEO Configuration</h3>
            </CardHeader>
            <CardContent className="p-4 space-y-4 border-t border-border">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Meta Subtitle / Title</label>
                <div className="text-sm">{category.subtitle || '—'}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
