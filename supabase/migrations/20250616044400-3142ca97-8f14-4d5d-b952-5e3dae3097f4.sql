
-- Create a table to store featured deals for the "Deal of the Day" section
CREATE TABLE public.featured_deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE NOT NULL,
  featured_date DATE NOT NULL DEFAULT CURRENT_DATE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(deal_id, featured_date)
);

-- Add RLS policies for featured deals
ALTER TABLE public.featured_deals ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read featured deals (public)
CREATE POLICY "Anyone can view featured deals" 
  ON public.featured_deals 
  FOR SELECT 
  USING (true);

-- Only root admins can manage featured deals
CREATE POLICY "Only root admins can manage featured deals" 
  ON public.featured_deals 
  FOR ALL 
  USING (has_role(auth.uid(), 'root'));

-- Create index for better performance
CREATE INDEX idx_featured_deals_date ON public.featured_deals(featured_date DESC);
CREATE INDEX idx_featured_deals_order ON public.featured_deals(display_order);
