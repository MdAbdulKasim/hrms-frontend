"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import NavigationHeader from './header';
import Sidebar from './Sidebar';
import { isSetupCompleted } from '@/components/setup/SetupWizard';

interface LayoutProps {
  children: React.ReactNode;
  userRole?: 'admin' | 'employee';
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [role, setRole] = useState<'admin' | 'employee'>('admin');

  // 🔥 Read role from localStorage on first load
  useEffect(() => {
    const savedRole = localStorage.getItem("role") as 'admin' | 'employee';
    if (savedRole) {
      setRole(savedRole);
    }
  }, []);

  // Route protection - redirect to setup if not completed
  useEffect(() => {
    const allowedPaths = ['/setup', '/login', '/register', '/auth'];
    const isAllowedPath = allowedPaths.some((path) => pathname.startsWith(path));
    const setupComplete = isSetupCompleted();

    // Redirect to setup if not completed and trying to access protected routes
    if (!setupComplete && !isAllowedPath) {
      router.push('/setup');
    }
  }, [pathname, router]);

  // Close mobile menu when window is resized to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileOpen]);

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsDesktopCollapsed(!isDesktopCollapsed);
    }
  };

  const closeMobileMenu = () => setIsMobileOpen(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      
      {/* Sidebar */}
      <Sidebar
        isDesktopCollapsed={isDesktopCollapsed}
        isMobileOpen={isMobileOpen}
        closeMobileMenu={closeMobileMenu}
        userRole={role}        // ✅ now passing actual role
      />

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <NavigationHeader 
          toggleSidebar={toggleSidebar}
          userRole={role}       // also show role in header
        />

        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}