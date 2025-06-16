
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Star, ExternalLink, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Coupon {
  id: string;
  title: string;
  code: string;
  discount_percentage?: number;
  discount_amount?: number;
  verified: boolean;
}

interface ShopDetailSidebarProps {
  categories: Category[];
  coupons: Coupon[];
  shopName: string;
}

const ShopDetailSidebar = ({ categories, coupons, shopName }: ShopDetailSidebarProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      {/* Shop Coupons */}
      {coupons && coupons.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Tag className="h-5 w-5 mr-2 text-green-500" />
              {shopName} Coupons
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {coupons.slice(0, 3).map((coupon) => (
              <div
                key={coupon.id}
                className="p-4 border border-green-200 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm text-gray-800 line-clamp-1">
                    {coupon.title}
                  </h4>
                  {coupon.verified && (
                    <Badge variant="success" className="text-xs">
                      ✓ Verified
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <code className="bg-white px-2 py-1 rounded text-sm font-mono font-semibold text-green-700 border border-green-300">
                      {coupon.code}
                    </code>
                    {(coupon.discount_percentage || coupon.discount_amount) && (
                      <Badge variant="outline" className="text-xs">
                        {coupon.discount_percentage 
                          ? `${coupon.discount_percentage}% OFF`
                          : `$${coupon.discount_amount} OFF`
                        }
                      </Badge>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => navigator.clipboard.writeText(coupon.code)}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            ))}
            
            {coupons.length > 3 && (
              <div className="text-center pt-2">
                <Button variant="outline" size="sm" className="w-full hover:bg-green-50 hover:text-green-600 hover:border-green-300">
                  View All Coupons ({coupons.length})
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Browse Categories */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Star className="h-5 w-5 mr-2 text-blue-500" />
            Browse Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {categories.slice(0, 6).map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="block group"
            >
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-200">
                <span className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                  {category.name}
                </span>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
          
          {categories.length > 6 && (
            <div className="text-center pt-2">
              <Link to="/categories">
                <Button variant="outline" size="sm" className="w-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300">
                  View All Categories
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ShopDetailSidebar;
