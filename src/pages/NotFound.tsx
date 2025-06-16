
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Search, ArrowLeft, Compass, AlertTriangle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[70vh]">
        <div className="text-center max-w-2xl">
          {/* 404 Animation */}
          <div className="relative mb-8">
            <div className="text-9xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text animate-pulse">
              404
            </div>
            <div className="absolute inset-0 text-9xl font-bold text-blue-100 -z-10 transform translate-x-2 translate-y-2">
              404
            </div>
          </div>

          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center animate-bounce">
                <AlertTriangle className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping"></div>
            </div>
          </div>

          {/* Main Message */}
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-gray-800">
            Oops! Page Not Found
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Looks like this deal has expired or the page you're looking for has wandered off into the digital wilderness. 
            Don't worry, we've got plenty of amazing deals waiting for you!
          </p>

          {/* Action Cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card className="hover:shadow-lg transition-all duration-300 group cursor-pointer border-2 border-transparent hover:border-blue-300">
              <CardContent className="p-6 text-center">
                <Link to="/" className="block">
                  <Home className="h-8 w-8 mx-auto mb-3 text-blue-600 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-gray-800 mb-2">Go Home</h3>
                  <p className="text-sm text-gray-600">Return to our homepage and discover hot deals</p>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 group cursor-pointer border-2 border-transparent hover:border-green-300">
              <CardContent className="p-6 text-center">
                <Link to="/deals" className="block">
                  <Compass className="h-8 w-8 mx-auto mb-3 text-green-600 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-gray-800 mb-2">Browse Deals</h3>
                  <p className="text-sm text-gray-600">Explore all available deals and discounts</p>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 group cursor-pointer border-2 border-transparent hover:border-purple-300">
              <CardContent className="p-6 text-center">
                <Link to="/categories" className="block">
                  <Search className="h-8 w-8 mx-auto mb-3 text-purple-600 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-gray-800 mb-2">Search Deals</h3>
                  <p className="text-sm text-gray-600">Find deals by category or search term</p>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/">
              <Button size="lg" className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                <Home className="h-5 w-5 mr-2" />
                Take Me Home
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => window.history.back()}
              className="px-8 py-3 border-2 hover:bg-gray-50 font-semibold"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Go Back
            </Button>
          </div>

          {/* Fun Message */}
          <div className="mt-12 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200">
            <p className="text-gray-700 font-medium">
              💡 <strong>Pro Tip:</strong> While you're here, why not check out today's hottest deals? 
              Our community has voted on some incredible discounts that you won't want to miss!
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default NotFound;
