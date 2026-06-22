export default function ProductDetailLoading() {
  return (
    <div className="text-foreground bg-white dark:bg-[#0f1113] min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        
        {/* Skeleton Breadcrumb */}
        <div className="mb-6 flex gap-2 text-xs font-bold uppercase tracking-widest text-neutral-300 dark:text-neutral-700">
          <span>Home</span>
          <span>/</span>
          <span>Products</span>
          <span>/</span>
          <span className="h-4 w-24 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
        </div>

        {/* 2-Column Grid matching PDP */}
        <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] items-start">
          
          {/* LEFT COLUMN: Gallery Skeleton */}
          <section className="min-w-0">
            {/* Desktop 2-column Grid of aspect-[3/4] blocks */}
            <div className="hidden md:grid grid-cols-2 gap-3">
              <div className="aspect-[3/4] w-full rounded bg-neutral-200 dark:bg-neutral-900 animate-pulse" />
              <div className="aspect-[3/4] w-full rounded bg-neutral-200 dark:bg-neutral-900 animate-pulse" />
            </div>

            {/* Mobile Single Block */}
            <div className="md:hidden aspect-square w-full rounded bg-neutral-200 dark:bg-neutral-900 animate-pulse" />

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="h-16 rounded bg-neutral-200 dark:bg-neutral-900 animate-pulse" />
              <div className="h-16 rounded bg-neutral-200 dark:bg-neutral-900 animate-pulse" />
              <div className="h-16 rounded bg-neutral-200 dark:bg-neutral-900 animate-pulse" />
            </div>
          </section>

          {/* RIGHT COLUMN: Info Panel Skeleton */}
          <aside className="md:sticky md:top-24 md:h-fit self-start">
            <div className="rounded border border-neutral-100 dark:border-neutral-900 bg-white dark:bg-[#111315] p-5 sm:p-6 shadow-sm">
              <div className="border-b border-neutral-200/40 dark:border-neutral-800/40 pb-5 flex flex-col gap-3">
                <div className="h-5 w-24 rounded bg-neutral-250 dark:bg-neutral-800 animate-pulse" />
                <div className="h-8 w-full rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                <div className="h-4 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                <div className="h-6 w-36 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse mt-2" />
              </div>

              {/* Price row skeleton */}
              <div className="mt-5 border-t border-b border-neutral-100 dark:border-neutral-900 py-4 flex flex-col gap-2">
                <div className="h-7 w-48 rounded bg-neutral-250 dark:bg-neutral-800 animate-pulse" />
                <div className="h-3.5 w-32 rounded bg-neutral-200 dark:bg-neutral-850 animate-pulse" />
              </div>

              {/* Swatch options skeleton */}
              <div className="mt-6 flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <div className="h-4 w-16 rounded bg-neutral-200 dark:bg-neutral-850 animate-pulse" />
                  <div className="flex gap-2">
                    <div className="h-8 w-14 rounded bg-neutral-200 dark:bg-neutral-900 animate-pulse" />
                    <div className="h-8 w-14 rounded bg-neutral-200 dark:bg-neutral-900 animate-pulse" />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="h-4 w-12 rounded bg-neutral-200 dark:bg-neutral-850 animate-pulse" />
                  <div className="flex gap-2">
                    <div className="h-8 w-10 rounded bg-neutral-200 dark:bg-neutral-900 animate-pulse" />
                    <div className="h-8 w-10 rounded bg-neutral-200 dark:bg-neutral-900 animate-pulse" />
                    <div className="h-8 w-10 rounded bg-neutral-200 dark:bg-neutral-900 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Quantity selector skeleton */}
              <div className="mt-6 h-11 w-32 rounded bg-neutral-200 dark:bg-neutral-900 animate-pulse" />

              {/* Action Buttons skeleton */}
              <div className="mt-6 flex gap-3">
                <div className="flex-1 h-13 rounded bg-neutral-250 dark:bg-neutral-800 animate-pulse" />
                <div className="flex-1 h-13 rounded bg-neutral-200 dark:bg-neutral-900 animate-pulse" />
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
