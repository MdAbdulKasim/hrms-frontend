"use client";

import { Card, CardContent } from "@/components/ui/card";
import { UserCheck, TrendingUp, Briefcase } from "lucide-react";

interface StatsProps {
    status: string;
    workHours: string;
    shift: string;
}

export const StatsCards = ({ status, workHours, shift }: StatsProps) => {
    const stats = [
        { label: "Work Status", value: status, icon: UserCheck, color: "from-blue-600 to-indigo-600", shadow: "shadow-blue-200" },
        { label: "Daily Hours", value: workHours, icon: TrendingUp, color: "from-emerald-500 to-teal-500", shadow: "shadow-emerald-200" },
        { label: "Current Role", value: shift, icon: Briefcase, color: "from-violet-600 to-purple-600", shadow: "shadow-purple-200" },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 h-full">
            {stats.map((stat, idx) => (
                <div key={idx} className="group relative bg-white/70 backdrop-blur-xl p-10 rounded-[3rem] shadow-2xl border border-white/40 flex flex-col items-center text-center transition-all duration-700 hover:shadow-3xl hover:-translate-y-4 overflow-hidden">
                    {/* Decorative element */}
                    <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-5 blur-3xl group-hover:opacity-20 transition-opacity duration-700`} />

                    <div className={`w-24 h-24 bg-gradient-to-br ${stat.color} rounded-[2rem] flex items-center justify-center mb-10 transform group-hover:rotate-[15deg] group-hover:scale-110 transition-all duration-700 shadow-2xl ${stat.shadow}`}>
                        <stat.icon className="w-12 h-12 text-white" />
                    </div>

                    <div className="relative z-10">
                        <h3 className="text-4xl font-bold text-slate-900 tracking-tight mb-3 leading-none uppercase truncate drop-shadow-sm">
                            {stat.value}
                        </h3>
                        <p className="text-[13px] font-bold text-slate-400 uppercase tracking-[0.25em] leading-tight">
                            {stat.label}
                        </p>
                    </div>

                    <div className="mt-10 pt-8 border-t border-slate-100/50 w-full flex items-center justify-center gap-3">
                        <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce duration-700" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce duration-700" style={{ animationDelay: '200ms' }}></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce duration-700" style={{ animationDelay: '400ms' }}></div>
                        </div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Active Tracking</span>
                    </div>
                </div>
            ))}
        </div>
    );
};
