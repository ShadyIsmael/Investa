import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NavigationItem, getNavigationForPath } from '@/core/navigation';
import { Icon } from '@/components/common/Icons';
import { usePermissions } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import { WorkspaceContext } from '@/components/layout/WorkspaceContext';
import { canAccessPolicy } from '@/core/routePolicy';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar, isCollapsed, toggleCollapse }) => {
  const { permissions } = usePermissions();
  const location = useLocation();
  const { t } = useTranslation();
  const navRef = useRef<HTMLElement>(null);
  const navigation = getNavigationForPath(location.pathname);
  const canRender = (item: NavigationItem) => !item.requiredPermissions?.length ||
    canAccessPolicy({ requiredPermissions: item.requiredPermissions, anyOf: item.anyOf }, permissions, true);
  const visibleNavigation = navigation.filter(canRender);

  useEffect(() => {
    if (!isCollapsed) navRef.current?.focus({ preventScroll: true });
  }, [location.pathname, isCollapsed]);

  const renderNavItem = (item: NavigationItem) => {
    const isActive = location.pathname === item.route || (item.route !== '/admin' && location.pathname.startsWith(`${item.route}/`));
    return (
      <Link key={item.key} to={item.route} title={isCollapsed ? t(item.labelKey) : undefined} aria-current={isActive ? 'page' : undefined} onClick={() => { if (window.innerWidth < 768) toggleSidebar(); }}>
        <div className={[
          'relative flex items-center gap-2 w-full px-2.5 py-2 rounded-md text-[13px] transition-colors duration-200 group',
          isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/70 font-medium',
          isCollapsed ? 'justify-center !px-2' : '',
        ].join(' ')}>
          {isActive && <span className="absolute inset-y-2 start-0 w-[3px] rounded-full bg-primary" aria-hidden="true" />}
          <Icon name={item.icon} className={['flex-shrink-0 w-[18px] h-[18px]', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'].join(' ')} />
          {!isCollapsed && <span className="truncate leading-none flex items-center gap-2">{t(item.labelKey)}{item.status === 'placeholder' && <span className="text-[9px] uppercase tracking-wide text-muted-foreground/70">{t('centralAdmin.status.planned')}</span>}</span>}
        </div>
      </Link>
    );
  };

  const renderSections = (group: NavigationItem['group']) => {
    const items = visibleNavigation.filter(item => item.group === group);
    const sections = [...new Set(items.map(item => item.section || group))];
    return sections.map(section => {
      const sectionItems = items.filter(item => (item.section || group) === section);
      const sectionLabelKey = sectionItems.find(item => item.sectionLabelKey)?.sectionLabelKey ||
        (group === 'workspace' ? 'centralAdmin.workspaceSection' : group === 'system' ? 'centralAdmin.systemSection' : undefined);
      return (
        <React.Fragment key={`${group}-${section}`}>
          {!isCollapsed && sectionLabelKey && <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground/60 px-2.5 pt-4 pb-1.5">{t(sectionLabelKey)}</p>}
          {sectionItems.map(renderNavItem)}
        </React.Fragment>
      );
    });
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden" onClick={toggleSidebar} aria-hidden="true" />}
      <aside
        aria-label={t('centralAdmin.sidebar')}
        style={{ zIndex: 'var(--z-fixed)' }}
        className={[
          'fixed md:static inset-y-0 start-0 flex flex-col bg-card border-e border-border transition-all duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          isCollapsed ? 'w-16' : 'w-64',
        ].join(' ')}
      >
        <div className={['border-b border-border px-3 py-3 flex-shrink-0', isCollapsed ? 'flex justify-center' : ''].join(' ')}>
          {isCollapsed ? <div className="w-8 h-8 rounded-md border border-border flex items-center justify-center"><Icon name="shield-check" className="w-4 h-4 text-muted-foreground" /></div> : <WorkspaceContext />}
        </div>
        <nav ref={navRef} tabIndex={-1} aria-label={t('centralAdmin.navigation')} className="flex-1 overflow-y-auto p-2.5 space-y-0.5 focus:outline-none">
          {!isCollapsed && <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground/60 px-2.5 pt-2 pb-1.5">{t('centralAdmin.navigation')}</p>}
          {renderSections('company')}
          {renderSections('workspace')}
          {renderSections('system')}
        </nav>
        <div className="p-2.5 border-t border-border">
          <button onClick={toggleCollapse} aria-expanded={!isCollapsed} title={isCollapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')} className="w-full flex items-center justify-center gap-2 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors text-xs font-medium">
            <Icon name={isCollapsed ? 'chevron-right' : 'chevron-left'} className="w-4 h-4" />
            {!isCollapsed && <span>{t('nav.collapse')}</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
