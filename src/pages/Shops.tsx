
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Store, ExternalLink, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Shop {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  website_url: string;
  category: string;
  deal_count: number;
  coupon_count: number;
}

const Shops = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    // Fetch shops with deal and coupon counts
    const { data: shopsData, error: shopsError } = await supabase
      .from('shops')
      .select('*')
      .order('name');

    if (shopsError) {
      console.error('Error fetching shops:', shopsError);
      setLoading(false);
      return;
    }

    // Get deal counts for each shop
    const shopsWithCounts = await Promise.all(
      (shopsData || []).map(async (shop) => {
        const [{ count: dealCount }, { count: couponCount }] = await Promise.all([
          supabase
            .from('deals')
            .select('*', { count: 'exact', head: true })
            .eq('shop_id', shop.id)
            .eq('status', 'approved'),
          supabase
            .from('coupons')
            .select('*', { count: 'exact', head: true })
            .eq('shop_id', shop.id)
        ]);

        return {
          ...shop,
          deal_count: dealCount || 0,
          coupon_count: couponCount || 0
        };
      })
    );

    setShops(shopsWithCounts);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Store className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Popular Shops</h1>
            </div>
            <p className="text-gray-600">
              Discover deals and coupons from your favorite brands and retailers
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-4" />
                    <div className="flex space-x-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : shops.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No shops found
                </h3>
                <p className="text-gray-600">
                  Check back soon for new shops and deals!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shops.map((shop) => (
                <Card key={shop.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={shop.logo_url} alt={shop.name} />
                        <AvatarFallback>
                          <Store className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{shop.name}</CardTitle>
                        {shop.category && (
                          <Badge variant="secondary" className="text-xs">
                            {shop.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {shop.description && (
                      <CardDescription className="mb-4 line-clamp-2">
                        {shop.description}
                      </CardDescription>
                    )}

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex space-x-4 text-sm text-gray-600">
                        <span>{shop.deal_count} deals</span>
                        <span>{shop.coupon_count} coupons</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Link
                        to={`/shop/${shop.slug}`}
                        className="flex-1"
                      >
                        <Button variant="limited-time" className="w-full">
                          View Deals
                        </Button>
                      </Link>
                      {shop.website_url && (
                        <Button
                          asChild
                          variant="outline"
                          size="icon"
                          className="flex-shrink-0"
                        >
                          <a
                            href={shop.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
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

export default Shops;
