
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import DealCard from '@/components/DealCard';
import FilterBar from '@/components/FilterBar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Tag } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
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
  shops: { name: string; slug: string; logo_url: string };
}

const Category = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    if (slug) {
      fetchCategoryData();
    }
  }, [slug, sortBy]);

  const fetchCategoryData = async () => {
    if (!slug) return;

    setLoading(true);

    // Fetch category details
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (categoryError) {
      console.error('Error fetching category:', categoryError);
      setLoading(false);
      return;
    }

    setCategory(categoryData);

    // Fetch deals for this category
    let query = supabase
      .from('deals')
      .select(`
        *,
        shops:shop_id (name, slug, logo_url)
      `)
      .eq('category_id', categoryData.id)
      .eq('status', 'approved');

    // Apply sorting
    switch (sortBy) {
      case 'hot':
        query = query.order('heat_score', { ascending: false });
        break;
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'discount':
        query = query.order('discount_percentage', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    const { data: dealsData, error: dealsError } = await query;

    if (!dealsError) {
      // Transform the data to match the expected Deal interface
      const transformedDeals = (dealsData || []).map(deal => ({
        ...deal,
        categories: { name: category.name, slug: category.slug }
      }));
      setDeals(transformedDeals);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <Skeleton className="h-8 w-32 mb-6" />
            <div className="mb-8">
              <Skeleton className="h-10 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
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

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto text-center">
            <Tag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Category not found
            </h1>
            <p className="text-gray-600 mb-6">
              The category you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
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
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>

          {/* Category Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {category.name} Deals
            </h1>
            {category.description && (
              <p className="text-gray-600">{category.description}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              {deals.length} deals found
            </p>
          </div>

          <FilterBar onSortChange={setSortBy} currentSort={sortBy} />

          {deals.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No deals found in {category.name}
              </h3>
              <p className="text-gray-600 mb-6">
                Be the first to post a deal in this category!
              </p>
              <Button asChild>
                <Link to="/post-deal">Post a Deal</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deals.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Category;
