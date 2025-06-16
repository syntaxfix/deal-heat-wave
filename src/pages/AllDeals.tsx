
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DealListings from '@/components/DealListings';
import FilterBar from '@/components/FilterBar';
import { useState } from 'react';

const AllDeals = () => {
  const [sortBy, setSortBy] = useState('hot');
  const [categorySlug, setCategorySlug] = useState('');

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
            sortBy={sortBy}
            onSortChange={setSortBy}
            categorySlug={categorySlug}
            onCategoryChange={setCategorySlug}
          />
          
          <DealListings 
            categorySlug={categorySlug}
            sortBy={sortBy}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AllDeals;
