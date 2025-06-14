
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, User, BookOpen } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  featured_image: string;
  category: string;
  tags: string[];
  read_time: number;
  created_at: string;
  profiles: {
    username: string;
    full_name: string;
  } | null;
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    // First get blog posts
    const { data: postsData, error: postsError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (postsError) {
      console.error('Error fetching blog posts:', postsError);
      setLoading(false);
      return;
    }

    if (!postsData || postsData.length === 0) {
      setPosts([]);
      setLoading(false);
      return;
    }

    // Get unique author IDs
    const authorIds = [...new Set(postsData.map(post => post.author_id).filter(Boolean))];

    if (authorIds.length === 0) {
      // No authors to fetch, set posts without profiles
      const postsWithoutProfiles = postsData.map(post => ({
        ...post,
        profiles: null
      }));
      setPosts(postsWithoutProfiles);
      setLoading(false);
      return;
    }

    // Get profiles for these authors
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, full_name')
      .in('id', authorIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
    }

    // Create a map of author_id to profile
    const profilesMap = new Map();
    if (profilesData) {
      profilesData.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });
    }

    // Combine posts with profiles
    const postsWithProfiles = postsData.map(post => ({
      ...post,
      profiles: post.author_id ? profilesMap.get(post.author_id) || null : null
    }));

    setPosts(postsWithProfiles);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">DealSpark Blog</h1>
            </div>
            <p className="text-gray-600">
              Stay updated with the latest money-saving tips, deal guides, and shopping strategies
            </p>
          </div>

          {loading ? (
            <div className="space-y-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <Skeleton className="w-full md:w-48 h-32" />
                      <div className="flex-1 space-y-3">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <div className="flex space-x-4">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No blog posts yet
                </h3>
                <p className="text-gray-600">
                  Check back soon for money-saving tips and deal guides!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Featured Image */}
                      <div className="w-full md:w-48 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {post.featured_image ? (
                          <img
                            src={post.featured_image}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <BookOpen className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="secondary">{post.category}</Badge>
                          {post.tags && post.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <Link to={`/blog/${post.slug}`}>
                          <h2 className="text-xl font-semibold text-gray-900 mb-2 hover:text-primary transition-colors">
                            {post.title}
                          </h2>
                        </Link>

                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {post.summary}
                        </p>

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{post.profiles?.full_name || post.profiles?.username || 'Anonymous'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{post.read_time} min read</span>
                          </div>
                          <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Blog;
