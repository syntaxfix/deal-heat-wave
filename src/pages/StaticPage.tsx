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
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  canonical_url: string | null;
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
      .maybeSingle();

    if (error) {
      console.error('Error fetching static page:', error);
      setPage(null);
    } else if (data) {
      setPage(data);
      
      // Set meta tags
      document.title = data.meta_title || `${data.title} - DealSpark`;
      
      const metaDescriptionTag = document.querySelector('meta[name="description"]');
      if (metaDescriptionTag) {
        const description = data.meta_description || `Learn more about ${data.title} on DealSpark.`;
        metaDescriptionTag.setAttribute('content', description);
      }
      
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', data.canonical_url || window.location.href);
    } else {
      setPage(null);
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
