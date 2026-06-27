const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://the-grim-store.onrender.com/api/v1";
const FALLBACK_API_URL = "https://the-grim-store.onrender.com/api/v1";
const CATALOG_REVALIDATE_SECONDS = 300;

export type StoreCategory = {
  id: string;
  name: string;
  slug: string;
  image?: string;
  banner?: string;
  product_count?: number;
};

export type StoreProduct = {
  id: string;
  slug: string;
  title: string;
  brand: string;
  brandMeta?: {
    name: string;
    logo?: string;
  };
  price: number;
  salePrice: number;
  stock: number;
  image: string;
  images: string[];
  colors: Array<{ name: string; hex: string }>;
  sizes: Array<{ label: string; stock: number }>;
  variants: StoreProductVariant[];
  summary: StoreProductSummary[];
  descriptionHtml: string;
  careInstructions: string[];
  sizeChart: Record<string, string>[];
  deliveryInfo: Record<string, unknown>;
  returnPolicy: string;
  badge: string;
  rating: number;
  reviewCount: number;
  description: string;
  shortDescription?: string;
  category?: string;
  tags: string[];
  sellerId?: string | null;
  sellerName?: string | null;
  productStatus?: string;
};

export type StoreProductVariant = {
  color: string;
  colorHex?: string;
  size: string;
  material?: string;
  pattern?: string;
  sku: string;
  stock: number;
  price: number;
  salePrice: number;
  images: string[];
  available: boolean;
};

export type StoreProductSummary = {
  title?: string;
  text: string;
  icon?: string;
};

export type StoreReview = {
  id: string;
  userId: string;
  productId: string;
  orderId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  images: Array<{ url: string; alt?: string }>;
  verifiedPurchase: boolean;
  helpfulCount: number;
  helpfulUsers: string[];
  reported: boolean;
  createdAt?: string;
};

export async function fetchProducts(params: Record<string, string | number | undefined> = {}): Promise<{ items: StoreProduct[]; total: number; page: number; pages: number }> {
  try {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") query.set(key, String(value));
    }
    const res = await fetchCatalog(`/products?${query.toString()}`, { next: { revalidate: CATALOG_REVALIDATE_SECONDS } });
    if (!res.ok) return { items: [] as StoreProduct[], total: 0, page: 1, pages: 1 };
    const data = await res.json();
    return {
      ...data,
      items: (data.items ?? []).map(normalizeProduct) as StoreProduct[]
    };
  } catch (error) {
    console.warn("[catalog-api] fetchProducts failed:", error);
    return { items: [] as StoreProduct[], total: 0, page: 1, pages: 1 };
  }
}

export async function fetchProduct(slug: string): Promise<StoreProduct | null> {
  try {
    const res = await fetchCatalog(`/products/${slug}`, { next: { revalidate: CATALOG_REVALIDATE_SECONDS } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.product ? normalizeProduct(data.product) : null;
  } catch (error) {
    console.warn(`[catalog-api] fetchProduct failed for slug ${slug}:`, error);
    return null;
  }
}

export async function fetchCategories(): Promise<StoreCategory[]> {
  try {
    const res = await fetchCatalog("/products/categories", { next: { revalidate: CATALOG_REVALIDATE_SECONDS } });
    if (!res.ok) return [] as StoreCategory[];
    const data = await res.json();
    return (data.categories ?? []) as StoreCategory[];
  } catch (error) {
    console.warn("[catalog-api] fetchCategories failed:", error);
    return [] as StoreCategory[];
  }
}

export async function fetchProductReviews(productId: string): Promise<StoreReview[]> {
  try {
    const res = await fetchCatalog(`/reviews/product/${productId}`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.reviews ?? []) as StoreReview[];
  } catch (error) {
    console.warn(`[catalog-api] fetchProductReviews failed for product ${productId}:`, error);
    return [];
  }
}

type NextFetchInit = RequestInit & { next?: { revalidate?: number } };

async function fetchCatalog(path: string, init?: NextFetchInit) {
  const timeoutMs = 1500; // 1.5 seconds connect timeout for local server
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      signal: controller.signal
    } as any);
    clearTimeout(id);
    return res;
  } catch (error) {
    clearTimeout(id);
    console.warn(`[catalog-api] Local connection failed for ${path}:`, (error as any).message || error);
    if (API_URL === FALLBACK_API_URL) throw error;

    // Fallback to production API with a slightly longer timeout of 8 seconds
    const fallbackController = new AbortController();
    const fallbackId = setTimeout(() => fallbackController.abort(), 8000);
    try {
      const res = await fetch(`${FALLBACK_API_URL}${path}`, {
        ...init,
        signal: fallbackController.signal
      } as any);
      clearTimeout(fallbackId);
      return res;
    } catch (fallbackError) {
      clearTimeout(fallbackId);
      throw fallbackError;
    }
  }
}

