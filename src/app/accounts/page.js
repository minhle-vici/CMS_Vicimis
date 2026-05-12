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
  
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isAccModalOpen, setIsAccModalOpen] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState(null);
  const [editingAcc, setEditingAcc] = useState(null);
  const [editingCat, setEditingCat] = useState(null);
  const [showPasswords, setShowPasswords] = useState({});

  const isManager = !!session?.user?.is_manager || session?.user?.role === 'Admin';

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/accounts');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
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

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    const name = e.target.catName.value;
    const method = editingCat ? 'PUT' : 'POST';
    const payload = editingCat ? { type: 'category', id: editingCat.id, name } : { type: 'category', name };
    
    try {
      const res = await fetch('/api/accounts', {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showNotification(editingCat ? 'Đã cập nhật danh mục' : 'Đã tạo danh mục mới', 'success');
        setIsCatModalOpen(false);
        setEditingCat(null);
        fetchAccounts();
      }
    } catch (e) { showNotification('Lỗi xử lý', 'error'); }
  };

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    const formData = {
      id: editingAcc?.id,
      categoryId: selectedCatId,
      name: e.target.accName.value,
      username: e.target.accUser.value,
      password: e.target.accPass.value,
      note: e.target.accNote.value,
      type: 'account'
    };
    
    try {
      const res = await fetch('/api/accounts', {
        method: editingAcc ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        showNotification(editingAcc ? 'Đã cập nhật tài khoản' : 'Đã thêm tài khoản thành công', 'success');
        setIsAccModalOpen(false);
        setEditingAcc(null);
        fetchAccounts();
      } else {
        const error = await res.json();
        showNotification(error.details || 'Lỗi lưu tài khoản', 'error');
      }
    } catch (e) { showNotification('Lỗi kết nối', 'error'); }
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

  const copyToClipboard = (text, msg) => {
    navigator.clipboard.writeText(text);
    showNotification(msg, 'success');
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
              <button className="btn btn-primary" onClick={() => { setEditingCat(null); setIsCatModalOpen(true); }}>
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
                <section key={cat.id} style={{ background: 'white', borderRadius: '32px', padding: '32px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className='bx bx-folder-open'></i>
                      </div>
                      {cat.name}
                      <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500 }}>({cat.accounts.length} tài khoản)</span>
                    </h2>
                    {isManager && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '12px' }} onClick={() => { setSelectedCatId(cat.id); setEditingAcc(null); setIsAccModalOpen(true); }}>
                          <i className='bx bx-plus'></i> Thêm tài khoản
                        </button>
                        <button className="btn-icon-small" style={{ borderRadius: '12px' }} onClick={() => { setEditingCat(cat); setIsCatModalOpen(true); }}><i className='bx bx-edit-alt'></i></button>
                        <button className="btn-icon-small" style={{ borderRadius: '12px', color: '#ef4444' }} onClick={() => deleteItem(cat.id, 'category')}><i className='bx bx-trash'></i></button>
                      </div>
                    )}
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                          <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', color: '#64748b', fontWeight: 800, width: '60px' }}>#</th>
                          <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', color: '#64748b', fontWeight: 800 }}>TÊN DỊCH VỤ</th>
                          <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', color: '#64748b', fontWeight: 800 }}>TÀI KHOẢN</th>
                          <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', color: '#64748b', fontWeight: 800 }}>MẬT KHẨU</th>
                          <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', color: '#64748b', fontWeight: 800 }}>GHI CHÚ</th>
                          {isManager && <th style={{ textAlign: 'center', padding: '16px', fontSize: '12px', color: '#64748b', fontWeight: 800 }}>TRẠNG THÁI</th>}
                          {isManager && <th style={{ textAlign: 'right', padding: '16px', fontSize: '12px', color: '#64748b', fontWeight: 800 }}>THAO TÁC</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {cat.accounts.map((acc, index) => (
                          <tr key={acc.id} style={{ 
                            borderBottom: '1px solid #f8fafc', 
                            transition: 'background 0.2s', 
                            opacity: acc.isVisibleToTeam ? 1 : 0.6,
                            background: acc.isVisibleToTeam ? 'transparent' : '#fff1f2'
                          }}>
                            <td style={{ padding: '16px', fontSize: '14px', color: '#94a3b8', fontWeight: 600 }}>{index + 1}</td>
                            <td style={{ padding: '16px', fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{acc.name}</td>
                            <td style={{ padding: '16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>{acc.username}</span>
                                <button className="btn-copy" onClick={() => copyToClipboard(acc.username, 'Đã copy User')}><i className='bx bx-copy'></i></button>
                              </div>
                            </td>
                            <td style={{ padding: '16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '14px', fontWeight: 600, color: '#475569', letterSpacing: showPasswords[acc.id] ? 'normal' : '3px' }}>
                                  {showPasswords[acc.id] ? acc.password : '••••••'}
                                </span>
                                <button className="btn-copy" onClick={() => setShowPasswords(prev => ({...prev, [acc.id]: !prev[acc.id]}))}>
                                  <i className={`bx ${showPasswords[acc.id] ? 'bx-low-vision' : 'bx-show'}`}></i>
                                </button>
                                <button className="btn-copy" onClick={() => copyToClipboard(acc.password, 'Đã copy Pass')}><i className='bx bx-copy'></i></button>
                              </div>
                            </td>
                            <td style={{ padding: '16px', fontSize: '13px', color: '#64748b', maxWidth: '200px' }}>{acc.note || '—'}</td>
                            {isManager && (
                              <td style={{ padding: '16px', textAlign: 'center' }}>
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                  <button 
                                    onClick={() => toggleVisibility(acc.id, acc.isVisibleToTeam)}
                                    style={{ 
                                      padding: '4px 12px', 
                                      borderRadius: '20px', 
                                      border: 'none', 
                                      fontSize: '11px', 
                                      fontWeight: 800,
                                      cursor: 'pointer',
                                      background: acc.isVisibleToTeam ? '#dcfce7' : '#fee2e2',
                                      color: acc.isVisibleToTeam ? '#10b981' : '#ef4444'
                                    }}>
                                    {acc.isVisibleToTeam ? 'ĐANG HIỆN' : 'ĐANG ẨN'}
                                  </button>
                                </div>
                              </td>
                            )}
                            {isManager && (
                              <td style={{ padding: '16px', textAlign: 'right' }}>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                  <button className="btn-icon-small" onClick={() => { setEditingAcc(acc); setSelectedCatId(cat.id); setIsAccModalOpen(true); }}><i className='bx bx-edit-alt'></i></button>
                                  <button className="btn-icon-small" style={{ color: '#ef4444' }} onClick={() => deleteItem(acc.id, 'account')}><i className='bx bx-trash'></i></button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal Creating/Editing Category */}
      {isCatModalOpen && (
        <div className="modal-overlay active" style={{ zIndex: 10000 }}>
          <div className="modal" style={{ maxWidth: '450px', padding: '0', borderRadius: '32px', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #ef4444 100%)', padding: '32px', color: 'white' }}>
              <h3 style={{ margin: 0 }}>{editingCat ? 'Chỉnh sửa danh mục' : 'Tạo danh mục mới'}</h3>
            </div>
            <form onSubmit={handleSaveCategory} style={{ padding: '32px', background: 'white' }}>
              <div className="form-group">
                <label>TÊN DANH MỤC</label>
                <input name="catName" type="text" defaultValue={editingCat?.name || ''} required style={{ width: '100%', padding: '14px', borderRadius: '16px', border: '1px solid #e2e8f0' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsCatModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">{editingCat ? 'Cập nhật' : 'Tạo ngay'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Creating/Editing Account */}
      {isAccModalOpen && (
        <div className="modal-overlay active" style={{ zIndex: 10000 }}>
          <div className="modal" style={{ maxWidth: '550px', padding: '0', borderRadius: '32px', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #ef4444 100%)', padding: '32px', color: 'white' }}>
              <h3 style={{ margin: 0 }}>{editingAcc ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản mới'}</h3>
            </div>
            <form onSubmit={handleSaveAccount} style={{ padding: '32px', background: 'white' }}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>TÊN DỊCH VỤ</label>
                <input name="accName" type="text" defaultValue={editingAcc?.name || ''} required style={{ width: '100%', padding: '14px', borderRadius: '16px', border: '1px solid #e2e8f0' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label>TÀI KHOẢN</label>
                  <input name="accUser" type="text" defaultValue={editingAcc?.username || ''} required style={{ width: '100%', padding: '14px', borderRadius: '16px', border: '1px solid #e2e8f0' }} />
                </div>
                <div className="form-group">
                  <label>MẬT KHẨU</label>
                  <input name="accPass" type="text" defaultValue={editingAcc?.password || ''} required style={{ width: '100%', padding: '14px', borderRadius: '16px', border: '1px solid #e2e8f0' }} />
                </div>
              </div>
              <div className="form-group">
                <label>GHI CHÚ (NOTE)</label>
                <textarea name="accNote" rows="3" defaultValue={editingAcc?.note || ''} style={{ width: '100%', padding: '14px', borderRadius: '16px', border: '1px solid #e2e8f0', resize: 'none' }}></textarea>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsAccModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">{editingAcc ? 'Lưu thay đổi' : 'Thêm mới'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .btn-copy {
          border: none;
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .btn-copy:hover {
          background: #3b82f6;
          color: white;
        }
      `}</style>
    </div>
  );
}
