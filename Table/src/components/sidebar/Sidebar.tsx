import {
  BrainIcon,
  ChartPieIcon,
  Search,
  Settings,
  Table2Icon,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { getAvatar } from '@/features/getAvatar';

// Menu items.
const items = [
  {
    title: 'Chart',
    url: '/chart',
    icon: ChartPieIcon,
  },
  {
    title: 'Table',
    url: '/table',
    icon: Table2Icon,
  },
  {
    title: 'AI',
    url: '/ai',
    icon: BrainIcon,
  },
  {
    title: 'Search',
    url: '#',
    icon: Search,
  },
  {
    title: 'Settings',
    url: '#',
    icon: Settings,
  },
];

export function AppSidebar() {
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <Sidebar className="border-r border-gray-200 bg-linear-to-b from-white to-gray-50">
      <SidebarContent className="p-4">
        {/* Logo/Brand Section */}
        <div className="mb-8 px-3">
          <h1 className="text-2xl font-bold gradient-text bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary">
            FOXWARE
          </h1>
          <p className="text-xs text-gray-500 mt-1 capitalize">
            project status
          </p>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="group">
                      <Link
                        to={item.url}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:shadow-sm hover:scale-[1.02] active:scale-[0.98] ${
                          isActive
                            ? 'bg-linear-to-r from-blue-50 to-indigo-200 text-blue-700 font-semibold'
                            : 'text-gray-700 hover:bg-linear-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700'
                        }`}
                      >
                        <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-100" />
                        <span className="font-medium text-sm">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Footer Section */}
        <div className="mt-auto pt-6 px-3 border-t border-gray-200">
          <div className="flex items-center gap-2 bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
            {/* avatar */}
            <Avatar>
              <AvatarImage className="object-cover" src={getAvatar(128)} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-base text-gray-600 font-medium">
                {user?.name}
              </h3>
              <h3 className="text-xs text-gray-600/50">{user?.email}</h3>
            </div>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
