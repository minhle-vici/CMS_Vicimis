export default function Topbar({ onAddTask }) {
  return (
    <header className="topbar">
      <div className="search-bar">
        <i className='bx bx-search'></i>
        <input type="text" placeholder="Search tasks, projects..." />
      </div>
      
      <div className="header-actions">
        <button className="btn btn-icon"><i className='bx bx-bell'></i></button>
        <button className="btn btn-primary" onClick={onAddTask}>
          <i className='bx bx-plus'></i> New Task
        </button>
        <div className="profile-avatar">
          <img src="https://ui-avatars.com/api/?name=Admin+User&background=a855f7&color=fff" alt="Profile" />
        </div>
      </div>
    </header>
  );
}
