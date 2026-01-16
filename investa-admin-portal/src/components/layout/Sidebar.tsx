
import React, { useState, useEffect } from 'react';
import { NavItem, User } from '@/types';
import { NAV_ITEMS } from '@/utils/constants';
import { Icon } from '@/components/common/Icons';
import { usePermissions } from '@/context/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (id: string) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  isOpen, 
  toggleSidebar, 
  isCollapsed, 
  toggleCollapse,
  userRole // Deprecated - not used
}) => {
  const { hasAnyPermission, hasAllPermissions } = usePermissions();
  
  // expandedMenu tracks the ID of the SINGLE expanded parent menu
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  // Automatically handle parent expansion based on activeTab
  useEffect(() => {
    if (isCollapsed) return;

    NAV_ITEMS.forEach(item => {
      if (item.children && item.children.length > 0) {
        const hasActiveChild = item.children.some(child => child.id === activeTab);
        if (hasActiveChild) {
          setExpandedMenu(item.id);
        }
      }
    });
  }, [activeTab, isCollapsed]);

  const toggleExpand = (id: string) => {
    if (isCollapsed) return;
    // Mutex logic: if clicking the already open menu, close it; otherwise, open it and close others
    setExpandedMenu(prev => (prev === id ? null : id));
  };

  const isChildActive = (item: NavItem) => {
    return item.children?.some(child => child.id === activeTab);
  };

  const renderNavItem = (item: NavItem, isSubItem = false, index = 0) => {
    // Permission-based filtering - strict mode
    if (item.permissions && item.permissions.length > 0) {
      const hasAccess = item.requireAll
        ? hasAllPermissions(...item.permissions)
        : hasAnyPermission(...item.permissions);
      
      if (!hasAccess) {
        return null; // Hide completely from DOM if no permission
      }
    }

    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenu === item.id;
    const isActive = activeTab === item.id;
    const isParentOfActive = isChildActive(item);

    return (
      <div 
        key={item.id} 
        className={`w-full ${isSubItem ? 'animate-in fade-in slide-in-from-left-1 duration-200' : ''}`}
        style={isSubItem ? { animationDelay: `${index * 30}ms` } : {}}
      >
        <button
          title={isCollapsed ? item.label : undefined}
          onClick={() => {
            if (hasChildren && !isCollapsed) {
              toggleExpand(item.id);
            } else {
              setActiveTab(item.id);
              if (window.innerWidth < 768) toggleSidebar();
            }
          }}
          className={`
            w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 group relative
            ${isActive 
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/20' 
              : isParentOfActive 
                ? 'bg-slate-800/30 text-indigo-300' 
                : 'text-slate-500 hover:text-white hover:bg-slate-800/50'}
            ${isSubItem ? 'pl-7 text-[10.5px] opacity-90' : ''}
            ${isCollapsed ? 'justify-center px-0 h-9 w-9 mx-auto mb-1' : ''}
          `}
        >
          {/* Active Accent Bar */}
          {isActive && !isSubItem && !isCollapsed && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-white rounded-r-full animate-in zoom-in-y duration-200" />
          )}

          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'}`}>
            <div className={`
              flex-shrink-0 transition-all duration-200
              ${isActive ? 'scale-105 text-white' : 'group-hover:scale-110 text-slate-500 group-hover:text-white'}
              ${isSubItem ? 'scale-90 opacity-60' : ''}
            `}>
              <Icon name={item.iconName} className={isSubItem ? "w-3 h-3" : "w-4 h-4"} />
            </div>
            
            {!isCollapsed && (
              <span className={`truncate max-w-[150px] tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            )}
          </div>
          
          {hasChildren && !isCollapsed && (
            <Icon 
              name="chevron-right" 
              className={`w-2.5 h-2.5 opacity-30 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} 
            />
          )}

          {/* Collapsed Tooltip Indicator */}
          {isActive && isCollapsed && (
            <div className="absolute -right-0.5 w-1 h-3 bg-indigo-500 rounded-full" />
          )}
        </button>

        {!isCollapsed && (
          <div className={`
            overflow-hidden transition-all duration-300 ease-in-out
            ${hasChildren && isExpanded ? 'max-h-96 opacity-100 mt-0.5 mb-1.5' : 'max-h-0 opacity-0'}
          `}>
            <div className="space-y-0.5 ml-3.5 border-l border-slate-800/40">
              {hasChildren && item.children!.map((child, idx) => renderNavItem(child, true, idx))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-20 md:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      <aside 
        className={`
          fixed md:static inset-y-0 left-0 z-30
          bg-slate-950 text-white transform transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 border-r border-slate-900 shadow-xl
          ${isCollapsed ? 'w-14' : 'w-64'}
        `}
      >
        <div className="h-full flex flex-col overflow-hidden">
          {/* Compact Logo Area */}
          <div className={`h-12 flex items-center border-b border-slate-900 transition-all ${isCollapsed ? 'justify-center' : 'px-4'}`}>
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/10 group-hover:scale-105 transition-transform duration-200">
                <Icon name="hands" className="text-white w-4 h-4" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col animate-in fade-in duration-300">
                  <span className="text-sm font-bold leading-none tracking-tight">Investa</span>
                  <span className="text-[8px] text-indigo-400/80 font-bold uppercase tracking-[0.15em] leading-none mt-0.5">Financial Portal</span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Items */}
          <nav className={`flex-1 py-4 space-y-0.5 overflow-y-auto scrollbar-hide ${isCollapsed ? 'px-1' : 'px-2'}`}>
            {!isCollapsed && (
              <div className="px-2 mb-2">
                <span className="text-[9px] font-bold text-slate-700 uppercase tracking-widest select-none">Navigation</span>
              </div>
            )}
            {(() => {
              const visible = NAV_ITEMS.some(item => {
                // If item has no permission requirement, treat as visible
                if (!item.permissions || item.permissions.length === 0) return true;
                return item.requireAll ? hasAllPermissions(...item.permissions) : hasAnyPermission(...item.permissions);
              });

              if (!visible) {
                return (
                  <div className="px-2">
                    <div className="text-[12px] font-semibold text-slate-400">Fallback Menu</div>
                    <div className="mt-2">
                      <button onClick={() => { setActiveTab('dashboard'); if (window.innerWidth < 768) toggleSidebar(); }} className="w-full text-left px-2 py-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800">Dashboard</button>
                      <button onClick={() => { setActiveTab('support-dashboard'); if (window.innerWidth < 768) toggleSidebar(); }} className="w-full text-left px-2 py-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800">Support</button>
                    </div>
                  </div>
                );
              }

              return NAV_ITEMS.map((item) => renderNavItem(item));
            })()}
          </nav>

          {/* Compact Footer Toggle */}
          <div className="p-2 border-t border-slate-900 bg-slate-950/40">
             <button 
                onClick={toggleCollapse}
                className={`
                  w-full flex items-center gap-2 py-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800/40 transition-all duration-200
                  ${isCollapsed ? 'justify-center' : 'px-2'}
                `}
             >
                <div className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </div>
                {!isCollapsed && (
                  <span className="text-[11px] font-medium">Collapse Sidebar</span>
                )}
             </button>
            {/* Dev helper: force all permissions for testing (visible in development only) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => { try { localStorage.setItem('forceAllPermissions','true'); localStorage.setItem('token','dev'); } catch(e){}; location.reload(); }}
                  title="Enable all permissions (dev)"
                  className="px-2 py-1 text-xs bg-emerald-600 text-white rounded-md"
                >Enable Dev Perms</button>
                <button
                  onClick={() => { try { localStorage.removeItem('forceAllPermissions'); localStorage.removeItem('token'); } catch(e){}; location.reload(); }}
                  title="Disable dev override"
                  className="px-2 py-1 text-xs bg-rose-600 text-white rounded-md"
                >Disable Dev Perms</button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
