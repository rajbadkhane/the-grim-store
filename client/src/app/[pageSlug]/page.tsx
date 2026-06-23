import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { pageMap, sitePages } from "@/lib/site-pages";

const founders = [
  {
    name: "Er. Harshit Koshti",
    image: "/harshit.jpeg",
    detail:
      "Co-founder of The Grim Store, focused on product direction, customer experience, and building a sharp ecommerce brand around useful everyday technology."
  },
  {
    name: "Er.Abhishek Rajput",
    image: "/abhisek.jpeg",
    detail:
      "Co-founder of The Grim Store, focused on operations, platform growth, and keeping the store reliable from catalog planning to customer support."
  }
];

export const dynamicParams = false;

export function generateStaticParams() {
  return sitePages.map((page) => ({ pageSlug: page.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ pageSlug: string }> }): Promise<Metadata> {
  const { pageSlug } = await params;
  const page = pageMap.get(pageSlug);
  if (!page) return {};

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/${page.slug}` },
    openGraph: {
      title: `${page.title} | The Grim Store`,
      description: page.description,
      type: "article",
      url: `/${page.slug}`,
      images: ["/logo.png"]
    }
  };
}

export default async function SiteInfoPage({ params }: { params: Promise<{ pageSlug: string }> }) {
  const { pageSlug } = await params;
  const page = pageMap.get(pageSlug);
  if (!page) notFound();

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const modifiedDate = new Date(page.lastUpdated).toISOString();
  const jsonLd: any = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title,
    description: page.description,
    url: `${base}/${page.slug}`,
    dateModified: modifiedDate,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: base },
        { "@type": "ListItem", position: 2, name: page.title, item: `${base}/${page.slug}` }
      ]
    }
  };
  const faqJsonLd =
    page.slug === "faq"
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: page.sections.map((section) => ({
            "@type": "Question",
            name: section.title,
            acceptedAnswer: {
              "@type": "Answer",
              text: [...section.body, ...(section.bullets ?? [])].join(" ")
            }
          }))
        }
      : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />}
      <section className="border-b border-neutral-250 dark:border-white/10 bg-white/40 dark:bg-neutral-900/60 backdrop-blur-xs">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#FF3B30]">{page.eyebrow}</p>
            <h1 className="mt-3 text-3xl font-black tracking-normal text-neutral-850 dark:text-white sm:text-4xl">{page.title}</h1>
            <p className="mt-5 text-base leading-8 text-neutral-600 dark:text-neutral-300">{page.description}</p>
            <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500">Last updated: {page.lastUpdated}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8">
        <article className="grid gap-5">
          {page.sections.map((section) => (
            <div key={section.title} className="rounded-2xl border border-[#282c3f]/10 dark:border-white/5 bg-white dark:bg-[#171a1d] p-5 sm:p-6 shadow-xs">
              <h2 className="text-xl font-black text-neutral-850 dark:text-white">{section.title}</h2>
              <div className="mt-4 grid gap-3 text-sm leading-7 text-neutral-600 dark:text-neutral-300">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              {section.bullets && (
                <ul className="mt-5 grid gap-3 text-sm font-bold text-neutral-700 dark:text-neutral-200">
                  {section.bullets.map((item) => (
                    <li key={item} className="flex gap-3">
                      <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#FF3B30]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          {page.slug === "about-us" && (
            <div className="rounded-2xl border border-[#282c3f]/10 bg-white p-5 shadow-xs dark:border-white/5 dark:bg-[#171a1d] sm:p-6">
              <h2 className="text-xl font-black text-neutral-850 dark:text-white">About the founders</h2>
              <p className="mt-4 text-sm leading-7 text-neutral-600 dark:text-neutral-300">
                The Grim Store is shaped by two engineer-founders who combine practical product thinking with a clean, customer-first ecommerce approach.
              </p>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {founders.map((founder) => (
                  <article key={founder.name} className="rounded-2xl border border-[#282c3f]/10 bg-neutral-50 p-5 text-center dark:border-white/5 dark:bg-neutral-950/40">
                    <img
                      src={founder.image}
                      alt={founder.name}
                      className="mx-auto h-32 w-32 rounded-full border border-[#FF3B30]/25 object-cover object-[center_28%] shadow-sm sm:h-36 sm:w-36"
                    />
                    <h3 className="mt-4 text-lg font-black text-neutral-850 dark:text-white">{founder.name}</h3>
                    <p className="mt-3 text-sm leading-7 text-neutral-600 dark:text-neutral-300">{founder.detail}</p>
                  </article>
                ))}
              </div>
            </div>
          )}
        </article>

        <aside className="h-fit rounded-xl border border-[#FF3B30]/20 bg-[#FF3B30]/5 p-5 shadow-xs dark:border-[#FF3B30]/30 dark:bg-[#FF3B30]/10">
          <h2 className="text-lg font-black text-neutral-850 dark:text-white">Need order help?</h2>
          <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-300">For parcel status, refunds, or return updates, open your account order history.</p>
          <Link href="/account?tab=orders" className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#FF3B30] px-5 text-xs font-black text-white transition-colors hover:bg-[#D71920] shadow-sm shadow-[#FF3B30]/10">
            My Orders <ArrowRight size={17} />
          </Link>
        </aside>
      </section>
    </>
  );
}
