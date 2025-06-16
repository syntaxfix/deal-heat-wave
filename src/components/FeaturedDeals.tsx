
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import DealCard from '@/components/DealCard';
import { Button } from '@/components/ui/button';
import { ArrowRight, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';

const fetchFeaturedDeals = async () => {
  const { data, error } = await supabase
    .from('deals')
    .select(`
      *,
      shops(name, slug, logo_url),
      categories(name, slug)
    `)
    .eq('status', 'approved')
    .limit(6);

  if (error) throw error;
  return data || [];
};

export const FeaturedDeals = () => {
  const { data: deals, isLoading } = useQuery({
    queryKey: ['featured-deals'],
    queryFn: fetchFeaturedDeals,
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Deals</h2>
            <div className="animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-200 h-64 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!deals || deals.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Flame className="h-6 w-6 text-orange-500 mr-2" />
            <h2 className="text-3xl font-bold text-gray-900">Featured Deals</h2>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hand-picked deals that our community loves. Don't miss out on these amazing offers!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>

        <div className="text-center">
          <Button asChild variant="outline" size="lg">
            <Link to="/deals">
              View All Deals
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
