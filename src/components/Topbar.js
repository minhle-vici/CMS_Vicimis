"use client";
import { useState, useEffect } from 'react';

export default function Topbar({ onAddTask, searchQuery, onSearchChange, buttonText = "New Task" }) {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const toggleSidebar = () => {
    document.body.classList.toggle('sidebar-open');
  };

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button className="menu-toggle" onClick={toggleSidebar} style={{ display: 'none' }}>
          <i className='bx bx-menu' style={{ fontSize: '24px' }}></i>
        </button>
        <div className="search-bar">
          <i className='bx bx-search'></i>
          <input 
            type="text" 
            placeholder="Tìm kiếm công việc, dự án..." 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      
      <div className="header-actions">
        <button className="btn btn-icon" onClick={toggleTheme} title="Toggle Dark/Light Mode">
          <i className={`bx ${theme === 'light' ? 'bx-moon' : 'bx-sun'}`}></i>
        </button>
        <button className="btn btn-icon"><i className='bx bx-bell'></i></button>
        <button className="btn btn-primary" onClick={onAddTask}>
          <i className='bx bx-plus'></i> <span>{buttonText}</span>
        </button>
        <div className="profile-avatar">
          <img src="https://ui-avatars.com/api/?name=Admin+User&background=1A2E5E&color=fff" alt="Profile" />
        </div>
      </div>
    </header>
  );
}

