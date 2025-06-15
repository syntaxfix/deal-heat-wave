
import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import ImageUpload from './ImageUpload';

const blogPostFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  summary: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional(),
  featured_image: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  status: z.enum(['published', 'draft']).default('published'),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  meta_keywords: z.string().optional(),
  canonical_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type BlogPostFormValues = z.infer<typeof blogPostFormSchema>;

export const BlogPostForm = () => {
  const [loading, setLoading] = useState(false);
  const form = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostFormSchema),
    defaultValues: {
      title: '',
      content: '',
      summary: '',
      category: '',
      tags: '',
      featured_image: '',
      status: 'published',
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
      canonical_url: '',
    },
  });

  const onSubmit: SubmitHandler<BlogPostFormValues> = async (values) => {
    setLoading(true);
    try {
      const { data: slugData, error: slugError } = await supabase.rpc('generate_unique_slug', {
        title: values.title,
        table_name: 'blog_posts',
      });

      if (slugError) throw slugError;

      const tagsArray = values.tags?.split(',').map(tag => tag.trim()).filter(tag => tag) || [];

      const { error } = await supabase.from('blog_posts').insert({
        title: values.title,
        content: values.content,
        summary: values.summary,
        category: values.category,
        tags: tagsArray,
        featured_image: values.featured_image,
        status: values.status,
        meta_title: values.meta_title,
        meta_description: values.meta_description,
        meta_keywords: values.meta_keywords,
        canonical_url: values.canonical_url,
        slug: slugData,
      });

      if (error) throw error;

      toast.success('Blog post created successfully!');
      form.reset();
    } catch (error: any) {
      console.error('Error creating blog post:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Blog Post Title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea placeholder="Blog post content (Markdown supported)" rows={10} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Summary</FormLabel>
              <FormControl>
                <Textarea placeholder="Short summary of the post" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Tech" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (comma-separated)</FormLabel>
              <FormControl>
                <Input placeholder="tech, news, updates" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="featured_image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Featured Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.png" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-2">
            <FormLabel>Or Upload Featured Image</FormLabel>
            <ImageUpload
              bucket="images"
              onUpload={(url) => form.setValue('featured_image', url, { shouldValidate: true })}
            />
        </div>

        <h3 className="text-lg font-medium pt-4">SEO</h3>
        <FormField
          control={form.control}
          name="meta_title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meta Title</FormLabel>
              <FormControl>
                <Input placeholder="SEO Title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="meta_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meta Description</FormLabel>
              <FormControl>
                <Textarea placeholder="SEO Description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="meta_keywords"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meta Keywords</FormLabel>
              <FormControl>
                <Input placeholder="keyword1, keyword2" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="canonical_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Canonical URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/canonical-url" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Create Blog Post
        </Button>
      </form>
    </Form>
  );
};
