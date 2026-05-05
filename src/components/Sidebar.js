export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="logo-icon"><i className='bx bx-hive'></i></div>
        <h2>Nexus<span>CMS</span></h2>
      </div>
      
      <nav className="menu">
        <p className="menu-title">Main</p>
        <a href="#" className="menu-item active">
          <i className='bx bx-grid-alt'></i>
          <span>Dashboard</span>
        </a>
        <a href="#" className="menu-item">
          <i className='bx bx-task'></i>
          <span>My Tasks</span>
          <span className="badge">4</span>
        </a>
        <a href="#" className="menu-item">
          <i className='bx bx-calendar'></i>
          <span>Calendar</span>
        </a>
        
        <p className="menu-title">Projects</p>
        <a href="#" className="menu-item">
          <i className='bx bxs-circle' style={{ color: '#a855f7', fontSize: '10px' }}></i>
          <span>Website Redesign</span>
        </a>
        <a href="#" className="menu-item">
          <i className='bx bxs-circle' style={{ color: '#3b82f6', fontSize: '10px' }}></i>
          <span>Marketing Campaign</span>
        </a>
        <a href="#" className="menu-item">
          <i className='bx bxs-circle' style={{ color: '#10b981', fontSize: '10px' }}></i>
          <span>App Development</span>
        </a>
      </nav>
      
      <div className="sidebar-footer">
        <a href="#" className="menu-item">
          <i className='bx bx-cog'></i>
          <span>Settings</span>
        </a>
        <a href="#" className="menu-item">
          <i className='bx bx-log-out'></i>
          <span>Logout</span>
        </a>
      </div>
    </aside>
  );
}
