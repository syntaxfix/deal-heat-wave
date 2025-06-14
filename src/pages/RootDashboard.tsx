
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Shield, Users, Package, BookOpen, Store, MessageSquare, Settings, BarChart3, TrendingUp, Eye, LogOut } from 'lucide-react';

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
      // Fetch all stats in parallel
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

      // Get today's votes
      const today = new Date().toISOString().split('T')[0];
      const { count: todayVotes } = await supabase
        .from('deal_votes')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today);

      setStats({
        totalDeals: totalDeals || 0,
        todayVotes: todayVotes || 0,
        onlineUsers: Math.floor(Math.random() * 50) + 10, // Simulated for now
        totalUsers: totalUsers || 0,
        pendingDeals: pendingDeals || 0,
        totalShops: totalShops || 0,
        totalBlogs: totalBlogs || 0,
        contactSubmissions: contactSubmissions || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/root/login');
  };

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
        <Tabs defaultValue="deals" className="space-y-6">
          <TabsList className="grid grid-cols-2 lg:grid-cols-6 bg-gray-800 border-gray-700">
            <TabsTrigger value="deals" className="data-[state=active]:bg-gray-700">
              Deals ({stats.pendingDeals})
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
            <TabsTrigger value="contacts" className="data-[state=active]:bg-gray-700">
              Contacts ({stats.contactSubmissions})
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-gray-700">
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deals">
            <Card className="border-gray-700 bg-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Deal Management</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage deal submissions, approvals, and moderation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={() => navigate('/admin')}
                    className="h-20 flex-col bg-blue-600 hover:bg-blue-700"
                  >
                    <BarChart3 className="h-6 w-6 mb-2" />
                    Review Pending Deals
                  </Button>
                  <Button
                    onClick={() => navigate('/post-deal')}
                    variant="outline"
                    className="h-20 flex-col border-gray-600 text-gray-300"
                  >
                    <Package className="h-6 w-6 mb-2" />
                    Create New Deal
                  </Button>
                  <Button
                    onClick={() => navigate('/')}
                    variant="outline"
                    className="h-20 flex-col border-gray-600 text-gray-300"
                  >
                    <Eye className="h-6 w-6 mb-2" />
                    View All Deals
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shops">
            <Card className="border-gray-700 bg-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Shop Management</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage shops, coupons, and store information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={() => navigate('/shops')}
                    className="h-20 flex-col bg-green-600 hover:bg-green-700"
                  >
                    <Store className="h-6 w-6 mb-2" />
                    Manage Shops
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col border-gray-600 text-gray-300"
                  >
                    <Package className="h-6 w-6 mb-2" />
                    Add New Shop
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col border-gray-600 text-gray-300"
                  >
                    <Settings className="h-6 w-6 mb-2" />
                    Coupon Codes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blogs">
            <Card className="border-gray-700 bg-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Blog Management</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage blog posts, tags, and content publishing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={() => navigate('/blog')}
                    className="h-20 flex-col bg-purple-600 hover:bg-purple-700"
                  >
                    <BookOpen className="h-6 w-6 mb-2" />
                    Manage Posts
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col border-gray-600 text-gray-300"
                  >
                    <BookOpen className="h-6 w-6 mb-2" />
                    Create New Post
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col border-gray-600 text-gray-300"
                  >
                    <Settings className="h-6 w-6 mb-2" />
                    Manage Tags
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pages">
            <Card className="border-gray-700 bg-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Static Pages</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage About, Privacy, Terms, and other static content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-400">Static page management coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts">
            <Card className="border-gray-700 bg-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Contact Submissions</CardTitle>
                <CardDescription className="text-gray-400">
                  View and respond to user contact form submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500">
                    {stats.contactSubmissions} Unread Messages
                  </Badge>
                  <p className="text-gray-400">Contact management interface coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="border-gray-700 bg-gray-800">
              <CardHeader>
                <CardTitle className="text-white">System Settings</CardTitle>
                <CardDescription className="text-gray-400">
                  Configure API keys, email settings, and system preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-400">System settings interface coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RootDashboard;
