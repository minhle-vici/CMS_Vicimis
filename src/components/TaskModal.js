"use client";
import { useState, useEffect } from 'react';

export default function TaskModal({ 
  isOpen, 
  onClose, 
  onSave, 
  users = [], 
  websites = [],
  showBooking = true,
  initialStep = 1,
  defaultDept = 'WEB'
}) {
  const [step, setStep] = useState(initialStep);
  const [formData, setFormData] = useState({
    department: defaultDept,
    type: '',
    shopName: '',
    websiteId: '',
    domain: '',
    demo: '',
    note: '',
    priority: 'Bình thường (24h)',
    assignee: '',
    isWholeDept: false
  });

  // Reset step and department when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(initialStep);
      setFormData(prev => ({ ...prev, department: defaultDept }));
    }
  }, [isOpen, initialStep, defaultDept]);

  if (!isOpen) return null;

  const handleNext = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setStep(step + 1);
  };

  const handleBack = () => setStep(step - 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  // Find shop name if websiteId is selected - Strict 100% match
  const selectedWebsite = websites.find(w => {
    const search = formData.websiteId.toLowerCase().trim().replace('id#', '');
    if (!search) return false;
    
    const siteId = w.id.toLowerCase().replace('id#', '');
    return siteId === search;
  });

  const departments = [
    { id: 'web', name: 'WEB', icon: 'bx-code-alt', color: 'blue' },
    { id: 'seo', name: 'SEO', icon: 'bx-trending-up', color: 'green' },
    { id: 'design', name: 'Design', icon: 'bx-palette', color: 'purple' },
  ];

  const webTypes = [
    { id: 'new', name: 'Tạo mới website', icon: 'bx-plus-circle' },
    { id: 'fix', name: 'Fix lỗi', icon: 'bx-wrench' },
    { id: 'booking', name: 'Booking', icon: 'bx-calendar' },
    { id: 'seo_web', name: 'SEO Web', icon: 'bx-search-alt' },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: step === 3 ? '600px' : '700px' }}>
        <div className="modal-header">
          <h3>
            {step > initialStep && <i className='bx bx-chevron-left' style={{ cursor: 'pointer', marginRight: '10px' }} onClick={handleBack}></i>}
            {step === 1 ? 'Chọn bộ phận' : step === 2 ? `Loại yêu cầu (${formData.department})` : 'Chi tiết yêu cầu'}
          </h3>
          <button onClick={onClose} className="close-btn"><i className='bx bx-x'></i></button>
        </div>

        <div className="modal-body">
          {step === 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', padding: '10px 0' }}>
              {departments.map(dept => (
                <div key={dept.id} className="selection-card" onClick={() => handleNext('department', dept.name)}>
                  <div className={`card-icon ${dept.color}`}><i className={`bx ${dept.icon}`}></i></div>
                  <h4>{dept.name}</h4>
                  <p>Phòng {dept.name}</p>
                </div>
              ))}
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '10px 0' }}>
              {webTypes.map(type => (
                <div key={type.id} className="selection-card wide" onClick={() => handleNext('type', type.name)}>
                  <div className="card-icon blue"><i className={`bx ${type.icon}`}></i></div>
                  <h4>{type.name}</h4>
                </div>
              ))}
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit}>
              {(formData.type === 'Fix lỗi' || formData.type === 'SEO Web') ? (
                <div className="form-group">
                  <label>Mã ID Website</label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ flex: '1' }}>
                      <input 
                        type="text" 
                        required 
                        value={formData.websiteId}
                        onChange={(e) => setFormData({...formData, websiteId: e.target.value})}
                        placeholder="Ví dụ: ID#24"
                      />
                    </div>
                    <div style={{ flex: '2' }}>
                      <div style={{ 
                        padding: '12px 16px', 
                        background: 'var(--bg-surface-hover)', 
                        borderRadius: '12px', 
                        border: '1px solid var(--border-color)',
                        minHeight: '45px',
                        display: 'flex',
                        alignItems: 'center',
                        color: selectedWebsite ? 'var(--text-main)' : 'var(--text-muted)',
                        fontSize: '14px',
                        fontWeight: selectedWebsite ? 600 : 400
                      }}>
                        {selectedWebsite ? (
                          <><i className='bx bx-check-circle' style={{ color: 'var(--primary)', marginRight: '8px' }}></i> {selectedWebsite.name}</>
                        ) : (
                          "Gõ ID để check tên tiệm..."
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="form-group">
                  <label>Tên tiệm / Dự án</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.shopName}
                    onChange={(e) => setFormData({...formData, shopName: e.target.value})}
                    placeholder="Nhập tên tiệm mới..."
                  />
                </div>
              )}

              <div className="form-group">
                <label>Mức độ ưu tiên</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {[
                    { id: 'Ưu tiên (60p)', name: 'Ưu tiên (60p)', color: '#ef4444' },
                    { id: 'Bình thường (24h)', name: 'Bình thường (24h)', color: '#3b82f6' },
                    { id: 'Không cần gấp', name: 'Không cần gấp', color: '#10b981' }
                  ].map(p => (
                    <button 
                      key={p.id} 
                      type="button" 
                      className={`priority-btn ${formData.priority === p.id ? 'active' : ''}`}
                      onClick={() => setFormData({...formData, priority: p.id})}
                      style={{ 
                        flex: 1, 
                        fontSize: '12px', 
                        padding: '12px 6px',
                        borderRadius: '12px',
                        fontWeight: 600,
                        transition: 'all 0.3s ease',
                        border: '1px solid var(--border-color)',
                        background: formData.priority === p.id ? p.color : 'transparent',
                        color: formData.priority === p.id ? '#ffffff' : 'var(--text-muted)',
                        borderColor: formData.priority === p.id ? p.color : 'var(--border-color)',
                        boxShadow: formData.priority === p.id ? `0 4px 15px ${p.color}55` : 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Giao cho ai?</label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {users.filter(u => u.role === 'IT').map(u => (
                    <button 
                      key={u.id}
                      type="button"
                      className={`btn btn-sm ${formData.assignee === u.name && !formData.isWholeDept ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => setFormData({...formData, assignee: u.name, isWholeDept: false})}
                      style={{ flex: '1 0 30%', fontSize: '11px', padding: '8px 4px' }}
                    >
                      <img src={`https://ui-avatars.com/api/?name=${u.name}&background=${u.color}&color=fff`} style={{ width: '16px', height: '16px', borderRadius: '50%', marginRight: '6px' }} />
                      {u.name}
                    </button>
                  ))}
                  <button 
                    type="button"
                    className={`btn btn-sm ${formData.isWholeDept ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setFormData({...formData, isWholeDept: true, assignee: 'Phòng WEB'})}
                    style={{ flex: '1 0 100%', marginTop: '8px', fontSize: '12px', padding: '10px 4px' }}
                  >
                    <i className='bx bx-group' style={{ marginRight: '6px' }}></i> Gửi nguyên bộ phận WEB
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Ghi chú thêm (Note)</label>
                <textarea 
                  rows="3" 
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                  placeholder="Yêu cầu cụ thể..."
                ></textarea>
              </div>

              <div className="modal-footer" style={{ padding: '10px 0 0' }}>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px' }}>Tạo Task & Gửi thông báo</button>
              </div>
            </form>
          )}
        </div>
      </div>

      <style jsx>{`
        .selection-card {
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 24px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          background: var(--bg-surface);
        }
        .selection-card:hover {
          border-color: var(--primary);
          transform: translateY(-5px);
          box-shadow: var(--shadow-md);
        }
        .selection-card.wide {
          display: flex;
          align-items: center;
          gap: 20px;
          text-align: left;
          padding: 20px;
        }
        .card-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          margin: 0 auto 15px;
        }
        .selection-card.wide .card-icon { margin: 0; }
        .card-icon.blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
        .card-icon.green { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .card-icon.purple { background: rgba(168, 85, 247, 0.1); color: #a855f7; }
        h4 { font-size: 16px; font-weight: 600; margin: 0; }
        p { font-size: 12px; color: var(--text-muted); margin-top: 5px; }
      `}</style>
    </div>
  );
}
