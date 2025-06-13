
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Menu, 
  X, 
  Flame, 
  User, 
  Settings, 
  LogOut,
  Bell,
  Heart,
  Plus
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onMenuToggle: () => void;
  isMenuOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, isMenuOpen }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container flex h-16 items-center px-4">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="sm"
          className="mr-2 md:hidden"
          onClick={onMenuToggle}
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>

        {/* Logo */}
        <div className="flex items-center space-x-2 mr-6">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-deals-hot to-deals-fire">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <span className="hidden font-bold text-xl bg-gradient-to-r from-deals-hot to-deals-fire bg-clip-text text-transparent sm:inline-block">
            HotDeals
          </span>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-lg mr-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search for deals, shops, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4"
            />
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4 mr-4">
          <Button variant="ghost" size="sm">
            Categories
          </Button>
          <Button variant="ghost" size="sm">
            Shops
          </Button>
          <Button variant="ghost" size="sm">
            Blog
          </Button>
        </nav>

        {/* Right side buttons */}
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Plus className="w-4 h-4 mr-2" />
            Post Deal
          </Button>
          
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-deals-hot rounded-full"></span>
          </Button>
          
          <Button variant="ghost" size="sm">
            <Heart className="w-4 h-4" />
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
