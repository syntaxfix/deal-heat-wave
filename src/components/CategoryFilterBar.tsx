
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface Shop {
  id: string;
  name: string;
  slug: string;
}

interface CategoryFilterBarProps {
  shops: Shop[];
  selectedShop: string;
  sortBy: string;
  onShopChange: (shop: string) => void;
  onSortChange: (sort: string) => void;
  categoryName?: string;
}

const CategoryFilterBar = ({
  shops,
  selectedShop,
  sortBy,
  onShopChange,
  onSortChange,
  categoryName
}: CategoryFilterBarProps) => {
  // Filter out shops with empty slugs
  const validShops = shops.filter(shop => shop.slug && shop.slug.trim() !== '');

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {categoryName ? `${categoryName} Deals` : 'Filter Deals'}
          </h3>
          <p className="text-sm text-gray-600">
            Find the best deals in this category
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="min-w-[180px]">
            <Label htmlFor="shop-filter" className="text-sm font-medium text-gray-700">
              Shop
            </Label>
            <Select value={selectedShop} onValueChange={onShopChange}>
              <SelectTrigger id="shop-filter">
                <SelectValue placeholder="All Shops" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Shops</SelectItem>
                {validShops.map((shop) => (
                  <SelectItem key={shop.id} value={shop.slug}>
                    {shop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-[180px]">
            <Label htmlFor="sort-filter" className="text-sm font-medium text-gray-700">
              Sort By
            </Label>
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger id="sort-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hot">🔥 Hot Deals</SelectItem>
                <SelectItem value="newest">🆕 Newest First</SelectItem>
                <SelectItem value="discount">💯 Highest Discount</SelectItem>
                <SelectItem value="price_low">💰 Price: Low to High</SelectItem>
                <SelectItem value="price_high">💰 Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryFilterBar;
