
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Clock, Percent, Grid3X3 } from 'lucide-react';

interface FilterBarProps {
  onSortChange?: (sort: string) => void;
  currentSort?: string;
}

const FilterBar = ({ onSortChange, currentSort = 'hot' }: FilterBarProps) => {
  const sortOptions = [
    { value: 'hot', label: 'Hot Deals', icon: TrendingUp },
    { value: 'newest', label: 'Newest', icon: Clock },
    { value: 'discount', label: 'Best Discount', icon: Percent },
    { value: 'votes', label: 'Most Voted', icon: TrendingUp }
  ];

  const handleSortChange = (sort: string) => {
    if (onSortChange) {
      onSortChange(sort);
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Grid3X3 className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Desktop - Button Group */}
            <div className="hidden md:flex space-x-1">
              {sortOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Button
                    key={option.value}
                    variant={currentSort === option.value ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleSortChange(option.value)}
                    className="flex items-center space-x-1"
                  >
                    <Icon className="h-3 w-3" />
                    <span>{option.label}</span>
                  </Button>
                );
              })}
            </div>

            {/* Mobile - Select Dropdown */}
            <div className="md:hidden">
              <Select value={currentSort} onValueChange={handleSortChange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center space-x-2">
                          <Icon className="h-3 w-3" />
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterBar;
