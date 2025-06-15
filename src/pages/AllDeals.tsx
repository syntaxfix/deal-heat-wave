
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import DealListings from '@/components/DealListings';
import FilterBar from '@/components/FilterBar';
import { Package } from 'lucide-react';
import { categories } from '@/data/categories';

interface Shop {
  id: string;
  name: string;
  slug: string;
}

const AllDeals = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedShop, setSelectedShop] = useState('');
  const [sortBy, setSortBy] = useState('hot');

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    const { data: shopsData } = await supabase
      .from('shops')
      .select('*')
      .order('name');
    
    if (shopsData) setShops(shopsData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">All Deals</h1>
            </div>
            <p className="text-gray-600">
              Discover amazing deals from all categories and stores
            </p>
          </div>

          {/* Filter Bar */}
          <FilterBar
            categories={categories}
            shops={shops}
            selectedCategory={selectedCategory}
            selectedShop={selectedShop}
            sortBy={sortBy}
            onCategoryChange={setSelectedCategory}
            onShopChange={setSelectedShop}
            onSortChange={setSortBy}
          />

          {/* Deal Listings */}
          <DealListings
            categorySlug={selectedCategory}
            shopSlug={selectedShop}
            sortBy={sortBy}
          />
        </div>
      </div>
    </div>
  );
};

export default AllDeals;
