
export default function DashCards({icon, title, number}:{icon: React.ReactNode, title:string, number: number}){
    return (
        <div className=" min-w-60 rounded-2xl flex flex-col flex-1 even:text-brand-accent bg-gray-100 shadow-md dark:shadow-brand-accent/20 dark:bg-gray-900 p-8 gap-4">
            <span className="flex items-center justify-center bg-gray-200 dark:bg-purple-300  rounded-2xl w-14 h-14">{icon}</span>
            <span className="text-muted-accent">{title}</span>
            <span className="text-xl font-bold" >{number}</span>
        </div>

    )
}