
export default function DashCards({icon, title, number}:{icon: React.ReactNode, title:string, number: number}){
    return (
        <div className="min-w-[200px] rounded-2xl flex flex-col items-start flex-1 bg-transparent border border-purple-500/20 p-6 gap-4 shadow-sm hover:border-purple-400/40 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 group">
            <span className="flex items-center justify-center bg-purple-500/10 text-purple-400 rounded-full w-14 h-14 group-hover:bg-purple-500/20 transition-colors">{icon}</span>
            <span className="text-sm font-medium text-muted-foreground tracking-wide mt-2">{title}</span>
            <span className="text-2xl font-black text-white">{number}</span>
        </div>
    )
}