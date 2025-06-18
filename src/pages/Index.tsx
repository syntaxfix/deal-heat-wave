
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrency } from '@/hooks/useCurrency';
import Header from '@/components/Header';
import DealListings from '@/components/DealListings';
import { ViewType } from '@/components/ViewSwitcher';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Package, Users, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';

interface FeaturedDeal {
  id: string;
  title: string;
  slug: string;
  description?: string;
  image_url?: string;
  original_price?: number;
  discounted_price?: number;
  discount_percentage?: number;
  heat_score: number;
  upvotes: number;
  shops?: { name: string; slug: string };
  categories?: { name: string; slug: string };
}

interface SystemSettings {
  homepage_meta_title?: string;
  homepage_meta_description?: string;
  homepage_meta_keywords?: string;
}

const Index = () => {
  const { formatPrice } = useCurrency();
  const [featuredDeals, setFeaturedDeals] = useState<FeaturedDeal[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({});
  const [stats, setStats] = useState({
    totalDeals: 0,
    totalUsers: 0,
    totalShops: 0,
  });

  useEffect(() => {
    fetchFeaturedDeals();
    fetchSystemSettings();
    fetchStats();
  }, []);

  const fetchFeaturedDeals = async () => {
    const { data } = await supabase
      .from('featured_deals')
      .select(`
        deals (
          id,
          title,
          slug,
          description,
          image_url,
          original_price,
          discounted_price,  
          discount_percentage,
          heat_score,
          upvotes,
          shops (name, slug),
          categories (name, slug)
        )
      `)
      .order('display_order')
      .limit(6);

    if (data) {
      const deals = data.map(item => item.deals).filter(Boolean) as FeaturedDeal[];
      setFeaturedDeals(deals);
    }
  };

  const fetchSystemSettings = async () => {
    const { data } = await supabase
      .from('system_settings')
      .select('key, value')
      .in('key', ['homepage_meta_title', 'homepage_meta_description', 'homepage_meta_keywords']);
    
    if (data) {
      const settings = data.reduce((acc, { key, value }) => {
        if (key) acc[key] = value;
        return acc;
      }, {} as SystemSettings);
      setSystemSettings(settings);
    }
  };

  const fetchStats = async () => {
    const [dealsResult, usersResult, shopsResult] = await Promise.all([
      supabase.from('deals').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('shops').select('id', { count: 'exact', head: true }),
    ]);

    setStats({
      totalDeals: dealsResult.count || 0,
      totalUsers: usersResult.count || 0,  
      totalShops: shopsResult.count || 0,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        title={systemSettings.homepage_meta_title || "DealSpark - Hottest Deals & Discounts"}
        description={systemSettings.homepage_meta_description || "Discover amazing deals, voted by community. Find the hottest discounts and save money on your favorite products."}
        keywords={systemSettings.homepage_meta_keywords || "deals, discounts, coupons, savings, shopping, bargains"}
        canonical={window.location.origin}
        ogTitle={systemSettings.homepage_meta_title || "DealSpark - Hottest Deals & Discounts"}  
        ogDescription={systemSettings.homepage_meta_description || "Discover amazing deals, voted by community"}
        ogUrl={window.location.origin}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "DealSpark",
          "description": systemSettings.homepage_meta_description || "Discover amazing deals, voted by community",
          "url": window.location.origin
        }}
      />
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Discover the Hottest Deals
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Community-driven deals that save you money
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/deals">Browse All Deals</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600" asChild>
              <Link to="/post-deal">Post a Deal</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{stats.totalDeals.toLocaleString()}</h3>
              <p className="text-gray-600">Active Deals</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</h3>
              <p className="text-gray-600">Deal Hunters</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{stats.totalShops.toLocaleString()}</h3>
              <p className="text-gray-600">Partner Stores</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Deals */}
      {featuredDeals.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Deals</h2>
                <p className="text-gray-600">Hand-picked deals with the highest community ratings</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredDeals.map((deal) => (
                  <Card key={deal.id} className="hover:shadow-lg transition-shadow">
                    <div className="aspect-video overflow-hidden rounded-t-lg">
                      {deal.image_url && (
                        <img
                          src={deal.image_url}
                          alt={deal.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </div>
                    
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="flex items-center space-x-1">
                          <TrendingUp className="h-3 w-3" />
                          <span>{deal.heat_score}°</span>
                        </Badge>
                        {deal.discount_percentage && (
                          <Badge variant="destructive">
                            -{deal.discount_percentage}% OFF
                          </Badge>
                        )}
                      </div>
                      
                      <CardTitle className="line-clamp-2">
                        <Link to={`/deal/${deal.slug}`} className="hover:text-primary">
                          {deal.title}
                        </Link>
                      </CardTitle>
                      
                      {deal.description && (
                        <CardDescription className="line-clamp-2">
                          {deal.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    
                    <CardContent>
                      {(deal.original_price || deal.discounted_price) && (
                        <div className="flex items-center space-x-2 mb-4">
                          {deal.discounted_price && (
                            <span className="text-2xl font-bold text-green-600">
                              {formatPrice(deal.discounted_price)}
                            </span>
                          )}
                          {deal.original_price && deal.discounted_price && (
                            <span className="text-lg text-gray-500 line-through">
                              {formatPrice(deal.original_price)}
                            </span>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        {deal.shops && (
                          <Link 
                            to={`/shop/${deal.shops.slug}`}
                            className="text-sm text-gray-600 hover:text-primary"
                          >
                            {deal.shops.name}
                          </Link>
                        )}
                        <span className="text-sm text-gray-500">
                          {deal.upvotes} votes
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="text-center mt-12">
                <Button size="lg" asChild>
                  <Link to="/deals">View All Deals</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Latest Deals */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Latest Deals</h2>
              <p className="text-gray-600">Fresh deals added by our community</p>
            </div>
            
            <DealListings
              sortBy="newest"
              viewType="grid"
              limit={12}
            />
            
            <div className="text-center mt-12">
              <Button size="lg" variant="outline" asChild>
                <Link to="/deals">Explore More Deals</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
