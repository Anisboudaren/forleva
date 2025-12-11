import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"
import { ReactNode } from "react"

type GradientVariant = 
  | "blue" 
  | "green" 
  | "purple" 
  | "yellow" 
  | "pink" 
  | "orange"
  | "teal"
  | "indigo"

const gradientVariants: Record<GradientVariant, string> = {
  blue: "from-sky-500 via-blue-500 to-indigo-500",
  green: "from-emerald-500 via-teal-500 to-cyan-500",
  purple: "from-violet-500 via-purple-500 to-fuchsia-500",
  yellow: "from-amber-400 via-yellow-400 to-orange-400",
  pink: "from-rose-400 via-pink-400 to-fuchsia-400",
  orange: "from-orange-400 via-amber-400 to-yellow-400",
  teal: "from-teal-500 via-cyan-500 to-sky-500",
  indigo: "from-indigo-500 via-purple-500 to-violet-500",
}

interface DashboardCardProps {
  variant?: GradientVariant
  icon?: LucideIcon
  title: string
  value: string | number
  description?: string | ReactNode
  className?: string
  children?: ReactNode
}

export function DashboardCard({
  variant = "blue",
  icon: Icon,
  title,
  value,
  description,
  className,
  children,
}: DashboardCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-br p-4 md:p-6 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]",
        gradientVariants[variant],
        className
      )}
    >
      {/* Decorative circles */}
      <div className="absolute -right-6 -top-6 md:-right-8 md:-top-8 h-16 w-16 md:h-24 md:w-24 rounded-full bg-white/10 blur-xl" />
      <div className="absolute -bottom-4 -left-4 md:-bottom-6 md:-left-6 h-20 w-20 md:h-32 md:w-32 rounded-full bg-white/5 blur-2xl" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2 md:mb-4">
          <h3 className="text-xs md:text-sm font-medium text-white/90">{title}</h3>
          {Icon && (
            <div className="rounded-lg bg-white/20 p-1.5 md:p-2 backdrop-blur-sm">
              <Icon className="h-4 w-4 md:h-5 md:w-5 text-white" />
            </div>
          )}
        </div>
        
        <div className="mb-1 md:mb-2">
          <div className="text-2xl md:text-3xl font-bold text-white">{value}</div>
        </div>
        
        {description && (
          <div className="text-[10px] md:text-xs text-white/80 mt-1 md:mt-2">
            {description}
          </div>
        )}
        
        {children && (
          <div className="mt-2 md:mt-4">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}

interface DashboardContentCardProps {
  title: string | ReactNode
  description?: string
  icon?: LucideIcon
  children: ReactNode
  className?: string
}

export function DashboardContentCard({
  title,
  description,
  icon: Icon,
  children,
  className,
}: DashboardContentCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl md:rounded-2xl bg-white p-4 md:p-6 shadow-lg transition-all duration-300 hover:shadow-xl border border-gray-100",
        className
      )}
    >
      <div className="mb-4 md:mb-6">
        {Icon && (
          <div className="flex items-center gap-2 md:gap-3 mb-2">
            <div className="rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-600 p-1.5 md:p-2">
              <Icon className="h-4 w-4 md:h-5 md:w-5 text-white" />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900">{title}</h2>
          </div>
        )}
        {!Icon && <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2">{title}</h2>}
        {description && (
          <p className="text-xs md:text-sm text-gray-600">{description}</p>
        )}
      </div>
      <div>{children}</div>
    </div>
  )
}

