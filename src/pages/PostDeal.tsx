
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Flame, Upload } from 'lucide-react';
import Header from '@/components/Header';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Shop {
  id: string;
  name: string;
  slug: string;
}

export default function PostDeal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    originalPrice: '',
    discountedPrice: '',
    affiliateLink: '',
    categoryId: '',
    shopId: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth', { state: { from: { pathname: '/post-deal' } } });
      return;
    }

    fetchCategories();
    fetchShops();
  }, [user, navigate]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
    } else {
      setCategories(data || []);
    }
  };

  const fetchShops = async () => {
    const { data, error } = await supabase
      .from('shops')
      .select('id, name, slug')
      .order('name');

    if (error) {
      console.error('Error fetching shops:', error);
    } else {
      setShops(data || []);
    }
  };

  const calculateDiscountPercentage = () => {
    const original = parseFloat(formData.originalPrice);
    const discounted = parseFloat(formData.discountedPrice);
    
    if (original > 0 && discounted > 0 && original > discounted) {
      return Math.round(((original - discounted) / original) * 100);
    }
    return 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);

    const discountPercentage = calculateDiscountPercentage();

    const { error } = await supabase
      .from('deals')
      .insert({
        title: formData.title,
        description: formData.description,
        image_url: formData.imageUrl,
        original_price: parseFloat(formData.originalPrice),
        discounted_price: parseFloat(formData.discountedPrice),
        discount_percentage: discountPercentage,
        affiliate_link: formData.affiliateLink,
        category_id: formData.categoryId,
        shop_id: formData.shopId,
        user_id: user.id,
        status: 'pending'
      });

    if (error) {
      toast.error('Failed to post deal: ' + error.message);
    } else {
      toast.success('Deal posted successfully! It will be reviewed by moderators.');
      navigate('/');
    }

    setIsLoading(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Flame className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Post a New Deal</CardTitle>
                  <CardDescription>Share an amazing deal with the community</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Deal Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter deal title"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the deal"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Product Image URL</label>
                  <Input
                    value={formData.imageUrl}
                    onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    type="url"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Original Price *</label>
                    <Input
                      value={formData.originalPrice}
                      onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                      placeholder="99.99"
                      type="number"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Discounted Price *</label>
                    <Input
                      value={formData.discountedPrice}
                      onChange={(e) => handleInputChange('discountedPrice', e.target.value)}
                      placeholder="49.99"
                      type="number"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                {formData.originalPrice && formData.discountedPrice && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      Discount: <span className="font-semibold">{calculateDiscountPercentage()}% OFF</span>
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category *</label>
                    <Select value={formData.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)}>
                      <SelectTrigger>
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
                    <label className="text-sm font-medium mb-2 block">Shop *</label>
                    <Select value={formData.shopId} onValueChange={(value) => handleInputChange('shopId', value)}>
                      <SelectTrigger>
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

                <div>
                  <label className="text-sm font-medium mb-2 block">Affiliate Link</label>
                  <Input
                    value={formData.affiliateLink}
                    onChange={(e) => handleInputChange('affiliateLink', e.target.value)}
                    placeholder="https://example.com/deal-link"
                    type="url"
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? 'Posting...' : 'Post Deal'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
