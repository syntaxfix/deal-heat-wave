
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DealListings from '@/components/DealListings';
import SearchBar from '@/components/SearchBar';
import FilterBar from '@/components/FilterBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, Package, Clock, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

interface Shop {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  description?: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  featured_image?: string;
  created_at: string;
}

interface Stats {
  totalDeals: number;
  todaysDeals: number;
  activeUsers: number;
  hotDeal?: any;
}

const Index = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalDeals: 0,
    todaysDeals: 0,
    activeUsers: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedShop, setSelectedShop] = useState('');
  const [sortBy, setSortBy] = useState('hot');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .limit(8);
      
      if (categoriesData) setCategories(categoriesData);

      // Fetch shops
      const { data: shopsData } = await supabase
        .from('shops')
        .select('*')
        .limit(12);
      
      if (shopsData) setShops(shopsData);

      // Fetch recent blog posts
      const { data: blogData } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (blogData) setBlogPosts(blogData);

      // Fetch stats
      const today = new Date().toISOString().split('T')[0];
      
      const [
        { count: totalDeals },
        { count: todaysDeals },
        { data: hotDeal }
      ] = await Promise.all([
        supabase.from('deals').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('deals').select('*', { count: 'exact', head: true }).eq('status', 'approved').gte('created_at', today),
        supabase.from('deals').select('*').eq('status', 'approved').order('heat_score', { ascending: false }).limit(1).single()
      ]);

      setStats({
        totalDeals: totalDeals || 0,
        todaysDeals: todaysDeals || 0,
        activeUsers: Math.floor(Math.random() * 100) + 50, // Simulated for now
        hotDeal: hotDeal
      });
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Stats */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Find Amazing Deals
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Discover the hottest deals, voted by our community
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <SearchBar onSearch={handleSearch} placeholder="Search for deals, shops, or products..." />
            </div>
          </div>

          {/* Community Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-4 text-center">
                <Package className="h-8 w-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.totalDeals}</div>
                <div className="text-sm opacity-80">Total Deals</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.todaysDeals}</div>
                <div className="text-sm opacity-80">Today's Deals</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.activeUsers}</div>
                <div className="text-sm opacity-80">Active Users</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {stats.hotDeal?.heat_score || 0}°
                </div>
                <div className="text-sm opacity-80">Hottest Deal</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Categories Section */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Star className="h-6 w-6 mr-2 text-yellow-500" />
                Popular Categories
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/category/${category.slug}`}
                    className="group"
                  >
                    <Card className="hover:shadow-lg transition-shadow group-hover:border-blue-300">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl mb-2">{category.icon || '📦'}</div>
                        <div className="font-semibold text-sm">{category.name}</div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
              <div className="text-center mt-4">
                <Link to="/categories">
                  <Button variant="outline" className="group">
                    View All Categories
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </section>

            {/* Shops Section */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Package className="h-6 w-6 mr-2 text-green-500" />
                Featured Shops
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {shops.map((shop) => (
                  <Link
                    key={shop.id}
                    to={`/shop/${shop.slug}`}
                    className="group"
                  >
                    <Card className="hover:shadow-lg transition-shadow group-hover:border-green-300">
                      <CardContent className="p-4 text-center">
                        {shop.logo_url ? (
                          <img
                            src={shop.logo_url}
                            alt={shop.name}
                            className="w-12 h-12 mx-auto mb-2 object-contain"
                          />
                        ) : (
                          <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded flex items-center justify-center">
                            {shop.name.charAt(0)}
                          </div>
                        )}
                        <div className="font-semibold text-xs truncate">{shop.name}</div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
              <div className="text-center mt-4">
                <Link to="/shops">
                  <Button variant="outline" className="group">
                    View All Shops
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </section>

            {/* Filter Bar */}
            <FilterBar
              categories={categories}
              shops={shops}
              selectedCategory={selectedCategory}
              selectedShop={selectedShop}
              sortBy={sortBy}
              onCategoryChange={setSelectedCategory}
              onShopChange={setSelectedShop}
              onSortChange={setSortBy}
            />

            {/* Deal Listings */}
            <DealListings
              categorySlug={selectedCategory}
              shopSlug={selectedShop}
              sortBy={sortBy}
              searchQuery={searchQuery}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="sticky top-4 space-y-6">
              {/* Hot Deal of the Day */}
              {stats.hotDeal && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <TrendingUp className="h-5 w-5 mr-2 text-red-500" />
                      🔥 Hot Deal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link to={`/deal/${stats.hotDeal.slug}`} className="block group">
                      <div className="aspect-video bg-gray-100 rounded mb-3 overflow-hidden">
                        {stats.hotDeal.image_url && (
                          <img
                            src={stats.hotDeal.image_url}
                            alt={stats.hotDeal.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        )}
                      </div>
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-blue-600">
                        {stats.hotDeal.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <Badge variant="destructive" className="text-xs">
                          {stats.hotDeal.heat_score}° Hot
                        </Badge>
                        {stats.hotDeal.discount_percentage && (
                          <Badge variant="secondary" className="text-xs">
                            -{stats.hotDeal.discount_percentage}%
                          </Badge>
                        )}
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              )}

              {/* Recent Blog Posts */}
              {blogPosts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Star className="h-5 w-5 mr-2 text-blue-500" />
                      Latest Articles
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {blogPosts.map((post) => (
                      <Link
                        key={post.id}
                        to={`/blog/${post.slug}`}
                        className="block group"
                      >
                        <div className="flex space-x-3">
                          <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                            {post.featured_image && (
                              <img
                                src={post.featured_image}
                                alt={post.title}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-blue-600">
                              {post.title}
                            </h4>
                            <p className="text-xs text-gray-500 line-clamp-2">
                              {post.summary}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                    <div className="text-center pt-2">
                      <Link to="/blog">
                        <Button variant="outline" size="sm" className="w-full">
                          View All Articles
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Community Guidelines */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Community Guidelines</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 space-y-2">
                  <p>• Post genuine deals only</p>
                  <p>• Check if deal is still active</p>
                  <p>• Use clear, descriptive titles</p>
                  <p>• Include original & sale prices</p>
                  <p>• Be respectful in comments</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
