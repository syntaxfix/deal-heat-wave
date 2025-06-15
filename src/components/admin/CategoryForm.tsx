
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

const categoryFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  icon: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  meta_keywords: z.string().optional(),
  canonical_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export const CategoryForm = () => {
  const [loading, setLoading] = useState(false);
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: '', description: '', icon: '' },
  });

  const onSubmit: SubmitHandler<CategoryFormValues> = async (values) => {
    setLoading(true);
    try {
      const { data: slugData, error: slugError } = await supabase.rpc('generate_unique_slug', {
        title: values.name,
        table_name: 'categories',
      });
      if (slugError) throw slugError;

      const { error } = await supabase.from('categories').insert({ 
        name: values.name,
        description: values.description,
        icon: values.icon,
        meta_title: values.meta_title,
        meta_description: values.meta_description,
        meta_keywords: values.meta_keywords,
        canonical_url: values.canonical_url,
        slug: slugData
      });
      if (error) throw error;

      toast.success('Category created successfully!');
      form.reset();
    } catch (error: any) {
      console.error('Error creating category:', error);
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl><Input placeholder="Category Name" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl><Textarea placeholder="Category description" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon (e.g., from lucide-react)</FormLabel>
              <FormControl><Input placeholder="cpu" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
          Create Category
        </Button>
      </form>
    </Form>
  );
};
