
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DealListings from '@/components/DealListings';
import FilterBar from '@/components/FilterBar';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const AllDeals = () => {
  const [sortBy, setSortBy] = useState('hot');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedShop, setSelectedShop] = useState('');

  // Fetch categories for the filter
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch shops for the filter
  const { data: shops = [] } = useQuery({
    queryKey: ['shops'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shops')
        .select('id, name, slug')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">All Deals</h1>
            <p className="text-gray-600">Discover the latest deals and save big on your favorite products</p>
          </div>
          
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
          
          <DealListings 
            categorySlug={selectedCategory}
            shopSlug={selectedShop}
            sortBy={sortBy}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AllDeals;