export function normalizeProduct(product: any): StoreProduct {
  const rawImages = Array.isArray(product.images) ? product.images : [];
  const images = rawImages
    .map((image: any) => (typeof image === "string" ? image : image?.url))
    .filter(Boolean);
  const variants = (Array.isArray(product.variants) ? product.variants : []).map((variant: any) => ({
    color: String(variant.color ?? ""),
    colorHex: variant.colorHex ?? variant.hex,
    size: String(variant.size ?? ""),
    material: variant.material ?? "",
    pattern: variant.pattern ?? "",
    sku: String(variant.sku ?? ""),
    stock: Number(variant.stock ?? 0),
    price: Number(variant.price ?? product.price ?? 0),
    salePrice: Number(variant.salePrice ?? variant.sale_price ?? product.salePrice ?? product.sale_price ?? 0),
    images: (Array.isArray(variant.images) ? variant.images : [])
      .map((image: any) => (typeof image === "string" ? image : image?.url))
      .filter(Boolean),
    available: variant.available !== false
  })) as StoreProductVariant[];
  const rating = Number(product.rating ?? product.ratings?.average ?? product.rating_average ?? 0);
  const reviewCount = Number(product.reviewCount ?? product.ratings?.count ?? product.rating_count ?? 0);
  const tags = Array.isArray(product.tags) ? product.tags : [];
  const brandMeta = brandMetaFromProduct(product.brand, product.brandMeta ?? product.brand_meta, tags);

  return {
    id: product.id ?? product._id,
    slug: product.slug,
    title: product.title,
    brand: product.brand,
    brandMeta,
    price: Number(product.price ?? 0),
    salePrice: Number(product.salePrice ?? product.sale_price ?? 0),
    stock: Number(product.stock ?? 0),
    image: images[0] ?? product.image ?? "",
    images,
    colors: Array.isArray(product.colors) ? product.colors : [],
    sizes: Array.isArray(product.sizes) ? product.sizes : [],
    variants,
    summary: Array.isArray(product.summary) ? product.summary : [],
    descriptionHtml: product.descriptionHtml ?? product.description_html ?? "",
    careInstructions: Array.isArray(product.careInstructions) ? product.careInstructions : [],
    sizeChart: Array.isArray(product.sizeChart) ? product.sizeChart : [],
    deliveryInfo: product.deliveryInfo ?? {},
    returnPolicy: product.returnPolicy ?? "",
    badge: product.bestseller ? "Bestseller" : product.trending ? "Trending" : product.featured ? "Featured" : "New",
    rating,
    reviewCount,
    description: product.description ?? "",
    shortDescription: product.shortDescription ?? product.short_description ?? "",
    category: product.category,
    tags,
    sellerId: product.sellerId ?? product.seller_id ?? null,
    sellerName: product.sellerName ?? product.seller_name ?? "The Grim Store",
    productStatus: product.productStatus ?? product.product_status ?? "active"
  };
}

function brandMetaFromProduct(brand: string, rawMeta: any, tags: string[]) {
  const meta = {
    name: String(rawMeta?.name ?? brand ?? ""),
    logo: String(rawMeta?.logo ?? "")
  };
  for (const tag of tags) {
    const [rawKey, ...rawValue] = String(tag).split(":");
    const key = rawKey.trim().toLowerCase();
    const value = rawValue.join(":").trim();
    if (!value) continue;
    if (key === "brandname" || key === "brand-name" || key === "branddisplay") meta.name = value;
    if (key === "brandlogo" || key === "brand-logo" || key === "brandimage" || key === "brand-image") meta.logo = value;
  }
  return meta;
}
