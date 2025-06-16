
import { Home, Search, Users, Settings, ShoppingBag, Grid3X3, FileText, Tag } from "lucide-react";
import Index from "./pages/Index";
import AllDeals from "./pages/AllDeals";
import Categories from "./pages/Categories";
import Category from "./pages/Category";
import Shops from "./pages/Shops";
import ShopDetail from "./pages/ShopDetail";
import DealDetail from "./pages/DealDetail";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import TagPage from "./pages/TagPage";
import SearchResults from "./pages/SearchResults";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import PostDeal from "./pages/PostDeal";
import Admin from "./pages/Admin";
import RootLogin from "./pages/RootLogin";
import RootDashboard from "./pages/RootDashboard";
import RootAdminRoute from "./components/auth/RootAdminRoute";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import StaticPage from "./pages/StaticPage";

export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <Home className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "All Deals",
    to: "/deals",
    icon: <Search className="h-4 w-4" />,
    page: <AllDeals />,
  },
  {
    title: "Categories",
    to: "/categories",
    icon: <Grid3X3 className="h-4 w-4" />,
    page: <Categories />,
  },
  {
    title: "Category",
    to: "/category/:slug",
    page: <Category />,
  },
  {
    title: "Shops",
    to: "/shops",
    icon: <ShoppingBag className="h-4 w-4" />,
    page: <Shops />,
  },
  {
    title: "Shop Detail",
    to: "/shop/:slug",
    page: <ShopDetail />,
  },
  {
    title: "Deal Detail",
    to: "/deal/:slug",
    page: <DealDetail />,
  },
  {
    title: "Blog",
    to: "/blog",
    icon: <FileText className="h-4 w-4" />,
    page: <Blog />,
  },
  {
    title: "Blog Post",
    to: "/blog/:slug",
    page: <BlogPost />,
  },
  {
    title: "Tag",
    to: "/tag/:slug",
    page: <TagPage />,
  },
  {
    title: "Search",
    to: "/search",
    page: <SearchResults />,
  },
  {
    title: "Contact",
    to: "/contact",
    page: <Contact />,
  },
  {
    title: "Auth",
    to: "/auth",
    page: <Auth />,
  },
  {
    title: "Login",
    to: "/login",
    page: <Login />,
  },
  {
    title: "Signup",
    to: "/signup",
    page: <Signup />,
  },
  {
    title: "Profile",
    to: "/profile",
    page: <Profile />,
  },
  {
    title: "Post Deal",
    to: "/post-deal",
    page: <PostDeal />,
  },
  {
    title: "Admin",
    to: "/admin",
    page: <Admin />,
  },
  {
    title: "Root Login",
    to: "/root/login",
    page: <RootLogin />,
  },
  {
    title: "Root Dashboard",
    to: "/root/dashboard",
    page: <RootAdminRoute />,
  },
  {
    title: "Forgot Password",
    to: "/forgot-password",
    page: <ForgotPassword />,
  },
  {
    title: "Reset Password",
    to: "/reset-password",
    page: <ResetPassword />,
  },
  {
    title: "Static Page",
    to: "/page/:slug",
    page: <StaticPage />,
  },
  {
    title: "Not Found",
    to: "*",
    page: <NotFound />,
  },
];
