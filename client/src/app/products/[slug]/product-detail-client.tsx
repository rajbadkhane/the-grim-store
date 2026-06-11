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
    <div className="text-white">
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-5 text-xs font-bold uppercase tracking-[0.16em] text-neutral-400 dark:text-white/38">
        Home / Products / <span className="text-blue-500 dark:text-blue-300">{product.title}</span>
      </nav>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
        <section className="min-w-0">
          <div className="md:hidden">
            <Swiper spaceBetween={12} slidesPerView={1.06} onSlideChange={(swiper) => setActiveImage(gallery[swiper.activeIndex] ?? visibleImage)}>
              {gallery.map((image, index) => (
                <SwiperSlide key={`${image}-${index}`}>
                  <GalleryFrame image={image} title={product.title} priority={index === 0} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          <div className="hidden gap-4 md:grid md:grid-cols-[88px_1fr]">
            <div className="grid h-fit gap-3">
              {gallery.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  aria-label={`Show product image ${index + 1}`}
                  onClick={() => setActiveImage(image)}
                  className={`relative aspect-square overflow-hidden rounded-2xl border bg-white/[0.045] p-1 transition ${
                    visibleImage === image ? "border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.18)]" : "border-neutral-200 hover:border-neutral-400 dark:border-white/10 dark:hover:border-white/35"
                  }`}
                >
                  <Image src={image} alt={`${product.title} thumbnail ${index + 1}`} fill sizes="88px" className="object-contain p-1" />
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={visibleImage} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.28 }}>
                <GalleryFrame image={visibleImage} title={product.title} priority />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <InfoPill icon={<Truck size={18} />} title="Fast dispatch" text="Ships in 24-48 hours" />
            <InfoPill icon={<RotateCcw size={18} />} title="Easy returns" text="7-day size exchange" />
            <InfoPill icon={<ShieldCheck size={18} />} title="Secure checkout" text="Protected payments" />
          </div>
        </section>

        <aside className="xl:sticky xl:top-24 xl:h-fit">
          <div className="electrox-card rounded-[1.5rem] p-5 sm:p-6">
          <div className="border-b border-white/10 pb-5">
            <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-500 dark:text-blue-400">{product.brand}</p>
            <h1 className="mt-3 text-3xl font-black leading-tight tracking-normal text-white sm:text-4xl">{product.title}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2.5 py-1.5 text-sm font-black text-emerald-600 dark:text-emerald-300">
                <Star size={15} fill="currentColor" /> {product.rating.toFixed(1)}
              </span>
              <span className="text-sm font-bold text-neutral-500 dark:text-white/52">{product.reviewCount} verified reviews</span>
              <span className={`rounded-md px-2.5 py-1.5 text-xs font-black uppercase ${canBuy ? "bg-blue-500/10 text-blue-600 dark:bg-blue-600/16 dark:text-blue-300" : "bg-neutral-100 text-neutral-500 dark:bg-white/10 dark:text-white/55"}`}>
                {canBuy ? `${selectedVariant.stock} in stock` : "Out of stock"}
              </span>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-end gap-3">
            <motion.span key={selectedVariant.salePrice} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-black">
              {formatMoney(selectedVariant.salePrice)}
            </motion.span>
            {selectedVariant.price > selectedVariant.salePrice && <span className="text-lg font-bold text-neutral-400 line-through dark:text-white/35">{formatMoney(selectedVariant.price)}</span>}
            {discount > 0 && <span className="mb-1 rounded-md bg-blue-600 px-2.5 py-1 text-xs font-black">{discount}% OFF</span>}
          </div>
          <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-neutral-400 dark:text-white/40">SKU {selectedVariant.sku}</p>
          <p className="mt-5 text-base leading-7 text-slate-300">{product.shortDescription || product.description}</p>

          <div className="mt-6 grid gap-5">
            <VariantGroup title="Color" options={colorOptions} selected={color} onPick={pickColor} swatches />
            <VariantGroup title="Size" options={sizeOptions} selected={size} onPick={(value) => pickDimension("size", value)} />
            {materialOptions.length > 1 && <VariantGroup title="Material" options={materialOptions} selected={material} onPick={(value) => pickDimension("material", value)} />}
            {patternOptions.length > 1 && <VariantGroup title="Pattern" options={patternOptions} selected={pattern} onPick={(value) => pickDimension("pattern", value)} />}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="inline-flex h-12 items-center rounded-2xl border border-white/10 bg-white/[0.045]">
              <button aria-label="Decrease quantity" type="button" className="grid h-12 w-11 place-items-center" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>
                <Minus size={16} />
              </button>
              <span className="w-10 text-center text-sm font-black">{quantity}</span>
              <button
                aria-label="Increase quantity"
                type="button"
                className="grid h-12 w-11 place-items-center"
                onClick={() => setQuantity((value) => Math.min(selectedVariant.stock || 1, value + 1))}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <Button onClick={buyNow} disabled={!canBuy} className="min-h-13 text-base">
              <Zap size={19} /> Buy now
            </Button>
            <Button variant="outline" onClick={addSelectedToCart} disabled={!canBuy} className="min-h-13 text-base">
              <ShoppingBag size={19} /> Add to cart
            </Button>
            <button
              type="button"
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              onClick={toggleWishlist}
              className={`grid min-h-13 place-items-center rounded-md border px-4 transition ${
                isWishlisted
                  ? "border-blue-500 bg-blue-600/18 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.2)]"
                  : "border-white/15 bg-white/5 text-white hover:border-blue-400 hover:bg-blue-500/10"
              }`}
            >
              <Heart size={20} className={isWishlisted ? "fill-blue-500" : ""} />
            </button>
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
    <div className="group relative aspect-square overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.045] shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
      {image ? (
        <Image
          src={image}
          alt={title}
          fill
          priority={priority}
          sizes="(max-width: 768px) 95vw, (max-width: 1280px) 58vw, 680px"
          className="object-contain p-6 transition duration-500 group-hover:scale-103 sm:p-8"
        />
      ) : (
        <div className="grid h-full place-items-center text-xs font-black uppercase tracking-widest text-neutral-400 dark:text-white/35">No image</div>
      )}
    </div>
  );
}

