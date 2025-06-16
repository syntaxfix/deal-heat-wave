
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Star, ExternalLink, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const fetchDealOfTheDay = async () => {
  const { data, error } = await supabase
    .from('featured_deals')
    .select(`
      deal:deals(
        *,
        shop:shops(name, slug, logo_url),
        categories:deal_categories(category:categories(name, slug))
      )
    `)
    .eq('is_active', true)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data?.deal || null;
};

export const DealOfTheDay = () => {
  const { data: deal, isLoading } = useQuery({
    queryKey: ['deal-of-the-day'],
    queryFn: fetchDealOfTheDay,
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-r from-orange-50 to-red-50">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="bg-gray-200 h-64 rounded-lg max-w-4xl mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  if (!deal) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-r from-orange-50 to-red-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Clock className="h-6 w-6 text-orange-500 mr-2" />
            <h2 className="text-3xl font-bold text-gray-900">Deal of the Day</h2>
          </div>
          <p className="text-gray-600">Limited time offer - grab it before it's gone!</p>
        </div>

        <Card className="max-w-4xl mx-auto shadow-xl border-2 border-orange-200">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Badge variant="destructive" className="animate-pulse">
                    Deal of the Day
                  </Badge>
                  <Badge variant="outline">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Hot
                  </Badge>
                </div>

                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                  {deal.title}
                </h3>

                <p className="text-gray-600 text-lg">
                  {deal.description}
                </p>

                <div className="flex items-center space-x-4">
                  {deal.original_price && (
                    <span className="text-2xl text-gray-400 line-through">
                      ${deal.original_price}
                    </span>
                  )}
                  {deal.deal_price && (
                    <span className="text-3xl font-bold text-green-600">
                      ${deal.deal_price}
                    </span>
                  )}
                  {deal.discount_percentage && (
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                      {deal.discount_percentage}% OFF
                    </Badge>
                  )}
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-1">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="font-semibold">{deal.upvotes || 0}</span>
                    <span className="text-gray-500">votes</span>
                  </div>
                  
                  {deal.shop && (
                    <div className="flex items-center space-x-2">
                      {deal.shop.logo_url && (
                        <img 
                          src={deal.shop.logo_url} 
                          alt={deal.shop.name}
                          className="w-6 h-6 rounded"
                        />
                      )}
                      <span className="text-gray-600">{deal.shop.name}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="flex-1">
                    <Link to={`/deal/${deal.slug}`}>
                      View Deal
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  
                  {deal.deal_url && (
                    <Button asChild variant="outline" size="lg" className="flex-1">
                      <a href={deal.deal_url} target="_blank" rel="noopener noreferrer">
                        Get Deal
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex justify-center">
                {deal.image_url ? (
                  <img 
                    src={deal.image_url} 
                    alt={deal.title}
                    className="w-full max-w-md h-64 object-cover rounded-lg shadow-lg"
                  />
                ) : (
                  <div className="w-full max-w-md h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg shadow-lg flex items-center justify-center">
                    <span className="text-gray-400 text-lg">No image available</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
