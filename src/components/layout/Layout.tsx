"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import NavigationHeader from './header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  userRole?: 'admin' | 'employee';
}

const checkSetupCompleted = (role: 'admin' | 'employee'): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    if (role === 'admin') {
      const setupData = localStorage.getItem('organizationSetup');
      if (!setupData) return false;
      const data = JSON.parse(setupData);
      return data.allStepsCompleted === true;
    }
    
    if (role === 'employee') {
      const setupData = localStorage.getItem('employeeSetupData');
      if (!setupData) return false;
      const data = JSON.parse(setupData);
      return data.allStepsCompleted === true;
    }
    
    return false;
  } catch {
    return false;
  }
};

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [role, setRole] = useState<'admin' | 'employee'>('admin');
  const [isChecking, setIsChecking] = useState(true);

  // Read role from localStorage on first load
  useEffect(() => {
    const savedRole = localStorage.getItem("role") as 'admin' | 'employee';
    if (savedRole) {
      setRole(savedRole);
    }
    setIsChecking(false);
  }, []);

  // Route protection - redirect to setup if not completed
  useEffect(() => {
    if (isChecking) return; // Don't check until role is loaded

    const allowedPaths = ['/setup', '/login', '/register', '/auth'];
    const isAllowedPath = allowedPaths.some((path) => pathname.startsWith(path));
    
    // If we're on an allowed path, don't check setup
    if (isAllowedPath) return;

    const setupComplete = checkSetupCompleted(role);

    // Redirect to setup if not completed and trying to access protected routes
    if (!setupComplete) {
      router.push('/setup');
    }
  }, [pathname, router, role, isChecking]);

  // Listen for setup completion events
  useEffect(() => {
    const handleSetupComplete = () => {
      // Force re-check when setup is completed
      const setupComplete = checkSetupCompleted(role);
      if (setupComplete) {
        // Redirect to appropriate dashboard
        if (role === 'admin') {
          router.push('/my-space/overview');
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

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      
      {/* Sidebar */}
      <Sidebar
        isDesktopCollapsed={isDesktopCollapsed}
        isMobileOpen={isMobileOpen}
        closeMobileMenu={closeMobileMenu}
        userRole={role}
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
          userRole={role}
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