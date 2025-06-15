
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Terminal } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { currencies } from '@/data/currencies';

const settingsSchema = z.object({
  homepage_meta_title: z.string().optional(),
  homepage_meta_description: z.string().optional(),
  homepage_meta_keywords: z.string().optional(),
  google_tag_id: z.string().optional(),
  site_currency: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const fetchSettings = async () => {
  const { data, error } = await supabase.from('system_settings').select('key, value');
  if (error) throw new Error(error.message);
  
  const settings = data.reduce((acc, { key, value }) => {
    if (key) acc[key] = value;
    return acc;
  }, {} as { [key: string]: string | null });

  return settings;
};

const upsertSettings = async (settings: SettingsFormValues) => {
    const settingsToUpsert = Object.entries(settings)
        .filter(([, value]) => value !== undefined && value !== null)
        .map(([key, value]) => ({ key, value: value as string }));

    if (settingsToUpsert.length === 0) return;

    const { error } = await supabase.from('system_settings').upsert(settingsToUpsert, { onConflict: 'key' });
    if (error) throw error;
};

export const SettingsAdmin = () => {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({ queryKey: ['system_settings'], queryFn: fetchSettings });

  const mutation = useMutation({
    mutationFn: upsertSettings,
    onSuccess: () => {
      toast.success('Settings updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['system_settings'] });
    },
    onError: (error: any) => {
      toast.error(`Error updating settings: ${error.message}`);
    },
  });

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
        homepage_meta_title: '',
        homepage_meta_description: '',
        homepage_meta_keywords: '',
        google_tag_id: '',
        site_currency: 'USD',
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        homepage_meta_title: settings.homepage_meta_title ?? '',
        homepage_meta_description: settings.homepage_meta_description ?? '',
        homepage_meta_keywords: settings.homepage_meta_keywords ?? '',
        google_tag_id: settings.google_tag_id ?? '',
        site_currency: settings.site_currency ?? 'USD',
      });
    }
  }, [settings, form]);

  const onSubmit: SubmitHandler<SettingsFormValues> = (data) => {
    mutation.mutate(data);
  };
  
  if (isLoading) return <div className="p-4">Loading settings...</div>;

  return (
    <div className="p-4 space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Site Settings</CardTitle>
                <CardDescription>Manage general site settings for SEO and analytics.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="homepage_meta_title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Homepage Meta Title</FormLabel>
                                    <FormControl><Input {...field} value={field.value ?? ''} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="homepage_meta_description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Homepage Meta Description</FormLabel>
                                    <FormControl><Textarea {...field} value={field.value ?? ''} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="homepage_meta_keywords"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Homepage Meta Keywords</FormLabel>
                                    <FormControl><Input placeholder="e.g. deals, discounts, coupons" {...field} value={field.value ?? ''} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="site_currency"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Site Currency</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a currency" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {currencies.map((currency) => (
                                      <SelectItem key={currency.code} value={currency.code}>
                                        {`${currency.symbol} ${currency.code} (${currency.country})`}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="google_tag_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Google Tag Manager/Analytics ID</FormLabel>
                                    <FormControl><Input placeholder="G-XXXXXXXXXX" {...field} value={field.value ?? ''} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Save Settings
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
        
        <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>Social Authentication</AlertTitle>
            <AlertDescription>
                To configure social authentication providers like Google or Facebook, please go to your project's Supabase Dashboard under Authentication &gt; Providers. Managing API keys and secrets from the application is insecure.
            </AlertDescription>
        </Alert>
    </div>
  );
};
