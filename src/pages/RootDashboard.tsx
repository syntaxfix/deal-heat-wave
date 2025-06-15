import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Plus, Edit, Trash2, Store, BookOpen, FileText, Users, Tag, Search } from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/admin/EmptyState';
import { TableSkeleton } from '@/components/admin/TableSkeleton';

interface Shop {
  id: string;
  created_at: string;
  name: string;
  description: string;
  website_url: string;
  slug: string;
}

interface Blog {
  id: string;
  created_at: string;
  title: string;
  content: string;
  author_id: string;
  status: 'published' | 'draft';
  slug: string;
}

interface Page {
  id: string;
  created_at: string;
  title: string;
  slug: string;
  content: string;
  is_visible: boolean;
}

interface User {
  id: string;
  created_at: string;
  username: string;
  full_name: string;
  avatar_url: string;
  role: 'user' | 'admin';
}

interface Deal {
  id: string;
  created_at: string;
  title: string;
  description: string;
  original_price: number;
  discounted_price: number;
  status: 'pending' | 'approved' | 'rejected';
  heat_score: number;
  upvotes: number;
  downvotes: number;
}

const ITEMS_PER_PAGE = 10;

const RootDashboard = () => {
  const queryClient = useQueryClient();

  // Pagination states
  const [shopsPage, setShopsPage] = useState(1);
  const [blogsPage, setBlogsPage] = useState(1);
  const [pagesPage, setPagesPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const [dealsPage, setDealsPage] = useState(1);

  // Dialog states
  const [isShopDialogOpen, setIsShopDialogOpen] = useState(false);
  const [isBlogDialogOpen, setIsBlogDialogOpen] = useState(false);
  const [isPageDialogOpen, setIsPageDialogOpen] = useState(false);
  const [isDealDialogOpen, setIsDealDialogOpen] = useState(false);

  // Form states
  const [shopForm, setShopForm] = useState<Partial<Shop>>({});
  const [blogForm, setBlogForm] = useState<Partial<Blog>>({});
  const [pageForm, setPageForm] = useState<Partial<Page>>({});
  const [userForm, setUserForm] = useState<Partial<User>>({});
  const [dealForm, setDealForm] = useState<Partial<Deal>>({});

  // Editing states
  const [editingShopId, setEditingShopId] = useState<string | null>(null);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingDealId, setEditingDealId] = useState<string | null>(null);

  // Search states
  const [searchQueries, setSearchQueries] = useState({
    shops: '',
    blogs: '',
    pages: '',
    users: '',
    deals: ''
  });

  // Shops queries with pagination and search
  const { data: shopsData, isLoading: shopsLoading } = useQuery({
    queryKey: ['admin-shops', shopsPage, searchQueries.shops],
    queryFn: async () => {
      const from = (shopsPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      
      let query = supabase
        .from('shops')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (searchQueries.shops.trim()) {
        query = query.or(`name.ilike.%${searchQueries.shops}%,description.ilike.%${searchQueries.shops}%`);
      }

      const { data, error, count } = await query.range(from, to);
      
      if (error) throw error;
      return { data: data || [], total: count || 0 };
    }
  });

  // Blogs queries with pagination and search
  const { data: blogsData, isLoading: blogsLoading } = useQuery({
    queryKey: ['admin-blogs', blogsPage, searchQueries.blogs],
    queryFn: async () => {
      const from = (blogsPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      
      let query = supabase
        .from('blog_posts')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (searchQueries.blogs.trim()) {
        query = query.or(`title.ilike.%${searchQueries.blogs}%,content.ilike.%${searchQueries.blogs}%`);
      }

      const { data, error, count } = await query.range(from, to);
      
      if (error) throw error;
      return { data: data || [], total: count || 0 };
    }
  });

  // Pages queries with pagination and search
  const { data: pagesData, isLoading: pagesLoading } = useQuery({
    queryKey: ['admin-pages', pagesPage, searchQueries.pages],
    queryFn: async () => {
      const from = (pagesPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      
      let query = supabase
        .from('static_pages')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (searchQueries.pages.trim()) {
        query = query.or(`title.ilike.%${searchQueries.pages}%,content.ilike.%${searchQueries.pages}%,slug.ilike.%${searchQueries.pages}%`);
      }

      const { data, error, count } = await query.range(from, to);
      
      if (error) throw error;
      return { data: data || [], total: count || 0 };
    }
  });

  // Users queries with pagination and search
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users', usersPage, searchQueries.users],
    queryFn: async () => {
      const from = (usersPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (searchQueries.users.trim()) {
        query = query.or(`username.ilike.%${searchQueries.users}%,full_name.ilike.%${searchQueries.users}%`);
      }

      const { data, error, count } = await query.range(from, to);
      
      if (error) throw error;
      return { data: data || [], total: count || 0 };
    }
  });

  // Deals queries with pagination and search
  const { data: dealsData, isLoading: dealsLoading } = useQuery({
    queryKey: ['admin-deals', dealsPage, searchQueries.deals],
    queryFn: async () => {
      const from = (dealsPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      
      let query = supabase
        .from('deals')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (searchQueries.deals.trim()) {
        query = query.or(`title.ilike.%${searchQueries.deals}%,description.ilike.%${searchQueries.deals}%`);
      }

      const { data, error, count } = await query.range(from, to);
      
      if (error) throw error;
      return { data: data || [], total: count || 0 };
    }
  });

  const shops = shopsData?.data || [];
  const blogs = blogsData?.data || [];
  const pages = pagesData?.data || [];
  const users = usersData?.data || [];
  const deals = dealsData?.data || [];

  const totalShops = shopsData?.total || 0;
  const totalBlogs = blogsData?.total || 0;
  const totalPages = pagesData?.total || 0;
  const totalUsers = usersData?.total || 0;
  const totalDeals = dealsData?.total || 0;

  const totalShopsPages = Math.ceil(totalShops / ITEMS_PER_PAGE);
  const totalBlogsPages = Math.ceil(totalBlogs / ITEMS_PER_PAGE);
  const totalPagesPages = Math.ceil(totalPages / ITEMS_PER_PAGE);
  const totalUsersPages = Math.ceil(totalUsers / ITEMS_PER_PAGE);
  const totalDealsPages = Math.ceil(totalDeals / ITEMS_PER_PAGE);

  // Mutation functions
  const createShopMutation = useMutation({
    mutationFn: async (newShop: Omit<Shop, 'id' | 'created_at'>) => {
      const { data, error } = await supabase.from('shops').insert([newShop]);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shops'] });
      setIsShopDialogOpen(false);
      setShopForm({});
      toast.success('Shop created successfully!');
    },
    onError: (error: any) => {
      toast.error(`Failed to create shop: ${error.message}`);
    },
  });

  const updateShopMutation = useMutation({
    mutationFn: async (updatedShop: Shop) => {
      const { data, error } = await supabase.from('shops').update(updatedShop).eq('id', updatedShop.id);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shops'] });
      setIsShopDialogOpen(false);
      setShopForm({});
      setEditingShopId(null);
      toast.success('Shop updated successfully!');
    },
    onError: (error: any) => {
      toast.error(`Failed to update shop: ${error.message}`);
    },
  });

  const deleteShopMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.from('shops').delete().eq('id', id);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shops'] });
      toast.success('Shop deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete shop: ${error.message}`);
    },
  });

  const createBlogMutation = useMutation({
    mutationFn: async (newBlog: Omit<Blog, 'id' | 'created_at'>) => {
      const { data, error } = await supabase.from('blog_posts').insert([newBlog]);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
      setIsBlogDialogOpen(false);
      setBlogForm({});
      toast.success('Blog created successfully!');
    },
    onError: (error: any) => {
      toast.error(`Failed to create blog: ${error.message}`);
    },
  });

  const updateBlogMutation = useMutation({
    mutationFn: async (updatedBlog: Blog) => {
      const { data, error } = await supabase.from('blog_posts').update(updatedBlog).eq('id', updatedBlog.id);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
      setIsBlogDialogOpen(false);
      setBlogForm({});
      setEditingBlogId(null);
      toast.success('Blog updated successfully!');
    },
    onError: (error: any) => {
      toast.error(`Failed to update blog: ${error.message}`);
    },
  });

  const deleteBlogMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.from('blog_posts').delete().eq('id', id);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
      toast.success('Blog deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete blog: ${error.message}`);
    },
  });

  const createPageMutation = useMutation({
    mutationFn: async (newPage: Omit<Page, 'id' | 'created_at'>) => {
      const { data, error } = await supabase.from('static_pages').insert([newPage]);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pages'] });
      setIsPageDialogOpen(false);
      setPageForm({});
      toast.success('Page created successfully!');
    },
    onError: (error: any) => {
      toast.error(`Failed to create page: ${error.message}`);
    },
  });

  const updatePageMutation = useMutation({
    mutationFn: async (updatedPage: Page) => {
      const { data, error } = await supabase.from('static_pages').update(updatedPage).eq('id', updatedPage.id);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pages'] });
      setIsPageDialogOpen(false);
      setPageForm({});
      setEditingPageId(null);
      toast.success('Page updated successfully!');
    },
    onError: (error: any) => {
      toast.error(`Failed to update page: ${error.message}`);
    },
  });

  const deletePageMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.from('static_pages').delete().eq('id', id);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pages'] });
      toast.success('Page deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete page: ${error.message}`);
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (updatedUser: User) => {
      const { data, error } = await supabase.from('profiles').update(updatedUser).eq('id', updatedUser.id);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setEditingUserId(null);
      toast.success('User updated successfully!');
    },
    onError: (error: any) => {
      toast.error(`Failed to update user: ${error.message}`);
    },
  });

  const updateDealMutation = useMutation({
    mutationFn: async (updatedDeal: Deal) => {
      const { data, error } = await supabase.from('deals').update(updatedDeal).eq('id', updatedDeal.id);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-deals'] });
      setIsDealDialogOpen(false);
      setDealForm({});
      setEditingDealId(null);
      toast.success('Deal updated successfully!');
    },
    onError: (error: any) => {
      toast.error(`Failed to update deal: ${error.message}`);
    },
  });

  const deleteDealMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.from('deals').delete().eq('id', id);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-deals'] });
      toast.success('Deal deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete deal: ${error.message}`);
    },
  });

  // Form handlers and utility functions
  const handleShopInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setShopForm({ ...shopForm, [e.target.name]: e.target.value });
  };

  const handleBlogInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setBlogForm({ ...blogForm, [e.target.name]: e.target.value });
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPageForm({ ...pageForm, [e.target.name]: e.target.value });
  };

  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setUserForm({ ...userForm, [e.target.name]: e.target.value });
  };

  const handleDealInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setDealForm({ ...dealForm, [e.target.name]: e.target.value });
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleShopCreate = () => {
    const slug = generateSlug(shopForm.name || '');
    createShopMutation.mutate({ ...shopForm, slug } as Omit<Shop, 'id' | 'created_at'>);
  };

  const handleBlogCreate = () => {
    const slug = generateSlug(blogForm.title || '');
    createBlogMutation.mutate({ ...blogForm, slug } as Omit<Blog, 'id' | 'created_at'>);
  };

  const handlePageCreate = () => {
    const slug = generateSlug(pageForm.title || '');
    createPageMutation.mutate({ ...pageForm, slug } as Omit<Page, 'id' | 'created_at'>);
  };

  const handleShopEdit = () => {
    updateShopMutation.mutate(shopForm as Shop);
  };

  const handleBlogEdit = () => {
    updateBlogMutation.mutate(blogForm as Blog);
  };

  const handlePageEdit = () => {
    updatePageMutation.mutate(pageForm as Page);
  };

  const handleUserEdit = () => {
    updateUserMutation.mutate(userForm as User);
  };

  const handleDealEdit = () => {
    updateDealMutation.mutate(dealForm as Deal);
  };

  const handleDeleteShop = (id: string) => {
    deleteShopMutation.mutate(id);
  };

  const handleDeleteBlog = (id: string) => {
    deleteBlogMutation.mutate(id);
  };

  const handleDeletePage = (id: string) => {
    deletePageMutation.mutate(id);
  };

  const handleDeleteDeal = (id: string) => {
    deleteDealMutation.mutate(id);
  };

  const handleEditShop = (shop: Shop) => {
    setShopForm(shop);
    setEditingShopId(shop.id);
    setIsShopDialogOpen(true);
  };

  const handleEditBlog = (blog: any) => {
    setBlogForm({
      ...blog,
      status: blog.status as 'published' | 'draft'
    });
    setEditingBlogId(blog.id);
    setIsBlogDialogOpen(true);
  };

  const handleEditPage = (page: Page) => {
    setPageForm(page);
    setEditingPageId(page.id);
    setIsPageDialogOpen(true);
  };

  const handleEditUser = (user: any) => {
    setUserForm({
      ...user,
      role: user.role as 'user' | 'admin'
    });
    setEditingUserId(user.id);
  };

  const handleEditDeal = (deal: any) => {
    setDealForm({
      ...deal,
      status: deal.status as 'pending' | 'approved' | 'rejected'
    });
    setEditingDealId(deal.id);
    setIsDealDialogOpen(true);
  };

  const handleSearchChange = (tab: string, value: string) => {
    setSearchQueries(prev => ({ ...prev, [tab]: value }));
    // Reset to first page when searching
    switch(tab) {
      case 'shops':
        setShopsPage(1);
        break;
      case 'blogs':
        setBlogsPage(1);
        break;
      case 'pages':
        setPagesPage(1);
        break;
      case 'users':
        setUsersPage(1);
        break;
      case 'deals':
        setDealsPage(1);
        break;
    }
  };

  const renderPagination = (currentPage: number, totalPages: number, onPageChange: (page: number) => void) => {
    if (totalPages <= 1) return null;

    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
              className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  onClick={() => onPageChange(pageNum)}
                  isActive={currentPage === pageNum}
                  className="cursor-pointer"
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
              className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  // Search input component
  const SearchInput = ({ tab, placeholder }: { tab: string; placeholder: string }) => (
    <div className="relative mb-4">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchQueries[tab as keyof typeof searchQueries]}
        onChange={(e) => handleSearchChange(tab, e.target.value)}
        className="pl-10"
      />
    </div>
  );

  const renderShopsContent = () => {
    if (shopsLoading) {
      return <TableSkeleton rows={5} columns={4} />;
    }

    if (shops.length === 0 && shopsPage === 1 && !searchQueries.shops.trim()) {
      return (
        <EmptyState
          title="No shops found"
          description="Get started by creating your first shop. Shops help organize deals by retailer."
          actionLabel="Add Shop"
          onAction={() => setIsShopDialogOpen(true)}
          icon={<Store className="h-12 w-12" />}
        />
      );
    }

    if (shops.length === 0 && searchQueries.shops.trim()) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No shops found matching "{searchQueries.shops}"</p>
        </div>
      );
    }

    return (
      <>
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {(shopsPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(shopsPage * ITEMS_PER_PAGE, totalShops)} of {totalShops} shops
          {searchQueries.shops.trim() && ` matching "${searchQueries.shops}"`}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Website</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shops.map((shop) => (
              <TableRow key={shop.id}>
                <TableCell className="font-medium">{shop.name}</TableCell>
                <TableCell>{shop.description}</TableCell>
                <TableCell>{shop.website_url}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEditShop(shop)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteShop(shop.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {renderPagination(shopsPage, totalShopsPages, setShopsPage)}
      </>
    );
  };

  const renderBlogsContent = () => {
    if (blogsLoading) {
      return <TableSkeleton rows={5} columns={4} />;
    }

    if (blogs.length === 0 && blogsPage === 1 && !searchQueries.blogs.trim()) {
      return (
        <EmptyState
          title="No blog posts found"
          description="Start sharing your thoughts by creating your first blog post."
          actionLabel="Add Blog Post"
          onAction={() => setIsBlogDialogOpen(true)}
          icon={<BookOpen className="h-12 w-12" />}
        />
      );
    }

    if (blogs.length === 0 && searchQueries.blogs.trim()) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No blog posts found matching "{searchQueries.blogs}"</p>
        </div>
      );
    }

    return (
      <>
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {(blogsPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(blogsPage * ITEMS_PER_PAGE, totalBlogs)} of {totalBlogs} blogs
          {searchQueries.blogs.trim() && ` matching "${searchQueries.blogs}"`}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blogs.map((blog) => (
              <TableRow key={blog.id}>
                <TableCell className="font-medium">{blog.title}</TableCell>
                <TableCell>
                  <Badge variant={blog.status === 'published' ? "default" : "secondary"}>
                    {blog.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(blog.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEditBlog(blog)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteBlog(blog.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {renderPagination(blogsPage, totalBlogsPages, setBlogsPage)}
      </>
    );
  };

  const renderPagesContent = () => {
    if (pagesLoading) {
      return <TableSkeleton rows={5} columns={4} />;
    }

    if (pages.length === 0 && pagesPage === 1 && !searchQueries.pages.trim()) {
      return (
        <EmptyState
          title="No pages found"
          description="Create static pages like About, Contact, or Terms of Service for your website."
          actionLabel="Add Page"
          onAction={() => setIsPageDialogOpen(true)}
          icon={<FileText className="h-12 w-12" />}
        />
      );
    }

    if (pages.length === 0 && searchQueries.pages.trim()) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No pages found matching "{searchQueries.pages}"</p>
        </div>
      );
    }

    return (
      <>
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {(pagesPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(pagesPage * ITEMS_PER_PAGE, totalPages)} of {totalPages} pages
          {searchQueries.pages.trim() && ` matching "${searchQueries.pages}"`}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.map((page) => (
              <TableRow key={page.id}>
                <TableCell className="font-medium">{page.title}</TableCell>
                <TableCell>{page.slug}</TableCell>
                <TableCell>
                  <Badge variant={page.is_visible ? "default" : "secondary"}>
                    {page.is_visible ? 'Visible' : 'Hidden'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEditPage(page)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeletePage(page.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {renderPagination(pagesPage, totalPagesPages, setPagesPage)}
      </>
    );
  };

  const renderUsersContent = () => {
    if (usersLoading) {
      return <TableSkeleton rows={5} columns={4} />;
    }

    if (users.length === 0 && usersPage === 1 && !searchQueries.users.trim()) {
      return (
        <EmptyState
          title="No users found"
          description="Users will appear here as they sign up for your platform."
          actionLabel="Refresh"
          onAction={() => queryClient.invalidateQueries({ queryKey: ['admin-users'] })}
          icon={<Users className="h-12 w-12" />}
        />
      );
    }

    if (users.length === 0 && searchQueries.users.trim()) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No users found matching "{searchQueries.users}"</p>
        </div>
      );
    }

    return (
      <>
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {(usersPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(usersPage * ITEMS_PER_PAGE, totalUsers)} of {totalUsers} users
          {searchQueries.users.trim() && ` matching "${searchQueries.users}"`}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell>{user.full_name}</TableCell>
                <TableCell>
                  <Badge variant={user.role === 'admin' ? "destructive" : "default"}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="outline" onClick={() => handleEditUser(user)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {renderPagination(usersPage, totalUsersPages, setUsersPage)}
      </>
    );
  };

  const renderDealsContent = () => {
    if (dealsLoading) {
      return <TableSkeleton rows={5} columns={6} />;
    }

    if (deals.length === 0 && dealsPage === 1 && !searchQueries.deals.trim()) {
      return (
        <EmptyState
          title="No deals found"
          description="Deals will appear here as users submit them for review."
          actionLabel="Refresh"
          onAction={() => queryClient.invalidateQueries({ queryKey: ['admin-deals'] })}
          icon={<Tag className="h-12 w-12" />}
        />
      );
    }

    if (deals.length === 0 && searchQueries.deals.trim()) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No deals found matching "{searchQueries.deals}"</p>
        </div>
      );
    }

    return (
      <>
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {(dealsPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(dealsPage * ITEMS_PER_PAGE, totalDeals)} of {totalDeals} deals
          {searchQueries.deals.trim() && ` matching "${searchQueries.deals}"`}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Original Price</TableHead>
              <TableHead>Discounted Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Heat Score</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deals.map((deal) => (
              <TableRow key={deal.id}>
                <TableCell className="font-medium">{deal.title}</TableCell>
                <TableCell>${deal.original_price}</TableCell>
                <TableCell>${deal.discounted_price}</TableCell>
                <TableCell>
                  <Badge variant={
                    deal.status === 'approved' ? "default" : 
                    deal.status === 'rejected' ? "destructive" : "secondary"
                  }>
                    {deal.status}
                  </Badge>
                </TableCell>
                <TableCell>{deal.heat_score}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEditDeal(deal)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteDeal(deal.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {renderPagination(dealsPage, totalDealsPages, setDealsPage)}
      </>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Root Dashboard</h1>
        <p className="text-muted-foreground">Manage deals, shops, blogs, pages, and users</p>
      </div>

      <Tabs defaultValue="deals" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="deals">Deals</TabsTrigger>
          <TabsTrigger value="shops">Shops</TabsTrigger>
          <TabsTrigger value="blogs">Blogs</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="deals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deals Management</CardTitle>
              <CardDescription>Manage and moderate user-submitted deals</CardDescription>
            </CardHeader>
            <CardContent>
              <SearchInput tab="deals" placeholder="Search deals by title or description..." />
              {renderDealsContent()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shops" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Shops Management</CardTitle>
                <CardDescription>Manage all shops and retailers</CardDescription>
              </div>
              <Dialog open={isShopDialogOpen} onOpenChange={setIsShopDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Shop
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>{editingShopId ? 'Edit Shop' : 'Create Shop'}</DialogTitle>
                    <DialogDescription>
                      {editingShopId ? 'Edit shop details.' : 'Create a new shop.'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input
                        type="text"
                        id="name"
                        name="name"
                        value={shopForm.name || ''}
                        onChange={handleShopInputChange}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={shopForm.description || ''}
                        onChange={handleShopInputChange}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="website_url" className="text-right">
                        Website URL
                      </Label>
                      <Input
                        type="text"
                        id="website_url"
                        name="website_url"
                        value={shopForm.website_url || ''}
                        onChange={handleShopInputChange}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      type="button" 
                      onClick={editingShopId ? handleShopEdit : handleShopCreate} 
                      disabled={createShopMutation.isPending || updateShopMutation.isPending}
                    >
                      {editingShopId ? 'Update Shop' : 'Create Shop'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <SearchInput tab="shops" placeholder="Search shops by name or description..." />
              {renderShopsContent()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blogs" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Blog Management</CardTitle>
                <CardDescription>Manage blog posts and articles</CardDescription>
              </div>
              <Dialog open={isBlogDialogOpen} onOpenChange={setIsBlogDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Blog Post
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>{editingBlogId ? 'Edit Blog Post' : 'Create Blog Post'}</DialogTitle>
                    <DialogDescription>
                      {editingBlogId ? 'Edit blog post details.' : 'Create a new blog post.'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-right">
                        Title
                      </Label>
                      <Input
                        type="text"
                        id="title"
                        name="title"
                        value={blogForm.title || ''}
                        onChange={handleBlogInputChange}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="content" className="text-right">
                        Content
                      </Label>
                      <Textarea
                        id="content"
                        name="content"
                        value={blogForm.content || ''}
                        onChange={handleBlogInputChange}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="status" className="text-right">
                        Status
                      </Label>
                      <Select onValueChange={(value) => setBlogForm({ ...blogForm, status: value as 'published' | 'draft' })}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      type="button" 
                      onClick={editingBlogId ? handleBlogEdit : handleBlogCreate} 
                      disabled={createBlogMutation.isPending || updateBlogMutation.isPending}
                    >
                      {editingBlogId ? 'Update Blog' : 'Create Blog'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <SearchInput tab="blogs" placeholder="Search blog posts by title or content..." />
              {renderBlogsContent()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Pages Management</CardTitle>
                <CardDescription>Manage static pages and content</CardDescription>
              </div>
              <Dialog open={isPageDialogOpen} onOpenChange={setIsPageDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Page
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>{editingPageId ? 'Edit Page' : 'Create Page'}</DialogTitle>
                    <DialogDescription>
                      {editingPageId ? 'Edit page details.' : 'Create a new page.'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-right">
                        Title
                      </Label>
                      <Input
                        type="text"
                        id="title"
                        name="title"
                        value={pageForm.title || ''}
                        onChange={handlePageInputChange}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="content" className="text-right">
                        Content
                      </Label>
                      <Textarea
                        id="content"
                        name="content"
                        value={pageForm.content || ''}
                        onChange={handlePageInputChange}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="is_visible" className="text-right">
                        Visibility
                      </Label>
                      <Select onValueChange={(value) => setPageForm({ ...pageForm, is_visible: value === 'true' })}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Visible</SelectItem>
                          <SelectItem value="false">Hidden</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      type="button" 
                      onClick={editingPageId ? handlePageEdit : handlePageCreate} 
                      disabled={createPageMutation.isPending || updatePageMutation.isPending}
                    >
                      {editingPageId ? 'Update Page' : 'Create Page'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <SearchInput tab="pages" placeholder="Search pages by title, content, or slug..." />
              {renderPagesContent()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Users Management</CardTitle>
              <CardDescription>Manage user accounts and roles</CardDescription>
            </CardHeader>
            <CardContent>
              <SearchInput tab="users" placeholder="Search users by username or full name..." />
              {renderUsersContent()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={editingUserId !== null} onOpenChange={(open) => { if (!open) setEditingUserId(null); }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Edit user details and roles.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select onValueChange={(value) => setUserForm({ ...userForm, role: value as 'user' | 'admin' })} defaultValue={userForm.role}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleUserEdit} disabled={updateUserMutation.isPending}>
              Update User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDealDialogOpen} onOpenChange={setIsDealDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Deal</DialogTitle>
            <DialogDescription>
              Edit deal details and status.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select onValueChange={(value) => setDealForm({ ...dealForm, status: value as 'pending' | 'approved' | 'rejected' })} defaultValue={dealForm.status}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleDealEdit} disabled={updateDealMutation.isPending}>
              Update Deal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RootDashboard;
