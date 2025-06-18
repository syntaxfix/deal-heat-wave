
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/useCurrency';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { User, Package, MessageSquare, Settings, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';

interface UserProfile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  role: string;
}

interface UserDeal {
  id: string;
  title: string;
  slug: string;
  description?: string;
  image_url?: string;
  original_price?: number;
  discounted_price?: number;
  discount_percentage?: number;
  heat_score: number;
  upvotes: number;
  downvotes: number;
  status: string;
  created_at: string;
  shops?: { name: string; slug: string };
  categories?: { name: string; slug: string };
}

interface UserComment {
  id: string;
  content: string;
  created_at: string;
  deals: {
    title: string;
    slug: string;
  };
}

const Profile = () => {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userDeals, setUserDeals] = useState<UserDeal[]>([]);
  const [userComments, setUserComments] = useState<UserComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUserContent();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setFormData({
        username: data.username || '',
        full_name: data.full_name || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserContent = async () => {
    if (!user) return;

    try {
      // Fetch user's deals
      const { data: dealsData } = await supabase
        .from('deals')
        .select(`
          *,
          shops(name, slug),
          categories(name, slug)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (dealsData) {
        setUserDeals(dealsData as UserDeal[]);
      }

      // Fetch user's comments
      const { data: commentsData } = await supabase
        .from('comments')
        .select(`
          *,
          deals(title, slug)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (commentsData) {
        setUserComments(commentsData as UserComment[]);
      }
    } catch (error) {
      console.error('Error fetching user content:', error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username || null,
          full_name: formData.full_name || null,
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile({
        ...profile,
        username: formData.username,
        full_name: formData.full_name,
      });

      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Profile not found</h2>
            <p className="text-gray-600">Unable to load your profile information.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        title="My Profile - DealSpark"
        description="Manage your DealSpark profile, view your submitted deals, and track your activity."
      />
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name || profile.username || 'User'} />
                  <AvatarFallback>
                    <User className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    {profile.full_name || profile.username || 'Anonymous User'}
                  </h1>
                  {profile.username && (
                    <p className="text-gray-600 mb-2">@{profile.username}</p>
                  )}
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline">{profile.role}</Badge>
                    <span className="text-sm text-gray-600">
                      {userDeals.length} deals posted
                    </span>
                    <span className="text-sm text-gray-600">
                      {userComments.length} comments
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="deals" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="deals" className="flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span>My Deals</span>
              </TabsTrigger>
              <TabsTrigger value="comments" className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span>Comments</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="deals">
              <Card>
                <CardHeader>
                  <CardTitle>My Submitted Deals</CardTitle>
                  <CardDescription>
                    Manage your deal submissions and track their status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userDeals.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No deals submitted yet
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Start sharing great deals with the community!
                      </p>
                      <Button asChild>
                        <Link to="/post-deal">Post Your First Deal</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userDeals.map((deal) => (
                        <div key={deal.id} className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-1">
                                <Link to={`/deal/${deal.slug}`} className="hover:text-primary">
                                  {deal.title}
                                </Link>
                              </h3>
                              {deal.description && (
                                <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                                  {deal.description}
                                </p>
                              )}
                            </div>
                            <Badge variant={getStatusColor(deal.status)}>
                              {deal.status}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              {deal.shops && (
                                <span>{deal.shops.name}</span>
                              )}
                              {deal.categories && (
                                <span>{deal.categories.name}</span>
                              )}
                              <span>{new Date(deal.created_at).toLocaleDateString()}</span>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              {(deal.original_price || deal.discounted_price) && (
                                <div className="flex items-center space-x-2">
                                  {deal.discounted_price && (
                                    <span className="font-semibold text-green-600">
                                      {formatPrice(deal.discounted_price)}
                                    </span>
                                  )}
                                  {deal.original_price && deal.discounted_price && (
                                    <span className="text-sm text-gray-500 line-through">
                                      {formatPrice(deal.original_price)}
                                    </span>
                                  )}
                                </div>
                              )}
                              
                              <div className="flex items-center space-x-2 text-sm">
                                <div className="flex items-center space-x-1">
                                  <TrendingUp className="h-4 w-4 text-orange-500" />
                                  <span>{deal.heat_score}°</span>
                                </div>
                                <span className="text-gray-500">
                                  {deal.upvotes} votes
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comments">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Comments</CardTitle>
                  <CardDescription>
                    Your latest comments on deals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userComments.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No comments yet
                      </h3>
                      <p className="text-gray-600">
                        Start engaging with the community by commenting on deals!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userComments.map((comment) => (
                        <div key={comment.id} className="border rounded-lg p-4">
                          <div className="mb-2">
                            <Link 
                              to={`/deal/${comment.deals.slug}`}
                              className="font-medium hover:text-primary"
                            >
                              {comment.deals.title}
                            </Link>
                          </div>
                          <p className="text-gray-700 mb-2">{comment.content}</p>
                          <span className="text-sm text-gray-500">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>
                    Update your profile information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        placeholder="Enter your username"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <Button type="submit" disabled={updating}>
                      {updating ? 'Updating...' : 'Update Profile'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
