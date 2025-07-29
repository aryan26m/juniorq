import Link from 'next/link';
import { Home, BookOpen, ClipboardList, BarChart2, Video, User, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type SidebarProps = React.HTMLAttributes<HTMLDivElement>;

const sidebarItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Resources', href: '/resources', icon: BookOpen },
  { name: 'Assignments', href: '/assignments', icon: ClipboardList },
  { name: 'Progress', href: '/progress', icon: BarChart2 },
  { name: 'Live Sessions', href: '/sessions', icon: Video },
  { name: 'Quizzes', href: '/quizzes', icon: ClipboardList },
  { name: 'Notes', href: '/notes', icon: BookOpen },
  { name: 'Profile', href: '/profile', icon: User },
];

export function Sidebar({ className }: SidebarProps) {
  return (
    <div className={cn('pb-12', className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            JuniorQ
          </h2>
          <p className="px-4 text-sm text-gray-500">KNIT Sultanpur</p>
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                className="w-full justify-start"
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Link>
              </Button>
            ))}
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Account
          </h2>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
