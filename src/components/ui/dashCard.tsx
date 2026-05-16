
export default function DashCards({icon, title, number}:{icon: React.ReactNode, title:string, number: number}){
    return (
        <div className="min-w-[200px] rounded-2xl flex flex-col flex-1 bg-card border border-border p-6 gap-4 shadow-sm dark:border-purple-500/20 dark:shadow-purple-500/10 hover:border-primary/40 dark:hover:border-purple-400/40 hover:shadow-lg dark:hover:shadow-purple-500/10 transition-all duration-300 group">
            <span className="flex items-center justify-center bg-primary/10 text-primary dark:bg-purple-500/15 dark:text-purple-400 rounded-2xl w-14 h-14 group-hover:bg-primary/20 dark:group-hover:bg-purple-500/25 transition-colors">{icon}</span>
            <span className="text-sm font-medium text-muted-foreground tracking-wide">{title}</span>
            <span className="text-2xl font-black text-foreground dark:text-purple-300">{number}</span>
        </div>
    )
}