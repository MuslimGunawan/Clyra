"use client";

import { useState, useEffect } from "react";
import AdminLoginModal from "./admin/AdminLoginModal";

export default function SecretAdminTrigger() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // 1. Keyboard Shortcut Trigger: Ctrl + Shift + A (or Cmd + Shift + A)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        setIsModalOpen(true);
      }
    };

    // 2. Custom Event Trigger (e.g. 5-tap on logo)
    const handleCustomTrigger = () => {
      setIsModalOpen(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("clyra_open_admin_vault", handleCustomTrigger);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("clyra_open_admin_vault", handleCustomTrigger);
    };
  }, []);

  return (
    <AdminLoginModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
    />
  );
}
