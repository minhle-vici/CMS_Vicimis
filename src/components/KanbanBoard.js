"use client";
import { useState } from 'react';

export default function KanbanBoard({ tasks, onTaskMove }) {
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  
  // State for required info modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingMove, setPendingMove] = useState(null);
  const [confirmData, setConfirmData] = useState({ demo: '', adminPass: '' });

  const columns = [
    { id: 'Đã tiếp nhận', title: 'Đã tiếp nhận', color: '#ef4444' },
    { id: 'Đang thực hiện', title: 'Đang thực hiện', color: '#3b82f6' },
    { id: 'Đã hoàn thành', title: 'Đã hoàn thành', color: '#10b981' },
  ];

  const onDragStart = (e, id) => {
    setDraggedTaskId(id);
    e.dataTransfer.setData("id", id);
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDrop = (e, status) => {
    const id = e.dataTransfer.getData("id");
    const task = tasks.find(t => t.id === id);
    
    // Rule: Cannot jump from "Đã tiếp nhận" to "Đã hoàn thành"
    if (task.status === 'Đã tiếp nhận' && status === 'Đã hoàn thành') {
      alert("Task phải đi qua trạng thái 'Đang thực hiện' trước khi Hoàn thành!");
      return;
    }

    // Rule: Moving from "Đã tiếp nhận" specifically to "Đang thực hiện" requires info
    if (task.status === 'Đã tiếp nhận' && status === 'Đang thực hiện') {
      // Check if any required info is missing
      const hasInfo = task.demo && task.adminPass && task.domain;
      
      if (!hasInfo) {
        // Show modal if info is missing
        setPendingMove({ id, status });
        setIsConfirmModalOpen(true);
        return;
      }
    }
    
    onTaskMove(id, status);
  };

  const handleConfirmMove = (e) => {
    e.preventDefault();
    if (!confirmData.demo || !confirmData.adminPass) {
      alert("Vui lòng nhập đầy đủ Link Demo và Tài khoản/Mật khẩu!");
      return;
    }
    onTaskMove(pendingMove.id, pendingMove.status, confirmData);
    setIsConfirmModalOpen(false);
    setPendingMove(null);
    setConfirmData({ demo: '', adminPass: '' });
  };

  return (
    <>
      <div className="board">
        {columns.map(col => (
          <div 
            key={col.id} 
            className="column"
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, col.id)}
          >
            <div className="column-header">
              <div className="column-title">
                <span className="dot" style={{ backgroundColor: col.color }}></span>
                <h4>{col.title}</h4>
                <span className="count">{tasks.filter(t => t.status === col.id).length}</span>
              </div>
            </div>
            
            <div className="task-list">
              {tasks.filter(t => t.status === col.id).map(task => {
                const isUrgent = task.category === 'Ưu tiên (60p)';
                const isNormal = task.category === 'Bình thường (24h)';
                const isLow = task.category === 'Không cần gấp';
                
                const themeColor = isUrgent ? '#ef4444' : isNormal ? '#3b82f6' : '#10b981';
                
                return (
                  <div 
                    key={task.id} 
                    className="task-card"
                    draggable
                    onDragStart={(e) => onDragStart(e, task.id)}
                    style={{ borderLeft: `5px solid ${themeColor}` }}
                  >
                    <div className="card-header">
                      <span className="category-tag" style={{ 
                        backgroundColor: themeColor, 
                        color: '#ffffff', 
                        padding: '4px 10px', 
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: 800,
                        boxShadow: `0 2px 8px ${themeColor}44`
                      }}>
                        {task.category}
                      </span>
                      <span className="website-id" style={{ 
                        fontSize: '12px', 
                        fontWeight: 700, 
                        color: 'var(--text-main)',
                        background: 'var(--bg-surface-hover)',
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>{task.websiteId}</span>
                    </div>
                    <h4 className="task-title" style={{ marginTop: '12px', fontSize: '15px' }}>{task.title}</h4>
                    <p className="task-desc" style={{ marginBottom: '15px' }}>{task.desc}</p>
                    
                    {(task.demo || task.adminPass) && (
                      <div style={{ 
                        marginTop: '10px', 
                        padding: '10px', 
                        background: 'rgba(0,0,0,0.1)', 
                        borderRadius: '8px', 
                        fontSize: '12px', 
                        border: `1px solid ${themeColor}33`,
                        borderLeft: `3px solid ${themeColor}`
                      }}>
                        {task.demo && <div style={{ color: '#3b82f6', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><i className='bx bx-link-alt'></i> {task.demo}</div>}
                        {task.adminPass && <div style={{ color: 'var(--text-muted)', marginTop: '4px' }}><i className='bx bx-lock-alt'></i> {task.adminPass}</div>}
                      </div>
                    )}

                  <div className="card-footer" style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="user" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img 
                        src={`https://ui-avatars.com/api/?name=${task.user}&background=${task.userColor}&color=fff`} 
                        alt={task.user} 
                        style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)' }}>{task.user}</span>
                    </div>
                  </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Required Info Modal */}
      {isConfirmModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3><i className='bx bx-shield-quarter' style={{ color: '#3b82f6', marginRight: '10px' }}></i> Bắt đầu thực hiện Task</h3>
              <button onClick={() => setIsConfirmModalOpen(false)} className="close-btn"><i className='bx bx-x'></i></button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Để chuyển sang <strong>Đang thực hiện</strong>, vui lòng nhập thông tin truy cập.
              </p>
              <form onSubmit={handleConfirmMove}>
                <div className="form-group">
                  <label>Link Demo</label>
                  <input type="text" required placeholder="https://demo.vici.com/..." value={confirmData.demo} onChange={(e) => setConfirmData({...confirmData, demo: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Tài khoản / Mật khẩu Admin</label>
                  <input type="text" required placeholder="admin / password123" value={confirmData.adminPass} onChange={(e) => setConfirmData({...confirmData, adminPass: e.target.value})} />
                </div>
                <div className="modal-footer" style={{ padding: '20px 0 0' }}>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>Xác nhận & Bắt đầu làm</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
