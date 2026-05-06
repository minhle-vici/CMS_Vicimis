import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'My Tasks', icon: 'bx-task', path: '/' },
    { name: 'Websites', icon: 'bx-globe', path: '/websites' },
    { name: 'Users', icon: 'bx-user-circle', path: '/users' },
    { name: 'Booking', icon: 'bx-calendar-event', path: '/booking' },
    { name: 'Demo Gallery', icon: 'bx-layer', path: '/demos' },
  ];

  return (
    <>
      <div className="sidebar-overlay" onClick={() => document.body.classList.remove('sidebar-open')}></div>
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon"><img style={{ width: '45px', height: '45px' }} src="/img/logo.webp" alt="" />  </div>
          <h2>Vicimis<span>CMS</span></h2>
        </div>

        <nav className="menu">
          <p className="menu-title">Main Menu</p>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`menu-item ${pathname === item.path ? 'active' : ''}`}
              onClick={() => document.body.classList.remove('sidebar-open')}
            >
              <i className={`bx ${item.icon}`}></i>
              <span>{item.name}</span>
              {item.badge && <span className="badge">{item.badge}</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link href="/settings" className={`menu-item ${pathname === '/settings' ? 'active' : ''}`} onClick={() => document.body.classList.remove('sidebar-open')}>
            <i className='bx bx-cog'></i>
            <span>Settings</span>
          </Link>
          <Link href="/logout" className="menu-item" onClick={() => document.body.classList.remove('sidebar-open')}>
            <i className='bx bx-log-out'></i>
            <span>Logout</span>
          </Link>
        </div>
      </aside>
    </>
  );
}


