
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DealForm } from './DealForm';
import { Database } from '@/integrations/supabase/types';
import { Pencil, Trash2 } from 'lucide-react';
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

type Deal = Database['public']['Tables']['deals']['Row'];

async function fetchDeals() {
  const { data, error } = await supabase.from('deals').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export const DealsAdmin = () => {
  const queryClient = useQueryClient();
  const { data: deals, isLoading, error } = useQuery({ queryKey: ['deals'], queryFn: fetchDeals });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  const handleDelete = async () => {
    if (!selectedDeal) return;
    try {
      const { error } = await supabase.from('deals').delete().eq('id', selectedDeal.id);
      if (error) throw error;
      toast.success('Deal deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      setIsAlertOpen(false);
      setSelectedDeal(null);
    } catch (error: any) {
      toast.error(`Error deleting deal: ${error.message}`);
    }
  };

  const openFormForEdit = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsFormOpen(true);
  };

  const openFormForCreate = () => {
    setSelectedDeal(null);
    setIsFormOpen(true);
  };
  
  const openAlertForDelete = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsAlertOpen(true);
  };

  if (isLoading) return <div>Loading deals...</div>;
  if (error) return <div>Error loading deals: {error.message}</div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Manage Deals</CardTitle>
        <Button onClick={openFormForCreate}>Create Deal</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deals?.map((deal) => (
              <TableRow key={deal.id}>
                <TableCell>{deal.title}</TableCell>
                <TableCell>{deal.status}</TableCell>
                <TableCell>${deal.discounted_price}</TableCell>
                <TableCell className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => openFormForEdit(deal)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="destructive" size="icon" onClick={() => openAlertForDelete(deal)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{selectedDeal ? 'Edit Deal' : 'Create Deal'}</DialogTitle></DialogHeader>
          <DealForm initialData={selectedDeal} onSuccess={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the deal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
