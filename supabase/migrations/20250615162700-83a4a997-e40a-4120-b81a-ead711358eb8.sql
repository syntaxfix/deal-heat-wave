
-- A more performant version of get_shops_with_counts using CTEs
CREATE OR REPLACE FUNCTION public.get_shops_with_counts()
RETURNS TABLE(
    id uuid,
    name text,
    slug text,
    description text,
    logo_url text,
    website_url text,
    category text,
    deal_count bigint,
    coupon_count bigint
)
LANGUAGE sql STABLE
AS $$
WITH deal_counts AS (
  SELECT shop_id, COUNT(*) as count
  FROM public.deals
  WHERE status = 'approved'
  GROUP BY shop_id
),
coupon_counts AS (
  SELECT shop_id, COUNT(*) as count
  FROM public.coupons
  GROUP BY shop_id
)
SELECT
  s.id,
  s.name,
  s.slug,
  s.description,
  s.logo_url,
  s.website_url,
  s.category,
  COALESCE(dc.count, 0)::bigint as deal_count,
  COALESCE(cc.count, 0)::bigint as coupon_count
FROM
  public.shops s
LEFT JOIN deal_counts dc ON s.id = dc.shop_id
LEFT JOIN coupon_counts cc ON s.id = cc.shop_id
ORDER BY
  s.name;
$$;

-- A new function to get all dashboard counts in a single query
CREATE OR REPLACE FUNCTION public.get_dashboard_counts()
RETURNS json
STABLE
LANGUAGE plpgsql
AS $$
DECLARE
  counts json;
BEGIN
  SELECT json_build_object(
    'deals', (SELECT count(*) FROM public.deals),
    'users', (SELECT count(*) FROM public.profiles),
    'categories', (SELECT count(*) FROM public.categories),
    'tags', (SELECT count(*) FROM public.tags),
    'shops', (SELECT count(*) FROM public.shops),
    'blogPosts', (SELECT count(*) FROM public.blog_posts),
    'staticPages', (SELECT count(*) FROM public.static_pages),
    'coupons', (SELECT count(*) FROM public.coupons)
  ) INTO counts;
  RETURN counts;
END;
$$;
