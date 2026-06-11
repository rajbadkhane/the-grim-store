import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { pageMap, sitePages } from "@/lib/site-pages";

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
      url: `/${page.slug}`
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
      <section className="border-b border-white/10 bg-[#090909]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.28em] text-blue-300">{page.eyebrow}</p>
            <h1 className="mt-4 text-4xl font-black tracking-normal sm:text-5xl">{page.title}</h1>
            <p className="mt-5 text-base leading-8 text-white/64">{page.description}</p>
            <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-white/40">Last updated: {page.lastUpdated}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_340px] lg:px-8">
        <article className="grid gap-5">
          {page.sections.map((section) => (
            <div key={section.title} className="rounded-md border border-white/10 bg-white/[0.035] p-5 sm:p-6">
              <h2 className="text-2xl font-black">{section.title}</h2>
              <div className="mt-4 grid gap-3 text-sm leading-7 text-white/62">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              {section.bullets && (
                <ul className="mt-5 grid gap-3 text-sm font-bold text-white/70">
                  {section.bullets.map((item) => (
                    <li key={item} className="flex gap-3">
                      <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-blue-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </article>

        <aside className="h-fit rounded-md border border-blue-500/30 bg-blue-600/10 p-5">
          <h2 className="text-lg font-black">Need order help?</h2>
          <p className="mt-3 text-sm leading-6 text-white/62">For parcel status, refunds, or return updates, open your account order history.</p>
          <Link href="/account?tab=orders" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-black text-white hover:bg-blue-600/90">
            My Orders <ArrowRight size={17} />
          </Link>
        </aside>
      </section>
    </>
  );
}
