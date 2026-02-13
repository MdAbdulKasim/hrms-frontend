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
} from "@/components/ui/chart";
import { Users, UserMinus, UserCheck, UserX, CalendarDays, Building2, Briefcase, MapPin, Clock } from "lucide-react";
import { CartesianGrid, XAxis, YAxis, Tooltip, Bar, BarChart } from "recharts";

// --- Components ---

interface AttendanceChartProps {
    data: { name: string; present: number; absent: number }[];
    activePeriod: string;
    onPeriodChange: (period: string) => void;
}

const attendanceChartConfig: ChartConfig = {
    present: {
        label: "Present",
        color: "#16a34a",
    },
    absent: {
        label: "Absent",
        color: "#ef4444",
    },
};

export const AttendanceOverviewChart = ({ data, activePeriod, onPeriodChange }: AttendanceChartProps) => {
    const totalPresent = React.useMemo(() => data.reduce((sum, d) => sum + d.present, 0), [data]);
    const totalAbsent = React.useMemo(() => data.reduce((sum, d) => sum + d.absent, 0), [data]);

    return (
        <Card className="shadow-2xl rounded-[1.5rem] border-none h-full bg-white overflow-hidden group transition-all hover:shadow-3xl">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 pt-6 sm:pt-8 px-4 sm:px-8">
                <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">Attendance Overview</CardTitle>
                    <CardDescription className="text-xs text-slate-400 mt-1">
                        Showing attendance for the selected period
                    </CardDescription>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                    {/* Summary Badges */}
                    <div className="hidden sm:flex items-center gap-2">
                        <div className="bg-green-50 border border-green-100 rounded-xl px-3 py-2 text-center min-w-[80px]">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Present</p>
                            <p className="text-lg font-black text-slate-800 leading-tight">{totalPresent.toLocaleString()}</p>
                        </div>
                        <div className="bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 text-center min-w-[80px]">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Absent</p>
                            <p className="text-lg font-black text-slate-800 leading-tight">{totalAbsent.toLocaleString()}</p>
                        </div>
                    </div>
                    {/* Period Toggle */}
                    <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
                        {['Day', 'Week', 'Month', 'Year'].map((period) => (
                            <button
                                key={period}
                                onClick={() => onPeriodChange(period)}
                                className={`px-2.5 sm:px-3 py-1.5 text-[10px] sm:text-[11px] font-bold rounded-lg transition-all ${activePeriod === period ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-white hover:text-slate-600 hover:shadow-sm'}`}
                            >
                                {period}
                            </button>
                        ))}
                    </div>
                </div>
            </CardHeader>

            {/* Mobile Summary Badges */}
            <div className="flex sm:hidden items-center gap-2 px-4 pb-2">
                <div className="bg-green-50 border border-green-100 rounded-xl px-3 py-2 text-center flex-1">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Present</p>
                    <p className="text-lg font-black text-slate-800 leading-tight">{totalPresent.toLocaleString()}</p>
                </div>
                <div className="bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 text-center flex-1">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Absent</p>
                    <p className="text-lg font-black text-slate-800 leading-tight">{totalAbsent.toLocaleString()}</p>
                </div>
            </div>

            <CardContent className="px-2 sm:px-6 pb-6 sm:pb-8">
                <ChartContainer
                    config={attendanceChartConfig}
                    className="w-full aspect-[2/1] sm:aspect-[5/2] min-h-[200px] max-h-[350px]"
                >
                    <BarChart
                        data={data}
                        margin={{ top: 10, right: 8, left: -10, bottom: 0 }}
                        barGap={2}
                        barCategoryGap={activePeriod === 'Month' ? '15%' : '25%'}
                    >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tickMargin={12}
                            tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                            interval={activePeriod === 'Month' ? 2 : 0}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                            width={35}
                        />
                        <ChartTooltip
                            cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
                            content={<ChartTooltipContent />}
                        />
                        <Bar
                            dataKey="present"
                            fill="#16a34a"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={activePeriod === 'Month' ? 14 : 28}
                        />
                        <Bar
                            dataKey="absent"
                            fill="#ef4444"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={activePeriod === 'Month' ? 14 : 28}
                        />
                    </BarChart>
                </ChartContainer>

                {/* Chart Legend */}
                <div className="flex items-center justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#16a34a' }} />
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Present</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#ef4444' }} />
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Absent</span>
                    </div>
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
    // Single card wrapper for all summary items as requested
    const stats = [
        { label: "Total", value: totalEmployees, icon: Users, color: "bg-blue-500", lightColor: "bg-blue-50" },
        { label: "Active", value: activeEmployees, icon: UserCheck, color: "bg-green-500", lightColor: "bg-green-50" },
        { label: "Inactive", value: inactive, icon: UserMinus, color: "bg-gray-400", lightColor: "bg-gray-50" },
        { label: "Present", value: present, icon: UserCheck, color: "bg-emerald-500", lightColor: "bg-emerald-50" },
        { label: "Absent", value: absent, icon: UserX, color: "bg-red-500", lightColor: "bg-red-50" },
        { label: "Depts", value: departments, icon: Building2, color: "bg-indigo-500", lightColor: "bg-indigo-50" },
        { label: "Roles", value: designations, icon: Briefcase, color: "bg-violet-500", lightColor: "bg-violet-50" },
        { label: "Locs", value: locations, icon: MapPin, color: "bg-teal-500", lightColor: "bg-teal-50" },
    ];

    return (
        <Card className="shadow-2xl rounded-[2rem] border-none bg-white p-6 md:p-8">
            <CardHeader className="px-0 pt-0 pb-8 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-2xl font-bold text-slate-800 tracking-tight">Employee Summary</CardTitle>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Live Updates</p>
                </div>
                <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wide">
                    Overview
                </div>
            </CardHeader>
            <CardContent className="px-0 pb-0">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors duration-300 group">
                            <div className={`w-12 h-12 ${stat.lightColor} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                                <stat.icon className={`w-8 h-8 ${stat.color} text-white p-2 rounded-lg`} />
                            </div>
                            <div>
                                <h4 className="text-4xl font-bold text-slate-800 leading-none mb-1">{stat.value}</h4>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
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
    title = "Attendance Statistics", // Updated title to match typical dashboard
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
                    className="mx-auto aspect-square max-h-[250px]"
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
                            innerRadius={60}
                            outerRadius={85}
                            paddingAngle={5}
                            strokeWidth={0}
                            animationBegin={0}
                            animationDuration={1500}
                        >
                            {displayData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                    </PieChart>
                </ChartContainer>

                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 mb-6">
                    {displayData.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }} />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{item.name}</span>
                        </div>
                    ))}
                </div>

                {/* Sub-cards */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 flex flex-col items-center text-center">
                        <span className="text-2xl font-bold text-slate-800 mb-1">{todaysLeaves}</span>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Today's Leaves</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 flex flex-col items-center text-center">
                        <span className="text-2xl font-bold text-slate-800 mb-1">{pendingRequests}</span>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Pending Requests</p>
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
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} width={100} axisLine={false} tickLine={false} />
                            <Tooltip
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} background={{ fill: '#f8fafc' }}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
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
                            <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} barSize={32}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[(index + 4) % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};
