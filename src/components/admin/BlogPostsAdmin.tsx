
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Database } from '@/integrations/supabase/types';
import { Badge } from '@/components/ui/badge';

type BlogPost = Database['public']['Tables']['blog_posts']['Row'];

async function fetchBlogPosts() {
  const { data, error } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export const BlogPostsAdmin = () => {
  const { data: posts, isLoading, error } = useQuery({ queryKey: ['blogPostsAdmin'], queryFn: fetchBlogPosts });

  if (isLoading) return <div>Loading blog posts...</div>;
  if (error) return <div>Error loading blog posts: {error.message}</div>;

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>All Blog Posts</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts?.map((post: BlogPost) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell>
                   <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                    {post.status}
                  </Badge>
                </TableCell>
                <TableCell>{post.created_at ? new Date(post.created_at).toLocaleDateString() : 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
