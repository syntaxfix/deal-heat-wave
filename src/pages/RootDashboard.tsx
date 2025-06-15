import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { CategoriesAdmin } from "@/components/admin/CategoriesAdmin";
import { StaticPagesAdmin } from "@/components/admin/StaticPagesAdmin";
import { TagsAdmin } from "@/components/admin/TagsAdmin";
import Header from "@/components/Header";

const RootDashboard = () => {
  return (
    <div>
      <Header />
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Root Dashboard</h1>
        <Tabs defaultValue="categories" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="shops">Shops</TabsTrigger>
            <TabsTrigger value="blog">Blog Posts</TabsTrigger>
            <TabsTrigger value="deals">Deals</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="static-pages">Static Pages</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
          </TabsList>
          
          <TabsContent value="shops">
            <div className="p-4 text-center text-muted-foreground">Shop management coming soon.</div>
          </TabsContent>

          <TabsContent value="blog">
             <div className="p-4 text-center text-muted-foreground">Blog post management coming soon.</div>
          </TabsContent>

          <TabsContent value="deals">
             <div className="p-4 text-center text-muted-foreground">Deal management coming soon.</div>
          </TabsContent>

          <TabsContent value="categories">
            <CategoriesAdmin />
          </TabsContent>

          <TabsContent value="static-pages">
            <StaticPagesAdmin />
          </TabsContent>

          <TabsContent value="tags">
            <TagsAdmin />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RootDashboard;
