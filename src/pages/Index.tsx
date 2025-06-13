
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import FilterBar from '@/components/FilterBar';
import DealCard from '@/components/DealCard';
import { Skeleton } from '@/components/ui/skeleton';

interface Deal {
  id: string;
  title: string;
  description: string;
  image_url: string;
  original_price: number;
  discounted_price: number;
  discount_percentage: number;
  heat_score: number;
  upvotes: number;
  downvotes: number;
  created_at: string;
  categories: { name: string; slug: string };
  shops: { name: string; slug: string; logo_url: string };
}

const Index = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchDeals();
  }, [sortBy]);

  const fetchDeals = async () => {
    setLoading(true);
    
    let query = supabase
      .from('deals')
      .select(`
        *,
        categories:category_id (name, slug),
        shops:shop_id (name, slug, logo_url)
      `)
      .eq('status', 'approved');

    // Apply sorting
    switch (sortBy) {
      case 'hot':
        query = query.order('heat_score', { ascending: false });
        break;
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'discount':
        query = query.order('discount_percentage', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query.limit(20);

    if (error) {
      console.error('Error fetching deals:', error);
    } else {
      setDeals(data || []);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🔥 Hottest Deals
              </h1>
              <p className="text-gray-600">
                Discover the best deals voted by our community
              </p>
            </div>

            <FilterBar onSortChange={setSortBy} currentSort={sortBy} />

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : deals.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No deals found
                </h3>
                <p className="text-gray-600">
                  Be the first to post a deal!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {deals.map((deal) => (
                  <DealCard
                    key={deal.id}
                    id={deal.id}
                    title={deal.title}
                    description={deal.description}
                    image={deal.image_url}
                    originalPrice={deal.original_price}
                    discountedPrice={deal.discounted_price}
                    discountPercentage={deal.discount_percentage}
                    category={deal.categories?.name || 'General'}
                    categorySlug={deal.categories?.slug || 'general'}
                    shop={deal.shops?.name || 'Unknown Shop'}
                    shopSlug={deal.shops?.slug || 'unknown'}
                    shopLogo={deal.shops?.logo_url}
                    heatScore={deal.heat_score}
                    upvotes={deal.upvotes}
                    downvotes={deal.downvotes}
                    postedTime={deal.created_at}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
