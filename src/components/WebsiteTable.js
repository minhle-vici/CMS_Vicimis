import Link from 'next/link';

export const PROJECT_STATUSES = [
  { value: 'Đã tiếp nhận', class: 'status-pending' },
  { value: 'Đang thực hiện', class: 'status-in-progress' },
  { value: 'Đã hoàn thành', class: 'status-handed-over' }
];

export default function ProjectTable({ 
  data, 
  onStatusChange, 
  searchId, 
  onSearchId, 
  currentPage, 
  totalPages, 
  onPageChange,
  linkLabel = "Link",
  detailPath = "websites"
}) {
  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: '120px' }}>
              <div style={{ marginBottom: '8px' }}>ID</div>
              <input 
                type="text" 
                placeholder="Search ID..." 
                value={searchId}
                onChange={(e) => onSearchId(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '8px 12px', 
                  fontSize: '11px', 
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-dark)',
                  color: 'var(--text-main)',
                  outline: 'none'
                }}
              />
            </th>
            <th>Tên Tiệm</th>
            <th>{linkLabel}</th>
            <th>Người Brief (AM)</th>
            <th>Người nhận (IT)</th>
            <th style={{ width: '180px' }}>Tiến độ</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? data.map((item) => (
            <tr key={item.id}>
              <td><span className="website-id">{item.id}</span></td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.name}</div>
                  {item.createdAt && (new Date() - new Date(item.createdAt)) / (1000 * 60 * 60 * 24) <= 7 && (
                    <span className="badge-new" style={{ 
                      background: 'linear-gradient(135deg, #10b981, #34d399)', 
                      color: 'white', 
                      fontSize: '9px', 
                      padding: '2px 6px', 
                      borderRadius: '4px', 
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                    }}>NEW</span>
                  )}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.type || 'Nails & Spa'}</div>
              </td>
              <td>
                {item.link || item.domain || item.bookingLink ? (
                  <a href={item.link || item.domain || item.bookingLink} target="_blank" className="external-link">
                    <i className='bx bx-link-external'></i> Truy cập
                  </a>
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Chưa có link</span>
                )}
              </td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img 
                    src={`https://ui-avatars.com/api/?name=${item.am}&background=f472b6&color=fff`} 
                    className="avatar-small" 
                    style={{ width: '24px', height: '24px' }}
                    alt={item.am}
                  />
                  <span>{item.am}</span>
                </div>
              </td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img 
                    src={`https://ui-avatars.com/api/?name=${item.it}&background=3b82f6&color=fff`} 
                    className="avatar-small" 
                    style={{ width: '24px', height: '24px' }}
                    alt={item.it}
                  />
                  <span>{item.it}</span>
                </div>
              </td>
              <td>
                <div className="status-select-wrapper">
                  <select 
                    className={`status-select ${
                      item.status === 'Đã hoàn thành' ? 'status-handed-over' : 
                      item.status === 'Đang thực hiện' ? 'status-in-progress' : 'status-pending'
                    }`}
                    value={item.status}
                    onChange={(e) => onStatusChange(item.id, e.target.value)}
                  >
                    {PROJECT_STATUSES.map(status => (
                      <option key={status.value} value={status.value}>{status.value}</option>
                    ))}
                  </select>
                </div>
              </td>
              <td>
                <div className="action-btns">
                  <Link href={`/${detailPath}/${item.id.replace('#', '')}`} className="btn btn-outline btn-sm" style={{ padding: '4px 12px', fontSize: '12px' }}>
                    Chi tiết <i className='bx bx-right-arrow-alt'></i>
                  </Link>
                </div>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                Không tìm thấy dữ liệu phù hợp
              </td>
            </tr>
          )}
        </tbody>
      </table>
      
      {totalPages > 1 && (
        <div className="pagination" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', padding: '16px', borderTop: '1px solid var(--border-color)' }}>
          <button className="btn btn-icon-small" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>
            <i className='bx bx-chevron-left'></i>
          </button>
          <div style={{ fontSize: '13px', fontWeight: 500 }}>
            Trang <span style={{ color: 'var(--primary)' }}>{currentPage}</span> / {totalPages}
          </div>
          <button className="btn btn-icon-small" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>
            <i className='bx bx-chevron-right'></i>
          </button>
        </div>
      )}
    </div>
  );
}





