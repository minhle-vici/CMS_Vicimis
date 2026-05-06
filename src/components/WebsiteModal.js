"use client";
import { useState } from 'react';

export default function WebsiteModal({ isOpen, onClose, onSave, users }) {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    am: 'Huyền',
    it: 'Quân', // Default
    priority: 'Bình thường (24h)',
    note: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalId = 'ID#' + Math.floor(1000 + Math.random() * 9000);
    onSave({
      ...formData,
      id: finalId,
      type: selectedType,
      createdAt: new Date().toISOString().slice(0, 10),
      status: 'Đã tiếp nhận'
    });
    setStep(1); 
    setFormData({ name: '', am: 'Huyền', it: 'Quân', priority: 'Bình thường (24h)', note: '' });
    onClose();
  };

  const options = [
    { id: 'new', name: 'Tạo mới', icon: 'bx-plus-circle', color: 'var(--blue)', desc: 'Xây dựng dự án mới' },
    { id: 'fix', name: 'Fix lỗi', icon: 'bx-wrench', color: 'var(--red)', desc: 'Sửa lỗi hoặc cập nhật' },
    { id: 'booking', name: 'Booking', icon: 'bx-calendar-event', color: 'var(--purple)', desc: 'Tích hợp đặt lịch' },
    { id: 'seo', name: 'SEO Web', icon: 'bx-trending-up', color: 'var(--green)', desc: 'Tối ưu hóa tìm kiếm' }
  ];

  return (
    <div className="modal-overlay active" onClick={(e) => e.target.classList.contains('modal-overlay') && onClose()}>
      <div className="modal" style={{ 
        width: '500px', 
        background: 'var(--bg-surface)',
        padding: '30px',
        borderRadius: '24px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
        border: '1px solid var(--border-color)',
        position: 'relative'
      }}>
        <div className="modal-header" style={{ marginBottom: '20px', borderBottom: 'none', padding: 0 }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>
            {step === 1 ? 'Loại hình công việc' : `Chi tiết: ${selectedType}`}
          </h3>
          <button className="btn-icon-small" onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px' }}>
            <i className='bx bx-x'></i>
          </button>
        </div>
        <div className="modal-body">
          {step === 1 ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '10px 0' }}>
              {options.map((opt) => (
                <div 
                  key={opt.id} 
                  className="dept-card"
                  onClick={() => { setSelectedType(opt.name); setStep(2); }}
                  style={{
                    padding: '24px',
                    borderRadius: '16px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-surface-hover)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <i className={`bx ${opt.icon}`} style={{ fontSize: '32px', color: opt.color, marginBottom: '12px', display: 'block' }}></i>
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>{opt.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tên tiệm / Website</label>
                <input 
                  type="text" 
                  required 
                  autoFocus
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder="Nhập tên website..."
                />
              </div>

              <div className="form-group">
                <label>Nhân viên nhận (IT)</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  {['Minh', 'Quân'].map(name => (
                    <button 
                      key={name}
                      type="button"
                      className={`btn ${formData.it === name ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => setFormData({...formData, it: name})}
                      style={{ flex: 1, padding: '10px' }}
                    >
                      {name}
                    </button>
                  ))}
                </div>
                <button 
                  type="button"
                  className={`btn ${formData.it === 'All' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setFormData({...formData, it: 'All'})}
                  style={{ width: '100%', padding: '10px' }}
                >
                  All (Tất cả phòng IT)
                </button>
              </div>

              <div className="form-group">
                <label>Mức độ ưu tiên</label>
                <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})}>
                  <option value="Ưu tiên (60p)">Ưu tiên (60p)</option>
                  <option value="Bình thường (24h)">Bình thường (24h)</option>
                  <option value="Không cần gấp">Không cần gấp</option>
                </select>
              </div>

              <div className="form-group">
                <label>Ghi chú (Note)</label>
                <textarea 
                  rows="2"
                  value={formData.note} 
                  onChange={(e) => setFormData({...formData, note: e.target.value})} 
                  placeholder="Thêm ghi chú nếu có..."
                  style={{ resize: 'none' }}
                ></textarea>
              </div>

              <div className="form-actions" style={{ marginTop: '20px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setStep(1)}>Quay lại</button>
                <button type="submit" className="btn btn-primary">Xác nhận & Lưu</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
