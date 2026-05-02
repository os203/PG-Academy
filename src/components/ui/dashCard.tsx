
export default function DashCards({icon, title, number}:{icon: React.ReactNode, title:string, number: number}){
    return (
        <div className=" min-w-60 rounded-2xl flex flex-col flex-1 odd:bg-background even:text-brand-accent even:bg-foreground/95 p-8 gap-4">
            <span>{icon}</span>
            <span className="text-muted-accent">{title}</span>
            <span className="text-xl font-bold" >{number}</span>
        </div>

    )
}