
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ShopForm } from "@/components/admin/ShopForm";
import { BlogPostForm } from "@/components/admin/BlogPostForm";
import { DealForm } from "@/components/admin/DealForm";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { StaticPageForm } from "@/components/admin/StaticPageForm";
import { TagForm } from "@/components/admin/TagForm";
import Header from "@/components/Header";

const RootDashboard = () => {
  return (
    <div>
      <Header />
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Root Dashboard</h1>
        <Tabs defaultValue="shops" className="w-full">
          <TabsList>
            <TabsTrigger value="shops">Shops</TabsTrigger>
            <TabsTrigger value="blog">Blog Posts</TabsTrigger>
            <TabsTrigger value="deals">Deals</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="static-pages">Static Pages</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
          </TabsList>
          
          <TabsContent value="shops">
            <h2 className="text-2xl font-semibold my-4">Create a new Shop</h2>
            <ShopForm />
          </TabsContent>

          <TabsContent value="blog">
            <h2 className="text-2xl font-semibold my-4">Create a new Blog Post</h2>
            <BlogPostForm />
          </TabsContent>

          <TabsContent value="deals">
            <h2 className="text-2xl font-semibold my-4">Create a new Deal</h2>
            <DealForm />
          </TabsContent>

          <TabsContent value="categories">
            <h2 className="text-2xl font-semibold my-4">Create a new Category</h2>
            <CategoryForm />
          </TabsContent>

          <TabsContent value="static-pages">
            <h2 className="text-2xl font-semibold my-4">Create a new Static Page</h2>
            <StaticPageForm />
          </TabsContent>

          <TabsContent value="tags">
            <h2 className="text-2xl font-semibold my-4">Create a new Tag</h2>
            <TagForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RootDashboard;
