
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DealListings from '@/components/DealListings';
import ShopDetailSidebar from '@/components/ShopDetailSidebar';
import CategoryFilterBar from '@/components/CategoryFilterBar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, MapPin, Globe } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

interface Shop {
  id: string;
  name: string;
  slug: string;
  description?: string;
  long_description?: string;
  logo_url?: string;
  banner_url?: string;
  website_url?: string;
  category?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Coupon {
  id: string;
  title: string;
  code: string;
  discount_percentage?: number;
  discount_amount?: number;
  verified: boolean;
}

const fetchShopBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from('shops')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw new Error(error.message);
  return data as Shop;
};

const fetchCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name');

  if (error) throw new Error(error.message);
  return data as Category[];
};

const fetchShopCoupons = async (shopId: string) => {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('shop_id', shopId)
    .order('verified', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data as Coupon[];
};

const ShopDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('hot');

  const { data: shop, isLoading: shopLoading } = useQuery({
    queryKey: ['shop', slug],
    queryFn: () => fetchShopBySlug(slug!),
    enabled: !!slug,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const { data: coupons } = useQuery({
    queryKey: ['shop-coupons', shop?.id],
    queryFn: () => fetchShopCoupons(shop!.id),
    enabled: !!shop?.id,
  });

  // Update page metadata when shop loads
  useEffect(() => {
    if (shop) {
      document.title = shop.meta_title || `${shop.name} Deals - Best Discounts & Coupons`;
      
      // Update meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', 
        shop.meta_description || `Find the best ${shop.name} deals, discounts, and coupons. Save money on top products from ${shop.name}.`
      );

      // Update meta keywords
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (shop.meta_keywords) {
        if (!metaKeywords) {
          metaKeywords = document.createElement('meta');
          metaKeywords.setAttribute('name', 'keywords');
          document.head.appendChild(metaKeywords);
        }
        metaKeywords.setAttribute('content', shop.meta_keywords);
      } else if (metaKeywords) {
        metaKeywords.remove();
      }
    }
  }, [shop]);

  if (shopLoading) {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded w-full mb-8"></div>
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

  if (!shop) {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Shop Not Found</h1>
          <p className="text-gray-600">The shop you're looking for doesn't exist.</p>
        </div>
        <Footer />
      </div>
    );
  }

  // Filter out shops with empty slugs before passing to CategoryFilterBar
  const validShops = [];

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
              <BreadcrumbLink href="/shops">Shops</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage>{shop.name}</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Shop Banner */}
        {shop.banner_url && (
          <div className="relative h-48 md:h-64 rounded-xl overflow-hidden mb-8">
            <img
              src={shop.banner_url}
              alt={`${shop.name} banner`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
        )}

        {/* Shop Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
            {shop.logo_url && (
              <img
                src={shop.logo_url}
                alt={`${shop.name} logo`}
                className="w-24 h-24 object-contain bg-white rounded-lg border shadow-sm"
              />
            )}
            
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <h1 className="text-4xl font-bold text-gray-900">{shop.name}</h1>
                <Badge variant="secondary" className="text-sm">Store</Badge>
                {shop.category && (
                  <Badge variant="outline" className="text-sm">
                    {shop.category}
                  </Badge>
                )}
              </div>
              
              {shop.description && (
                <p className="text-xl text-gray-600 mb-4">{shop.description}</p>
              )}
              
              <div className="flex flex-wrap gap-3">
                {shop.website_url && (
                  <a
                    href={shop.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Visit Store
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
          
          {shop.long_description && (
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-6">
                <p className="text-gray-700 leading-relaxed">
                  {shop.long_description}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Filter Bar (shop is locked) */}
        <CategoryFilterBar
          shops={validShops}
          selectedShop=""
          sortBy={sortBy}
          onShopChange={() => {}} // No-op since shop is locked
          onSortChange={setSortBy}
          categoryName={`${shop.name} Deals`}
        />

        {/* Deal Listings */}
        <DealListings
          categorySlug={selectedCategory}
          shopSlug={slug}
          sortBy={sortBy}
        />

        {/* Horizontal Sidebar */}
        <ShopDetailSidebar
          categories={categories || []}
          coupons={coupons || []}
          shopName={shop.name}
        />
      </div>
      
      <Footer />
    </div>
  );
};

export default ShopDetail;
