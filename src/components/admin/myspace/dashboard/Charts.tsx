"use client";

import * as React from "react";
import { Pie, PieChart, Cell, ResponsiveContainer } from "recharts";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart";
import { Users, UserMinus, UserCheck, UserX, CalendarDays, Building2, Briefcase, MapPin, Clock } from "lucide-react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, BarChart } from "recharts";

// --- Components ---

interface AttendanceChartProps {
    data: { name: string; present: number; absent: number }[];
    activePeriod: string;
    onPeriodChange: (period: string) => void;
}

export const AttendanceOverviewChart = ({ data, activePeriod, onPeriodChange }: AttendanceChartProps) => {
    return (
        <Card className="shadow-2xl rounded-[1.5rem] border-none h-full bg-white overflow-hidden group transition-all hover:shadow-3xl">
            <CardHeader className="flex flex-row items-center justify-between pb-4 pt-8 px-8">
                <div>
                    <CardTitle className="text-xl font-bold text-slate-800 tracking-tight">Attendance Overview</CardTitle>
                </div>
                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
                    {['Day', 'Week', 'Month', 'Year'].map((period) => (
                        <button
                            key={period}
                            onClick={() => onPeriodChange(period)}
                            className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${activePeriod === period ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-white hover:text-slate-600 hover:shadow-sm'}`}
                        >
                            {period}
                        </button>
                    ))}
                </div>
            </CardHeader>
            <CardContent className="px-10 pb-12">
                <div className="h-[320px] w-full mt-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 700 }}
                                dy={15}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 700 }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    borderRadius: '20px',
                                    border: 'none',
                                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                    padding: '16px'
                                }}
                                itemStyle={{ fontSize: '13px', fontWeight: 800 }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                align="center"
                                iconType="circle"
                                wrapperStyle={{ paddingTop: '40px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="present"
                                stroke="#22c55e"
                                strokeWidth={4}
                                dot={{ r: 6, strokeWidth: 0, fill: '#22c55e' }}
                                activeDot={{ r: 8, strokeWidth: 0 }}
                                name="Present"
                            />
                            <Line
                                type="monotone"
                                dataKey="absent"
                                stroke="#ef4444"
                                strokeWidth={4}
                                dot={{ r: 6, strokeWidth: 0, fill: '#ef4444' }}
                                activeDot={{ r: 8, strokeWidth: 0 }}
                                name="Absent"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

interface EmployeeSummaryProps {
    totalEmployees: number;
    activeEmployees: number;
    inactive: number;
    present: number;
    absent: number;
    departments: number;
    designations: number;
    locations: number;
}

export const EmployeeSummaryList = ({
    totalEmployees,
    activeEmployees,
    inactive,
    present,
    absent,
    departments,
    designations,
    locations
}: EmployeeSummaryProps) => {
    const stats = [
        { label: "Total Employees", value: totalEmployees, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Active Employees", value: activeEmployees, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Inactive Employees", value: inactive, icon: UserMinus, color: "text-rose-600", bg: "bg-rose-50" },
        { label: "Today Present", value: present, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Today Absent", value: absent, icon: UserX, color: "text-orange-600", bg: "bg-orange-50" },
        { label: "Total Departments", value: departments, icon: Building2, color: "text-blue-400", bg: "bg-blue-50" },
        { label: "Total Designations", value: designations, icon: Briefcase, color: "text-indigo-600", bg: "bg-indigo-50" },
        { label: "Total Locations", value: locations, icon: MapPin, color: "text-sky-500", bg: "bg-sky-50" },
    ];

    return (
        <Card className="shadow-2xl rounded-[1.5rem] border-none h-full bg-white overflow-hidden group transition-all hover:shadow-3xl">
            <CardHeader className="pb-2 pt-8 px-8">
                <CardTitle className="text-xl font-bold text-slate-800 tracking-tight">Employee Summary</CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8 pt-4">
                <div className="space-y-4">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="flex items-center justify-between group/item">
                            <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 ${stat.bg} rounded-xl flex items-center justify-center transition-transform duration-500 group-hover/item:scale-110`}>
                                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                                <span className="text-sm font-medium text-slate-500">{stat.label}</span>
                            </div>
                            <span className="text-lg font-bold text-slate-800">{stat.value.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export const EmployeeSummaryCards = ({
    totalEmployees,
    activeEmployees,
    inactive,
    present,
    absent,
    departments,
    designations,
    locations
}: EmployeeSummaryProps) => {
    const cards = [
        { label: "Total Employee", value: totalEmployees, icon: Users, color: "from-blue-600 to-indigo-600", shadow: "shadow-blue-200" },
        { label: "Active Employee", value: activeEmployees, icon: UserCheck, color: "from-emerald-500 to-teal-500", shadow: "shadow-emerald-200" },
        { label: "Daily Present", value: present, icon: UserCheck, color: "from-sky-500 to-cyan-500", shadow: "shadow-sky-200" },
        { label: "Daily Absent", value: absent, icon: UserX, color: "from-orange-500 to-rose-500", shadow: "shadow-orange-200" },
        { label: "Inactive Members", value: inactive, icon: UserMinus, color: "from-pink-500 to-rose-500", shadow: "shadow-rose-200" },
        { label: "Departments", value: departments, icon: Building2, color: "from-violet-600 to-purple-600", shadow: "shadow-purple-200" },
        { label: "Designations", value: designations, icon: Briefcase, color: "from-slate-600 to-slate-800", shadow: "shadow-slate-200" },
        { label: "Locations", value: locations, icon: MapPin, color: "from-teal-500 to-emerald-600", shadow: "shadow-teal-200" },
    ];

    return (
        <Card className="shadow-none border-none bg-transparent">
            <CardHeader className="px-1 pb-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center shadow-sm border border-indigo-100/50">
                        <Users className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight">Employee Summary</CardTitle>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">WORKFORCE SNAPSHOT</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-0 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10">
                    {cards.map((card, idx) => (
                        <div key={idx} className="group relative bg-white/70 backdrop-blur-xl p-10 rounded-[3rem] shadow-2xl border border-white/40 flex flex-col items-center text-center transition-all duration-700 hover:shadow-3xl hover:-translate-y-4 overflow-hidden">
                            {/* Decorative element */}
                            <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${card.color} opacity-5 blur-3xl group-hover:opacity-20 transition-opacity duration-700`} />

                            <div className={`w-24 h-24 bg-gradient-to-br ${card.color} rounded-[2rem] flex items-center justify-center mb-10 transform group-hover:rotate-[15deg] group-hover:scale-110 transition-all duration-700 shadow-2xl ${card.shadow}`}>
                                <card.icon className="w-12 h-12 text-white" />
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-5xl font-bold text-slate-800 tracking-tight mb-3 leading-none truncate">
                                    {card.value.toLocaleString()}
                                </h3>
                                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.25em] leading-tight">
                                    {card.label}
                                </p>
                            </div>

                            <div className="mt-10 pt-8 border-t border-slate-100/50 w-full flex items-center justify-center gap-3">
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce duration-700" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce duration-700" style={{ animationDelay: '200ms' }}></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce duration-700" style={{ animationDelay: '400ms' }}></div>
                                </div>
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Live Integration</span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

// --- Shadcn Part ---

const COLORS = [
    "#3b82f6", // Blue
    "#ef4444", // Red
    "#22c55e", // Green
    "#f59e0b", // Amber
    "#8b5cf6", // Purple
    "#ec4899", // Pink
    "#06b6d4", // Cyan
    "#14b8a6", // Teal
    "#f97316", // Orange
    "#6366f1", // Indigo
];

interface LeaveStatisticsPieChartProps {
    data: { name: string; value: number; color?: string }[];
    title?: string;
    subtitle?: string;
    todaysLeaves?: number;
    pendingRequests?: number;
}

export const LeaveStatisticsPieChart = ({
    data,
    title = "Leave Statistics",
    subtitle = "LEAVE BREAKDOWN",
    todaysLeaves = 0,
    pendingRequests = 0
}: LeaveStatisticsPieChartProps) => {
    // Ensure we have data even if counts are zero
    const displayData = data && data.length > 0 ? data.map((item, idx) => ({
        ...item,
        fill: item.color || COLORS[idx % COLORS.length]
    })) : [
        { name: "No Data", value: 1, fill: "#f1f5f9" }
    ];

    // Create dynamic config for Shadcn Chart
    const chartConfig: ChartConfig = {};
    displayData.forEach((item) => {
        chartConfig[item.name.toLowerCase().replace(/\s+/g, '_')] = {
            label: item.name,
            color: item.fill
        };
    });

    return (
        <Card className="shadow-2xl rounded-[1.5rem] border-none flex flex-col h-full bg-white overflow-hidden group transition-all duration-700 hover:shadow-3xl">
            <CardHeader className="pb-4 pt-8 px-8">
                <CardTitle className="text-xl font-bold text-slate-800 tracking-tight">{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pb-8 px-8">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[300px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            data={displayData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={5}
                            strokeWidth={0}
                            animationBegin={0}
                            animationDuration={1500}
                        />
                    </PieChart>
                </ChartContainer>

                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-8">
                    {displayData.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                            <span className="text-xs font-semibold text-slate-500">{item.name}</span>
                        </div>
                    ))}
                </div>

                {/* Sub-cards */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100/50">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                <CalendarDays className="w-4 h-4 text-orange-600" />
                            </div>
                            <span className="text-xl font-bold text-slate-800">{todaysLeaves}</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Today's Leaves</p>
                    </div>
                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Clock className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="text-xl font-bold text-slate-800">{pendingRequests}</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Requests</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

// Keep legacy for backward compatibility if needed, but we will update home pages
export const LeaveStatisticsChart = LeaveStatisticsPieChart;

interface DistributionChartProps {
    data: { name: string; count: number }[];
}

export const DepartmentDistributionChart = ({ data }: DistributionChartProps) => {
    return (
        <Card className="shadow-2xl rounded-[1.5rem] border-none h-full bg-white overflow-hidden transition-all hover:shadow-3xl">
            <CardHeader className="pb-4 pt-8 px-8">
                <CardTitle className="text-xl font-bold text-slate-800 tracking-tight">Department Distribution</CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={data} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} width={80} axisLine={false} tickLine={false} />
                            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                            <Bar dataKey="count" fill="#3b82f6" radius={[0, 10, 10, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export const LocationDistributionChart = ({ data }: DistributionChartProps) => {
    return (
        <Card className="shadow-2xl rounded-[1.5rem] border-none h-full bg-white overflow-hidden transition-all hover:shadow-3xl">
            <CardHeader className="pb-4 pt-8 px-8">
                <CardTitle className="text-xl font-bold text-slate-800 tracking-tight">Location Distribution</CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} dy={10} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                            <Bar dataKey="count" fill="#60a5fa" radius={[10, 10, 0, 0]} barSize={32} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};
