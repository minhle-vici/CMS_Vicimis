"use client";
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import StatCard from '@/components/StatCard';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [filterRole, setFilterRole] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({ name: '', role: 'AM', email: '', password: '', is_manager: false });

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
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Có lỗi xảy ra khi lưu!');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Xác nhận xóa thành viên này?')) {
      try {
        await fetch(`/api/users/${id}`, { method: 'DELETE' });
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Có lỗi xảy ra khi xóa!');
      }
    }
  };

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

      {/* User Modal */}
      {isModalOpen && (
        <div className="modal-overlay active" onClick={(e) => e.target.classList.contains('modal-overlay') && setIsModalOpen(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editingUser ? 'Sửa thông tin User' : 'Thêm User mới'}</h3>
              <button className="btn-icon-small" onClick={() => setIsModalOpen(false)}><i className='bx bx-x'></i></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Tên nhân viên</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-row" style={{ display: 'flex', gap: '16px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Phòng ban (Role)</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="AM">Account Manager (AM)</option>
                      <option value="IT">IT / Developer</option>
                      <option value="Designer">Designer</option>
                      <option value="Sale">Sale</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Chức vụ (Vai trò)</label>
                    <div style={{ marginTop: '10px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'normal' }}>
                        <input
                          type="checkbox"
                          checked={formData.is_manager}
                          onChange={(e) => setFormData({ ...formData, is_manager: e.target.checked })}
                          style={{ width: '16px', height: '16px' }}
                        />
                        Trưởng phòng
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Mật khẩu {editingUser && '(để trống nếu không đổi)'}</label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Nhập mật khẩu..."
                  />
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Hủy</button>
                  <button type="submit" className="btn btn-primary">Lưu thay đổi</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
