
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import FilterBar from '@/components/FilterBar';
import DealCard from '@/components/DealCard';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { mockDeals, type Deal } from '@/data/mockData';
import { categories } from '@/data/categories';

const Category = () => {
  const { slug } = useParams<{ slug: string }>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('heat');
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentCategory, setCurrentCategory] = useState<any>(null);

  useEffect(() => {
    const category = categories.find(cat => cat.slug === slug);
    setCurrentCategory(category);
    
    if (category) {
      document.title = `${category.name} Deals | Deal Heat Wave`;
      document.querySelector('meta[name="description"]')?.setAttribute('content', `Find the best ${category.name.toLowerCase()} deals, discounts, and offers. ${category.description}`);
      
      // Filter deals by category
      setIsLoading(true);
      setTimeout(() => {
        const categoryDeals = mockDeals.filter(deal => 
          deal.category.toLowerCase() === category.name.toLowerCase()
        );
        setDeals(categoryDeals);
        setIsLoading(false);
      }, 500);
    }
  }, [slug]);

  const handleMenuToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleFilterChange = (filters: string[]) => {
    setActiveFilters(filters);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
  };

  const loadMore = () => {
    setIsLoading(true);
    setTimeout(() => {
      const newDeals = [...mockDeals].map(deal => ({
        ...deal,
        id: deal.id + '_' + Math.random(),
        postedTime: '1 day ago'
      })).filter(deal => 
        deal.category.toLowerCase() === currentCategory?.name.toLowerCase()
      );
      setDeals(prev => [...prev, ...newDeals]);
      setIsLoading(false);
      
      if (deals.length > 15) {
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

  if (!currentCategory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
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
          <FilterBar
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
            sortBy={sortBy}
            onSortChange={handleSortChange}
          />
          
          <div className="container px-4 py-6">
            {/* Category header */}
            <div className="bg-gradient-to-r from-primary to-orange-600 rounded-2xl p-8 mb-8 text-white">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                  <currentCategory.icon className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">{currentCategory.name} Deals</h1>
                  <p className="text-xl opacity-90">{currentCategory.description}</p>
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
                  
                  {hasMore && sortedDeals.length > 0 && (
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
                  
                  {sortedDeals.length === 0 && !isLoading && (
                    <div className="text-center py-12">
                      <h3 className="text-lg font-semibold mb-2">No deals found</h3>
                      <p className="text-muted-foreground">Try adjusting your filters or check back later</p>
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

export default Category;
