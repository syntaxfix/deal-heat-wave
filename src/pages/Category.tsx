
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DealListings from '@/components/DealListings';
import CategoryFilterBar from '@/components/CategoryFilterBar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
}

interface Shop {
  id: string;
  name: string;
  slug: string;
}

const fetchCategoryBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw new Error(error.message);
  return data as Category;
};

const fetchShops = async () => {
  const { data, error } = await supabase
    .from('shops')
    .select('id, name, slug')
    .order('name');

  if (error) throw new Error(error.message);
  return data as Shop[];
};

const Category = () => {
  const { slug } = useParams<{ slug: string }>();
  const [selectedShop, setSelectedShop] = useState('');
  const [sortBy, setSortBy] = useState('hot');

  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => fetchCategoryBySlug(slug!),
    enabled: !!slug,
  });

  const { data: shops } = useQuery({
    queryKey: ['shops'],
    queryFn: fetchShops,
  });

  // Update page metadata when category loads
  useEffect(() => {
    if (category) {
      document.title = category.meta_title || `${category.name} Deals - Find the Best Discounts`;
      
      // Update meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', 
        category.meta_description || `Discover amazing ${category.name.toLowerCase()} deals and discounts. Save money on top brands and products.`
      );

      // Update meta keywords
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (category.meta_keywords) {
        if (!metaKeywords) {
          metaKeywords = document.createElement('meta');
          metaKeywords.setAttribute('name', 'keywords');
          document.head.appendChild(metaKeywords);
        }
        metaKeywords.setAttribute('content', category.meta_keywords);
      } else if (metaKeywords) {
        metaKeywords.remove();
      }
    }
  }, [category]);

  if (categoryLoading) {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
          <p className="text-gray-600">The category you're looking for doesn't exist.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/categories">Categories</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage>{category.name}</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Category Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-4xl font-bold text-gray-900">{category.name}</h1>
            <Badge variant="secondary" className="text-sm">Category</Badge>
          </div>
          
          {category.description && (
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-6">
                <p className="text-gray-700 text-lg leading-relaxed">
                  {category.description}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Category-specific Filter Bar (category is locked) */}
        <CategoryFilterBar
          shops={shops || []}
          selectedShop={selectedShop}
          sortBy={sortBy}
          onShopChange={setSelectedShop}
          onSortChange={setSortBy}
          categoryName={category.name}
        />

        {/* Deal Listings */}
        <DealListings
          categorySlug={slug}
          shopSlug={selectedShop}
          sortBy={sortBy}
        />
      </div>
      
      <Footer />
    </div>
  );
};

export default Category;
