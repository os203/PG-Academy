"use client";

import { Search } from 'lucide-react';
import { UserButton, useUser } from '@clerk/nextjs';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/context/LanguageContext';

export default function DashboardNavbar() {
    const { user } = useUser();
    const { t } = useLanguage();

    return (
        <div className="sticky top-0 z-30 glass-dark flex items-center justify-between p-4 w-full h-16 border-b border-zinc-800/50">
            <div className="hidden sm:flex items-center ms-10 md:ms-0 gap-3 px-3 py-1.5 text-xs rounded-full border border-zinc-700/50 bg-zinc-800/30">
                <Search size={16} className="text-zinc-500" />
                <input type="text" className="flex-1 w-[150px] lg:w-[200px] transition-all duration-300 p-1 bg-transparent text-white placeholder:text-zinc-500 outline-none" placeholder={t('common.search') + "..."} />
            </div>
            <div className="flex items-center gap-3 justify-end w-full">
                <LanguageSwitcher variant="compact" />
                <div className="flex flex-col items-end">
                    <span className="text-sm leading-4 font-medium text-white">{user?.fullName || user?.firstName}</span>
                    <span className="text-[10px] text-zinc-500 pt-0.5">{user?.primaryEmailAddress?.emailAddress}</span>
                </div>
                <UserButton appearance={{ elements: { userButtonAvatarBox: "w-8 h-8 rounded-lg border border-[#bd9759]" } }} />
            </div>
        </div>
    );
}
