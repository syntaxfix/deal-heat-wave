import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import DealCard from '@/components/DealCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Store, ExternalLink, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface Shop {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  website_url: string;
  category: string;
}

interface Deal {
  id: string;
  title: string;
  description: string;
  summary?: string;
  image_url: string;
  original_price: number;
  discounted_price: number;
  discount_percentage: number;
  heat_score: number;
  upvotes: number;
  downvotes: number;
  created_at: string;
  affiliate_link: string;
  slug?: string;
  categories: { name: string; slug: string };
}

interface Coupon {
  id: string;
  title: string;
  description: string;
  code: string;
  discount_percentage: number;
  discount_amount: number;
  expires_at: string;
  verified: boolean;
}

const ShopDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [shop, setShop] = useState<Shop | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchShopData();
    }
  }, [slug]);

  const fetchShopData = async () => {
    if (!slug) return;

    // Fetch shop details
    const { data: shopData, error: shopError } = await supabase
      .from('shops')
      .select('*')
      .eq('slug', slug)
      .single();

    if (shopError) {
      console.error('Error fetching shop:', shopError);
      setLoading(false);
      return;
    }

    setShop(shopData);

    // Fetch deals for this shop
    const { data: dealsData, error: dealsError } = await supabase
      .from('deals')
      .select(`
        *,
        categories:category_id (name, slug)
      `)
      .eq('shop_id', shopData.id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (!dealsError) {
      // Transform the data to match the expected Deal interface
      const transformedDeals = (dealsData || []).map(deal => ({
        ...deal,
        shops: { name: shopData.name, slug: shopData.slug, logo_url: shopData.logo_url }
      }));
      setDeals(transformedDeals);
    }

    // Fetch coupons for this shop
    const { data: couponsData, error: couponsError } = await supabase
      .from('coupons')
      .select('*')
      .eq('shop_id', shopData.id)
      .order('created_at', { ascending: false });

    if (!couponsError) {
      setCoupons(couponsData || []);
    }

    setLoading(false);
  };

  const handleCopyCoupon = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success('Coupon code copied!');
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      toast.error('Failed to copy coupon code');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <Skeleton className="h-8 w-32 mb-6" />
            <div className="flex items-center space-x-4 mb-8">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <Skeleton className="h-10 w-full mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-80" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto text-center">
            <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Shop not found
            </h1>
            <p className="text-gray-600 mb-6">
              The shop you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/shops">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Shops
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/shops">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Shops
            </Link>
          </Button>

          {/* Shop Header */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={shop.logo_url} alt={shop.name} />
                  <AvatarFallback>
                    <Store className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{shop.name}</h1>
                    {shop.category && (
                      <Badge variant="secondary">{shop.category}</Badge>
                    )}
                  </div>
                  {shop.description && (
                    <p className="text-gray-600 mb-4">{shop.description}</p>
                  )}
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      {deals.length} active deals
                    </span>
                    <span className="text-sm text-gray-600">
                      {coupons.length} coupons
                    </span>
                    {shop.website_url && (
                      <a
                        href={shop.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-sm text-primary hover:underline"
                      >
                        <span>Visit Store</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="deals" className="space-y-6">
            <TabsList>
              <TabsTrigger value="deals">Deals ({deals.length})</TabsTrigger>
              <TabsTrigger value="coupons">Coupons ({coupons.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="deals">
              {deals.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No deals available
                    </h3>
                    <p className="text-gray-600">
                      Check back soon for new deals from {shop.name}!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {deals.map((deal) => (
                    <DealCard key={deal.id} deal={deal} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="coupons">
              {coupons.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No coupons available
                    </h3>
                    <p className="text-gray-600">
                      Check back soon for new coupons from {shop.name}!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {coupons.map((coupon) => (
                    <Card key={coupon.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{coupon.title}</CardTitle>
                          {coupon.verified && (
                            <Badge className="bg-green-600">Verified</Badge>
                          )}
                        </div>
                        {coupon.description && (
                          <CardDescription>{coupon.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Code:</span>
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                              {coupon.code}
                            </code>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleCopyCoupon(coupon.code)}
                            className="flex items-center space-x-1"
                          >
                            {copiedCode === coupon.code ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                            <span>{copiedCode === coupon.code ? 'Copied' : 'Copy'}</span>
                          </Button>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          {coupon.discount_percentage && (
                            <p>Save {coupon.discount_percentage}%</p>
                          )}
                          {coupon.discount_amount && (
                            <p>Save ${coupon.discount_amount}</p>
                          )}
                          {coupon.expires_at && (
                            <p>Expires: {new Date(coupon.expires_at).toLocaleDateString()}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ShopDetail;
