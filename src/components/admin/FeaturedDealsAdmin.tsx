import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Deal {
  id: string;
  title: string;
  image_url?: string;
  discounted_price?: number;
  heat_score?: number;
}

interface FeaturedDeal {
  id: string;
  deal_id: string;
  featured_date: string;
  display_order: number;
  deals: Deal;
}

const fetchFeaturedDeals = async () => {
  const { data, error } = await supabase
    .from('featured_deals')
    .select(`
      *,
      deals(id, title, image_url, discounted_price, heat_score)
    `)
    .order('display_order', { ascending: true });

  if (error) throw new Error(error.message);
  return data as FeaturedDeal[];
};

const fetchAvailableDeals = async () => {
  const { data, error } = await supabase
    .from('deals')
    .select('id, title, image_url, discounted_price, heat_score')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);
  return data as Deal[];
};

export const FeaturedDealsAdmin = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedFeaturedDeal, setSelectedFeaturedDeal] = useState<FeaturedDeal | null>(null);
  const [selectedDealId, setSelectedDealId] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);

  const { data: featuredDeals, isLoading } = useQuery({
    queryKey: ['featured_deals'],
    queryFn: fetchFeaturedDeals,
  });

  const { data: availableDeals } = useQuery({
    queryKey: ['available_deals'],
    queryFn: fetchAvailableDeals,
  });

  const handleAdd = async () => {
    if (!selectedDealId) {
      toast.error('Please select a deal');
      return;
    }

    try {
      const { error } = await supabase
        .from('featured_deals')
        .insert({
          deal_id: selectedDealId,
          display_order: displayOrder
        });

      if (error) throw error;
      
      toast.success('Deal added to featured deals!');
      queryClient.invalidateQueries({ queryKey: ['featured_deals'] });
      setIsFormOpen(false);
      setSelectedDealId('');
      setDisplayOrder(0);
    } catch (error: any) {
      toast.error(`Error adding featured deal: ${error.message}`);
    }
  };

  const handleDelete = async () => {
    if (!selectedFeaturedDeal) return;

    try {
      const { error } = await supabase
        .from('featured_deals')
        .delete()
        .eq('id', selectedFeaturedDeal.id);

      if (error) throw error;
      
      toast.success('Featured deal removed!');
      queryClient.invalidateQueries({ queryKey: ['featured_deals'] });
      setIsAlertOpen(false);
      setSelectedFeaturedDeal(null);
    } catch (error: any) {
      toast.error(`Error removing featured deal: ${error.message}`);
    }
  };

  const handleReorder = async (featuredDealId: string, newOrder: number) => {
    try {
      const { error } = await supabase
        .from('featured_deals')
        .update({ display_order: newOrder })
        .eq('id', featuredDealId);

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['featured_deals'] });
    } catch (error: any) {
      toast.error(`Error reordering: ${error.message}`);
    }
  };

  if (isLoading) return <div>Loading featured deals...</div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Featured Deals (Deal of the Day)</CardTitle>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Featured Deal
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Deal</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Heat Score</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {featuredDeals?.map((featuredDeal, index) => (
              <TableRow key={featuredDeal.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{featuredDeal.display_order}</Badge>
                    <div className="flex flex-col gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleReorder(featuredDeal.id, featuredDeal.display_order - 1)}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleReorder(featuredDeal.id, featuredDeal.display_order + 1)}
                        disabled={index === (featuredDeals?.length || 0) - 1}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {featuredDeal.deals.image_url && (
                      <img
                        src={featuredDeal.deals.image_url}
                        alt={featuredDeal.deals.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <span className="font-medium">{featuredDeal.deals.title}</span>
                  </div>
                </TableCell>
                <TableCell>${featuredDeal.deals.discounted_price}</TableCell>
                <TableCell>
                  <Badge>{featuredDeal.deals.heat_score}°</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setSelectedFeaturedDeal(featuredDeal);
                      setIsAlertOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Featured Deal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="deal">Select Deal</Label>
              <Select value={selectedDealId} onValueChange={setSelectedDealId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a deal" />
                </SelectTrigger>
                <SelectContent>
                  {availableDeals?.map((deal) => (
                    <SelectItem key={deal.id} value={deal.id}>
                      {deal.title} - ${deal.discounted_price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
                min={0}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdd}>
                Add Featured Deal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Featured Deal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this deal from the featured deals list?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};