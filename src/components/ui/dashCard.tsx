
export default function DashCards({icon, title, number}:{icon: React.ReactNode, title:string, number: number}){
    return (
        <div className="min-w-[200px] rounded-2xl flex flex-col items-start flex-1 bg-transparent border border-[#bd9759]/20 p-6 gap-4 shadow-sm hover:border-[#bd9759]/40 hover:shadow-lg hover:shadow-[#bd9759]/10 transition-all duration-300 group">
            <span className="flex items-center justify-center bg-[#bd9759]/10 text-[#e0a84d] rounded-full w-14 h-14 group-hover:bg-[#bd9759]/20 transition-colors">{icon}</span>
            <span className="text-sm font-medium text-muted-foreground tracking-wide mt-2">{title}</span>
            <span className="text-2xl font-black text-white">{number}</span>
        </div>
    )
}