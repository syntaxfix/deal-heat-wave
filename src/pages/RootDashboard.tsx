import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { 
  Shield, 
  Users, 
  Package, 
  TrendingUp, 
  Eye, 
  LogOut,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Store,
  FileText,
  Globe
} from 'lucide-react';

interface DashboardStats {
  totalDeals: number;
  todayVotes: number;
  onlineUsers: number;
  totalUsers: number;
  pendingDeals: number;
  totalShops: number;
  totalBlogs: number;
  contactSubmissions: number;
}

interface Deal {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  original_price?: number;
  discounted_price?: number;
  discount_percentage?: number;
  affiliate_link?: string;
  status: string;
  created_at: string;
  upvotes: number;
  downvotes: number;
  heat_score: number;
  expires_at?: string;
  slug?: string;
  categories?: { id: string; name: string };
  shops?: { id: string; name: string };
  profiles?: { username?: string; full_name?: string };
}

interface Shop {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  status: string;
  created_at: string;
  category?: string;
  content?: string;
  summary?: string;
  featured_image?: string;
}

interface StaticPage {
  id: string;
  title: string;
  slug: string;
  is_visible: boolean;
  created_at: string;
  content?: string;
}

interface User {
  id: string;
  email?: string;
  created_at: string;
  profiles?: {
    username?: string;
    full_name?: string;
    role: string;
  };
}

const RootDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalDeals: 0,
    todayVotes: 0,
    onlineUsers: 0,
    totalUsers: 0,
    pendingDeals: 0,
    totalShops: 0,
    totalBlogs: 0,
    contactSubmissions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('deals');

  // Data states
  const [deals, setDeals] = useState<Deal[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [staticPages, setStaticPages] = useState<StaticPage[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Deal form states
  const [showDealDialog, setShowDealDialog] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [dealForm, setDealForm] = useState({
    title: '',
    description: '',
    image_url: '',
    original_price: '',
    discounted_price: '',
    affiliate_link: '',
    category_id: '',
    shop_id: '',
    expires_at: '',
    status: 'approved'
  });

  // Shop form states
  const [showShopDialog, setShowShopDialog] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [shopForm, setShopForm] = useState({
    name: '',
    slug: '',
    description: '',
    logo_url: '',
    website_url: ''
  });

  // Blog form states
  const [showBlogDialog, setShowBlogDialog] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [blogForm, setBlogForm] = useState({
    title: '',
    slug: '',
    content: '',
    summary: '',
    featured_image: '',
    category: '',
    status: 'published'
  });

  // Page form states
  const [showPageDialog, setShowPageDialog] = useState(false);
  const [editingPage, setEditingPage] = useState<StaticPage | null>(null);
  const [pageForm, setPageForm] = useState({
    title: '',
    slug: '',
    content: '',
    is_visible: true
  });

  useEffect(() => {
    if (user) {
      checkRootAdminAccess();
    } else {
      navigate('/root/login');
    }
  }, [user, navigate]);

  const checkRootAdminAccess = async () => {
    if (!user) return;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !profile || profile.role !== 'root_admin') {
      toast.error('Access denied. Root admin privileges required.');
      navigate('/root/login');
      return;
    }

    setUserProfile(profile);
    fetchDashboardStats();
  };

  const fetchDashboardStats = async () => {
    try {
      const [
        { count: totalDeals },
        { count: totalUsers },
        { count: pendingDeals },
        { count: totalShops },
        { count: totalBlogs },
        { count: contactSubmissions },
      ] = await Promise.all([
        supabase.from('deals').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('deals').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('shops').select('*', { count: 'exact', head: true }),
        supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
        supabase.from('contact_submissions').select('*', { count: 'exact', head: true }).eq('read', false),
      ]);

      const today = new Date().toISOString().split('T')[0];
      const { count: todayVotes } = await supabase
        .from('deal_votes')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today);

      setStats({
        totalDeals: totalDeals || 0,
        todayVotes: todayVotes || 0,
        onlineUsers: Math.floor(Math.random() * 50) + 10,
        totalUsers: totalUsers || 0,
        pendingDeals: pendingDeals || 0,
        totalShops: totalShops || 0,
        totalBlogs: totalBlogs || 0,
        contactSubmissions: contactSubmissions || 0,
      });

      // Fetch initial data for active tab
      if (activeTab === 'deals') {
        fetchDeals();
        fetchCategories();
        fetchShops();
      }
      else if (activeTab === 'shops') fetchShops();
      else if (activeTab === 'blogs') fetchBlogPosts();
      else if (activeTab === 'pages') fetchStaticPages();
      else if (activeTab === 'users') fetchUsers();
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDeals = async () => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          categories(id, name),
          shops(id, name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching deals:', error);
        return;
      }
      
      if (data) {
        // Fetch user profiles separately for deals that have user_id
        const userIds = data.filter(deal => deal.user_id).map(deal => deal.user_id);
        let profiles = [];
        
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, username, full_name')
            .in('id', userIds);
          
          profiles = profilesData || [];
        }
        
        // Map deals with their user profiles
        const dealsWithProfiles = data.map(deal => ({
          ...deal,
          profiles: deal.user_id ? profiles.find(profile => profile.id === deal.user_id) : null
        }));
        
        setDeals(dealsWithProfiles as Deal[]);
      }
    } catch (error) {
      console.error('Error fetching deals:', error);
    }
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('id, name, slug')
      .order('name');
    
    if (data) setCategories(data);
  };

  const fetchShops = async () => {
    const { data } = await supabase
      .from('shops')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setShops(data);
  };

  const fetchBlogPosts = async () => {
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setBlogPosts(data);
  };

  const fetchStaticPages = async () => {
    const { data } = await supabase
      .from('static_pages')
      .select('id, title, slug, is_visible, created_at, content')
      .order('created_at', { ascending: false });
    
    if (data) setStaticPages(data);
  };

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, username, full_name, role, created_at')
      .order('created_at', { ascending: false });
    
    if (data) {
      const transformedUsers = data.map(profile => ({
        id: profile.id,
        email: '',
        created_at: profile.created_at || '',
        profiles: {
          username: profile.username,
          full_name: profile.full_name,
          role: profile.role || 'user'
        }
      }));
      setUsers(transformedUsers);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'deals') {
      fetchDeals();
      fetchCategories();
      fetchShops();
    }
    else if (value === 'shops') fetchShops();
    else if (value === 'blogs') fetchBlogPosts();
    else if (value === 'pages') fetchStaticPages();
    else if (value === 'users') fetchUsers();
  };

  const handleDealStatusChange = async (dealId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('deals')
        .update({ status: newStatus })
        .eq('id', dealId);

      if (error) throw error;

      toast.success(`Deal ${newStatus} successfully`);
      fetchDeals();
      fetchDashboardStats();
    } catch (error) {
      console.error('Error updating deal status:', error);
      toast.error('Failed to update deal status');
    }
  };

  // Shop CRUD functions
  const generateSlugFromTitle = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const resetShopForm = () => {
    setShopForm({
      name: '',
      slug: '',
      description: '',
      logo_url: '',
      website_url: ''
    });
    setEditingShop(null);
  };

  const openShopDialog = (shop?: Shop) => {
    if (shop) {
      setEditingShop(shop);
      setShopForm({
        name: shop.name,
        slug: shop.slug,
        description: shop.description || '',
        logo_url: shop.logo_url || '',
        website_url: shop.website_url || ''
      });
    } else {
      resetShopForm();
    }
    setShowShopDialog(true);
  };

  const handleSaveShop = async () => {
    try {
      if (!shopForm.name.trim()) {
        toast.error('Shop name is required');
        return;
      }

      const slug = shopForm.slug || generateSlugFromTitle(shopForm.name);

      const shopData = {
        name: shopForm.name.trim(),
        slug: slug,
        description: shopForm.description.trim() || null,
        logo_url: shopForm.logo_url.trim() || null,
        website_url: shopForm.website_url.trim() || null
      };

      let error;
      if (editingShop) {
        ({ error } = await supabase
          .from('shops')
          .update(shopData)
          .eq('id', editingShop.id));
      } else {
        ({ error } = await supabase
          .from('shops')
          .insert(shopData));
      }

      if (error) throw error;

      toast.success(`Shop ${editingShop ? 'updated' : 'created'} successfully`);
      setShowShopDialog(false);
      resetShopForm();
      fetchShops();
      fetchDashboardStats();
    } catch (error) {
      console.error('Error saving shop:', error);
      toast.error(`Failed to ${editingShop ? 'update' : 'create'} shop`);
    }
  };

  const handleDeleteShop = async (shopId: string) => {
    if (!confirm('Are you sure you want to delete this shop?')) return;

    try {
      const { error } = await supabase
        .from('shops')
        .delete()
        .eq('id', shopId);

      if (error) throw error;

      toast.success('Shop deleted successfully');
      fetchShops();
      fetchDashboardStats();
    } catch (error) {
      console.error('Error deleting shop:', error);
      toast.error('Failed to delete shop');
    }
  };

  // Blog CRUD functions
  const resetBlogForm = () => {
    setBlogForm({
      title: '',
      slug: '',
      content: '',
      summary: '',
      featured_image: '',
      category: '',
      status: 'published'
    });
    setEditingBlog(null);
  };

  const openBlogDialog = (blog?: BlogPost) => {
    if (blog) {
      setEditingBlog(blog);
      setBlogForm({
        title: blog.title,
        slug: blog.slug,
        content: blog.content || '',
        summary: blog.summary || '',
        featured_image: blog.featured_image || '',
        category: blog.category || '',
        status: blog.status
      });
    } else {
      resetBlogForm();
    }
    setShowBlogDialog(true);
  };

  const handleSaveBlog = async () => {
    try {
      if (!blogForm.title.trim()) {
        toast.error('Blog title is required');
        return;
      }

      const slug = blogForm.slug || generateSlugFromTitle(blogForm.title);

      const blogData = {
        title: blogForm.title.trim(),
        slug: slug,
        content: blogForm.content.trim() || null,
        summary: blogForm.summary.trim() || null,
        featured_image: blogForm.featured_image.trim() || null,
        category: blogForm.category.trim() || null,
        status: blogForm.status
      };

      let error;
      if (editingBlog) {
        ({ error } = await supabase
          .from('blog_posts')
          .update(blogData)
          .eq('id', editingBlog.id));
      } else {
        ({ error } = await supabase
          .from('blog_posts')
          .insert(blogData));
      }

      if (error) throw error;

      toast.success(`Blog post ${editingBlog ? 'updated' : 'created'} successfully`);
      setShowBlogDialog(false);
      resetBlogForm();
      fetchBlogPosts();
      fetchDashboardStats();
    } catch (error) {
      console.error('Error saving blog post:', error);
      toast.error(`Failed to ${editingBlog ? 'update' : 'create'} blog post`);
    }
  };

  const handleDeleteBlog = async (blogId: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', blogId);

      if (error) throw error;

      toast.success('Blog post deleted successfully');
      fetchBlogPosts();
      fetchDashboardStats();
    } catch (error) {
      console.error('Error deleting blog post:', error);
      toast.error('Failed to delete blog post');
    }
  };

  // Page CRUD functions
  const resetPageForm = () => {
    setPageForm({
      title: '',
      slug: '',
      content: '',
      is_visible: true
    });
    setEditingPage(null);
  };

  const openPageDialog = (page?: StaticPage) => {
    if (page) {
      setEditingPage(page);
      setPageForm({
        title: page.title,
        slug: page.slug,
        content: page.content || '',
        is_visible: page.is_visible
      });
    } else {
      resetPageForm();
    }
    setShowPageDialog(true);
  };

  const handleSavePage = async () => {
    try {
      if (!pageForm.title.trim()) {
        toast.error('Page title is required');
        return;
      }

      const slug = pageForm.slug || generateSlugFromTitle(pageForm.title);

      const pageData = {
        title: pageForm.title.trim(),
        slug: slug,
        content: pageForm.content.trim() || null,
        is_visible: pageForm.is_visible
      };

      let error;
      if (editingPage) {
        ({ error } = await supabase
          .from('static_pages')
          .update(pageData)
          .eq('id', editingPage.id));
      } else {
        ({ error } = await supabase
          .from('static_pages')
          .insert(pageData));
      }

      if (error) throw error;

      toast.success(`Page ${editingPage ? 'updated' : 'created'} successfully`);
      setShowPageDialog(false);
      resetPageForm();
      fetchStaticPages();
    } catch (error) {
      console.error('Error saving page:', error);
      toast.error(`Failed to ${editingPage ? 'update' : 'create'} page`);
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;

    try {
      const { error } = await supabase
        .from('static_pages')
        .delete()
        .eq('id', pageId);

      if (error) throw error;

      toast.success('Page deleted successfully');
      fetchStaticPages();
    } catch (error) {
      console.error('Error deleting page:', error);
      toast.error('Failed to delete page');
    }
  };

  const handleUserRoleUpdate = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      toast.success('User role updated successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const resetDealForm = () => {
    setDealForm({
      title: '',
      description: '',
      image_url: '',
      original_price: '',
      discounted_price: '',
      affiliate_link: '',
      category_id: '',
      shop_id: '',
      expires_at: '',
      status: 'approved'
    });
    setEditingDeal(null);
  };

  const openDealDialog = (deal?: Deal) => {
    if (deal) {
      setEditingDeal(deal);
      setDealForm({
        title: deal.title,
        description: deal.description || '',
        image_url: deal.image_url || '',
        original_price: deal.original_price?.toString() || '',
        discounted_price: deal.discounted_price?.toString() || '',
        affiliate_link: deal.affiliate_link || '',
        category_id: deal.categories?.id || '',
        shop_id: deal.shops?.id || '',
        expires_at: deal.expires_at ? formatDateForInput(deal.expires_at) : '',
        status: deal.status
      });
    } else {
      resetDealForm();
    }
    setShowDealDialog(true);
  };

  const formatDateForInput = (date: string | null) => {
    if (!date) return '';
    // Convert to local date and set time to midnight (00:00)
    const localDate = new Date(date);
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T00:00`;
  };

  const convertDateToUTC = (dateString: string) => {
    if (!dateString) return null;
    // If only date is provided (no time), add midnight
    const dateWithTime = dateString.includes('T') ? dateString : `${dateString}T00:00`;
    return new Date(dateWithTime).toISOString();
  };

  const calculateDiscount = () => {
    const original = parseFloat(dealForm.original_price);
    const discounted = parseFloat(dealForm.discounted_price);
    
    if (original && discounted && original > discounted) {
      return Math.round(((original - discounted) / original) * 100);
    }
    return 0;
  };

  const handleSaveDeal = async () => {
    try {
      if (!dealForm.title.trim()) {
        toast.error('Deal title is required');
        return;
      }

      const discountPercentage = calculateDiscount();
      const baseSlug = generateSlugFromTitle(dealForm.title);
      const uniqueSlug = editingDeal?.slug || `${baseSlug}-${Date.now()}`;

      const dealData = {
        title: dealForm.title.trim(),
        description: dealForm.description.trim() || null,
        image_url: dealForm.image_url.trim() || null,
        original_price: dealForm.original_price ? parseFloat(dealForm.original_price) : null,
        discounted_price: dealForm.discounted_price ? parseFloat(dealForm.discounted_price) : null,
        discount_percentage: discountPercentage > 0 ? discountPercentage : null,
        affiliate_link: dealForm.affiliate_link.trim() || null,
        category_id: dealForm.category_id || null,
        shop_id: dealForm.shop_id || null,
        expires_at: dealForm.expires_at ? convertDateToUTC(dealForm.expires_at) : null,
        status: dealForm.status,
        slug: uniqueSlug,
        user_id: editingDeal?.profiles ? null : user?.id
      };

      let error;
      if (editingDeal) {
        ({ error } = await supabase
          .from('deals')
          .update(dealData)
          .eq('id', editingDeal.id));
      } else {
        ({ error } = await supabase
          .from('deals')
          .insert({
            ...dealData,
            heat_score: 0,
            upvotes: 0,
            downvotes: 0,
            views: 0,
            user_id: user?.id
          }));
      }

      if (error) throw error;

      toast.success(`Deal ${editingDeal ? 'updated' : 'created'} successfully`);
      setShowDealDialog(false);
      resetDealForm();
      fetchDeals();
      fetchDashboardStats();
    } catch (error) {
      console.error('Error saving deal:', error);
      toast.error(`Failed to ${editingDeal ? 'update' : 'create'} deal`);
    }
  };

  const handleDeleteDeal = async (dealId: string) => {
    if (!confirm('Are you sure you want to delete this deal?')) return;

    try {
      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', dealId);

      if (error) throw error;

      toast.success('Deal deleted successfully');
      fetchDeals();
      fetchDashboardStats();
    } catch (error) {
      console.error('Error deleting deal:', error);
      toast.error('Failed to delete deal');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/root/login');
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  const pendingDeals = deals.filter(deal => deal.status === 'pending');
  const approvedDeals = deals.filter(deal => deal.status === 'approved');
  const rejectedDeals = deals.filter(deal => deal.status === 'rejected');

  if (!userProfile || userProfile.role !== 'root_admin') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="border-gray-700 bg-gray-800">
          <CardContent className="pt-6 text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-white">Access Denied</h2>
            <p className="text-gray-400">You need root admin privileges to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Shield className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Root Admin Dashboard</h1>
                <p className="text-gray-400">Welcome back, {userProfile.full_name || userProfile.username || 'Administrator'}</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:text-white">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-gray-700 bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Deals</CardTitle>
              <Package className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalDeals}</div>
              <p className="text-xs text-gray-400">
                {stats.pendingDeals} pending approval
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-700 bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Today's Votes</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.todayVotes}</div>
              <p className="text-xs text-gray-400">
                User engagement today
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-700 bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Online Users</CardTitle>
              <Eye className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.onlineUsers}</div>
              <p className="text-xs text-gray-400">
                Active right now
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-700 bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Users</CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
              <p className="text-xs text-gray-400">
                Registered members
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid grid-cols-2 lg:grid-cols-6 bg-gray-800 border-gray-700">
            <TabsTrigger value="deals" className="data-[state=active]:bg-gray-700">
              Deals ({stats.totalDeals})
            </TabsTrigger>
            <TabsTrigger value="shops" className="data-[state=active]:bg-gray-700">
              Shops ({stats.totalShops})
            </TabsTrigger>
            <TabsTrigger value="blogs" className="data-[state=active]:bg-gray-700">
              Blogs ({stats.totalBlogs})
            </TabsTrigger>
            <TabsTrigger value="pages" className="data-[state=active]:bg-gray-700">
              Pages
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-gray-700">
              Users ({stats.totalUsers})
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-gray-700">
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Enhanced Deals Management */}
          <TabsContent value="deals">
            <Card className="border-gray-700 bg-gray-800">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white">Deal Management</CardTitle>
                    <CardDescription className="text-gray-400">
                      Manage deals, approve submissions, and moderate content
                    </CardDescription>
                  </div>
                  <Button onClick={() => openDealDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Deal
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Pending Approvals Section */}
                {pendingDeals.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-yellow-400 mb-4">
                      ⏳ Pending Approvals ({pendingDeals.length})
                    </h3>
                    <div className="space-y-4">
                      {pendingDeals.map((deal) => (
                        <div key={deal.id} className="border border-yellow-600 bg-yellow-500/5 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-white">{deal.title}</h4>
                              <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                                <span>By: {deal.profiles?.username || deal.profiles?.full_name || 'Unknown'}</span>
                                <span>Category: {deal.categories?.name || 'None'}</span>
                                <span>Shop: {deal.shops?.name || 'None'}</span>
                                <span>Heat: {deal.heat_score}°</span>
                              </div>
                              {deal.description && (
                                <p className="text-gray-300 text-sm mt-2">{deal.description.slice(0, 100)}...</p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleDealStatusChange(deal.id, 'approved')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDealStatusChange(deal.id, 'rejected')}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openDealDialog(deal)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* All Deals Table */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">All Deals</h3>
                  {deals.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-300 mb-2">No deals found</h3>
                      <p className="text-gray-400">Create your first deal to get started!</p>
                    </div>
                  ) : (
                    <div className="border border-gray-600 rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-600">
                            <TableHead className="text-gray-300">Title</TableHead>
                            <TableHead className="text-gray-300">Status</TableHead>
                            <TableHead className="text-gray-300">Price</TableHead>
                            <TableHead className="text-gray-300">Heat</TableHead>
                            <TableHead className="text-gray-300">Submitted By</TableHead>
                            <TableHead className="text-gray-300">Created</TableHead>
                            <TableHead className="text-gray-300">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {deals.map((deal) => (
                            <TableRow key={deal.id} className="border-gray-600">
                              <TableCell className="text-white">
                                <div>
                                  <div className="font-medium">{deal.title}</div>
                                  <div className="text-sm text-gray-400">
                                    {deal.categories?.name && `${deal.categories.name} • `}
                                    {deal.shops?.name && deal.shops.name}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={getStatusBadgeVariant(deal.status)}>
                                  {deal.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-white">
                                {deal.discounted_price && (
                                  <div>
                                    <div className="font-medium">£{deal.discounted_price}</div>
                                    {deal.original_price && (
                                      <div className="text-sm text-gray-400 line-through">
                                        £{deal.original_price}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="text-white">{deal.heat_score}°</TableCell>
                              <TableCell className="text-gray-300">
                                {deal.profiles?.username || deal.profiles?.full_name || 'Admin'}
                              </TableCell>
                              <TableCell className="text-gray-300">
                                {new Date(deal.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  {deal.status === 'pending' && (
                                    <>
                                      <Button
                                        size="sm"
                                        onClick={() => handleDealStatusChange(deal.id, 'approved')}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        <Check className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleDealStatusChange(deal.id, 'rejected')}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openDealDialog(deal)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteDeal(deal.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shop Management */}
          <TabsContent value="shops">
            <Card className="border-gray-700 bg-gray-800">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white">Shop Management</CardTitle>
                    <CardDescription className="text-gray-400">
                      Manage shops and store information
                    </CardDescription>
                  </div>
                  <Button onClick={() => openShopDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Shop
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {shops.length === 0 ? (
                  <div className="text-center py-8">
                    <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">No shops found</h3>
                    <p className="text-gray-400">Create your first shop to get started!</p>
                  </div>
                ) : (
                  <div className="border border-gray-600 rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-600">
                          <TableHead className="text-gray-300">Name</TableHead>
                          <TableHead className="text-gray-300">Slug</TableHead>
                          <TableHead className="text-gray-300">Website</TableHead>
                          <TableHead className="text-gray-300">Created</TableHead>
                          <TableHead className="text-gray-300">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {shops.map((shop) => (
                          <TableRow key={shop.id} className="border-gray-600">
                            <TableCell className="text-white">
                              <div className="flex items-center space-x-3">
                                {shop.logo_url && (
                                  <img src={shop.logo_url} alt={shop.name} className="h-8 w-8 rounded" />
                                )}
                                <div>
                                  <div className="font-medium">{shop.name}</div>
                                  {shop.description && (
                                    <div className="text-sm text-gray-400">{shop.description.slice(0, 50)}...</div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-300">{shop.slug}</TableCell>
                            <TableCell className="text-gray-300">
                              {shop.website_url ? (
                                <a href={shop.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                  {shop.website_url}
                                </a>
                              ) : '-'}
                            </TableCell>
                            <TableCell className="text-gray-300">
                              {new Date(shop.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openShopDialog(shop)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteShop(shop.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Blog Management */}
          <TabsContent value="blogs">
            <Card className="border-gray-700 bg-gray-800">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white">Blog Management</CardTitle>
                    <CardDescription className="text-gray-400">
                      Manage blog posts and content
                    </CardDescription>
                  </div>
                  <Button onClick={() => openBlogDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Blog Post
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {blogPosts.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">No blog posts found</h3>
                    <p className="text-gray-400">Create your first blog post to get started!</p>
                  </div>
                ) : (
                  <div className="border border-gray-600 rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-600">
                          <TableHead className="text-gray-300">Title</TableHead>
                          <TableHead className="text-gray-300">Status</TableHead>
                          <TableHead className="text-gray-300">Category</TableHead>
                          <TableHead className="text-gray-300">Created</TableHead>
                          <TableHead className="text-gray-300">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {blogPosts.map((blog) => (
                          <TableRow key={blog.id} className="border-gray-600">
                            <TableCell className="text-white">
                              <div>
                                <div className="font-medium">{blog.title}</div>
                                <div className="text-sm text-gray-400">/{blog.slug}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={blog.status === 'published' ? 'default' : 'secondary'}>
                                {blog.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-300">{blog.category || '-'}</TableCell>
                            <TableCell className="text-gray-300">
                              {new Date(blog.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openBlogDialog(blog)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteBlog(blog.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Page Management */}
          <TabsContent value="pages">
            <Card className="border-gray-700 bg-gray-800">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white">Static Pages</CardTitle>
                    <CardDescription className="text-gray-400">
                      Manage static pages like About, Privacy Policy, etc.
                    </CardDescription>
                  </div>
                  <Button onClick={() => openPageDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Page
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {staticPages.length === 0 ? (
                  <div className="text-center py-8">
                    <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">No pages found</h3>
                    <p className="text-gray-400">Create your first page to get started!</p>
                  </div>
                ) : (
                  <div className="border border-gray-600 rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-600">
                          <TableHead className="text-gray-300">Title</TableHead>
                          <TableHead className="text-gray-300">Slug</TableHead>
                          <TableHead className="text-gray-300">Visibility</TableHead>
                          <TableHead className="text-gray-300">Created</TableHead>
                          <TableHead className="text-gray-300">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {staticPages.map((page) => (
                          <TableRow key={page.id} className="border-gray-600">
                            <TableCell className="text-white">
                              <div className="font-medium">{page.title}</div>
                            </TableCell>
                            <TableCell className="text-gray-300">/{page.slug}</TableCell>
                            <TableCell>
                              <Badge variant={page.is_visible ? 'default' : 'secondary'}>
                                {page.is_visible ? 'Visible' : 'Hidden'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-300">
                              {new Date(page.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openPageDialog(page)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeletePage(page.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management */}
          <TabsContent value="users">
            <Card className="border-gray-700 bg-gray-800">
              <CardHeader>
                <CardTitle className="text-white">User Management</CardTitle>
                <CardDescription className="text-gray-400">
                  View and manage all users
                </CardDescription>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">No users found</h3>
                    <p className="text-gray-400">No users have registered yet.</p>
                  </div>
                ) : (
                  <div className="border border-gray-600 rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-600">
                          <TableHead className="text-gray-300">User</TableHead>
                          <TableHead className="text-gray-300">Username</TableHead>
                          <TableHead className="text-gray-300">Role</TableHead>
                          <TableHead className="text-gray-300">Joined</TableHead>
                          <TableHead className="text-gray-300">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id} className="border-gray-600">
                            <TableCell className="text-white">
                              <div className="font-medium">
                                {user.profiles?.full_name || 'Unknown User'}
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-300">
                              @{user.profiles?.username || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                user.profiles?.role === 'root_admin' ? 'destructive' :
                                user.profiles?.role === 'admin' ? 'default' :
                                user.profiles?.role === 'moderator' ? 'secondary' : 'outline'
                              }>
                                {user.profiles?.role || 'user'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-300">
                              {new Date(user.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {user.id !== userProfile.id && (
                                <Select
                                  value={user.profiles?.role || 'user'}
                                  onValueChange={(value) => handleUserRoleUpdate(user.id, value)}
                                >
                                  <SelectTrigger className="w-32 bg-gray-700 border-gray-600">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="moderator">Moderator</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="border-gray-700 bg-gray-800">
              <CardHeader>
                <CardTitle className="text-white">System Settings</CardTitle>
                <CardDescription className="text-gray-400">
                  Configure system preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">System settings interface will be implemented here...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Deal Form Dialog */}
      <Dialog open={showDealDialog} onOpenChange={setShowDealDialog}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingDeal ? 'Edit Deal' : 'Create New Deal'}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingDeal ? 'Update deal information' : 'Add a new deal to the platform'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={dealForm.title}
                onChange={(e) => setDealForm({...dealForm, title: e.target.value})}
                className="bg-gray-700 border-gray-600"
                placeholder="Deal title"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={dealForm.description}
                onChange={(e) => setDealForm({...dealForm, description: e.target.value})}
                className="bg-gray-700 border-gray-600"
                placeholder="Deal description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                value={dealForm.image_url}
                onChange={(e) => setDealForm({...dealForm, image_url: e.target.value})}
                className="bg-gray-700 border-gray-600"
                placeholder="https://example.com/image.jpg"
              />
              {/* Image Preview */}
              {dealForm.image_url && (
                <div className="mt-2">
                  <p className="text-sm text-gray-400 mb-2">Image Preview:</p>
                  <div className="border border-gray-600 rounded-lg overflow-hidden max-w-xs">
                    <img
                      src={dealForm.image_url}
                      alt="Deal preview"
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        const errorDiv = target.nextElementSibling as HTMLDivElement;
                        target.style.display = 'none';
                        if (errorDiv) {
                          errorDiv.style.display = 'block';
                        }
                      }}
                    />
                    <div className="hidden p-4 text-center text-gray-400 text-sm">
                      Invalid image URL or image failed to load
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="original_price">Original Price (£)</Label>
                <Input
                  id="original_price"
                  type="number"
                  step="0.01"
                  value={dealForm.original_price}
                  onChange={(e) => setDealForm({...dealForm, original_price: e.target.value})}
                  className="bg-gray-700 border-gray-600"
                  placeholder="99.99"
                />
              </div>
              <div>
                <Label htmlFor="discounted_price">Sale Price (£)</Label>
                <Input
                  id="discounted_price"
                  type="number"
                  step="0.01"
                  value={dealForm.discounted_price}
                  onChange={(e) => setDealForm({...dealForm, discounted_price: e.target.value})}
                  className="bg-gray-700 border-gray-600"
                  placeholder="79.99"
                />
              </div>
            </div>

            {calculateDiscount() > 0 && (
              <div className="text-green-400 text-sm">
                Discount: {calculateDiscount()}% OFF
              </div>
            )}

            <div>
              <Label htmlFor="affiliate_link">Deal Link</Label>
              <Input
                id="affiliate_link"
                value={dealForm.affiliate_link}
                onChange={(e) => setDealForm({...dealForm, affiliate_link: e.target.value})}
                className="bg-gray-700 border-gray-600"
                placeholder="https://store.example.com/product"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={dealForm.category_id} onValueChange={(value) => setDealForm({...dealForm, category_id: value})}>
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Shop</Label>
                <Select value={dealForm.shop_id} onValueChange={(value) => setDealForm({...dealForm, shop_id: value})}>
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue placeholder="Select shop" />
                  </SelectTrigger>
                  <SelectContent>
                    {shops.map((shop) => (
                      <SelectItem key={shop.id} value={shop.id}>
                        {shop.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expires_at">Expires At (Optional)</Label>
                <Input
                  id="expires_at"
                  type="date"
                  value={dealForm.expires_at.split('T')[0]}
                  onChange={(e) => {
                    const dateValue = e.target.value;
                    setDealForm({...dealForm, expires_at: dateValue ? `${dateValue}T00:00` : ''});
                  }}
                  className="bg-gray-700 border-gray-600"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Time will be set to midnight if date is selected
                </p>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={dealForm.status} onValueChange={(value) => setDealForm({...dealForm, status: value})}>
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDealDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveDeal}>
              {editingDeal ? 'Update Deal' : 'Create Deal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shop Form Dialog */}
      <Dialog open={showShopDialog} onOpenChange={setShowShopDialog}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingShop ? 'Edit Shop' : 'Create New Shop'}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingShop ? 'Update shop information' : 'Add a new shop to the platform'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="shop_name">Shop Name *</Label>
              <Input
                id="shop_name"
                value={shopForm.name}
                onChange={(e) => setShopForm({...shopForm, name: e.target.value})}
                className="bg-gray-700 border-gray-600"
                placeholder="Shop name"
              />
            </div>

            <div>
              <Label htmlFor="shop_slug">Slug</Label>
              <Input
                id="shop_slug"
                value={shopForm.slug}
                onChange={(e) => setShopForm({...shopForm, slug: e.target.value})}
                className="bg-gray-700 border-gray-600"
                placeholder="shop-slug (auto-generated if empty)"
              />
            </div>

            <div>
              <Label htmlFor="shop_description">Description</Label>
              <Textarea
                id="shop_description"
                value={shopForm.description}
                onChange={(e) => setShopForm({...shopForm, description: e.target.value})}
                className="bg-gray-700 border-gray-600"
                placeholder="Shop description"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="shop_logo">Logo URL</Label>
              <Input
                id="shop_logo"
                value={shopForm.logo_url}
                onChange={(e) => setShopForm({...shopForm, logo_url: e.target.value})}
                className="bg-gray-700 border-gray-600"
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div>
              <Label htmlFor="shop_website">Website URL</Label>
              <Input
                id="shop_website"
                value={shopForm.website_url}
                onChange={(e) => setShopForm({...shopForm, website_url: e.target.value})}
                className="bg-gray-700 border-gray-600"
                placeholder="https://example.com"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShopDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveShop}>
              {editingShop ? 'Update Shop' : 'Create Shop'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Blog Form Dialog */}
      <Dialog open={showBlogDialog} onOpenChange={setShowBlogDialog}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingBlog ? 'Update blog post information' : 'Add a new blog post to the platform'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div>
              <Label htmlFor="blog_title">Title *</Label>
              <Input
                id="blog_title"
                value={blogForm.title}
                onChange={(e) => setBlogForm({...blogForm, title: e.target.value})}
                className="bg-gray-700 border-gray-600"
                placeholder="Blog post title"
              />
            </div>

            <div>
              <Label htmlFor="blog_slug">Slug</Label>
              <Input
                id="blog_slug"
                value={blogForm.slug}
                onChange={(e) => setBlogForm({...blogForm, slug: e.target.value})}
                className="bg-gray-700 border-gray-600"
                placeholder="blog-post-slug (auto-generated if empty)"
              />
            </div>

            <div>
              <Label htmlFor="blog_summary">Summary</Label>
              <Textarea
                id="blog_summary"
                value={blogForm.summary}
                onChange={(e) => setBlogForm({...blogForm, summary: e.target.value})}
                className="bg-gray-700 border-gray-600"
                placeholder="Brief summary of the blog post"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="blog_content">Content</Label>
              <Textarea
                id="blog_content"
                value={blogForm.content}
                onChange={(e) => setBlogForm({...blogForm, content: e.target.value})}
                className="bg-gray-700 border-gray-600"
                placeholder="Blog post content"
                rows={6}
              />
            </div>

            <div>
              <Label htmlFor="blog_image">Featured Image URL</Label>
              <Input
                id="blog_image"
                value={blogForm.featured_image}
                onChange={(e) => setBlogForm({...blogForm, featured_image: e.target.value})}
                className="bg-gray-700 border-gray-600"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="blog_category">Category</Label>
                <Input
                  id="blog_category"
                  value={blogForm.category}
                  onChange={(e) => setBlogForm({...blogForm, category: e.target.value})}
                  className="bg-gray-700 border-gray-600"
                  placeholder="Category name"
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={blogForm.status} onValueChange={(value) => setBlogForm({...blogForm, status: value})}>
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBlogDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveBlog}>
              {editingBlog ? 'Update Post' : 'Create Post'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Page Form Dialog */}
      <Dialog open={showPageDialog} onOpenChange={setShowPageDialog}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingPage ? 'Edit Page' : 'Create New Page'}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingPage ? 'Update page information' : 'Add a new static page to the platform'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div>
              <Label htmlFor="page_title">Title *</Label>
              <Input
                id="page_title"
                value={pageForm.title}
                onChange={(e) => setPageForm({...pageForm, title: e.target.value})}
                className="bg-gray-700 border-gray-600"
                placeholder="Page title"
              />
            </div>

            <div>
              <Label htmlFor="page_slug">Slug</Label>
              <Input
                id="page_slug"
                value={pageForm.slug}
                onChange={(e) => setPageForm({...pageForm, slug: e.target.value})}
                className="bg-gray-700 border-gray-600"
                placeholder="page-slug (auto-generated if empty)"
              />
            </div>

            <div>
              <Label htmlFor="page_content">Content</Label>
              <Textarea
                id="page_content"
                value={pageForm.content}
                onChange={(e) => setPageForm({...pageForm, content: e.target.value})}
                className="bg-gray-700 border-gray-600"
                placeholder="Page content"
                rows={8}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="page_visible"
                checked={pageForm.is_visible}
                onChange={(e) => setPageForm({...pageForm, is_visible: e.target.checked})}
                className="rounded"
              />
              <Label htmlFor="page_visible">Make page visible</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPageDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePage}>
              {editingPage ? 'Update Page' : 'Create Page'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RootDashboard;
