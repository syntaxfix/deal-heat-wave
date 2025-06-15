
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
import { Plus, Edit, Trash2, Store, BookOpen, FileText, Users } from 'lucide-react';
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

const RootDashboard = () => {
  const queryClient = useQueryClient();

  // State declarations
  const [isShopDialogOpen, setIsShopDialogOpen] = useState(false);
  const [isBlogDialogOpen, setIsBlogDialogOpen] = useState(false);
  const [isPageDialogOpen, setIsPageDialogOpen] = useState(false);

  const [shopForm, setShopForm] = useState<Partial<Shop>>({});
  const [blogForm, setBlogForm] = useState<Partial<Blog>>({});
  const [pageForm, setPageForm] = useState<Partial<Page>>({});
  const [userForm, setUserForm] = useState<Partial<User>>({});

  const [editingShopId, setEditingShopId] = useState<string | null>(null);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Shops queries and mutations
  const { data: shops = [], isLoading: shopsLoading } = useQuery({
    queryKey: ['admin-shops'],
    queryFn: async () => {
      const { data, error } = await supabase.from('shops').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Blogs queries and mutations
  const { data: blogs = [], isLoading: blogsLoading } = useQuery({
    queryKey: ['admin-blogs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Pages queries and mutations
  const { data: pages = [], isLoading: pagesLoading } = useQuery({
    queryKey: ['admin-pages'],
    queryFn: async () => {
      const { data, error } = await supabase.from('static_pages').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Users queries and mutations
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

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

  const handleDeleteShop = (id: string) => {
    deleteShopMutation.mutate(id);
  };

  const handleDeleteBlog = (id: string) => {
    deleteBlogMutation.mutate(id);
  };

  const handleDeletePage = (id: string) => {
    deletePageMutation.mutate(id);
  };

  const handleEditShop = (shop: Shop) => {
    setShopForm(shop);
    setEditingShopId(shop.id);
    setIsShopDialogOpen(true);
  };

  const handleEditBlog = (blog: Blog) => {
    setBlogForm(blog);
    setEditingBlogId(blog.id);
    setIsBlogDialogOpen(true);
  };

  const handleEditPage = (page: Page) => {
    setPageForm(page);
    setEditingPageId(page.id);
    setIsPageDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setUserForm(user);
    setEditingUserId(user.id);
  };

  const renderShopsContent = () => {
    if (shopsLoading) {
      return <TableSkeleton rows={5} columns={4} />;
    }

    if (shops.length === 0) {
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

    return (
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
    );
  };

  const renderBlogsContent = () => {
    if (blogsLoading) {
      return <TableSkeleton rows={5} columns={4} />;
    }

    if (blogs.length === 0) {
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

    return (
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
    );
  };

  const renderPagesContent = () => {
    if (pagesLoading) {
      return <TableSkeleton rows={5} columns={4} />;
    }

    if (pages.length === 0) {
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

    return (
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
    );
  };

  const renderUsersContent = () => {
    if (usersLoading) {
      return <TableSkeleton rows={5} columns={4} />;
    }

    if (users.length === 0) {
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

    return (
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
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Root Dashboard</h1>
        <p className="text-muted-foreground">Manage shops, blogs, pages, and users</p>
      </div>

      <Tabs defaultValue="shops" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="shops">Shops</TabsTrigger>
          <TabsTrigger value="blogs">Blogs</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

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
    </div>
  );
};

export default RootDashboard;
