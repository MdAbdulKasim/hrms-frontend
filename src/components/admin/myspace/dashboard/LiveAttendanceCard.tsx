import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';

interface LiveAttendanceCardProps {
    isCheckedIn: boolean;
    checkInTime?: string;
    onCheckIn: () => void;
    onCheckOut: () => void;
    loading?: boolean;
    isOnLeave?: boolean;
}

export const LiveAttendanceCard = ({
    isCheckedIn,
    checkInTime,
    onCheckIn,
    onCheckOut,
    loading,
    isOnLeave = false
}: LiveAttendanceCardProps) => {
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        if (isCheckedIn && checkInTime && !isOnLeave) {
            const start = new Date(checkInTime).getTime();
            setDuration(Math.floor((Date.now() - start) / 1000));
            const timer = setInterval(() => {
                setDuration(Math.floor((Date.now() - start) / 1000));
            }, 1000);
            return () => clearInterval(timer);
        } else {
            setDuration(0);
        }
    }, [isCheckedIn, checkInTime, isOnLeave]);

    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        const pad = (num: number) => String(num).padStart(2, '0');
        return `${pad(hours)} : ${pad(minutes)} : ${pad(secs)}`;
    };

    return (
        <div className="bg-[#0f172a] rounded-[2rem] p-6 h-full min-h-[140px] flex items-center justify-between relative overflow-hidden shadow-xl border border-slate-800">
            {/* Dark theme decorative elements */}
            <div className="absolute top-0 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>

            <div className="relative z-10 flex-1">
                <p className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-4">Live Attendance</p>
                <div className="flex items-center gap-4">
                    <div className="font-mono text-4xl font-bold text-white tracking-wider tabular-nums">
                        {formatTime(duration)}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${isOnLeave ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : isCheckedIn ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                        {isOnLeave ? 'On Leave' : isCheckedIn ? 'Active' : 'Idle'}
                    </span>
                </div>
                <p className="text-slate-500 text-xs mt-3 font-medium">
                    {isOnLeave ? 'Approved leave for today' : isCheckedIn
                        ? 'System tracking your active hours'
                        : 'System ready to check-in'
                    }
                </p>
            </div>

            <div className="relative z-10">
                <button
                    onClick={isCheckedIn ? onCheckOut : onCheckIn}
                    disabled={loading || isOnLeave}
                    className={`h-14 px-8 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2 ${loading || isOnLeave ? 'opacity-70 cursor-not-allowed bg-slate-700 text-slate-400' :
                        isCheckedIn
                            ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/30'
                            : 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/30'
                        }`}
                >
                    {loading ? (
                        <span>Processing...</span>
                    ) : (
                        <>
                            {isOnLeave ? 'On Leave' : isCheckedIn ? 'Check Out' : 'Check-in Now'}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
