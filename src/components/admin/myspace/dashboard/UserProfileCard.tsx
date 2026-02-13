import React from 'react';
import { User } from 'lucide-react';

interface UserProfileCardProps {
    user: {
        firstName: string;
        lastName: string;
        designation: string;
        profileImage?: string;
    } | null;
}

export const UserProfileCard = ({ user }: UserProfileCardProps) => {
    return (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] p-6 text-white shadow-xl flex items-center gap-6 h-full min-h-[140px] relative overflow-hidden group">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>

            <div className="relative z-10 w-20 h-20 rounded-full bg-white/20 p-1 backdrop-blur-sm">
                <div className="w-full h-full rounded-full bg-white/10 overflow-hidden flex items-center justify-center border border-white/20">
                    {user?.profileImage ? (
                        <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-8 h-8 text-white/80" />
                    )}
                </div>
            </div>

            <div className="relative z-10 flex-1">
                <p className="text-blue-100 text-xs font-bold tracking-widest uppercase mb-1">Administrator</p>
                <h2 className="text-2xl font-bold leading-tight mb-2">
                    {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
                </h2>
                <div className="inline-block px-3 py-1 bg-white/20 rounded-lg backdrop-blur-md border border-white/10">
                    <p className="text-xs font-bold tracking-wide text-white">
                        {user?.designation || 'N/A'}
                    </p>
                </div>
            </div>
        </div>
    );
};
