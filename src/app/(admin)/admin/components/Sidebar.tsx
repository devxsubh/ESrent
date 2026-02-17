'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useApi';
import Image from 'next/image';
import { 
  Car, 
  Tag, 
  BarChart3, 
  Settings,
  LogOut,
  MessageSquare,
  Building2,
  Sparkles,
  Video,
  CalendarCheck,
  Ticket,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { 
    name: 'Dashboard', 
    href: '/admin', 
    icon: BarChart3,
    description: 'Overview & Analytics'
  },
  { 
    name: 'Bookings', 
    href: '/admin/bookings', 
    icon: CalendarCheck,
    description: 'Booking Requests'
  },
  { 
    name: 'Coupons', 
    href: '/admin/coupons', 
    icon: Ticket,
    description: 'Discount Coupons'
  },
  { 
    name: 'Cars', 
    href: '/admin/cars', 
    icon: Car,
    description: 'Manage Vehicles'
  },
  { 
    name: 'Brands', 
    href: '/admin/brands', 
    icon: Building2,
    description: 'Car Manufacturers'
  },
  { 
    name: 'Categories', 
    href: '/admin/categories', 
    icon: Tag,
    description: 'Vehicle Types'
  },
  { 
    name: 'Reviews', 
    href: '/admin/reviews', 
    icon: MessageSquare,
    description: 'Customer Feedback'
  },
  { 
    name: 'Video Testimonials', 
    href: '/admin/video-testimonials', 
    icon: Video,
    description: 'Video Customer Reviews'
  },
  { 
    name: 'Settings', 
    href: '/admin/settings', 
    icon: Settings,
    description: 'System Configuration'
  },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' }); // optional, for completeness
      logout();
      setTimeout(() => {
        router.replace('/admin/login');
      }, 100); // 100ms delay to allow state to update
    } catch {
      alert('Logout failed');
    }
  };

  return (
    <div className={cn(
      "bg-gradient-to-b from-card via-card/95 to-card/90 border-r border-border/50 h-full flex flex-col backdrop-blur-sm transition-all duration-300 ease-in-out relative",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Toggle Button */}
      {onToggle && (
        <button
          onClick={onToggle}
          className="absolute top-4 -right-3 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center shadow-md hover:bg-accent transition-colors z-10 hidden lg:flex"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-foreground" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-foreground" />
          )}
        </button>
      )}
      
      {/* Header */}
      <div className={cn(
        "border-b border-border/50 transition-all duration-300",
        collapsed ? "p-4" : "p-6"
      )}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center p-1 flex-shrink-0">
            <Image
              src="/images/ES logo (1).svg"
              alt="ES Rent Logo"
              width={32}
              height={32}
              className="w-full h-full object-contain"
            />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                ES Rental
              </h1>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-2">
        {!collapsed && (
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
              Navigation
            </h3>
          </div>
        )}
        
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex items-center rounded-xl text-sm font-medium transition-all duration-200',
                collapsed ? 'justify-center px-3 py-3' : 'gap-3 px-4 py-3',
                isActive
                  ? 'bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/10'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground hover:shadow-md'
              )}
              title={collapsed ? item.name : undefined}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary to-primary/60 rounded-r-full"></div>
              )}
              
              <div className={cn(
                'rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0',
                collapsed ? 'w-10 h-10' : 'w-8 h-8',
                isActive
                  ? 'bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg'
                  : 'bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
              )}>
                <Icon className={cn(collapsed ? 'w-5 h-5' : 'w-4 h-4')} />
              </div>
              
              {!collapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{item.name}</div>
                    <div className={cn(
                      'text-xs transition-colors',
                      isActive ? 'text-primary/70' : 'text-muted-foreground/60'
                    )}>
                      {item.description}
                    </div>
                  </div>
                  
                  {/* Hover effect */}
                  {!isActive && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Sparkles className="w-3 h-3 text-primary/50" />
                    </div>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={cn(
        "border-t border-border/50 transition-all duration-300",
        collapsed ? "p-3" : "p-4"
      )}>
        {!collapsed && (
          <div className="bg-gradient-to-r from-muted/30 to-muted/20 rounded-xl p-3 mb-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Admin Access</span>
            </div>
            <p className="text-xs text-muted-foreground/70">
              Full system control
            </p>
          </div>
        )}
        
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center w-full rounded-xl text-sm font-medium text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 group",
            collapsed ? "justify-center px-3 py-3" : "gap-3 px-4 py-3"
          )}
          title={collapsed ? "Logout" : undefined}
        >
          <div className={cn(
            "rounded-lg bg-muted/50 flex items-center justify-center group-hover:bg-red-500/20 transition-colors flex-shrink-0",
            collapsed ? "w-10 h-10" : "w-8 h-8"
          )}>
            <LogOut className={cn(collapsed ? "w-5 h-5" : "w-4 h-4")} />
          </div>
          {!collapsed && <span className="truncate">Logout</span>}
        </button>
      </div>
    </div>
  );
}
