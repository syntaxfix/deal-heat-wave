
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen } from 'lucide-react';

interface StaticPageData {
  id: string;
  title: string;
  slug: string;
  content: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  canonical_url: string;
}

const StaticPage = () => {
  const location = useLocation();
  const [page, setPage] = useState<StaticPageData | null>(null);
  const [loading, setLoading] = useState(true);

  // Get slug from pathname (remove leading slash)
  const slug = location.pathname.substring(1);

  useEffect(() => {
    fetchStaticPage();
  }, [slug]);

  const fetchStaticPage = async () => {
    const { data, error } = await supabase
      .from('static_pages')
      .select('*')
      .eq('slug', slug)
      .eq('is_visible', true)
      .single();

    if (error) {
      console.error('Error fetching static page:', error);
      setPage(null);
    } else {
      setPage(data);
      
      // Set meta tags
      if (data.meta_title) {
        document.title = data.meta_title;
      } else {
        document.title = `${data.title} - DealSpark`;
      }
      
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription && data.meta_description) {
        metaDescription.setAttribute('content', data.meta_description);
      }
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-12 w-3/4 mb-6" />
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Page not found
            </h1>
            <p className="text-gray-600">
              The page you're looking for doesn't exist or has been removed.
            </p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{page.title}</h1>
          
          <Card>
            <CardContent className="pt-6">
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StaticPage;
