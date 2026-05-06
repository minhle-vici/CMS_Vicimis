"use client";
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    name: 'Quân Lê',
    email: 'quan@vici.com',
    notifications: true,
    role: 'IT Technical'
  });

  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="app-container">
      <Sidebar />
      
      <main className="main-content">
        <Topbar onAddTask={() => {}} />

        <header style={{ padding: '0 40px 32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 600 }}>Cài đặt tài khoản</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Quản lý thông tin cá nhân và cấu hình thông báo.</p>
        </header>

        <div className="settings-container" style={{ padding: '0 40px', maxWidth: '800px' }}>
          <div className="card" style={{ padding: '32px' }}>
            <form onSubmit={handleSave}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
                <div style={{ position: 'relative' }}>
                  <img 
                    src={`https://ui-avatars.com/api/?name=${profile.name}&background=1A2E5E&color=fff&size=128`} 
                    alt="Avatar" 
                    style={{ width: '80px', height: '80px', borderRadius: '20px', objectFit: 'cover' }}
                  />
                  <button type="button" className="btn btn-icon-small" style={{ position: 'absolute', bottom: '-5px', right: '-5px', background: 'var(--secondary)', color: 'white' }}>
                    <i className='bx bx-camera'></i>
                  </button>
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{profile.name}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Vai trò: <span className="badge status-in-progress" style={{ marginLeft: '4px' }}>{profile.role}</span></p>
                </div>
              </div>

              <div className="grid-form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Họ và Tên</label>
                  <input 
                    type="text" 
                    value={profile.name} 
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    placeholder="Nhập tên của bạn"
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Email liên hệ</label>
                  <input 
                    type="email" 
                    value={profile.email} 
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    placeholder="yourname@vici.com"
                  />
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '32px 0' }} />

              <div className="notification-settings">
                <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Cấu hình thông báo</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-surface-hover)', borderRadius: '12px' }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '14px' }}>Thông báo Task mới</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Gửi email cho tôi khi có task mới được gán cho tôi.</p>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={profile.notifications} 
                      onChange={(e) => setProfile({...profile, notifications: e.target.checked})}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>

              <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-outline">Hủy bỏ</button>
                <button type="submit" className="btn btn-primary">
                  {isSaved ? 'Đã lưu thành công!' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <style jsx>{`
        .switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
        }
        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #cbd5e1;
          transition: .4s;
          border-radius: 24px;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        input:checked + .slider {
          background-color: var(--primary);
        }
        input:checked + .slider:before {
          transform: translateX(20px);
        }
      `}</style>
    </div>
  );
}
