
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Home, 
  Flame, 
  TrendingUp, 
  Clock, 
  Star, 
  Smartphone, 
  Gamepad2, 
  Shirt, 
  Car, 
  Home as HomeIcon,
  Book,
  Utensils,
  Shield,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = [
  { name: 'Electronics', icon: Smartphone, count: 1234 },
  { name: 'Gaming', icon: Gamepad2, count: 856 },
  { name: 'Fashion', icon: Shirt, count: 743 },
  { name: 'Automotive', icon: Car, count: 432 },
  { name: 'Home & Garden', icon: HomeIcon, count: 651 },
  { name: 'Books', icon: Book, count: 289 },
  { name: 'Food & Drinks', icon: Utensils, count: 387 },
  { name: 'Health & Beauty', icon: Shield, count: 512 }
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:h-auto md:z-auto
      `}>
        <div className="flex items-center justify-between p-4 md:hidden">
          <h2 className="font-semibold">Menu</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <ScrollArea className="h-full px-4 pb-4">
          {/* Main Navigation */}
          <div className="space-y-2 mb-6">
            <Button variant="default" className="w-full justify-start">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Flame className="mr-2 h-4 w-4" />
              Hot Deals
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <TrendingUp className="mr-2 h-4 w-4" />
              Trending
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Clock className="mr-2 h-4 w-4" />
              Recent
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Star className="mr-2 h-4 w-4" />
              Top Rated
            </Button>
          </div>

          <Separator className="mb-6" />

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-3 px-2">
              CATEGORIES
            </h3>
            <div className="space-y-1">
              {categories.map((category) => (
                <Button 
                  key={category.name}
                  variant="ghost" 
                  className="w-full justify-between text-left"
                >
                  <div className="flex items-center">
                    <category.icon className="mr-2 h-4 w-4" />
                    {category.name}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {category.count}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        </ScrollArea>
      </aside>
    </>
  );
};

export default Sidebar;
