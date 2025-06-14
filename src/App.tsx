
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Shops from "./pages/Shops";
import ShopDetail from "./pages/ShopDetail";
import Category from "./pages/Category";
import DealDetail from "./pages/DealDetail";
import Auth from "./pages/Auth";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import RootLogin from "./pages/RootLogin";
import RootDashboard from "./pages/RootDashboard";
import Profile from "./pages/Profile";
import PostDeal from "./pages/PostDeal";
import Admin from "./pages/Admin";
import Contact from "./pages/Contact";
import StaticPage from "./pages/StaticPage";
import TagPage from "./pages/TagPage";
import NotFound from "./pages/NotFound";
import CookieConsent from "./components/CookieConsent";
import Footer from "./components/Footer";
import ResetPassword from "@/pages/ResetPassword";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen flex flex-col">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/root/login" element={<RootLogin />} />
                <Route path="/root/dashboard" element={<RootDashboard />} />
                <Route path="/deal/:slug" element={<DealDetail />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/tag/:slug" element={<TagPage />} />
                <Route path="/shops" element={<Shops />} />
                <Route path="/shop/:slug" element={<ShopDetail />} />
                <Route path="/category/:slug" element={<Category />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/about" element={<StaticPage />} />
                <Route path="/privacy" element={<StaticPage />} />
                <Route path="/terms" element={<StaticPage />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/post-deal" element={<PostDeal />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Footer />
            </div>
            <CookieConsent />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
