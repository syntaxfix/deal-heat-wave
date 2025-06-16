
import { Button } from '@/components/ui/button';
import { Search, Flame, TrendingUp, Users, Star, Clock, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white rounded-full"></div>
        <div className="absolute top-32 right-20 w-16 h-16 border-2 border-white rounded-full"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 border-2 border-white rounded-full"></div>
        <div className="absolute bottom-32 right-1/3 w-8 h-8 border-2 border-white rounded-full"></div>
      </div>

      <div className="relative container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Flame className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Discover Amazing
            <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Deals & Savings
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed text-blue-100">
            Join millions of deal hunters finding exclusive discounts, flash sales, and unbeatable offers from your favorite brands.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-6 bg-white text-blue-600 hover:bg-blue-50">
              <Link to="/deals">
                <Search className="mr-2 h-5 w-5" />
                Browse All Deals
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6 border-white text-white hover:bg-white/10">
              <Link to="/post-deal">
                <Gift className="mr-2 h-5 w-5" />
                Share a Deal
              </Link>
            </Button>
          </div>
          
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
            <div className="text-center p-6 bg-white/10 rounded-2xl backdrop-blur-sm">
              <div className="bg-yellow-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-yellow-900" />
              </div>
              <h3 className="font-bold text-2xl mb-2">50K+</h3>
              <p className="text-blue-100">Active Deal Hunters</p>
            </div>
            
            <div className="text-center p-6 bg-white/10 rounded-2xl backdrop-blur-sm">
              <div className="bg-green-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Flame className="h-8 w-8 text-green-900" />
              </div>
              <h3 className="font-bold text-2xl mb-2">1000+</h3>
              <p className="text-blue-100">Hot Deals Daily</p>
            </div>
            
            <div className="text-center p-6 bg-white/10 rounded-2xl backdrop-blur-sm">
              <div className="bg-orange-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-orange-900" />
              </div>
              <h3 className="font-bold text-2xl mb-2">$2M+</h3>
              <p className="text-blue-100">Money Saved</p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="text-center p-6 bg-white/5 rounded-xl backdrop-blur-sm border border-white/20">
              <Clock className="h-8 w-8 text-yellow-300 mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">Real-Time Updates</h3>
              <p className="text-blue-100 text-sm">Get notified instantly when new deals go live</p>
            </div>
            
            <div className="text-center p-6 bg-white/5 rounded-xl backdrop-blur-sm border border-white/20">
              <TrendingUp className="h-8 w-8 text-green-300 mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">Trending Deals</h3>
              <p className="text-blue-100 text-sm">Discover what's hot and popular right now</p>
            </div>
            
            <div className="text-center p-6 bg-white/5 rounded-xl backdrop-blur-sm border border-white/20">
              <Users className="h-8 w-8 text-purple-300 mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">Community Driven</h3>
              <p className="text-blue-100 text-sm">Deals rated and verified by our community</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
