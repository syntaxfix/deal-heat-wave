
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
SELECT
    s.id,
    s.name,
    s.slug,
    s.description,
    s.logo_url,
    s.website_url,
    s.category,
    (SELECT COUNT(*) FROM public.deals d WHERE d.shop_id = s.id AND d.status = 'approved') as deal_count,
    (SELECT COUNT(*) FROM public.coupons c WHERE c.shop_id = s.id) as coupon_count
FROM
    public.shops s
ORDER BY
    s.name;
$$;
