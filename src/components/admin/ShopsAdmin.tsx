
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Database } from '@/integrations/supabase/types';

type Shop = Database['public']['Tables']['shops']['Row'];

async function fetchShops() {
  const { data, error } = await supabase.from('shops').select('*').order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export const ShopsAdmin = () => {
  const { data: shops, isLoading, error } = useQuery({ queryKey: ['shopsAdmin'], queryFn: fetchShops });

  if (isLoading) return <div>Loading shops...</div>;
  if (error) return <div>Error loading shops: {error.message}</div>;

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>All Shops</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Website</TableHead>
              <TableHead>Category</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shops?.map((shop: Shop) => (
              <TableRow key={shop.id}>
                <TableCell className="font-medium">{shop.name}</TableCell>
                <TableCell>
                  {shop.website_url ? (
                    <a href={shop.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {shop.website_url}
                    </a>
                  ) : (
                    'N/A'
                  )}
                </TableCell>
                <TableCell>{shop.category}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
