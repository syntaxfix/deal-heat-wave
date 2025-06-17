
import { Home, Package, Store, BookOpen, Mail, Settings, Shield } from "lucide-react";
import Index from "./pages/Index";
import AllDeals from "./pages/AllDeals";
import Shops from "./pages/Shops";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import StaticPage from "./pages/StaticPage";
import RootDashboard from "./pages/RootDashboard";

export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <Home className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Deals",
    to: "/deals",
    icon: <Package className="h-4 w-4" />,
    page: <AllDeals />,
  },
  {
    title: "Shops",
    to: "/shops",
    icon: <Store className="h-4 w-4" />,
    page: <Shops />,
  },
  {
    title: "Blog",
    to: "/blog",
    icon: <BookOpen className="h-4 w-4" />,
    page: <Blog />,
  },
  {
    title: "Contact",
    to: "/contact",
    icon: <Mail className="h-4 w-4" />,
    page: <Contact />,
  },
  {
    title: "Static Page",
    to: "/page/:slug",
    icon: <Settings className="h-4 w-4" />,
    page: <StaticPage />,
  },
  {
    title: "Root Dashboard",
    to: "/root-dashboard",
    icon: <Shield className="h-4 w-4" />,
    page: <RootDashboard />,
  },
];
