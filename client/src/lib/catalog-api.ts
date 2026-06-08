const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";
const CATALOG_REVALIDATE_SECONDS = 60;

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
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }
  const res = await fetch(`${API_URL}/products?${query.toString()}`, { next: { revalidate: CATALOG_REVALIDATE_SECONDS } });
  if (!res.ok) return { items: [] as StoreProduct[], total: 0, page: 1, pages: 1 };
  const data = await res.json();
  return {
    ...data,
    items: (data.items ?? []).map(normalizeProduct) as StoreProduct[]
  };
}

export async function fetchProduct(slug: string): Promise<StoreProduct | null> {
  const res = await fetch(`${API_URL}/products/${slug}`, { next: { revalidate: CATALOG_REVALIDATE_SECONDS } });
  if (!res.ok) return null;
  const data = await res.json();
  return data.product ? normalizeProduct(data.product) : null;
}

export async function fetchCategories(): Promise<StoreCategory[]> {
  const res = await fetch(`${API_URL}/products/categories`, { next: { revalidate: CATALOG_REVALIDATE_SECONDS * 5 } });
  if (!res.ok) return [] as StoreCategory[];
  const data = await res.json();
  return (data.categories ?? []) as StoreCategory[];
}

export async function fetchProductReviews(productId: string): Promise<StoreReview[]> {
  const res = await fetch(`${API_URL}/reviews/product/${productId}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.reviews ?? []) as StoreReview[];
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

  return {
    id: product.id ?? product._id,
    slug: product.slug,
    title: product.title,
    brand: product.brand,
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
    tags: Array.isArray(product.tags) ? product.tags : []
  };
}
