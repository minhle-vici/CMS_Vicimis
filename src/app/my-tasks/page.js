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

  // Đồng bộ filter từ URL
  const dateFilter = searchParams.get('filter') || 'month';
  const selectedMonth = searchParams.get('month') || new Date().toISOString().slice(0, 7);

  const updateFilters = (newFilter, newMonth) => {
    const params = new URLSearchParams(searchParams);
    if (newFilter) params.set('filter', newFilter);
    if (newMonth) params.set('month', newMonth);
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
              {['today', 'week', 'month'].map((f) => (
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
                  {f === 'today' ? 'Hôm nay' : f === 'week' ? 'Tuần này' : 'Tháng này'}
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
            <ProjectTable data={filteredWebsites} onStatusChange={handleStatusChange} onEdit={() => {}} searchId="" onSearchId={() => {}} currentPage={1} totalPages={1} onPageChange={() => {}} />
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
    </div>
  );
}
