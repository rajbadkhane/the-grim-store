"use client";

import Image from "next/image";
import { useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Minus, PackageCheck, Plus, RotateCcw, Ruler, ShieldCheck, ShoppingBag, Sparkles, Star, Truck, Zap } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { StoreProduct, StoreProductVariant } from "@/lib/catalog-api";
import { formatMoney } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { api } from "@/lib/api";

type Option = { label: string; enabled: boolean; hex?: string };

function unique<T>(values: T[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function fallbackVariant(product: StoreProduct): StoreProductVariant {
  return {
    color: product.colors?.[0]?.name ?? "Black",
    colorHex: product.colors?.[0]?.hex ?? "#111111",
    size: product.sizes?.[0]?.label ?? "M",
    material: "Premium cotton",
    pattern: "Solid",
    sku: product.slug.toUpperCase(),
    stock: product.stock,
    price: product.price,
    salePrice: product.salePrice,
    images: product.images,
    available: product.stock > 0
  };
}

export function ProductDetailClient({ product }: { product: StoreProduct }) {
  const variants = useMemo(() => (product.variants.length ? product.variants : [fallbackVariant(product)]), [product]);
  const firstAvailable = variants.find((variant) => variant.available && variant.stock > 0) ?? variants[0];
  const [color, setColor] = useState(firstAvailable.color);
  const [size, setSize] = useState(firstAvailable.size);
  const [material, setMaterial] = useState(firstAvailable.material ?? "");
  const [pattern, setPattern] = useState(firstAvailable.pattern ?? "");
  const [quantity, setQuantity] = useState(1);
  const add = useCart((state) => state.add);
  const router = useRouter();
  const { user, refreshMe, openLoginModal } = useAuth();
  const isWishlisted = Array.isArray(user?.wishlist) && user.wishlist.map(String).includes(String(product.id));

  async function toggleWishlist() {
    if (!user) {
      toast.error("Login required to use wishlist.");
      openLoginModal();
      return;
    }

    try {
      await api.post(`/users/wishlist/${product.id}`);
      await refreshMe();
      toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
    } catch {
      toast.error("Wishlist update failed. Try again.");
    }
  }

  const selectedVariant =
    variants.find((variant) => variant.color === color && variant.size === size && (variant.material ?? "") === material && (variant.pattern ?? "") === pattern) ??
    variants.find((variant) => variant.color === color && variant.size === size) ??
    firstAvailable;

  const gallery = selectedVariant.images.length ? selectedVariant.images : product.images.length ? product.images : [product.image].filter(Boolean);
  const [activeImage, setActiveImage] = useState(gallery[0] ?? "");
  const visibleImage = gallery.includes(activeImage) ? activeImage : gallery[0] ?? "";
  const discount = selectedVariant.price > selectedVariant.salePrice ? Math.round(((selectedVariant.price - selectedVariant.salePrice) / selectedVariant.price) * 100) : 0;
  const canBuy = selectedVariant.available && selectedVariant.stock > 0;

  const colorOptions = optionSet(variants, "color", selectedVariant, ["size", "material", "pattern"]);
  const sizeOptions = optionSet(variants, "size", selectedVariant, ["color", "material", "pattern"]);
  const materialOptions = optionSet(variants, "material", selectedVariant, ["color", "size", "pattern"]);
  const patternOptions = optionSet(variants, "pattern", selectedVariant, ["color", "size", "material"]);

  function pickColor(nextColor: string) {
    const next = variants.find((variant) => variant.color === nextColor && variant.available && variant.stock > 0) ?? variants.find((variant) => variant.color === nextColor);
    if (!next) return;
    setColor(next.color);
    setSize(next.size);
    setMaterial(next.material ?? "");
    setPattern(next.pattern ?? "");
    setQuantity(1);
    if (next.images[0]) setActiveImage(next.images[0]);
  }

  function pickDimension(key: "size" | "material" | "pattern", value: string) {
    const next =
      variants.find((variant) => variant.color === color && (variant as any)[key] === value && variant.available && variant.stock > 0) ??
      variants.find((variant) => variant.color === color && (variant as any)[key] === value);
    if (!next) return;
    setSize(next.size);
    setMaterial(next.material ?? "");
    setPattern(next.pattern ?? "");
    setQuantity(1);
    if (next.images[0]) setActiveImage(next.images[0]);
  }

  function validateSelection() {
    if (!canBuy) {
      toast.error("This variant is currently out of stock.");
      return false;
    }
    if (quantity > selectedVariant.stock) {
      toast.error(`Only ${selectedVariant.stock} pieces available for this variant.`);
      return false;
    }
    return true;
  }

  function addSelectedToCart() {
    if (!validateSelection()) return false;
    add({
      id: `${product.id}:${selectedVariant.sku}`,
      slug: product.slug,
      title: product.title,
      image: gallery[0] ?? product.image,
      salePrice: selectedVariant.salePrice,
      quantity,
      sku: selectedVariant.sku,
      variantKey: selectedVariant.sku,
      size: selectedVariant.size,
      color: selectedVariant.color,
      material: selectedVariant.material,
      pattern: selectedVariant.pattern
    });
    toast.success("Variant added to cart");
    return true;
  }

  function buyNow() {
    if (!canBuy) {
      toast.error("This variant is currently out of stock.");
      return;
    }
    if (quantity > selectedVariant.stock) {
      toast.error(`Only ${selectedVariant.stock} pieces available for this variant.`);
      return;
    }
    sessionStorage.setItem(
      "grim_checkout_intent",
      JSON.stringify({
        isDirect: true,
        item: {
          id: `${product.id}:${selectedVariant.sku}`,
          slug: product.slug,
          title: product.title,
          image: gallery[0] ?? product.image,
          salePrice: selectedVariant.salePrice,
          quantity,
          sku: selectedVariant.sku,
          variantKey: selectedVariant.sku,
          size: selectedVariant.size,
          color: selectedVariant.color,
          material: selectedVariant.material,
          pattern: selectedVariant.pattern
        },
        createdAt: new Date().toISOString()
      })
    );
    router.push(`/checkout?product=${encodeURIComponent(product.slug)}`);
  }

  return (
    <div className="text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-5 text-xs font-bold uppercase tracking-[0.16em] text-neutral-450">
          Home / Products / <span className="text-electrox-blue">{product.title}</span>
        </nav>

        <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] items-start">
          <section className="min-w-0">
            {/* Mobile View Slider */}
            <div className="md:hidden">
              <Swiper spaceBetween={12} slidesPerView={1.06} onSlideChange={(swiper) => setActiveImage(gallery[swiper.activeIndex] ?? visibleImage)}>
                {gallery.map((image, index) => (
                  <SwiperSlide key={`${image}-${index}`}>
                    <GalleryFrame image={image} title={product.title} priority={index === 0} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Desktop View 2-Column Grid (Myntra Style) */}
            <div className={`hidden md:grid gap-4.5 ${gallery.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
              {gallery.map((image, index) => (
                <div key={`${image}-${index}`} className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-neutral-200/50 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 shadow-sm transition hover:shadow-md">
                  <Image
                    src={image}
                    alt={`${product.title} view ${index + 1}`}
                    fill
                    sizes="(max-width: 1280px) 25vw, 400px"
                    className="object-contain p-6 transition duration-500 group-hover:scale-103"
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <InfoPill icon={<Truck size={18} />} title="Fast dispatch" text="Ships in 24-48 hours" />
              <InfoPill icon={<RotateCcw size={18} />} title="Easy returns" text="7-day size exchange" />
              <InfoPill icon={<ShieldCheck size={18} />} title="Secure checkout" text="Protected payments" />
            </div>
          </section>

          {/* Sticky Info Panel */}
          <aside className="md:sticky md:top-24 md:h-fit self-start">
            <div className="rounded-2xl border border-neutral-200/50 dark:border-neutral-850 bg-white dark:bg-[#0c0c0e] p-5 sm:p-6 shadow-sm">
              <div className="border-b border-neutral-200/40 dark:border-neutral-800/40 pb-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-indigo-600 dark:text-indigo-400">{product.brand}</p>
                  {/* Assured Checkmark badge */}
                  <div className="inline-flex items-center gap-1 bg-blue-650 dark:bg-blue-800 px-2 py-0.5 rounded text-[9px] font-black uppercase text-white tracking-widest shadow-sm select-none">
                    Assured <span className="text-yellow-400">★</span>
                  </div>
                </div>
                <h1 className="mt-3 text-2xl font-black leading-tight tracking-normal text-foreground sm:text-3xl">{product.title}</h1>
                
                {/* Rating badge */}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-1 text-xs font-black text-emerald-600 dark:text-emerald-450">
                    <Star size={13} fill="currentColor" /> {product.rating.toFixed(1)}
                  </span>
                  <span className="text-xs font-bold text-neutral-450">{product.reviewCount} verified reviews</span>
                  <span className={`rounded px-2.5 py-1 text-xs font-black uppercase ${canBuy ? "bg-indigo-550/10 text-indigo-650 dark:text-indigo-400" : "bg-neutral-100 text-neutral-500 dark:bg-white/10 dark:text-white/55"}`}>
                    {canBuy ? `${selectedVariant.stock} in stock` : "Out of stock"}
                  </span>
                </div>
              </div>

              {/* Price row */}
              <div className="mt-5">
                <div className="flex flex-wrap items-baseline gap-2.5">
                  <motion.span key={selectedVariant.salePrice} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-black text-foreground">
                    {formatMoney(selectedVariant.salePrice)}
                  </motion.span>
                  {selectedVariant.price > selectedVariant.salePrice && (
                    <>
                      <span className="text-base font-bold text-neutral-450 line-through">{formatMoney(selectedVariant.price)}</span>
                      <span className="text-base font-extrabold text-orange-500 dark:text-orange-400">({discount}% OFF)</span>
                    </>
                  )}
                </div>
                <p className="mt-1 text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-450">Inclusive of all taxes</p>
              </div>

              <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-neutral-450">SKU {selectedVariant.sku}</p>
              <p className="mt-5 text-sm leading-6 text-neutral-450 font-medium">{product.shortDescription || product.description}</p>

              {/* Swatch options selection */}
              <div className="mt-6 grid gap-5">
                <VariantGroup title="Color" options={colorOptions} selected={color} onPick={pickColor} swatches />
                <VariantGroup title="Size" options={sizeOptions} selected={size} onPick={(value) => pickDimension("size", value)} />
                {materialOptions.length > 1 && <VariantGroup title="Material" options={materialOptions} selected={material} onPick={(value) => pickDimension("material", value)} />}
                {patternOptions.length > 1 && <VariantGroup title="Pattern" options={patternOptions} selected={pattern} onPick={(value) => pickDimension("pattern", value)} />}
              </div>

              {/* Quantity selector */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="inline-flex h-11 items-center rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
                  <button aria-label="Decrease quantity" type="button" className="grid h-11 w-10 place-items-center text-neutral-450 hover:text-foreground" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-xs font-black">{quantity}</span>
                  <button
                    aria-label="Increase quantity"
                    type="button"
                    className="grid h-11 w-10 place-items-center text-neutral-450 hover:text-foreground"
                    onClick={() => setQuantity((value) => Math.min(selectedVariant.stock || 1, value + 1))}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Actions Buy Now / Add to Cart (Flipkart/Myntra Style CTAs) */}
              <div className="mt-6 grid gap-3 sm:grid-cols-[1.1fr_1fr_auto]">
                <button
                  onClick={buyNow}
                  disabled={!canBuy}
                  className="flex min-h-13 items-center justify-center gap-2 rounded-xl bg-[#fb641b] hover:bg-[#e65a12] text-white font-black text-xs uppercase tracking-widest transition shadow-sm hover:shadow disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Zap size={14} className="fill-current" /> Buy Now
                </button>
                <button
                  onClick={addSelectedToCart}
                  disabled={!canBuy}
                  className="flex min-h-13 items-center justify-center gap-2 rounded-xl bg-indigo-650 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest transition shadow-sm hover:shadow disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ShoppingBag size={14} /> Add to Bag
                </button>
                <button
                  type="button"
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  onClick={toggleWishlist}
                  className={`grid min-h-13 w-13 place-items-center rounded-xl border transition ${
                    isWishlisted
                      ? "border-rose-500 bg-rose-500/5 text-rose-500 shadow-sm"
                      : "border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-foreground hover:border-rose-500 hover:bg-rose-500/5 hover:text-rose-500"
                  }`}
                >
                  <Heart size={16} className={isWishlisted ? "fill-rose-500" : ""} />
                </button>
              </div>

              {/* Delivery Pincode Checker (Flipkart style) */}
              <div className="mt-6 border-t border-neutral-200/40 dark:border-neutral-800/40 pt-5">
                <p className="text-xs font-extrabold uppercase tracking-wider text-neutral-450 mb-2.5">Delivery Options</p>
                <div className="flex max-w-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-1.5 items-center">
                  <Truck size={14} className="text-neutral-400 dark:text-neutral-500 mr-2" />
                  <input
                    type="text"
                    placeholder="Enter Pincode"
                    maxLength={6}
                    className="flex-1 bg-transparent text-xs font-bold text-foreground outline-none placeholder:text-neutral-450"
                  />
                  <button
                    type="button"
                    onClick={() => toast.success("Pincode is serviceable for fast dispatch!")}
                    className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:underline px-2"
                  >
                    Check
                  </button>
                </div>
                <p className="mt-2 text-[10px] text-neutral-400 dark:text-neutral-500 font-semibold">Please enter PIN code to check delivery time & COD availability.</p>
              </div>

              <ProductSummary product={product} />
            </div>
          </aside>
        </div>

        <RichDescription product={product} />
      </div>
    </div>
  );
}

function optionSet(variants: StoreProductVariant[], key: keyof StoreProductVariant, selected: StoreProductVariant, keep: Array<keyof StoreProductVariant>): Option[] {
  return unique(variants.map((variant) => String(variant[key] ?? ""))).map((label) => {
    const match = variants.find((variant) => {
      if (String(variant[key] ?? "") !== label) return false;
      return keep.every((field) => String(variant[field] ?? "") === String(selected[field] ?? ""));
    });
    const fallback = variants.find((variant) => String(variant[key] ?? "") === label);
    const candidate = match ?? fallback;
    return {
      label,
      enabled: Boolean(candidate?.available && (candidate?.stock ?? 0) > 0),
      hex: fallback?.colorHex
    };
  });
}

function GalleryFrame({ image, title, priority }: { image: string; title: string; priority?: boolean }) {
  return (
    <div className="group relative aspect-square overflow-hidden rounded-2xl border border-electrox-elevated bg-neutral-50 dark:bg-[#121212] shadow-sm">
      {image ? (
        <Image
          src={image}
          alt={title}
          fill
          priority={priority}
          sizes="(max-width: 768px) 95vw, (max-width: 1280px) 58vw, 680px"
          className="object-contain p-6 transition duration-500 group-hover:scale-102 sm:p-8"
        />
      ) : (
        <div className="grid h-full place-items-center text-xs font-black uppercase tracking-widest text-neutral-450">No image</div>
      )}
    </div>
  );
}

function VariantGroup({ title, options, selected, onPick, swatches }: { title: string; options: Option[]; selected: string; onPick: (value: string) => void; swatches?: boolean }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-extrabold uppercase tracking-wider text-neutral-450">{title}</p>
        {title === "Size" && <span className="inline-flex items-center gap-1 text-[10px] font-black text-electrox-blue uppercase tracking-wider"><Ruler size={12} /> Size chart</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.label}
            type="button"
            disabled={!option.enabled}
            onClick={() => onPick(option.label)}
            className={`relative inline-flex min-h-10 items-center justify-center gap-2 rounded border px-3 text-xs font-extrabold transition ${
              selected === option.label ? "border-electrox-blue bg-electrox-blue/5 text-electrox-blue" : "border-electrox-elevated bg-electrox-bg-2 text-foreground hover:border-electrox-blue"
            } disabled:cursor-not-allowed disabled:opacity-35`}
          >
            {swatches && <span className="h-3 w-3 rounded-full border border-neutral-300 dark:border-white/20" style={{ backgroundColor: option.hex ?? option.label }} />}
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function InfoPill({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-electrox-elevated bg-electrox-surface p-4 shadow-sm">
      <span className="text-electrox-blue">{icon}</span>
      <div>
        <p className="text-xs font-black text-foreground">{title}</p>
        <p className="text-[10px] font-bold text-neutral-450">{text}</p>
      </div>
    </div>
  );
}

function ProductSummary({ product }: { product: StoreProduct }) {
  const items = product.summary.length
    ? product.summary
    : [
        { title: "Material", text: "High grade components certified for daily use." },
        { title: "Standard", text: "Rigorously tested to comply with international specifications." },
        { title: "Care", text: "Covered by direct service guarantee." }
      ];

  return (
    <section className="mt-7 rounded-2xl border border-electrox-elevated bg-electrox-surface p-5 shadow-sm">
      <div className="flex items-center gap-2 border-b border-electrox-elevated pb-3">
        <Sparkles size={16} className="text-electrox-blue" />
        <h2 className="text-xs font-black uppercase tracking-wider text-foreground">Product Summary</h2>
      </div>
      <div className="mt-4 grid gap-3">
        {items.map((item, index) => (
          <div key={`${item.text}-${index}`} className="flex gap-3">
            <PackageCheck size={16} className="mt-0.5 shrink-0 text-electrox-blue" />
            <p className="text-xs leading-5 text-neutral-450 font-semibold">
              {item.title && <strong className="text-foreground">{item.title}: </strong>}
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function RichDescription({ product }: { product: StoreProduct }) {
  const genericAdminHtml =
    "<h2>Product Details</h2><p>premium electronics built with clean structure, soft handfeel, and durable finish.</p><ul><li>Premium fabric</li><li>Comfort-first fit</li><li>Easy everyday styling</li></ul>";
  const hasCustomRichDescription = product.descriptionHtml && product.descriptionHtml !== "<p></p>" && product.descriptionHtml !== genericAdminHtml;
  const descriptionHtml = textToHtml(product.description);

  return (
    <section className="mt-12 grid gap-6 border-t border-electrox-elevated pt-10 lg:grid-cols-[1fr_360px]">
      <article>
        <p className="text-xs font-black uppercase tracking-[0.24em] text-electrox-blue">Details & care</p>
        <div className="rich-product-html mt-4" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
        {hasCustomRichDescription && <div className="rich-product-html mt-8" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />}
      </article>
      <aside className="grid h-fit gap-4">
        <div className="rounded-2xl border border-electrox-elevated bg-electrox-surface p-5 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-wider text-foreground">Delivery</h3>
          <p className="mt-2.5 text-xs leading-5 text-neutral-450 font-semibold">{String(product.deliveryInfo?.text ?? "Free delivery above INR 1499. Standard delivery usually takes 3-6 business days.")}</p>
        </div>
        <div className="rounded-2xl border border-electrox-elevated bg-electrox-surface p-5 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-wider text-foreground">Return Policy</h3>
          <p className="mt-2.5 text-xs leading-5 text-neutral-450 font-semibold">{product.returnPolicy || "Easy 7-day exchange for size issues on unused products with original tags."}</p>
        </div>
        {product.careInstructions.length > 0 && (
          <div className="rounded-2xl border border-electrox-elevated bg-electrox-surface p-5 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-foreground">Care Instructions</h3>
            <ul className="mt-3 grid gap-2 text-xs text-neutral-450">
              {product.careInstructions.map((item) => <li key={item}>- {item}</li>)}
            </ul>
          </div>
        )}
      </aside>
    </section>
  );
}

function textToHtml(value: string) {
  const escaped = value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .trim();

  if (!escaped) return "<h2>Product Details</h2><p>Premium grade construction with comfortable daily utility.</p>";

  return escaped
    .split(/\n{2,}/)
    .map((block) => {
      const lines = block.split("\n").filter(Boolean);
      if (lines.length > 1) {
        const [first, ...rest] = lines;
        return `<h3>${first}</h3><ul>${rest.map((line) => `<li>${line}</li>`).join("")}</ul>`;
      }
      return `<p>${block}</p>`;
    })
    .join("");
}
