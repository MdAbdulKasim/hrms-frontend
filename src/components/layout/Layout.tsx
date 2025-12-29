"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import NavigationHeader from './header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  userRole?: 'admin' | 'employee';
}

import { checkSetupStatus, checkEmployeeSetupStatus, getUserRole, requiresSetup } from '@/lib/auth';

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [role, setRole] = useState<'admin' | 'employee'>('admin');
  const [isChecking, setIsChecking] = useState(true);

  // Read role from centralized helper on first load
  useEffect(() => {
    const activeRole = getUserRole();
    if (activeRole) {
      setRole(activeRole);
    }
    setIsChecking(false);
  }, []);

  // Route protection - redirect to setup if not completed
  useEffect(() => {
    if (isChecking) return; // Don't check until role is loaded

    const allowedPaths = ['/admin/setup', '/employee/setup', '/login', '/register', '/auth'];
    const isAllowedPath = allowedPaths.some((path) => pathname.startsWith(path));

    // If we're on an allowed path, don't check setup
    if (isAllowedPath) return;

    const setupRequired = requiresSetup(role);

    // Redirect to setup if required and trying to access protected routes
    if (setupRequired) {
      if (role === 'admin') {
        router.push('/admin/setup');
      } else if (role === 'employee') {
        // router.push('/employee/setup');
        // router.push('/employee/my-space/overview');
      }
    }
  }, [pathname, router, role, isChecking]);

  // Listen for setup completion events
  useEffect(() => {
    const handleSetupComplete = () => {
      // Force re-check when setup is completed
      const setupComplete = role === 'admin'
        ? checkSetupStatus()
        : role === 'employee'
          ? checkEmployeeSetupStatus()
          : false;

      if (setupComplete && !requiresSetup(role)) {
        // Redirect to appropriate dashboard
        if (role === 'admin') {
          router.push('/admin/my-space/overview');
        } else if (role === 'employee') {
          router.push('/employee/my-space/overview');
        }
      }
    };

    window.addEventListener('setupStatusChanged', handleSetupComplete);
    window.addEventListener('storage', handleSetupComplete);

    return () => {
      window.removeEventListener('setupStatusChanged', handleSetupComplete);
      window.removeEventListener('storage', handleSetupComplete);
    };
  }, [role, router]);

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

  // Show loading while checking role
  if (isChecking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const isAuthPage = pathname.startsWith('/auth') || pathname.startsWith('/login') || pathname.startsWith('/register');

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">

      {/* Sidebar */}
      {!isAuthPage && (
        <Sidebar
          isDesktopCollapsed={isDesktopCollapsed}
          isMobileOpen={isMobileOpen}
          closeMobileMenu={closeMobileMenu}
          userRole={role}
        />
      )}

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-[2px] z-40 md:hidden animate-in fade-in duration-300"
          onClick={closeMobileMenu}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!isAuthPage && (
          <NavigationHeader
            toggleSidebar={toggleSidebar}
            userRole={role}
          />
        )}

        <main className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}