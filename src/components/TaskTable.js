import { useState } from 'react';

export default function TaskTable({ tasks, onTaskMove }) {
  // State for required info modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingMove, setPendingMove] = useState(null);
  const [confirmData, setConfirmData] = useState({ demo: '', adminPass: '', domain: '' });

  const getPriorityColor = (category) => {
    switch (category) {
      case 'Ưu tiên (60p)': return 'tag-red';
      case 'Bình thường (24h)': return 'tag-blue';
      case 'Không cần gấp': return 'tag-green';
      default: return 'tag-blue';
    }
  };

  const handleStatusChange = (task, newStatus) => {
    // Rule: Moving from "Đã tiếp nhận" specifically to "Đang thực hiện" requires info
    if (task.status === 'Đã tiếp nhận' && newStatus === 'Đang thực hiện') {
      const hasInfo = task.demo && task.adminPass && task.domain;
      
      if (!hasInfo) {
        setPendingMove({ id: task.id, status: newStatus });
        setIsConfirmModalOpen(true);
        return;
      }
    }

    // Rule: Cannot jump from "Đã tiếp nhận" to "Đã hoàn thành"
    if (task.status === 'Đã tiếp nhận' && newStatus === 'Đã hoàn thành') {
      alert("Task phải đi qua trạng thái 'Đang thực hiện' trước khi Hoàn thành!");
      return;
    }

    onTaskMove(task.id, newStatus);
  };

  const handleConfirmMove = (e) => {
    e.preventDefault();
    if (!confirmData.demo || !confirmData.adminPass || !confirmData.domain) {
      alert("Vui lòng nhập đầy đủ Link Domain, Link Demo và Tài khoản/Mật khẩu!");
      return;
    }
    onTaskMove(pendingMove.id, pendingMove.status, confirmData);
    setIsConfirmModalOpen(false);
    setPendingMove(null);
    setConfirmData({ demo: '', adminPass: '', domain: '' });
  };

  return (
    <>
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Task Name</th>
              <th>Website ID</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Assignee</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td>
                  <div style={{ fontWeight: 500 }}>{task.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{task.desc}</div>
                </td>
                <td>
                  {task.websiteId ? <span className="website-id">{task.websiteId}</span> : '-'}
                </td>
                <td>
                  <span className={`tag ${getPriorityColor(task.category)}`}>{task.category}</span>
                </td>
                <td>
                  <select 
                    value={task.status} 
                    onChange={(e) => handleStatusChange(task, e.target.value)}
                    className={`status-select ${
                      task.status === 'Đã hoàn thành' ? 'status-handed-over' : 
                      task.status === 'Đang thực hiện' ? 'status-in-progress' : 'status-pending'
                    }`}
                    style={{ 
                      padding: '4px 8px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 600,
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="Đã tiếp nhận">Đã tiếp nhận</option>
                    <option value="Đang thực hiện">Đang thực hiện</option>
                    <option value="Đã hoàn thành">Đã hoàn thành</option>
                  </select>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img 
                      src={`https://ui-avatars.com/api/?name=${task.user}&background=${task.userColor}&color=fff`} 
                      className="avatar-small" 
                      style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                      alt={task.user}
                    />
                    <span style={{ fontSize: '13px' }}>{task.user}</span>
                  </div>
                </td>
                <td>
                  <div className="action-btns">
                    <button className="btn-icon-small"><i className='bx bx-edit-alt'></i></button>
                    <button className="btn-icon-small"><i className='bx bx-trash' style={{ color: 'var(--red)' }}></i></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Required Info Modal */}
      {isConfirmModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3><i className='bx bx-shield-quarter' style={{ color: '#3b82f6', marginRight: '10px' }}></i> Cập nhật dữ liệu Demo</h3>
              <button onClick={() => setIsConfirmModalOpen(false)} className="close-btn"><i className='bx bx-x'></i></button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Vui lòng cung cấp thông tin dự án để bắt đầu thực hiện.
              </p>
              <form onSubmit={handleConfirmMove}>
                <div className="form-group">
                  <label>Link Domain</label>
                  <input type="text" required placeholder="https://..." value={confirmData.domain} onChange={(e) => setConfirmData({...confirmData, domain: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Link Demo</label>
                  <input type="text" required placeholder="https://demo..." value={confirmData.demo} onChange={(e) => setConfirmData({...confirmData, demo: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Tài khoản / Mật khẩu Admin</label>
                  <input type="text" required placeholder="admin / password123" value={confirmData.adminPass} onChange={(e) => setConfirmData({...confirmData, adminPass: e.target.value})} />
                </div>
                <div className="modal-footer" style={{ padding: '20px 0 0' }}>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>Xác nhận & Cập nhật</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
