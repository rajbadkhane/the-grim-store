"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const MIN_VISIBLE_MS = 260;
const FALLBACK_HIDE_MS = 1700;
const BUTTON_FEEDBACK_MS = 680;

function isSamePageHashLink(url: URL) {
  return (
    url.origin === window.location.origin &&
    url.pathname === window.location.pathname &&
    url.search === window.location.search &&
    url.hash.length > 0
  );
}

function shouldLoadForUrl(url: URL) {
  if (url.origin !== window.location.origin) return false;
  if (isSamePageHashLink(url)) return false;

  return `${url.pathname}${url.search}` !== `${window.location.pathname}${window.location.search}`;
}

function shouldLoadForHistoryUrl(url?: string | URL | null) {
  if (!url) return false;
  return shouldLoadForUrl(new URL(url, window.location.href));
}

function shouldLoadForLink(link: HTMLAnchorElement, event: MouseEvent) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return false;
  }

  if (link.target && link.target !== "_self") return false;
  if (link.hasAttribute("download")) return false;

  const url = new URL(link.href, window.location.href);
  return shouldLoadForUrl(url);
}

function showButtonFeedback(element: HTMLElement) {
  if (element.hasAttribute("disabled") || element.getAttribute("aria-disabled") === "true") return;

  const needsPosition = window.getComputedStyle(element).position === "static";
  if (needsPosition) element.style.position = "relative";

  element.dataset.clickLoading = "true";
  window.setTimeout(() => {
    if (element.isConnected) {
      delete element.dataset.clickLoading;
      if (needsPosition) element.style.removeProperty("position");
    }
  }, BUTTON_FEEDBACK_MS);
}

export function NavigationLoading() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const [isLoading, setIsLoading] = useState(false);
  const mountedRef = useRef(false);
  const startedAtRef = useRef(0);
  const hideTimerRef = useRef<number | null>(null);
  const fallbackTimerRef = useRef<number | null>(null);
  const startTimerRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (startTimerRef.current) {
      window.clearTimeout(startTimerRef.current);
      startTimerRef.current = null;
    }

    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    if (fallbackTimerRef.current) {
      window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
  }, []);

  const finishLoading = useCallback(() => {
    const elapsed = window.performance.now() - startedAtRef.current;
    const remaining = Math.max(MIN_VISIBLE_MS - elapsed, 0);

    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => {
      setIsLoading(false);
      hideTimerRef.current = null;
    }, remaining);
  }, []);

  const startLoading = useCallback(() => {
    clearTimers();
    startedAtRef.current = window.performance.now();
    setIsLoading(true);

    fallbackTimerRef.current = window.setTimeout(() => {
      finishLoading();
    }, FALLBACK_HIDE_MS);
  }, [clearTimers, finishLoading]);

  const scheduleLoading = useCallback(() => {
    if (startTimerRef.current) window.clearTimeout(startTimerRef.current);
    startTimerRef.current = window.setTimeout(() => {
      startTimerRef.current = null;
      startLoading();
    }, 0);
  }, [startLoading]);

  useEffect(() => {
    if (mountedRef.current) {
      finishLoading();
      return;
    }

    mountedRef.current = true;
  }, [finishLoading, routeKey]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const button = target.closest<HTMLElement>("button, [role='button'], input[type='button'], input[type='submit']");
      if (button) showButtonFeedback(button);

      const link = target.closest<HTMLAnchorElement>("a[href]");
      if (link && shouldLoadForLink(link, event)) startLoading();
    }

    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
      clearTimers();
    };
  }, [clearTimers, startLoading]);

  useEffect(() => {
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function pushState(data: unknown, unused: string, url?: string | URL | null) {
      if (shouldLoadForHistoryUrl(url)) scheduleLoading();
      return originalPushState.call(this, data, unused, url);
    };

    window.history.replaceState = function replaceState(data: unknown, unused: string, url?: string | URL | null) {
      if (shouldLoadForHistoryUrl(url)) scheduleLoading();
      return originalReplaceState.call(this, data, unused, url);
    };

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, [scheduleLoading]);

  return (
    <AnimatePresence>
      {isLoading && (
        <>
          <motion.div
            key="page-load-track"
            aria-hidden="true"
            className="pointer-events-none fixed inset-x-0 top-0 z-[220] h-1 overflow-hidden bg-red-650/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
          >
            <motion.div
              className="h-full rounded-r-full bg-gradient-to-r from-red-650 via-red-500 to-amber-400 shadow-[0_0_18px_rgba(225,29,46,0.55)]"
              initial={{ width: "8%", x: "-12%" }}
              animate={{ width: ["18%", "62%", "92%"], x: ["0%", "12%", "24%"] }}
              transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1], repeat: Infinity }}
            />
          </motion.div>
          <motion.div
            key="page-load-glow"
            aria-hidden="true"
            className="pointer-events-none fixed right-4 top-20 z-[220] h-9 w-9 rounded-md border border-red-500/20 bg-white/78 shadow-xl shadow-red-650/10 backdrop-blur-md dark:bg-neutral-950/78"
            initial={{ opacity: 0, scale: 0.92, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            <motion.div
              className="m-2.5 h-4 w-4 rounded-full border-2 border-red-650 border-t-amber-400"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.7, ease: "linear", repeat: Infinity }}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
