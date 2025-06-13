
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import DealCard from '@/components/DealCard';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, Copy, Check } from 'lucide-react';
import { mockShops, type Shop } from '@/data/shopsData';
import { mockDeals, type Deal } from '@/data/mockData';

const ShopDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [shop, setShop] = useState<Shop | null>(null);
  const [relatedDeals, setRelatedDeals] = useState<Deal[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const foundShop = mockShops.find(s => s.slug === slug);
    setShop(foundShop || null);
    
    if (foundShop) {
      document.title = `${foundShop.name} Deals & Coupons | Deal Heat Wave`;
      document.querySelector('meta[name="description"]')?.setAttribute('content', `Find the latest ${foundShop.name} deals, discount codes, and cashback offers. ${foundShop.description}`);
      
      // Get related deals (simulate filtering by shop)
      const shopDeals = mockDeals.filter(deal => deal.shopName === foundShop.name).slice(0, 6);
      setRelatedDeals(shopDeals);
    }
  }, [slug]);

  const handleMenuToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (!shop) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Shop Not Found</h1>
          <Link to="/shops">
            <Button>Back to Shops</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuToggle={handleMenuToggle} isMenuOpen={isSidebarOpen} />
      
      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <main className="flex-1 md:ml-64">
          <div className="container px-4 py-6">
            {/* Back button */}
            <Link to="/shops" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to All Shops
            </Link>

            {/* Shop header */}
            <div className="bg-white rounded-2xl p-8 mb-8 shadow-sm">
              <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img 
                    src={shop.logo}
                    alt={shop.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{shop.name}</h1>
                  <p className="text-muted-foreground mb-4">{shop.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {shop.activeDeals > 0 && (
                      <Badge variant="default">
                        {shop.activeDeals} Active Deals
                      </Badge>
                    )}
                    {shop.coupons.length > 0 && (
                      <Badge variant="secondary">
                        {shop.coupons.length} Coupon Codes
                      </Badge>
                    )}
                    <Badge variant="outline">{shop.category}</Badge>
                  </div>
                  
                  <Button asChild>
                    <a href={shop.website} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit {shop.name}
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            {/* Coupon codes */}
            {shop.coupons.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Active Coupon Codes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {shop.coupons.map((coupon) => (
                    <Card key={coupon.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant={coupon.verified ? "default" : "outline"}>
                            {coupon.verified ? "Verified" : "Unverified"}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Expires: {coupon.expiryDate}
                          </span>
                        </div>
                        
                        <h3 className="font-semibold mb-2">{coupon.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{coupon.description}</p>
                        
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-100 rounded-lg p-3 font-mono text-center font-bold">
                            {coupon.code}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyCode(coupon.code)}
                          >
                            {copiedCode === coupon.code ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Related deals */}
            {relatedDeals.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Latest {shop.name} Deals</h2>
                <div className="space-y-4">
                  {relatedDeals.map((deal) => (
                    <DealCard key={deal.id} deal={deal} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ShopDetail;
