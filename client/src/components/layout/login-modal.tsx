"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/auth";

export function LoginModal() {
  const { showLoginModal, closeLoginModal } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (showLoginModal) {
      closeLoginModal();
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [showLoginModal, closeLoginModal, router]);

  return null;
}
