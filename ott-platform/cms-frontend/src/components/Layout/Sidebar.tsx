import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Film, Tv, Upload, Users, BarChart2,
  Bell, Settings, Image, LogOut, ChevronLeft, ChevronRight,
  PlaySquare, ListVideo, Tag, BadgeDollarSign, Smartphone,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuthStore } from '@/stores/auth.store';
import { authApi } from '@/api/endpoints';
import toast from 'react-hot-toast';

interface NavItem {
  label:    string;
  to:       string;
  icon:     React.ReactNode;
  badge?:   number;
  children?: { label: string; to: string }[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',    to: '/',          icon: <LayoutDashboard size={18} /> },
  {
    label: 'Movies',
    to: '/movies',
    icon: <Film size={18} />,
    children: [
      { label: 'All Movies', to: '/movies' },
      { label: 'Add Top 10 Movie', to: '/movies/new?trending=true' },
    ],
  },
  { label: 'Series',       to: '/series',    icon: <Tv size={18} /> },
  { label: 'Upload',       to: '/upload',    icon: <Upload size={18} /> },
  { label: 'Encoding Queue', to: '/encoding', icon: <ListVideo size={18} /> },
  { label: 'Users',        to: '/users',     icon: <Users size={18} /> },
  { label: 'Analytics',    to: '/analytics', icon: <BarChart2 size={18} /> },
  { label: 'Default Avatars', to: '/banners',   icon: <Image size={18} /> },
  { label: 'Android Components', to: '/android-components', icon: <Smartphone size={18} /> },
  { label: 'Genres',       to: '/genres',    icon: <Tag size={18} /> },
  { label: 'Subscriptions',to: '/subscriptions', icon: <BadgeDollarSign size={18} /> },
  { label: 'Notifications',to: '/notifications', icon: <Bell size={18} /> },
  { label: 'Settings',     to: '/settings',  icon: <Settings size={18} /> },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout }          = useAuthStore();
  const navigate                  = useNavigate();
  const location                  = useLocation();

  // Keep track of which dropdown menus are expanded
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    NAV_ITEMS.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some((child) => {
          const childPath = child.to.split('?')[0];
          return (
            location.pathname === childPath ||
            location.pathname.startsWith(childPath)
          );
        });
        if (isChildActive) {
          setExpandedMenus((prev) => ({ ...prev, [item.label]: true }));
        }
      }
    });
  }, [location.pathname]);

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const handleParentClick = (item: NavItem) => {
    if (collapsed) {
      setCollapsed(false);
      setExpandedMenus((prev) => ({ ...prev, [item.label]: true }));
    } else {
      toggleMenu(item.label);
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch { /* ignore */ }
    logout();
    navigate('/login');
    toast.success('Logged out');
  };

  return (
    <aside className={cn(
      'flex h-screen flex-col border-r border-surface-700 bg-surface-800',
      'transition-all duration-300 ease-in-out',
      collapsed ? 'w-16' : 'w-64',
    )}>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-surface-700 px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <PlaySquare className="text-brand-500 shrink-0" size={24} />
            <span className="text-lg font-bold text-white tracking-tight">OTT Admin</span>
          </div>
        )}
        {collapsed && <PlaySquare className="mx-auto text-brand-500" size={24} />}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-1.5 text-surface-300 hover:bg-surface-700 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {NAV_ITEMS.map((item) => {
          if (item.children) {
            const isExpanded = expandedMenus[item.label];
            const isAnyActive = item.children.some((child) => {
              const childPath = child.to.split('?')[0];
              return (
                location.pathname === childPath ||
                (childPath === '/movies'
                  ? location.pathname.startsWith('/movies') &&
                    !location.pathname.includes('/new')
                  : location.pathname.startsWith(childPath))
              );
            });

            return (
              <div key={item.label} className="space-y-1">
                <button
                  type="button"
                  onClick={() => handleParentClick(item)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 text-left',
                    isAnyActive
                      ? 'bg-brand-500/20 text-brand-400 border border-brand-500/20'
                      : 'text-surface-200 hover:bg-surface-700 hover:text-white',
                    collapsed && 'justify-center'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {!collapsed && (
                    <ChevronDown
                      size={16}
                      className={cn(
                        'ml-auto transition-transform duration-200 text-surface-400',
                        isExpanded && 'rotate-180'
                      )}
                    />
                  )}
                </button>

                {isExpanded && !collapsed && (
                  <div className="mt-1 ml-6 pl-3 border-l border-surface-700 space-y-1">
                    {item.children.map((child) => {
                      const isChildActive = child.to.includes('?')
                        ? location.pathname + location.search === child.to ||
                          (location.pathname === child.to.split('?')[0] &&
                            location.search.includes('trending=true'))
                        : location.pathname === child.to ||
                          (child.to === '/movies' &&
                            location.pathname.startsWith('/movies') &&
                            !location.pathname.includes('/new'));

                      return (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          className={cn(
                            'block rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150',
                            isChildActive
                              ? 'text-brand-400 font-semibold bg-brand-500/10'
                              : 'text-surface-300 hover:bg-surface-700 hover:text-white'
                          )}
                        >
                          {child.label}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                'transition-all duration-150',
                isActive
                  ? 'bg-brand-500/20 text-brand-400 border border-brand-500/20'
                  : 'text-surface-200 hover:bg-surface-700 hover:text-white',
                collapsed && 'justify-center',
              )}
              title={collapsed ? item.label : undefined}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && item.badge ? (
                <span className="ml-auto rounded-full bg-brand-500 px-2 py-0.5 text-xs font-bold text-white">
                  {item.badge}
                </span>
              ) : null}
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="border-t border-surface-700 p-3">
        {!collapsed && user && (
          <div className="mb-2 flex items-center gap-3 rounded-lg px-2 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white uppercase">
              {user.displayName?.[0] || user.email[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-white">{user.displayName || 'Admin'}</p>
              <p className="truncate text-xs text-surface-300">{user.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm',
            'text-surface-300 hover:bg-surface-700 hover:text-red-400 transition-colors',
            collapsed && 'justify-center',
          )}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={16} className="shrink-0" />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </aside>
  );
}
