
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Filter, 
  SlidersHorizontal, 
  Flame, 
  TrendingUp, 
  Clock, 
  Star,
  X
} from 'lucide-react';

interface FilterBarProps {
  activeFilters: string[];
  onFilterChange: (filters: string[]) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ 
  activeFilters, 
  onFilterChange, 
  sortBy, 
  onSortChange 
}) => {
  const filterOptions = [
    { value: 'hot', label: 'Hot Deals', icon: Flame },
    { value: 'trending', label: 'Trending', icon: TrendingUp },
    { value: 'new', label: 'New', icon: Clock },
    { value: 'top-rated', label: 'Top Rated', icon: Star },
  ];

  const toggleFilter = (filter: string) => {
    if (activeFilters.includes(filter)) {
      onFilterChange(activeFilters.filter(f => f !== filter));
    } else {
      onFilterChange([...activeFilters, filter]);
    }
  };

  const clearFilters = () => {
    onFilterChange([]);
  };

  return (
    <div className="bg-white border-b sticky top-16 z-40 py-4">
      <div className="container px-4">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          {/* Filter buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-2 mr-4">
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            {filterOptions.map((option) => {
              const isActive = activeFilters.includes(option.value);
              const IconComponent = option.icon;
              
              return (
                <Button
                  key={option.value}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleFilter(option.value)}
                  className="flex items-center space-x-1"
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{option.label}</span>
                </Button>
              );
            })}
            
            {activeFilters.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4 mr-1" />
                Clear all
              </Button>
            )}
          </div>
          
          {/* Sort dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Sort by:</span>
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="heat">Heat Score</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="discount">Highest Discount</SelectItem>
                <SelectItem value="expiry">Expiring Soon</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Active filters display */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {activeFilters.map((filter) => {
              const option = filterOptions.find(opt => opt.value === filter);
              return (
                <Badge key={filter} variant="secondary" className="flex items-center space-x-1">
                  {option && <option.icon className="w-3 h-3" />}
                  <span>{option?.label}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1 hover:bg-transparent"
                    onClick={() => toggleFilter(filter)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
