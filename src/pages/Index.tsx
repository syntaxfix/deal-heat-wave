
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import FilterBar from '@/components/FilterBar';
import DealCard from '@/components/DealCard';
import { mockDeals, type Deal } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('heat');
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Simulate loading deals
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setDeals(mockDeals);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleMenuToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleFilterChange = (filters: string[]) => {
    setActiveFilters(filters);
    // In a real app, this would trigger an API call
    console.log('Filters changed:', filters);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    // In a real app, this would trigger an API call
    console.log('Sort changed:', sort);
  };

  const loadMore = () => {
    setIsLoading(true);
    // Simulate loading more deals
    setTimeout(() => {
      const newDeals = [...mockDeals].map(deal => ({
        ...deal,
        id: deal.id + '_' + Math.random(),
        postedTime: '1 day ago'
      }));
      setDeals(prev => [...prev, ...newDeals]);
      setIsLoading(false);
      
      // Simulate no more deals after a few loads
      if (deals.length > 20) {
        setHasMore(false);
      }
    }, 1500);
  };

  const filteredDeals = deals.filter(deal => {
    if (activeFilters.length === 0) return true;
    
    return activeFilters.some(filter => {
      switch (filter) {
        case 'hot':
          return deal.heatScore >= 80;
        case 'trending':
          return deal.upvotes > 100;
        case 'new':
          return deal.postedTime.includes('hour');
        case 'top-rated':
          return deal.heatScore >= 70;
        default:
          return true;
      }
    });
  });

  const sortedDeals = [...filteredDeals].sort((a, b) => {
    switch (sortBy) {
      case 'heat':
        return b.heatScore - a.heatScore;
      case 'newest':
        return a.postedTime.localeCompare(b.postedTime);
      case 'price-low':
        return a.discountedPrice - b.discountedPrice;
      case 'price-high':
        return b.discountedPrice - a.discountedPrice;
      case 'discount':
        return b.discountPercentage - a.discountPercentage;
      default:
        return b.heatScore - a.heatScore;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuToggle={handleMenuToggle} isMenuOpen={isSidebarOpen} />
      
      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <main className="flex-1 md:ml-64">
          <FilterBar
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
            sortBy={sortBy}
            onSortChange={handleSortChange}
          />
          
          <div className="container px-4 py-6">
            {/* Hero section */}
            <div className="bg-gradient-to-r from-deals-hot to-deals-fire rounded-2xl p-8 mb-8 text-white">
              <div className="max-w-2xl">
                <h1 className="text-4xl font-bold mb-4">
                  Discover the Hottest Deals
                </h1>
                <p className="text-xl opacity-90 mb-6">
                  Join our community of deal hunters and never miss a bargain again. 
                  From tech gadgets to fashion finds, we've got you covered!
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button variant="secondary" size="lg">
                    Post a Deal
                  </Button>
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-deals-hot">
                    Browse Categories
                  </Button>
                </div>
              </div>
            </div>

            {/* Deals grid */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  {activeFilters.length > 0 ? 'Filtered Deals' : 'Latest Deals'}
                </h2>
                <div className="text-sm text-muted-foreground">
                  Showing {sortedDeals.length} deals
                </div>
              </div>
              
              {isLoading && deals.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Loading deals...</span>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {sortedDeals.map((deal, index) => (
                      <div 
                        key={deal.id}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <DealCard deal={deal} />
                      </div>
                    ))}
                  </div>
                  
                  {hasMore && (
                    <div className="flex justify-center py-8">
                      <Button 
                        onClick={loadMore} 
                        disabled={isLoading}
                        variant="outline"
                        size="lg"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Loading more deals...
                          </>
                        ) : (
                          'Load More Deals'
                        )}
                      </Button>
                    </div>
                  )}
                  
                  {!hasMore && deals.length > 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      You've reached the end! Check back later for more deals.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
