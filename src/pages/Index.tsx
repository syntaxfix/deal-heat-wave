import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import DealCard from '@/components/DealCard';
import FilterBar from '@/components/FilterBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Flame, Store, BookOpen } from 'lucide-react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Deal {
  id: string;
  title: string;
  slug: string;
  summary: string;
  image_url: string;
  original_price: number;
  discounted_price: number;
}

const Index = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [featuredShops, setFeaturedShops] = useState<any[]>([]);
  const [featuredCategories, setFeaturedCategories] = useState<any[]>([]);
  const [latestBlogs, setLatestBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    await Promise.all([
      fetchDeals(true),
      fetchFeaturedShops(),
      fetchFeaturedCategories(),
      fetchLatestBlogs(),
    ]);
    setLoading(false);
  };

  const fetchFeaturedShops = async () => {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .limit(6);

    if (error) {
      console.error('Error fetching featured shops:', error);
    } else {
      setFeaturedShops(data || []);
    }
  };

  const fetchFeaturedCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .limit(8);

    if (error) {
      console.error('Error fetching featured categories:', error);
    } else {
      setFeaturedCategories(data || []);
    }
  };

  const fetchLatestBlogs = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      console.error('Error fetching latest blogs:', error);
    } else {
      setLatestBlogs(data || []);
    }
  };

  const fetchDeals = async (initialLoad = false) => {
    if (initialLoad) {
      setPage(1);
      setHasMore(true);
    }

    const { data, error, count } = await supabase
      .from('deals')
      .select('*', { count: 'exact' })
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .range((page - 1) * 9, page * 9 - 1);

    if (error) {
      console.error('Error fetching deals:', error);
    } else {
      if (initialLoad) {
        setDeals(data || []);
      } else {
        setDeals((prevDeals) => [...prevDeals, ...(data || [])]);
      }

      if (data && data.length < 9) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    }
  };

  const loadMoreDeals = async () => {
    setPage((prevPage) => prevPage + 1);
    await fetchDeals();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg: grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-40 w-full mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Discover Amazing Deals
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Save money with the best deals, discounts, and offers from top brands
          </p>
          <Link to="/post-deal">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              Post a Deal
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Featured Shops */}
        {featuredShops.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Featured Shops</h2>
              <Link to="/shops" className="text-primary hover:underline">
                View all shops
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {featuredShops.map((shop) => (
                <Link key={shop.id} to={`/shop/${shop.slug}`} className="group">
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4 text-center">
                      <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-lg flex items-center justify-center">
                        {shop.logo_url ? (
                          <img
                            src={shop.logo_url}
                            alt={shop.name}
                            className="w-12 h-12 object-contain"
                          />
                        ) : (
                          <Store className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                        {shop.name}
                      </h3>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Featured Categories */}
        {featuredCategories.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Popular Categories</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {featuredCategories.map((category) => (
                <Link key={category.id} to={`/category/${category.slug}`} className="group">
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4 text-center">
                      <div className="w-12 h-12 mx-auto mb-2 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-medium text-xs group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Hot Deals */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Flame className="h-6 w-6 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Hot Deals</h2>
            </div>
            <FilterBar />
          </div>

          {deals.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No deals available
                </h3>
                <p className="text-gray-600">
                  Check back soon for amazing deals and discounts!
                </p>
              </CardContent>
            </Card>
          ) : (
            <InfiniteScroll
              dataLength={deals.length}
              next={loadMoreDeals}
              hasMore={hasMore}
              loader={
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="pt-6">
                        <Skeleton className="h-40 w-full mb-4" />
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full mb-4" />
                        <Skeleton className="h-4 w-2/3" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {deals.map((deal) => (
                  <DealCard key={deal.id} deal={deal} />
                ))}
              </div>
            </InfiniteScroll>
          )}
        </section>

        {/* Latest Blog Posts */}
        {latestBlogs.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Latest Blog Posts</h2>
              <Link to="/blog" className="text-primary hover:underline">
                View all posts
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestBlogs.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="w-full h-32 bg-gray-200 rounded-lg overflow-hidden mb-4">
                      {post.featured_image ? (
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <BookOpen className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <Badge variant="secondary" className="mb-2">
                      {post.category}
                    </Badge>
                    <Link to={`/blog/${post.slug}`}>
                      <h3 className="font-semibold text-gray-900 mb-2 hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                    </Link>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {post.summary}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Index;
