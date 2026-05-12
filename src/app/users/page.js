"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/components/Notification';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import StatCard from '@/components/StatCard';

export default function UsersPage() {
  const { data: session, status } = useSession();
  const { showNotification } = useNotification();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [filterRole, setFilterRole] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({ name: '', role: 'AM', email: '', password: '', is_manager: false });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'Admin') {
      router.push('/unauthorized');
    }
  }, [status, session, router]);

  const fetchUsers = async () => {
    try {
      const url = filterRole === 'All' ? '/api/users' : `/api/users?role=${filterRole}`;
      const res = await fetch(url);
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filterRole]);

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({ name: user.name, role: user.role, email: user.email, password: '', is_manager: user.is_manager });
    } else {
      setEditingUser(null);
      setFormData({ name: '', role: 'AM', email: '', password: '', is_manager: false });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await fetch(`/api/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }
      setIsModalOpen(false);
      showNotification(editingUser ? 'Cập nhật thành viên thành công!' : 'Thêm thành viên mới thành công!', 'success');
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      showNotification('Có lỗi xảy ra khi lưu!', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Xác nhận xóa thành viên này?')) {
      try {
        await fetch(`/api/users/${id}`, { method: 'DELETE' });
        showNotification('Đã xóa thành viên!', 'info');
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        showNotification('Có lỗi xảy ra khi xóa!', 'error');
      }
    }
  };

  if (status === 'loading') {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Đang tải...</div>;
  }

  if (session?.user?.role !== 'Admin') {
    return null;
  }

  return (
    <div className="app-container">
      <Sidebar />

      <main className="main-content">
        <Topbar onAddTask={() => handleOpenModal()} />
        <header style={{ padding: '0 40px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 600 }}>Quản lý Thành viên</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Quản lý danh sách nhân sự, phân quyền và chức vụ.</p>
          </div>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <i className='bx bx-user-plus'></i> Thêm User mới
          </button>
        </header>

        <section className="overview">
          <StatCard icon="bx-group" color="purple" label="Tổng nhân sự" value={users.length} />
          <StatCard icon="bx-briefcase" color="blue" label="Account Manager" value={users.filter(u => u.role === 'AM').length} />
          <StatCard icon="bx-code-alt" color="green" label="Kỹ thuật / IT" value={users.filter(u => u.role === 'IT').length} />
          <StatCard icon="bx-paint" color="red" label="Designer" value={users.filter(u => u.role === 'Designer').length} />
        </section>

        <div className="table-container">
          <div style={{ marginBottom: '16px', display: 'flex', gap: '10px' }}>
            <span style={{ fontWeight: 500 }}>Lọc theo phòng ban:</span>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="All">Tất cả phòng ban</option>
              <option value="AM">Account Manager (AM)</option>
              <option value="IT">IT / Developer</option>
              <option value="Designer">Designer</option>
              <option value="Sale">Sale</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Thành viên</th>
                  <th>Chức vụ / Phòng ban</th>
                  <th>Vai trò</th>
                  <th>Email</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  let color = '3b82f6';
                  if (user.role === 'AM') color = 'f472b6';
                  if (user.role === 'Designer') color = '10b981';
                  if (user.role === 'Sale') color = 'f59e0b';
                  if (user.role === 'Admin') color = 'ef4444';

                  return (
                    <tr key={user.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={`https://ui-avatars.com/api/?name=${user.name}&background=${color}&color=fff`}
                            className="avatar-small"
                            style={{ width: '32px', height: '32px' }}
                            alt={user.name}
                          />
                          <div style={{ fontWeight: 500 }}>
                            {user.name}
                            {user.is_manager && <i className='bx bxs-star' style={{ color: '#f59e0b', marginLeft: '6px', fontSize: '14px' }} title="Trưởng phòng"></i>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge status-in-progress`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        {user.is_manager ? <span style={{ fontWeight: 600, color: '#f59e0b' }}>Trưởng phòng</span> : <span style={{ color: '#6b7280' }}>Nhân viên</span>}
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <div className="action-btns">
                          <button className="btn-icon-small" title="Sửa" onClick={() => handleOpenModal(user)}>
                            <i className='bx bx-edit-alt'></i>
                          </button>
                          <button className="btn-icon-small" title="Xóa" onClick={() => handleDelete(user.id)}>
                            <i className='bx bx-trash' style={{ color: 'var(--red)' }}></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>Không có người dùng nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modern iOS Liquid Glass Modal */}
      {isModalOpen && (
        <div 
          className="modal-overlay active" 
          onClick={(e) => e.target.classList.contains('modal-overlay') && setIsModalOpen(false)}
          style={{
            backdropFilter: 'blur(12px) saturate(160%)',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <div 
            className="modal"
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(25px) saturate(200%)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '32px',
              width: '100%',
              maxWidth: '550px',
              padding: '40px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255,255,255,1)',
              position: 'relative',
              animation: 'modalSlideUp 0.5s cubic-bezier(0.19, 1, 0.22, 1)'
            }}
          >
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes modalSlideUp {
                from { opacity: 0; transform: translateY(30px) scale(0.95); }
                to { opacity: 1; transform: translateY(0) scale(1); }
              }
              .glass-input {
                background: rgba(0, 0, 0, 0.04) !important;
                border: 1px solid rgba(0, 0, 0, 0.05) !important;
                border-radius: 16px !important;
                padding: 14px 18px !important;
                font-weight: 500 !important;
                transition: all 0.2s !important;
              }
              .glass-input:focus {
                background: white !important;
                border-color: #3b82f6 !important;
                box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important;
                transform: translateY(-1px);
              }
              .form-label {
                font-size: 13px;
                font-weight: 600;
                color: #475569;
                margin-bottom: 8px;
                display: block;
                padding-left: 4px;
              }
            `}} />

            <div className="modal-header" style={{ marginBottom: '32px', border: 'none', padding: 0 }}>
              <div>
                <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b' }}>
                  {editingUser ? 'Sửa thông tin' : 'Thành viên mới'}
                </h3>
                <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                  {editingUser ? `Đang chỉnh sửa tài khoản ${editingUser.name}` : 'Tạo tài khoản truy cập hệ thống CMS'}
                </p>
              </div>
              <button 
                className="btn-icon-small" 
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'rgba(0,0,0,0.05)', borderRadius: '50%', width: '36px', height: '36px' }}
              >
                <i className='bx bx-x' style={{ fontSize: '24px' }}></i>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Tên nhân viên</label>
                <input
                  type="text"
                  required
                  className="glass-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Họ và tên..."
                />
              </div>

              <div className="form-row" style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label">Phòng ban</label>
                  <select
                    className="glass-input"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    style={{ backgroundPosition: 'right 16px center' }}
                  >
                    <option value="AM">Account Manager (AM)</option>
                    <option value="IT">IT / Developer</option>
                    <option value="Designer">Designer</option>
                    <option value="Sale">Sale</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1, marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                   <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '12px 16px', background: 'rgba(0,0,0,0.03)', borderRadius: '16px', marginTop: '22px' }}>
                    <input
                      type="checkbox"
                      checked={formData.is_manager}
                      onChange={(e) => setFormData({ ...formData, is_manager: e.target.checked })}
                      style={{ width: '18px', height: '18px', accentColor: '#3b82f6' }}
                    />
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>Trưởng phòng</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email công việc</label>
                <input
                  type="email"
                  required
                  className="glass-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@vicimis.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mật khẩu {editingUser && <span style={{ fontWeight: 400, opacity: 0.7 }}>(để trống nếu không đổi)</span>}</label>
                <input
                  type="password"
                  required={!editingUser}
                  className="glass-input"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>

              <div className="form-actions" style={{ marginTop: '40px', gap: '16px' }}>
                <button 
                  type="button" 
                  className="btn" 
                  onClick={() => setIsModalOpen(false)}
                  style={{ flex: 1, background: 'rgba(0,0,0,0.05)', color: '#475569', borderRadius: '16px', padding: '14px' }}
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  className="btn"
                  style={{ flex: 2, background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', color: 'white', borderRadius: '16px', padding: '14px', fontWeight: 600, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                >
                  {editingUser ? 'Cập nhật ngay' : 'Tạo tài khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
