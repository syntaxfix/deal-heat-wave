
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

interface StaticPage {
  id: string;
  title: string;
  slug: string;
  content?: string;
  is_visible: boolean;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
}

const StaticPageRouter = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<StaticPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchPage = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('static_pages')
          .select('*')
          .eq('slug', slug)
          .eq('is_visible', true)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            setError('Page not found');
          } else {
            throw error;
          }
        } else {
          setPage(data);
          
          // Update page metadata
          if (data.meta_title) {
            document.title = data.meta_title;
          } else {
            document.title = data.title;
          }
          
          // Update meta description
          let metaDescription = document.querySelector('meta[name="description"]');
          if (data.meta_description) {
            if (!metaDescription) {
              metaDescription = document.createElement('meta');
              metaDescription.setAttribute('name', 'description');
              document.head.appendChild(metaDescription);
            }
            metaDescription.setAttribute('content', data.meta_description);
          } else if (metaDescription) {
            metaDescription.remove();
          }

          // Update meta keywords
          let metaKeywords = document.querySelector('meta[name="keywords"]');
          if (data.meta_keywords) {
            if (!metaKeywords) {
              metaKeywords = document.createElement('meta');
              metaKeywords.setAttribute('name', 'keywords');
              document.head.appendChild(metaKeywords);
            }
            metaKeywords.setAttribute('content', data.meta_keywords);
          } else if (metaKeywords) {
            metaKeywords.remove();
          }
        }
      } catch (err: any) {
        console.error('Error fetching static page:', err);
        setError('Failed to load page');
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h1>
          <p className="text-gray-600">The page you're looking for doesn't exist or has been removed.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage>{page.title}</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Content */}
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">{page.title}</h1>
          
          <Card>
            <CardContent className="p-8">
              <div 
                className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline"
                dangerouslySetInnerHTML={{ __html: page.content || '' }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default StaticPageRouter;
