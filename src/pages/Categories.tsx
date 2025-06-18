
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrency } from '@/hooks/useCurrency';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Grid, Folder } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import { Breadcrumbs } from '@/components/Breadcrumbs';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  deal_count?: number;
}

const Categories = () => {
  const { currency } = useCurrency();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Categories" }
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;

      // Get deal counts for each category
      const categoriesWithCounts = await Promise.all(
        (data || []).map(async (category) => {
          const { count } = await supabase
            .from('deals')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id)
            .eq('status', 'approved');

          return {
            ...category,
            deal_count: count || 0,
          };
        })
      );

      setCategories(categoriesWithCounts);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        title="Categories - DealSpark | Browse Deals by Category"
        description="Browse deals organized by categories. Find the best discounts in electronics, fashion, home & garden, and more."
        keywords="categories, deals by category, electronics deals, fashion deals, home deals"
        canonical={`${window.location.origin}/categories`}
        ogTitle="Categories - DealSpark"
        ogDescription="Browse deals organized by categories"
        ogUrl={`${window.location.origin}/categories`}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Deal Categories",
          "description": "Browse deals organized by categories",
          "url": `${window.location.origin}/categories`
        }}
      />
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Breadcrumbs items={breadcrumbItems} className="mb-6" />
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Grid className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
            </div>
            <p className="text-gray-600">
              Browse deals organized by categories - currently showing prices in {currency}
            </p>
          </div>

          {/* Categories Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-6 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <Folder className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No categories available
              </h3>
              <p className="text-gray-600">
                Check back later for new categories
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Card key={category.id} className="hover:shadow-lg transition-shadow group">
                  <CardHeader>
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        {category.icon ? (
                          <span className="text-2xl">{category.icon}</span>
                        ) : (
                          <Folder className="h-6 w-6 text-primary" />
                        )}
                      </div>
                    </div>
                    
                    <CardTitle className="group-hover:text-primary transition-colors">
                      <Link to={`/category/${category.slug}`}>
                        {category.name}
                      </Link>
                    </CardTitle>
                    
                    {category.description && (
                      <CardDescription className="line-clamp-2">
                        {category.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">
                        {category.deal_count || 0} deals
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Browse →
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories;
