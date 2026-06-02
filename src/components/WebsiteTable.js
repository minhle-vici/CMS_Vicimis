import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Pagination from './Pagination';

export const PROJECT_STATUSES = [
  { value: 'Đã tiếp nhận', class: 'status-pending' },
  { value: 'Đang thực hiện', class: 'status-in-progress' },
  { value: 'Hoàn thành demo', class: 'status-info' },
  { value: 'Bàn giao', class: 'status-handed-over' }
];

export default function ProjectTable({ 
  data, 
  onStatusChange, 
  onEdit,
  searchId, 
  onSearchId, 
  currentPage, 
  totalPages, 
  onPageChange
}) {
  const { data: session } = useSession();

  return (
    <div className="data-table-wrapper" style={{ border: 'none', background: 'transparent' }}>
      <style jsx>{`
        .glass-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0 12px;
        }
        .glass-table th {
          padding: 12px 24px;
          color: #64748b;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .glass-table tr td {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          padding: 20px 24px;
          transition: all 0.3s;
        }
        .glass-table tr td:first-child { border-radius: 20px 0 0 20px; border-left: 1px solid rgba(255,255,255,0.4); }
        .glass-table tr td:last-child { border-radius: 0 20px 20px 0; border-right: 1px solid rgba(255,255,255,0.4); }
        .glass-table tr:hover td {
          background: rgba(255, 255, 255, 0.95);
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.05);
        }
        .website-id-pill {
          background: #1e293b;
          color: white;
          padding: 6px 12px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 13px;
          display: inline-block;
        }
        .user-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
        }
        .status-pill {
          padding: 6px 12px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          outline: none;
          width: 100%;
          transition: opacity 0.2s;
        }
        .status-pill:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }
        .status-Đã-tiếp-nhận { background: #f1f5f9; color: #475569; }
        .status-Đang-thực-hiện { background: #dbeafe; color: #1d4ed8; }
        .status-Hoàn-thành-demo { background: #fef3c7; color: #b45309; }
        .status-Bàn-giao { background: #d1fae5; color: #065f46; }
      `}</style>

      <table className="glass-table">
        <thead>
          <tr>
            <th style={{ width: '120px' }}>
              <div style={{ marginBottom: '8px' }}>ID WEB</div>
              <input 
                type="text" 
                placeholder="Tìm ID..." 
                value={searchId}
                onChange={(e) => onSearchId(e.target.value)}
                style={{ width: '100%', padding: '6px 10px', fontSize: '11px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white' }}
              />
            </th>
            <th>TÊN WEBSITE / DỰ ÁN</th>
            <th>BRIEF / ORDER</th>
            <th>DEMO / DOMAIN</th>
            <th style={{ width: '180px' }}>TRẠNG THÁI</th>
            <th>THAO TÁC</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? data.map((item) => {
            const isOwner = session?.user?.id === String(item.briefById);
            const isAssignee = session?.user?.id === String(item.assignedToId);
            const isAdmin = session?.user?.role === 'Admin';
            const canChangeStatus = isOwner || isAssignee || isAdmin;

            return (
              <tr key={item.id}>
                <td><span className="website-id-pill">{item.siteId}</span></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '15px' }}>{item.name}</div>
                    {item.createdAt && (new Date() - new Date(item.createdAt)) / (1000 * 60 * 60 * 24) <= 7 && (
                      <span style={{ 
                        background: 'linear-gradient(135deg, #10b981, #34d399)', 
                        color: 'white', 
                        fontSize: '9px', 
                        padding: '2px 6px', 
                        borderRadius: '6px', 
                        fontWeight: 800,
                        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                      }}>NEW</span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                    Bắt đầu: {item.startDate ? new Date(item.startDate).toLocaleDateString('vi-VN') : '---'}
                  </div>
                </td>
                <td>
                  <div className="user-chip" style={{ marginBottom: '6px' }}>
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>GIAO:</span>
                    <span style={{ color: '#db2777' }}>{item.briefedBy?.name || '---'}</span>
                  </div>
                  <div className="user-chip">
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>NHẬN:</span>
                    <span style={{ color: '#2563eb' }}>{item.assignedTo?.name || '---'}</span>
                  </div>
                </td>
                <td>
                  <div style={{ marginBottom: '4px' }}>
                    {item.demoUrl ? (
                      <a href={item.demoUrl} target="_blank" style={{ fontSize: '12px', color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}>
                        <i className='bx bx-link-alt'></i> Xem Demo
                      </a>
                    ) : <span style={{ fontSize: '12px', color: '#94a3b8' }}>Chưa có demo</span>}
                  </div>
                  <div>
                    {item.domain ? (
                      <a href={`https://${item.domain}`} target="_blank" style={{ fontSize: '12px', color: '#10b981', textDecoration: 'none', fontWeight: 600 }}>
                        <i className='bx bx-globe'></i> {item.domain}
                      </a>
                    ) : <span style={{ fontSize: '12px', color: '#94a3b8' }}>Chưa có domain</span>}
                  </div>
                </td>
                <td>
                  <div style={{ position: 'relative' }}>
                    <select 
                      className={`status-pill status-${item.status.replace(/\s+/g, '-')}`}
                      value={item.status}
                      onChange={(e) => onStatusChange(item.id, e.target.value)}
                      disabled={!canChangeStatus}
                      title={!canChangeStatus ? "Bạn không có quyền đổi trạng thái dự án này" : ""}
                    >
                      {PROJECT_STATUSES.map(s => (
                        <option key={s.value} value={s.value}>{s.value}</option>
                      ))}
                    </select>
                    {!canChangeStatus && <i className='bx bx-lock-alt' style={{ position: 'absolute', right: '-15px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#94a3b8' }}></i>}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-icon-small" onClick={() => onEdit(item)} title="Sửa chi tiết">
                      <i className='bx bx-edit-alt' style={{ fontSize: '20px' }}></i>
                    </button>
                    <Link href={`/websites/${item.id}`} className="btn-icon-small" title="Xem full">
                      <i className='bx bx-fullscreen' style={{ fontSize: '20px' }}></i>
                    </Link>
                  </div>
                </td>
              </tr>
            );
          }) : (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', padding: '60px', color: '#64748b', background: 'rgba(255,255,255,0.5)', borderRadius: '20px' }}>
                <i className='bx bx-search-alt' style={{ fontSize: '48px', opacity: 0.2 }}></i>
                <p style={{ marginTop: '10px' }}>Không tìm thấy website nào khớp với tìm kiếm</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      
      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={onPageChange} 
      />
    </div>
  );
}
