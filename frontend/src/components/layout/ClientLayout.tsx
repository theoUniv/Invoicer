'use client';

import { Navbar } from "@/components/layout";
import { usePathname } from "next/navigation";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  
  const noNavbarPages = ['/login', '/register', '/forget-password'];
  const shouldShowNavbar = !noNavbarPages.includes(pathname);

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      {children}
    </>
  );
}
