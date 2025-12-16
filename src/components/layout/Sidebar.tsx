"use client";

import { Home, Users, Bell, Calendar, Clock, UserCircle, ClipboardList } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const menu = [
    { label: "home", href: "/my-space/overview", icon: Home },
    { label: "Onboarding", href: "/onboarding", icon: Users },
    { label: "Feeds", href: "/feeds", icon: Bell },
    { label: "Leave Tracker", href: "/leavetracker", icon: Calendar },
    { label: "Attendance", href: "/attendance", icon: Clock },
    { label: "Time Tracking", href: "/timetracking", icon: ClipboardList },
    { label: "Profile", href: "/profile", icon: UserCircle },
  ];

  return (
    <aside className="w-64 h-screen border-r bg-white flex flex-col">
      <div className="h-16 flex items-center px-6 text-xl font-semibold border-b text-blue-600">
        HRMS Portal
      </div>

      <nav className="flex-1 p-4 space-y-4">
        {menu.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm
                ${active ? "bg-blue-100 text-blue-600" : "text-black hover:bg-blue-100"}
              `}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
