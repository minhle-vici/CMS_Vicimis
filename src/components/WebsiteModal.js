"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function WebsiteModal({ isOpen, onClose, onSave, users, initialData = null }) {
  const { data: session } = useSession();
  const [mode, setMode] = useState('select'); // 'select', 'new', 'fix'
  const [searchId, setSearchId] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    briefById: '',
    assignedToId: '',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '',
    demoUrl: '',
    demoUser: '',
    demoPass: '',
    domain: '',
    templateUrl: '',
    status: 'Đã tiếp nhận',
    priority: 'Bình thường 24g',
    info: ''
  });

  useEffect(() => {
    if (initialData) {
      setMode('fix');
      setFormData({
        ...initialData,
        startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().slice(0, 10) : '',
        endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().slice(0, 10) : '',
        briefById: initialData.briefById ? Number(initialData.briefById) : '',
        assignedToId: initialData.assignedToId ? Number(initialData.assignedToId) : ''
      });
    } else {
      setMode('select');
      setSearchId('');
      setFormData({
        id: '', // Will be filled or random
        name: '',
        briefById: session?.user?.id ? Number(session.user.id) : '',
        assignedToId: '',
        startDate: new Date().toISOString().slice(0, 10),
        endDate: '',
        demoUrl: '',
        demoUser: '',
        demoPass: '',
        domain: '',
        templateUrl: '',
        status: 'Đã tiếp nhận',
        priority: 'Bình thường 24g',
        info: ''
      });
    }
  }, [initialData, isOpen, session]);

  const handleSearch = async () => {
    if (!searchId) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/websites`);
      const allWebs = await res.json();
      const found = allWebs.find(w => String(w.siteId) === searchId);
      
      if (found) {
        setFormData({
          ...found,
          info: '', // Xóa lịch sử cũ để nhập yêu cầu fix mới
          status: 'Đã tiếp nhận', // Tự động reset status về Tiếp nhận để IT thấy
          startDate: found.startDate ? new Date(found.startDate).toISOString().slice(0, 10) : '',
          endDate: found.endDate ? new Date(found.endDate).toISOString().slice(0, 10) : '',
          briefById: session?.user?.id ? Number(session.user.id) : '',
          assignedToId: found.assignedToId ? Number(found.assignedToId) : ''
        });
        setMode('fix');
      } else {
        alert('Không tìm thấy Website ID này!');
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, isFixMode: mode === 'fix' });
  };

  const amUsers = users.filter(u => u.role === 'AM' || u.role === 'Admin' || String(u.id) === String(session?.user?.id));
  const itUsers = users.filter(u => u.role === 'IT' || u.role === 'Designer' || u.role === 'Admin');

  return (
    <div 
      className="modal-overlay active" 
      onClick={(e) => e.target.classList.contains('modal-overlay') && onClose()}
      style={{
        backdropFilter: 'blur(12px) saturate(160%)',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 9999
      }}
    >
      <div 
        className="modal" 
        style={{ 
          width: '700px', 
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(25px) saturate(200%)',
          padding: '40px',
          borderRadius: '32px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          .glass-field {
            background: rgba(0, 0, 0, 0.04) !important;
            border: 1px solid rgba(0, 0, 0, 0.05) !important;
            border-radius: 12px !important;
            padding: 10px 14px !important;
            font-size: 14px !important;
            width: 100%;
            outline: none;
            transition: all 0.2s;
          }
          .glass-field:focus {
            background: white !important;
            border-color: #3b82f6 !important;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
          }
          .field-label {
            font-size: 12px;
            font-weight: 700;
            color: #64748b;
            margin-bottom: 6px;
            display: block;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
        `}} />

        <div className="modal-header" style={{ marginBottom: '30px', border: 'none', padding: 0 }}>
          <div>
            {mode === 'select' ? (
              <>
                <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b' }}>Thêm Task Website</h3>
                <p style={{ fontSize: '14px', color: '#64748b' }}>Chọn hình thức yêu cầu</p>
              </>
            ) : (
              <>
                <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b' }}>
                  <i className='bx bx-chevron-left' style={{ cursor: 'pointer', marginRight: '8px' }} onClick={() => setMode('select')}></i>
                  {mode === 'new' ? 'Tạo Website Mới' : 'Sửa chữa / Fix Lỗi'}
                </h3>
                <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                  {mode === 'new' 
                    ? 'Nhập thông tin cho dự án mới' 
                    : <strong style={{ color: '#3b82f6' }}>Dự án: {formData.name} {formData.domain ? `(${formData.domain})` : ''} - #{formData.siteId || formData.id}</strong>
                  }
                </p>
              </>
            )}
          </div>
          <button className="btn-icon-small" onClick={onClose} style={{ position: 'absolute', top: '30px', right: '30px', background: 'rgba(0,0,0,0.05)', borderRadius: '50%' }}>
            <i className='bx bx-x' style={{ fontSize: '24px' }}></i>
          </button>
        </div>

        {mode === 'select' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '20px 0' }}>
            <div 
              onClick={() => setMode('new')}
              style={{ padding: '30px', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.3s', background: 'white' }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', margin: '0 auto 20px' }}>
                <i className='bx bx-plus-circle'></i>
              </div>
              <h4 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>Tạo mới Website</h4>
              <p style={{ fontSize: '13px', color: '#64748b' }}>Bắt đầu một dự án hoàn toàn mới</p>
            </div>

            <div 
              onClick={() => setMode('search_fix')}
              style={{ padding: '30px', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.3s', background: 'white' }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', margin: '0 auto 20px' }}>
                <i className='bx bx-wrench'></i>
              </div>
              <h4 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>Sửa chữa / Fix</h4>
              <p style={{ fontSize: '13px', color: '#64748b' }}>Cập nhật cho website đã có ID</p>
            </div>
          </div>
        ) : mode === 'search_fix' ? (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <h4 style={{ marginBottom: '20px' }}>Nhập ID Website cần sửa (Số):</h4>
            <div style={{ display: 'flex', gap: '10px', maxWidth: '400px', margin: '0 auto' }}>
              <input 
                type="number" 
                className="glass-field" 
                placeholder="Ví dụ: 12" 
                value={searchId} 
                onChange={(e) => setSearchId(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button className="btn btn-primary" onClick={handleSearch} disabled={isSearching} style={{ whiteSpace: 'nowrap' }}>
                {isSearching ? '...' : 'Tìm kiếm'}
              </button>
            </div>
            <button className="btn btn-link" onClick={() => setMode('select')} style={{ marginTop: '20px', color: '#64748b' }}>Quay lại</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {mode === 'new' && (
              <div style={{ marginBottom: '20px' }}>
                <label className="field-label">Tên Website / Khách hàng mới</label>
                <input 
                  type="text" 
                  required 
                  className="glass-field"
                  placeholder="Nhập tên website..."
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label className="field-label">Người giao (Brief)</label>
                <input 
                  type="text" 
                  className="glass-field" 
                  value={users.find(u => u.id === formData.briefById)?.name || session?.user?.name || ''} 
                  readOnly 
                  style={{ backgroundColor: 'rgba(0,0,0,0.02)', color: '#64748b', cursor: 'not-allowed' }}
                />
              </div>
              <div>
                <label className="field-label">Người nhận (IT/Developer)</label>
                <select className="glass-field" value={formData.assignedToId} onChange={(e) => setFormData({...formData, assignedToId: e.target.value})}>
                  <option value="">-- Cả phòng IT --</option>
                  {users.filter(u => u.role === 'IT').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label className="field-label">Ngày bắt đầu</label>
                <input type="date" className="glass-field" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} />
              </div>
              <div>
                <label className="field-label">Trạng thái</label>
                <select className="glass-field" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} style={{ fontWeight: 'bold', color: '#1e3a8a' }}>
                  <option value="Đã tiếp nhận">Đã tiếp nhận</option>
                  <option value="Đang thực hiện">Đang thực hiện</option>
                  <option value="Hoàn thành demo">Hoàn thành demo</option>
                  <option value="Bàn giao">Bàn giao</option>
                </select>
              </div>
              <div>
                <label className="field-label">Mức độ ưu tiên</label>
                <select className="glass-field" value={formData.priority || 'Bình thường 24g'} onChange={(e) => setFormData({...formData, priority: e.target.value})} style={{ fontWeight: 'bold', color: '#dc2626' }}>
                  <option value="Bình thường 24g">Bình thường 24g</option>
                  <option value="Ưu tiên 60p">Ưu tiên 60p</option>
                  <option value="Không gấp">Không gấp</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label className="field-label">Nội dung yêu cầu / Fix (Chat Info)</label>
              <textarea 
                className="glass-field" 
                rows="4" 
                placeholder="Nhập nội dung cần IT xử lý..." 
                style={{ resize: 'vertical' }}
                value={formData.info}
                onChange={(e) => setFormData({...formData, info: e.target.value})}
              ></textarea>
            </div>

            <div className="form-actions" style={{ marginTop: '30px', display: 'flex', gap: '16px' }}>
              <button type="button" className="btn" onClick={() => setMode('select')} style={{ flex: 1, background: 'rgba(0,0,0,0.05)', borderRadius: '16px', fontWeight: 600 }}>Quay lại</button>
              <button type="submit" className="btn" style={{ flex: 2, background: 'linear-gradient(135deg, #3b82f6 0%, #ef4444 100%)', color: 'white', borderRadius: '16px', fontWeight: 600, boxShadow: '0 8px 20px rgba(59, 130, 246, 0.2)' }}>
                {mode === 'new' ? 'Khởi tạo Dự án' : 'Gửi yêu cầu IT'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
