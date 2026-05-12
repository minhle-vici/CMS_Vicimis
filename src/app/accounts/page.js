"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import { useNotification } from '@/components/Notification';

export default function AccountsPage() {
  const { data: session } = useSession();
  const { showNotification } = useNotification();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isAccModalOpen, setIsAccModalOpen] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState(null);
  const [editingAcc, setEditingAcc] = useState(null);
  const [showPasswords, setShowPasswords] = useState({});

  const isManager = session?.user?.is_manager || session?.user?.role === 'Admin';

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/accounts');
      const data = await res.json();
      if (res.ok) setCategories(data);
    } catch (error) {
      console.error(error);
      showNotification('Không thể tải danh sách tài khoản', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchAccounts();
  }, [session]);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const name = e.target.catName.value;
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'category', name })
      });
      if (res.ok) {
        showNotification('Đã tạo danh mục mới', 'success');
        setIsCatModalOpen(false);
        fetchAccounts();
      }
    } catch (e) { showNotification('Lỗi khi tạo danh mục', 'error'); }
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    const formData = {
      type: 'account',
      categoryId: selectedCatId,
      name: e.target.accName.value,
      username: e.target.accUser.value,
      password: e.target.accPass.value,
      note: e.target.accNote.value
    };
    
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        showNotification('Đã thêm tài khoản thành công', 'success');
        setIsAccModalOpen(false);
        fetchAccounts();
      }
    } catch (e) { showNotification('Lỗi khi thêm tài khoản', 'error'); }
  };

  const toggleVisibility = async (id, currentStatus) => {
    try {
      const res = await fetch('/api/accounts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isVisibleToTeam: !currentStatus })
      });
      if (res.ok) {
        showNotification('Đã cập nhật trạng thái hiển thị', 'success');
        fetchAccounts();
      }
    } catch (e) { showNotification('Lỗi cập nhật', 'error'); }
  };

  const deleteItem = async (id, type) => {
    if (!confirm('Bạn có chắc chắn muốn xóa?')) return;
    try {
      const res = await fetch(`/api/accounts?id=${id}&type=${type}`, { method: 'DELETE' });
      if (res.ok) {
        showNotification('Đã xóa thành công', 'success');
        fetchAccounts();
      }
    } catch (e) { showNotification('Lỗi khi xóa', 'error'); }
  };

  const togglePassword = (id) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Topbar />
        
        <div style={{ padding: '0 40px 40px' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '32px 0' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Quản lý Tài khoản Nội bộ</h1>
              <p style={{ color: 'var(--text-muted)' }}>Phòng ban: <strong style={{ color: 'var(--primary)' }}>{session?.user?.role}</strong></p>
            </div>
            {isManager && (
              <button className="btn btn-primary" onClick={() => setIsCatModalOpen(true)}>
                <i className='bx bx-folder-plus'></i> Tạo Danh mục mới
              </button>
            )}
          </header>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px' }}>Đang tải...</div>
          ) : categories.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px', background: 'white', borderRadius: '32px', border: '1px dashed #cbd5e1' }}>
              <i className='bx bx-key' style={{ fontSize: '60px', color: '#cbd5e1', marginBottom: '16px' }}></i>
              <p style={{ color: '#64748b' }}>Chưa có danh mục tài khoản nào được tạo.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              {categories.map(cat => (
                <section key={cat.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <i className='bx bx-folder' style={{ color: 'var(--primary)' }}></i> {cat.name}
                      <span style={{ fontSize: '12px', background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px', color: '#64748b' }}>{cat.accounts.length}</span>
                    </h2>
                    {isManager && (
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => { setSelectedCatId(cat.id); setIsAccModalOpen(true); }}>
                          <i className='bx bx-plus'></i> Thêm tài khoản
                        </button>
                        <button className="btn-icon-small" onClick={() => deleteItem(cat.id, 'category')} title="Xóa danh mục"><i className='bx bx-trash'></i></button>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                    {cat.accounts.map(acc => (
                      <div key={acc.id} style={{ 
                        background: 'white', 
                        padding: '24px', 
                        borderRadius: '24px', 
                        border: '1px solid #f1f5f9',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                        position: 'relative',
                        opacity: acc.isVisibleToTeam ? 1 : 0.6
                      }}>
                        {!acc.isVisibleToTeam && (
                          <div style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '10px', background: '#fee2e2', color: '#ef4444', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                            ĐANG ẨN VỚI TEAM
                          </div>
                        )}
                        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-main)' }}>{acc.name}</h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>USER</span>
                              <button style={{ border: 'none', background: 'none', color: '#3b82f6', fontSize: '12px', cursor: 'pointer' }} onClick={() => { navigator.clipboard.writeText(acc.username); showNotification('Đã copy User', 'success'); }}>Copy</button>
                            </div>
                            <div style={{ fontWeight: 600, fontSize: '14px' }}>{acc.username}</div>
                          </div>

                          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>PASSWORD</span>
                              <div style={{ display: 'flex', gap: '10px' }}>
                                <button style={{ border: 'none', background: 'none', color: '#64748b', fontSize: '12px', cursor: 'pointer' }} onClick={() => togglePassword(acc.id)}>
                                  {showPasswords[acc.id] ? 'Ẩn' : 'Hiện'}
                                </button>
                                <button style={{ border: 'none', background: 'none', color: '#3b82f6', fontSize: '12px', cursor: 'pointer' }} onClick={() => { navigator.clipboard.writeText(acc.password); showNotification('Đã copy Pass', 'success'); }}>Copy</button>
                              </div>
                            </div>
                            <div style={{ fontWeight: 600, fontSize: '14px', letterSpacing: showPasswords[acc.id] ? 'normal' : '4px' }}>
                              {showPasswords[acc.id] ? acc.password : '••••••••'}
                            </div>
                          </div>

                          {acc.note && (
                            <div style={{ fontSize: '12px', color: '#64748b', background: '#fffbeb', padding: '10px', borderRadius: '10px', border: '1px solid #fef3c7' }}>
                              <i className='bx bx-info-circle'></i> {acc.note}
                            </div>
                          )}
                        </div>

                        {isManager && (
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                            <button className="btn-icon-small" onClick={() => toggleVisibility(acc.id, acc.isVisibleToTeam)} title={acc.isVisibleToTeam ? "Ẩn với Team" : "Hiện với Team"}>
                              <i className={`bx ${acc.isVisibleToTeam ? 'bx-low-vision' : 'bx-show'}`}></i>
                            </button>
                            <button className="btn-icon-small" onClick={() => deleteItem(acc.id, 'account')} title="Xóa tài khoản"><i className='bx bx-trash'></i></button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Category Modal */}
      {isCatModalOpen && (
        <div className="modal-overlay active" style={{ zIndex: 10000 }}>
          <div className="modal" style={{ maxWidth: '400px', padding: '32px', borderRadius: '24px' }}>
            <h3 style={{ marginBottom: '24px', fontWeight: 700 }}>Tạo danh mục tài khoản</h3>
            <form onSubmit={handleAddCategory}>
              <div className="form-group">
                <label>Tên danh mục</label>
                <input name="catName" type="text" placeholder="Ví dụ: Tài khoản Server, Social..." required className="glass-field" />
              </div>
              <div className="form-actions" style={{ marginTop: '32px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsCatModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Tạo ngay</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Account Modal */}
      {isAccModalOpen && (
        <div className="modal-overlay active" style={{ zIndex: 10000 }}>
          <div className="modal" style={{ maxWidth: '500px', padding: '32px', borderRadius: '24px' }}>
            <h3 style={{ marginBottom: '24px', fontWeight: 700 }}>Thêm tài khoản mới</h3>
            <form onSubmit={handleAddAccount}>
              <div className="form-group">
                <label>Tên dịch vụ/Tài khoản</label>
                <input name="accName" type="text" placeholder="Ví dụ: Canva Pro, Hosting A..." required className="glass-field" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Tài khoản / Email</label>
                  <input name="accUser" type="text" required className="glass-field" />
                </div>
                <div className="form-group">
                  <label>Mật khẩu</label>
                  <input name="accPass" type="text" required className="glass-field" />
                </div>
              </div>
              <div className="form-group">
                <label>Ghi chú (Note)</label>
                <textarea name="accNote" rows="3" className="glass-field" placeholder="Ghi chú thêm nếu cần..."></textarea>
              </div>
              <div className="form-actions" style={{ marginTop: '32px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsAccModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Thêm tài khoản</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
