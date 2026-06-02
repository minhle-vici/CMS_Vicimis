"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import AcknowledgePopup from './AcknowledgePopup';

const ROLE_COLORS = {
  Admin: '#ef4444',
  IT: '#3b82f6',
  AM: '#f472b6',
  Sale: '#f59e0b',
  Designer: '#10b981',
};

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;
  const isAdmin = role === 'Admin';

  const menuItems = [
    { name: 'Dashboard', icon: 'bx-grid-alt', path: '/', roles: ['Admin'] },
    { name: 'Websites', icon: 'bx-globe', path: '/websites', roles: ['Admin', 'IT', 'AM', 'Sale'] },
    { name: 'My Task', icon: 'bx-task', path: '/my-tasks', roles: ['Admin', 'IT', 'AM', 'Sale', 'Designer'] },
    { name: 'Thư mục', icon: 'bx-folder-open', path: '/folders', roles: ['Admin', 'IT', 'AM', 'Sale', 'Designer'] },
    { name: 'Chat', icon: 'bx-message-dots', path: '/chat', roles: ['Admin', 'IT', 'AM', 'Sale', 'Designer'] },
    { name: 'Team Management', icon: 'bx-group', path: '/team', roles: ['Admin', 'IT', 'AM', 'Sale', 'Designer'], managerOnly: true },
    { name: 'Booking', icon: 'bx-calendar-event', path: '/booking', roles: ['Admin', 'AM', 'Sale'] },
    { name: 'Employees', icon: 'bx-user-circle', path: '/users', roles: ['Admin'] },
  ];

  const visibleItems = menuItems.filter(item => {
    const hasRole = !role || item.roles.includes(role);
    if (item.managerOnly) {
      return hasRole && (session?.user?.is_manager || role === 'Admin');
    }
    return hasRole;
  });

  return (
    <>
      <AcknowledgePopup />
      <div className="sidebar-overlay" onClick={() => document.body.classList.remove('sidebar-open')} />
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">
            <img style={{ width: '45px', height: '45px' }} src="/img/logo.webp" alt="Vicimis" />
          </div>
          <h2>Vicimis<span>CMS</span></h2>
        </div>

        <nav className="menu">
          <p className="menu-title">Main Menu</p>
          {visibleItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`menu-item ${pathname === item.path ? 'active' : ''}`}
              onClick={() => document.body.classList.remove('sidebar-open')}
            >
              <i className={`bx ${item.icon}`} />
              <span>{item.name}</span>
              {item.badge && <span className="badge">{item.badge}</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          {isAdmin && (
            <Link href="/settings" className={`menu-item ${pathname === '/settings' ? 'active' : ''}`} onClick={() => document.body.classList.remove('sidebar-open')}>
              <i className='bx bx-cog' />
              <span>Cài đặt hệ thống</span>
            </Link>
          )}

          {/* User Info */}
          {session?.user && (
            <div className="sidebar-user">
              <img
                src={`https://ui-avatars.com/api/?name=${session.user.name}&background=${(ROLE_COLORS[role] || '6366f1').replace('#', '')}&color=fff`}
                alt={session.user.name}
                className="sidebar-avatar"
              />
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">{session.user.name}</span>
                <span className="sidebar-user-role" style={{ color: ROLE_COLORS[role] || '#6366f1' }}>
                  {role}
                </span>
              </div>
            </div>
          )}

          <button
            className="menu-item logout-btn"
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            <i className='bx bx-log-out' />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>
    </>
  );
}
