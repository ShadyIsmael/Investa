import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NavItem } from '@/types';
import { NAV_ITEMS } from '@/utils/constants';
import { Icon } from '@/components/common/Icons';
import { usePermissions } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  toggleSidebar,
  isCollapsed,
  toggleCollapse,
}) => {
  const { hasAnyPermission, hasAllPermissions } = usePermissions();
  const location = useLocation();
  const { t } = useTranslation();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  useEffect(() => {
    if (isCollapsed) return;
    NAV_ITEMS.forEach(item => {
      if (item.children?.some(c => c.path === location.pathname)) {
        setExpandedMenu(item.id);
      }
    });
  }, [location.pathname, isCollapsed]);

  const toggleExpand = (id: string) => !isCollapsed && setExpandedMenu(p => p === id ? null : id);

  const renderNavItem = (item: NavItem, isSubItem = false) => {
    if (item.permissions?.length) {
      const ok = item.requireAll
        ? hasAllPermissions(...item.permissions)
        : hasAnyPermission(...item.permissions);
      if (!ok) return null;
    }

    const hasChildren = !!item.children?.length;
    const isExpanded  = expandedMenu === item.id;
    const isActive    = location.pathname === item.path;
    const isParent    = item.children?.some(c => location.pathname.startsWith(c.path || ''));

    const inner = (
      <div
        className={[
          'relative flex items-center justify-between gap-2 w-full px-2.5 py-2 rounded-lg text-[13px] transition-all duration-200 group',
          isActive  ? 'bg-primary/10 text-primary font-semibold' : '',
          isParent && !hasChildren ? 'text-foreground font-medium' : '',
          !isActive && !isParent   ? 'text-muted-foreground hover:text-foreground hover:bg-secondary/70 font-medium' : '',
          isSubItem ? 'ps-5 text-xs py-1.5' : '',
          isCollapsed ? '!px-2 justify-center' : '',
        ].join(' ')}
      >
        {/* Active accent bar */}
        {isActive && !isSubItem && (
          <span className="absolute inset-y-2 start-0 w-[3px] rounded-full bg-primary" />
        )}
        <div className={['flex items-center gap-2.5', isCollapsed ? 'justify-center w-full' : ''].join(' ')}>
          <Icon
            name={item.iconName}
            className={[
              'flex-shrink-0',
              isActive ? 'w-[18px] h-[18px] text-primary' : 'w-[18px] h-[18px] text-muted-foreground group-hover:text-foreground transition-colors',
              isSubItem ? '!w-4 !h-4 opacity-70' : '',
            ].join(' ')}
          />
          {!isCollapsed && (
            <span className="truncate leading-none">{t(item.labelKey || item.label, { defaultValue: item.label })}</span>
          )}
        </div>
        {hasChildren && !isCollapsed && (
          <Icon name="chevron-right"
            className={['w-3.5 h-3.5 opacity-40 transition-transform duration-200', isExpanded ? 'rotate-90' : ''].join(' ')}
          />
        )}
      </div>
    );

    return (
      <div key={item.id} className="w-full">
        {hasChildren
          ? <button className="w-full text-start" title={isCollapsed ? t(item.labelKey || item.label, { defaultValue: item.label }) : undefined} onClick={() => toggleExpand(item.id)}>{inner}</button>
          : <Link to={item.path || '/'} title={isCollapsed ? t(item.labelKey || item.label, { defaultValue: item.label }) : undefined} onClick={() => { if (window.innerWidth < 768) toggleSidebar(); }}>{inner}</Link>
        }
        {!isCollapsed && hasChildren && (
          <div className={['overflow-hidden transition-all duration-300', isExpanded ? 'max-h-96 mt-0.5 mb-1' : 'max-h-0'].join(' ')}>
            <div className="ms-5 border-s border-border ps-2 space-y-0.5 py-1">
              {item.children!.map(c => renderNavItem(c, true))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        style={{ zIndex: 'var(--z-fixed)' }}
        className={[
          'fixed md:static inset-y-0 start-0 flex flex-col bg-card border-e border-border transition-all duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          isCollapsed ? 'w-16' : 'w-64',
        ].join(' ')}
      >
        {/* Brand */}
        <div className={['h-14 flex items-center border-b border-border px-3 flex-shrink-0', isCollapsed ? 'justify-center' : 'gap-2.5'].join(' ')}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-sky-500/30">
            <Icon name="trending-up" className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <span className="text-base font-black tracking-tighter text-foreground select-none">Investa</span>
              <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground -mt-0.5">Admin Portal</span>
            </div>
          )}
        </div>

        {/* Nav list */}
        <nav className="flex-1 overflow-y-auto p-2.5 space-y-0.5">
          {!isCollapsed && (
            <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground/60 px-2.5 pt-2 pb-1.5">
              {t('nav.mainMenu', { defaultValue: 'Main Menu' })}
            </p>
          )}
          {NAV_ITEMS.map(item => renderNavItem(item))}
        </nav>


        <div className="p-2.5 border-t border-border">
          <button
            onClick={toggleCollapse}
            title={isCollapsed ? t('nav.expandSidebar', { defaultValue: 'Expand sidebar' }) : t('nav.collapseSidebar', { defaultValue: 'Collapse sidebar' })}
            className="w-full flex items-center justify-center gap-2 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all text-xs font-medium"
          >
            <Icon name={isCollapsed ? 'chevron-right' : 'chevron-left'} className="w-4 h-4" />
            {!isCollapsed && <span>{t(isCollapsed ? 'nav.expand' : 'nav.collapse', { defaultValue: isCollapsed ? 'Expand' : 'Collapse' })}</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
