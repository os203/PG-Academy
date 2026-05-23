import { Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from "../ui/ThemeToggle";

export default function DashboardNavbar() {

    const { user } = useAuth();



    return (
        <div className="sticky top-0 glass bg-linear-to-br from-brand-accent to-brand-primary shadow-lg shadow-brand-accent/20 flex items-center justify-between bg-background p-4 w-full h-18">
            <div className=" hidden  sm:flex items-center ml-10 md:ml-0 gap-3 px-2 py-1 text-xs rounded-full ring-[1.5px] ring-gray-700">
                <Search size={21} />
                <input type="text" className="flex-1 w-[150px] lg:w-[200px] transition-all duration-300 p-2 bg-transparent" placeholder="search...." />
            </div>
            <div className="flex items-center gap-4 justify-end w-full">
                <ThemeToggle />
                <div className="flex flex-col">
                    <span className="text-l leading-3 font-medium">{user?.name} </span>
                    <span className="text-[9px] text-muted-foreground text-right pt-2">{user?.email} </span>
                </div>
                <div className="w-7 h-7 rounded-full bg-brand-primary flex items-center justify-center text-white text-xs font-bold overflow-hidden cursor-pointer">
                    {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user?.name} className="w-full h-full object-cover" />
                    ) : (
                        <span>{user?.name ? user.name.charAt(0).toUpperCase() : "U"}</span>
                    )}
                </div>
            </div>


        </div>
    )
}
