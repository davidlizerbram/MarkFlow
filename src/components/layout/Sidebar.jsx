import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  Clock,
  Scale,
  Users,
  FileBarChart,
  Settings,
  Search,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'All Matters', href: '/matters', icon: FileText },
  { name: 'Deadlines', href: '/deadlines', icon: Clock },
  { name: 'TTAB Proceedings', href: '/ttab', icon: Scale },
]

const secondaryNavigation = [
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Reports', href: '/reports', icon: FileBarChart },
  { name: 'Conflict Watch', href: '/conflicts', icon: AlertTriangle },
]

export function Sidebar() {
  return (
    <div className="hidden border-r bg-card lg:block lg:w-64 lg:flex-shrink-0">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <Scale className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">MarkFlow</span>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          <Separator className="my-4" />

          <nav className="space-y-1">
            {secondaryNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          <Separator className="my-4" />

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )
            }
          >
            <Settings className="h-4 w-4" />
            Settings
          </NavLink>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t p-4">
          <div className="text-xs text-muted-foreground">
            <p>MarkFlow v1.0.0</p>
            <p className="mt-1">Trademark Docketing System</p>
          </div>
        </div>
      </div>
    </div>
  )
}
