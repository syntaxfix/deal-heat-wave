
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Store, ArrowRight } from 'lucide-react';
import { mockShops, type Shop } from '@/data/shopsData';

const Shops = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [shops, setShops] = useState<Shop[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    document.title = 'All Shops & Stores | Deal Heat Wave';
    document.querySelector('meta[name="description"]')?.setAttribute('content', 'Browse all shops and stores with active deals, discount codes, and cashback offers.');
    
    setShops(mockShops);
  }, []);

  const handleMenuToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const filteredShops = shops.filter(shop =>
    shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shop.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuToggle={handleMenuToggle} isMenuOpen={isSidebarOpen} />
      
      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <main className="flex-1 md:ml-64">
          <div className="container px-4 py-6">
            {/* Hero section */}
            <div className="bg-gradient-to-r from-primary to-orange-600 rounded-2xl p-8 mb-8 text-white">
              <h1 className="text-4xl font-bold mb-4">All Shops & Stores</h1>
              <p className="text-xl opacity-90 mb-6">
                Discover exclusive deals and discount codes from your favorite retailers
              </p>
              
              {/* Search */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 w-4 h-4" />
                <Input
                  placeholder="Search shops..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/20 border-white/30 placeholder:text-white/70 text-white"
                />
              </div>
            </div>

            {/* Shops grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredShops.map((shop) => (
                <Link key={shop.id} to={`/shop/${shop.slug}`}>
                  <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        <img 
                          src={shop.logo}
                          alt={shop.name}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      </div>
                      
                      <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                        {shop.name}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {shop.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 justify-center mb-4">
                        {shop.activeDeals > 0 && (
                          <Badge variant="secondary">
                            {shop.activeDeals} Active Deals
                          </Badge>
                        )}
                        {shop.coupons.length > 0 && (
                          <Badge variant="outline">
                            {shop.coupons.length} Coupons
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-center text-sm text-primary group-hover:text-primary/80">
                        View Shop
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            
            {filteredShops.length === 0 && (
              <div className="text-center py-12">
                <Store className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No shops found</h3>
                <p className="text-muted-foreground">Try adjusting your search terms</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Shops;