function VariantGroup({ title, options, selected, onPick, swatches }: { title: string; options: Option[]; selected: string; onPick: (value: string) => void; swatches?: boolean }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-neutral-500 dark:text-white/50">{title}</p>
        {title === "Size" && <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-500 dark:text-blue-300"><Ruler size={14} /> Size chart</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.label}
            type="button"
            disabled={!option.enabled}
            onClick={() => onPick(option.label)}
            className={`relative inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-4 text-sm font-black transition ${
              selected === option.label ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:bg-blue-600/18 dark:text-white" : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-blue-400 dark:border-white/12 dark:bg-white/[0.035] dark:text-white/72"
            } disabled:cursor-not-allowed disabled:opacity-35`}
          >
            {swatches && <span className="h-4 w-4 rounded-full border border-white/30" style={{ backgroundColor: option.hex ?? option.label }} />}
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function InfoPill({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-4">
      <span className="text-blue-400">{icon}</span>
      <div>
        <p className="text-sm font-black text-white">{title}</p>
        <p className="text-xs font-bold text-slate-400">{text}</p>
      </div>
    </div>
  );
}

function ProductSummary({ product }: { product: StoreProduct }) {
  const items = product.summary.length
    ? product.summary
    : [
        { title: "Fabric", text: "Premium cotton rich fabric with a clean handfeel." },
        { title: "Fit", text: "Structured electronics silhouette made for daily rotation." },
        { title: "Finish", text: "Bio-washed surface, reinforced seams, and durable color." }
      ];

  return (
    <section className="mt-7 rounded-2xl border border-white/10 bg-white/[0.045] p-5">
      <div className="flex items-center gap-2">
        <Sparkles size={18} className="text-blue-400" />
        <h2 className="font-black">Product Summary</h2>
      </div>
      <div className="mt-4 grid gap-3">
        {items.map((item, index) => (
          <div key={`${item.text}-${index}`} className="flex gap-3">
            <PackageCheck size={18} className="mt-0.5 shrink-0 text-blue-400" />
            <p className="text-sm leading-6 text-neutral-600 dark:text-white/68">
              {item.title && <strong className="text-neutral-950 dark:text-white">{item.title}: </strong>}
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
    <section className="mt-12 grid gap-6 border-t border-neutral-200 pt-10 dark:border-white/10 lg:grid-cols-[1fr_360px]">
      <article>
        <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-500 dark:text-blue-400">Details & care</p>
        <div className="rich-product-html mt-4" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
        {hasCustomRichDescription && <div className="rich-product-html mt-8" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />}
      </article>
      <aside className="grid h-fit gap-4">
        <div className="rounded-md border border-neutral-200 bg-neutral-50 p-5 dark:border-white/10 dark:bg-white/[0.035]">
          <h3 className="font-black">Delivery</h3>
          <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-white/58">{String(product.deliveryInfo?.text ?? "Free delivery above INR 1499. Standard delivery usually takes 3-6 business days.")}</p>
        </div>
        <div className="rounded-md border border-neutral-200 bg-neutral-50 p-5 dark:border-white/10 dark:bg-white/[0.035]">
          <h3 className="font-black">Return Policy</h3>
          <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-white/58">{product.returnPolicy || "Easy 7-day exchange for size issues on unused products with original tags."}</p>
        </div>
        {product.careInstructions.length > 0 && (
          <div className="rounded-md border border-neutral-200 bg-neutral-50 p-5 dark:border-white/10 dark:bg-white/[0.035]">
            <h3 className="font-black">Care Instructions</h3>
            <ul className="mt-3 grid gap-2 text-sm text-white/58">
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

  if (!escaped) return "<h2>Product Details</h2><p>Premium fashion-grade construction with a comfortable everyday fit.</p>";

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
