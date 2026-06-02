"use client";
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback, Suspense } from 'react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import ProjectTable from '@/components/WebsiteTable';
import TaskCard from '@/components/TaskCard';
import { useNotification } from '@/components/Notification';

export default function MyTasksPage() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <MyTasksContent />
    </Suspense>
  );
}

function MyTasksContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showNotification } = useNotification();
  
  const [websites, setWebsites] = useState([]);
  const [itUsers, setItUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban'); 
  const [draggedId, setDraggedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [selectedTaskDetail, setSelectedTaskDetail] = useState(null);

  useEffect(() => {
    const handleOpenDetail = (e) => setSelectedTaskDetail(e.detail);
    window.addEventListener('open-task-detail', handleOpenDetail);
    return () => window.removeEventListener('open-task-detail', handleOpenDetail);
  }, []);

  // Đồng bộ filter từ URL
  const dateFilter = searchParams.get('filter') || 'all';
  const selectedMonth = searchParams.get('month') || new Date().toISOString().slice(0, 7);

  const updateFilters = (newFilter, newMonth) => {
    const params = new URLSearchParams(searchParams);
    if (newFilter) params.set('filter', newFilter);
    if (newMonth) params.set('month', newMonth);
    setCurrentPage(1);
    router.push(`?${params.toString()}`);
  };

  const fetchMyData = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const roleParam = session.user.role === 'Admin' ? '' : `?role=${session.user.role}&userId=${session.user.id}`;
      const res = await fetch(`/api/websites${roleParam}`);
      if (res.ok) {
        const data = await res.json();
        setWebsites(data);
      } else {
        setWebsites([]);
      }
    } catch (error) {
      console.error('Error fetching my tasks:', error);
      showNotification('Không thể tải danh sách công việc!', 'error');
    } finally {
      setLoading(false);
    }

    // Lấy danh sách IT để chuyển giao
    try {
      const resUsers = await fetch('/api/users');
      const allUsers = await resUsers.json();
      setItUsers(allUsers.filter(u => u.role === 'IT'));
    } catch (e) { console.error(e); }
  }, [session, showNotification]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchMyData();
    }
  }, [session, fetchMyData]);

  const handleStatusChange = async (id, newStatus) => {
    console.log('🔄 Đang cập nhật trạng thái:', { id, newStatus });

    const item = websitesList.find(w => String(w.id) === String(id));
    if (session?.user?.role === 'IT' && newStatus !== 'Đã tiếp nhận') {
      if (!item?.demoUser || !item?.demoPass) {
        setPendingStatusChange({ id, newStatus, currentItem: item });
        return;
      }
    }

    try {
      const res = await fetch(`/api/websites/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        const updatedSite = await res.json();
        setWebsites(prev => {
          const newState = prev.map(s => String(s.id) === String(id) ? updatedSite : s);
          console.log('✅ State mới:', newState.find(s => String(s.id) === String(id)));
          return newState;
        });
        showNotification(`Đã chuyển sang: ${newStatus}`, 'success');
      } else {
        const errorData = await res.json();
        console.error('❌ Lỗi API:', errorData);
        showNotification('Lỗi server khi cập nhật!', 'error');
      }
    } catch (error) {
      console.error('❌ Lỗi kết nối:', error);
      showNotification('Lỗi kết nối!', 'error');
    }
  };

  const submitPendingStatusChange = async (e) => {
    e.preventDefault();
    const demoUser = e.target.demoUser.value;
    const demoPass = e.target.demoPass.value;
    const demoUrl = e.target.demoUrl?.value || '';

    try {
      const { id, newStatus } = pendingStatusChange;
      const res = await fetch(`/api/websites/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, demoUser, demoPass, demoUrl })
      });
      
      if (res.ok) {
        const updatedSite = await res.json();
        setWebsites(prev => prev.map(s => String(s.id) === String(id) ? updatedSite : s));
        showNotification(`Đã cập nhật trạng thái và tài khoản!`, 'success');
        setPendingStatusChange(null);
      } else {
        showNotification('Lỗi server khi cập nhật!', 'error');
      }
    } catch (error) {
      showNotification('Lỗi kết nối!', 'error');
    }
  };

  // Drag and Drop Handlers
  const onDragStart = (e, id) => {
    if (!id) return;
    setDraggedId(id);
    e.dataTransfer.setData("id", id);
    // Visual feedback
    e.currentTarget.style.opacity = '0.4';
    e.currentTarget.style.transform = 'scale(0.95)';
  };

  const onDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const handlePassTask = async (id, targetUserId) => {
    try {
      const res = await fetch(`/api/websites/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedToId: targetUserId, isAcknowledged: false })
      });
      if (res.ok) {
        showNotification('Đã chuyển giao Task thành công!', 'success');
        fetchMyData(); // Reload
      }
    } catch (error) {
      showNotification('Lỗi khi chuyển giao!', 'error');
    }
  };

  const onDrop = (e, targetStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("id") || draggedId;
    console.log('📥 Drop event:', { id, targetStatus });
    
    if (id) {
      // Xác định trạng thái cụ thể để áp dụng
      let statusToApply = Array.isArray(targetStatus) ? targetStatus[0] : targetStatus;
      
      const item = websites.find(w => String(w.id) === String(id));
      if (item) {
        if (item.status !== statusToApply) {
          handleStatusChange(id, statusToApply);
        } else {
          console.log('ℹ️ Trạng thái không đổi, bỏ qua.');
        }
      }
    }
    setDraggedId(null);
  };

  if (status === 'loading') return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Đang tải...</div>;

  const websitesList = Array.isArray(websites) ? websites : [];

  const filteredWebsites = websitesList.filter(w => {
    // KHÔNG hiển thị task đã giao cho người khác trong bảng "Công việc của tôi"
    if (w.assignedToId && String(w.assignedToId) !== String(session?.user?.id)) {
      return false;
    }

    if (dateFilter === 'all') return true;
    const taskDate = new Date(w.startDate || w.createdAt);
    const now = new Date();
    
    if (dateFilter === 'today') {
      return taskDate.toDateString() === now.toDateString();
    }
    if (dateFilter === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return taskDate >= oneWeekAgo;
    }
    if (dateFilter === 'month') {
      return taskDate.getMonth() === now.getMonth() && taskDate.getFullYear() === now.getFullYear();
    }
    if (dateFilter === 'custom') {
      return taskDate.toISOString().slice(0, 7) === selectedMonth;
    }
    return true;
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredWebsites.length / itemsPerPage);
  const paginatedWebsites = filteredWebsites.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const columns = [
    { title: 'Tiếp nhận', status: 'Đã tiếp nhận', color: '#64748b' },
    { title: 'Đang thực hiện', status: 'Đang thực hiện', color: '#3b82f6' },
    { title: 'Hoàn thành / Demo', status: ['Hoàn thành demo', 'Bàn giao'], color: '#10b981' }
  ];

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Topbar buttonText="Yêu cầu hỗ trợ" />
        
        <header className="page-header" style={{ padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700 }}>Công việc của tôi</h1>
            <p style={{ color: 'var(--text-muted)' }}>Chào {session?.user?.name}, kéo thả để cập nhật tiến độ công việc.</p>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ background: 'var(--bg-surface-hover)', padding: '4px', borderRadius: '12px', display: 'flex', gap: '4px', border: '1px solid var(--border-color)' }}>
              {['all', 'today', 'week', 'month'].map((f) => (
                <button 
                  key={f}
                  onClick={() => updateFilters(f)}
                  style={{ 
                    padding: '8px 16px', 
                    borderRadius: '8px', 
                    border: 'none', 
                    cursor: 'pointer', 
                    fontSize: '13px',
                    fontWeight: 600,
                    background: dateFilter === f ? 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' : 'transparent',
                    color: dateFilter === f ? 'white' : 'var(--text-muted)',
                    boxShadow: dateFilter === f ? '0 4px 12px rgba(59, 130, 246, 0.2)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  {f === 'all' ? 'Tất cả' : f === 'today' ? 'Hôm nay' : f === 'week' ? 'Tuần này' : 'Tháng này'}
                </button>
              ))}
            </div>

            <input 
              type="month" 
              value={selectedMonth}
              onChange={(e) => updateFilters('custom', e.target.value)}
              style={{ 
                padding: '8px 12px', 
                borderRadius: '10px', 
                border: '1px solid var(--border-color)', 
                fontSize: '13px',
                outline: 'none',
                background: 'var(--bg-surface-hover)',
                color: 'var(--text-main)',
                cursor: 'pointer'
              }}
            />

            <div style={{ background: 'var(--bg-surface-hover)', padding: '6px', borderRadius: '14px', display: 'flex', gap: '4px' }}>
              <button onClick={() => setViewMode('kanban')} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: viewMode === 'kanban' ? 'var(--card-bg)' : 'transparent', boxShadow: viewMode === 'kanban' ? 'var(--shadow)' : 'none', fontWeight: 600, color: viewMode === 'kanban' ? 'var(--text-main)' : 'var(--text-muted)' }}>
                <i className='bx bx-columns'></i>
              </button>
              <button onClick={() => setViewMode('table')} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: viewMode === 'table' ? 'var(--card-bg)' : 'transparent', boxShadow: viewMode === 'table' ? 'var(--shadow)' : 'none', fontWeight: 600, color: viewMode === 'table' ? 'var(--text-main)' : 'var(--text-muted)' }}>
                <i className='bx bx-list-ul'></i>
              </button>
            </div>
          </div>
        </header>

        <div className="content-area" style={{ padding: '0 40px 40px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px' }}>Đang tải dữ liệu...</div>
          ) : viewMode === 'table' ? (
            <ProjectTable data={paginatedWebsites} onStatusChange={handleStatusChange} onEdit={() => {}} searchId="" onSearchId={() => {}} currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', alignItems: 'start' }}>
              {columns.map((col) => (
                <div 
                  key={col.title} 
                  onDragOver={onDragOver}
                  onDrop={(e) => onDrop(e, col.status)}
                  style={{ background: 'rgba(0,0,0,0.02)', borderRadius: '24px', padding: '20px', minHeight: '600px', border: '1px solid rgba(0,0,0,0.03)', transition: 'background 0.3s' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '0 8px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: col.color }}></span>
                      {col.title}
                    </h3>
                    <span style={{ background: 'rgba(0,0,0,0.05)', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>
                      {filteredWebsites.filter(w => Array.isArray(col.status) ? col.status.includes(w.status) : w.status === col.status).length}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {filteredWebsites
                      .filter(w => Array.isArray(col.status) ? col.status.includes(w.status) : w.status === col.status)
                      .map((site) => (
                        <TaskCard 
                          key={site.id}
                          site={site}
                          itUsers={itUsers}
                          currentUserId={session?.user?.id}
                          onPassTask={handlePassTask}
                          onDragStart={onDragStart}
                          onDragEnd={onDragEnd}
                          columnColor={col.color}
                        />
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Popup yêu cầu thông tin tài khoản khi IT đổi trạng thái */}
      {pendingStatusChange && (
        <div className="modal-overlay active" style={{ zIndex: 10000 }}>
          <div className="modal" style={{ maxWidth: '450px', padding: '0', borderRadius: '24px', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', padding: '24px', color: 'white' }}>
              <h3 style={{ margin: 0, fontSize: '20px' }}>Yêu cầu thông tin truy cập</h3>
              <p style={{ margin: '8px 0 0', fontSize: '13px', opacity: 0.9 }}>
                Vui lòng cung cấp tài khoản và mật khẩu demo trước khi chuyển sang trạng thái <strong>{pendingStatusChange.newStatus}</strong>.
              </p>
            </div>
            <form onSubmit={submitPendingStatusChange} style={{ padding: '24px', background: 'white' }}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '8px', display: 'block' }}>URL DEMO (Tùy chọn)</label>
                <input name="demoUrl" type="text" defaultValue={pendingStatusChange.currentItem?.demoUrl || ''} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }} placeholder="https://..." />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '8px', display: 'block' }}>TÀI KHOẢN (Bắt buộc)</label>
                <input name="demoUser" type="text" required defaultValue={pendingStatusChange.currentItem?.demoUser || ''} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
              </div>
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '8px', display: 'block' }}>MẬT KHẨU (Bắt buộc)</label>
                <input name="demoPass" type="text" required defaultValue={pendingStatusChange.currentItem?.demoPass || ''} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setPendingStatusChange(null)}>Hủy bỏ</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Lưu & Cập nhật trạng thái</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup Xem chi tiết Task */}
      {selectedTaskDetail && (
        <div className="modal-overlay active" style={{ zIndex: 10000 }} onClick={(e) => { if(e.target.className.includes('modal-overlay')) setSelectedTaskDetail(null); }}>
          <div className="modal" style={{ maxWidth: '600px', padding: '0', borderRadius: '24px', overflow: 'hidden', background: '#fff' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '20px', color: '#1e293b' }}>{selectedTaskDetail.name}</h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>Mã dự án: #{selectedTaskDetail.siteId || selectedTaskDetail.id}</p>
              </div>
              <button onClick={() => setSelectedTaskDetail(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}>
                <i className='bx bx-x'></i>
              </button>
            </div>
            <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>Yêu cầu / Ghi chú</h4>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', color: '#334155', fontSize: '14px', whiteSpace: 'pre-wrap', border: '1px solid #e2e8f0', wordBreak: 'break-word' }}>
                  {selectedTaskDetail.info || 'Không có ghi chú thêm.'}
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>Mức độ ưu tiên</h4>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '8px', 
                    fontSize: '13px', 
                    fontWeight: 700,
                    background: selectedTaskDetail.priority === 'Ưu tiên 60p' ? '#fee2e2' : selectedTaskDetail.priority === 'Không gấp' ? '#f1f5f9' : '#dcfce3',
                    color: selectedTaskDetail.priority === 'Ưu tiên 60p' ? '#dc2626' : selectedTaskDetail.priority === 'Không gấp' ? '#64748b' : '#16a34a',
                  }}>
                    {selectedTaskDetail.priority || 'Bình thường 24g'}
                  </span>
                </div>
                <div>
                  <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>Template URL</h4>
                  {selectedTaskDetail.templateUrl ? (
                    <a href={selectedTaskDetail.templateUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '14px', wordBreak: 'break-all' }}>
                      {selectedTaskDetail.templateUrl}
                    </a>
                  ) : <span style={{ color: '#94a3b8', fontSize: '14px' }}>Chưa cập nhật</span>}
                </div>
                <div>
                  <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>Domain</h4>
                  {selectedTaskDetail.domain ? (
                    <a href={`https://${selectedTaskDetail.domain}`} target="_blank" rel="noopener noreferrer" style={{ color: '#10b981', textDecoration: 'none', fontSize: '14px', wordBreak: 'break-all' }}>
                      {selectedTaskDetail.domain}
                    </a>
                  ) : <span style={{ color: '#94a3b8', fontSize: '14px' }}>Chưa cập nhật</span>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ background: '#f1f5f9', padding: '16px', borderRadius: '12px' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>Người giao (Brief)</h4>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{selectedTaskDetail.briefedBy?.name || 'N/A'}</div>
                </div>
                <div style={{ background: '#f1f5f9', padding: '16px', borderRadius: '12px' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>Người thực hiện</h4>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{selectedTaskDetail.assignedTo?.name || 'Cả phòng IT'}</div>
                </div>
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedTaskDetail(null)} className="btn btn-outline" style={{ padding: '8px 24px' }}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
