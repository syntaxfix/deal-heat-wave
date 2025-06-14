
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import VotingSystem from '@/components/VotingSystem';
import CommentSection from '@/components/CommentSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, ExternalLink, Store, Tag, Clock, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Deal {
  id: string;
  title: string;
  description: string;
  image_url: string;
  original_price: number;
  discounted_price: number;
  discount_percentage: number;
  heat_score: number;
  upvotes: number;
  downvotes: number;
  views: number;
  affiliate_link: string;
  created_at: string;
  expires_at: string;
  category_id: string;
  shop_id: string;
  user_id: string;
  categories: { name: string; slug: string } | null;
  shops: { name: string; slug: string; logo_url: string } | null;
  profiles: { username: string; full_name: string; avatar_url: string } | null;
}

const DealDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchDeal();
      incrementViews();
    }
  }, [id]);

  const fetchDeal = async () => {
    if (!id) return;

    // First get the deal
    const { data: dealData, error: dealError } = await supabase
      .from('deals')
      .select('*')
      .eq('id', id)
      .eq('status', 'approved')
      .single();

    if (dealError) {
      console.error('Error fetching deal:', dealError);
      setLoading(false);
      return;
    }

    if (!dealData) {
      setDeal(null);
      setLoading(false);
      return;
    }

    // Fetch related data
    const promises = [];

    // Get category if category_id exists
    if (dealData.category_id) {
      promises.push(
        supabase
          .from('categories')
          .select('name, slug')
          .eq('id', dealData.category_id)
          .single()
      );
    } else {
      promises.push(Promise.resolve({ data: null, error: null }));
    }

    // Get shop if shop_id exists
    if (dealData.shop_id) {
      promises.push(
        supabase
          .from('shops')
          .select('name, slug, logo_url')
          .eq('id', dealData.shop_id)
          .single()
      );
    } else {
      promises.push(Promise.resolve({ data: null, error: null }));
    }

    // Get profile if user_id exists
    if (dealData.user_id) {
      promises.push(
        supabase
          .from('profiles')
          .select('username, full_name, avatar_url')
          .eq('id', dealData.user_id)
          .single()
      );
    } else {
      promises.push(Promise.resolve({ data: null, error: null }));
    }

    const [categoryResult, shopResult, profileResult] = await Promise.all(promises);

    setDeal({
      ...dealData,
      categories: categoryResult.data,
      shops: shopResult.data,
      profiles: profileResult.data
    });

    // Set document title
    if (dealData) {
      document.title = `${dealData.title} - DealSpark`;
    }
    
    setLoading(false);
  };

  const incrementViews = async () => {
    if (!id) return;

    // Simple increment without RPC since it might not exist
    const { data: currentDeal } = await supabase
      .from('deals')
      .select('views')
      .eq('id', id)
      .single();

    if (currentDeal) {
      await supabase
        .from('deals')
        .update({ views: (currentDeal.views || 0) + 1 })
        .eq('id', id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-32 mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Skeleton className="h-80" />
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-12 w-32" />
              </div>
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Deal not found
            </h1>
            <p className="text-gray-600 mb-6">
              The deal you're looking for doesn't exist or has been removed.
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
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Deals
            </Link>
          </Button>

          {/* Deal Details */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Image */}
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  {deal.image_url ? (
                    <img
                      src={deal.image_url}
                      alt={deal.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200">
                      <Store className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-6">
                  {/* Category and Shop */}
                  <div className="flex items-center justify-between">
                    {deal.categories && (
                      <Link 
                        to={`/category/${deal.categories.slug}`}
                        className="flex items-center space-x-1 text-sm text-primary hover:underline"
                      >
                        <Tag className="h-3 w-3" />
                        <span>{deal.categories.name}</span>
                      </Link>
                    )}
                    {deal.shops && (
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={deal.shops.logo_url} />
                          <AvatarFallback className="text-xs">
                            {deal.shops.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <Link 
                          to={`/shop/${deal.shops.slug}`}
                          className="text-sm text-gray-600 hover:text-primary"
                        >
                          {deal.shops.name}
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    {deal.title}
                  </h1>

                  {/* Description */}
                  {deal.description && (
                    <p className="text-gray-600 leading-relaxed">
                      {deal.description}
                    </p>
                  )}

                  {/* Price */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl font-bold text-green-600">
                        ${deal.discounted_price?.toFixed(2)}
                      </span>
                      <span className="text-lg text-gray-500 line-through">
                        ${deal.original_price?.toFixed(2)}
                      </span>
                      <Badge className="bg-green-600 text-white">
                        {deal.discount_percentage}% OFF
                      </Badge>
                    </div>
                    <p className="text-sm text-green-600 font-medium">
                      You save ${((deal.original_price || 0) - (deal.discounted_price || 0)).toFixed(2)}
                    </p>
                  </div>

                  {/* Voting System */}
                  <VotingSystem
                    dealId={deal.id}
                    initialUpvotes={deal.upvotes}
                    initialDownvotes={deal.downvotes}
                    initialHeatScore={deal.heat_score}
                  />

                  {/* Get Deal Button */}
                  {deal.affiliate_link && (
                    <Button
                      size="lg"
                      className="w-full text-lg py-3"
                      asChild
                    >
                      <a
                        href={deal.affiliate_link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span>Get This Deal</span>
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </a>
                    </Button>
                  )}

                  {/* Meta Information */}
                  <div className="pt-4 border-t border-gray-200 space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>Posted {formatDistanceToNow(new Date(deal.created_at), { addSuffix: true })}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{deal.views || 0} views</span>
                      </div>
                    </div>
                    
                    {deal.profiles && (
                      <div className="flex items-center space-x-2">
                        <span>Posted by:</span>
                        <Avatar className="h-4 w-4">
                          <AvatarImage src={deal.profiles.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {deal.profiles.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span>{deal.profiles.full_name || deal.profiles.username || 'Anonymous'}</span>
                      </div>
                    )}

                    {deal.expires_at && (
                      <div className="text-red-600">
                        <span>Expires: {new Date(deal.expires_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <CommentSection dealId={deal.id} />
        </div>
      </div>
    </div>
  );
};

export default DealDetail;
