
import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';

const tagFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

type TagFormValues = z.infer<typeof tagFormSchema>;

export const TagForm = () => {
  const [loading, setLoading] = useState(false);
  const form = useForm<TagFormValues>({
    resolver: zodResolver(tagFormSchema),
    defaultValues: { name: '' },
  });

  const onSubmit: SubmitHandler<TagFormValues> = async (values) => {
    setLoading(true);
    try {
      const { data: slugData, error: slugError } = await supabase.rpc('generate_unique_slug', {
        title: values.name,
        table_name: 'tags',
      });
      if (slugError) throw slugError;

      const { error } = await supabase.from('tags').insert({ ...values, slug: slugData });
      if (error) throw error;

      toast.success('Tag created successfully!');
      form.reset();
    } catch (error: any) {
      console.error('Error creating tag:', error);
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
              <FormControl><Input placeholder="Tag Name" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Create Tag
        </Button>
      </form>
    </Form>
  );
};
