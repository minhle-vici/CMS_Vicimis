"use client";
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import StatCard from '@/components/StatCard';
import ProjectTable from '@/components/WebsiteTable';
import WebsiteModal from '@/components/WebsiteModal';
import { useNotification } from '@/components/Notification';

export default function WebsitesPage() {
  const { data: session } = useSession();
  const { showNotification } = useNotification();
  
  const [websites, setWebsites] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchId, setSearchId] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const itemsPerPage = 10;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch Websites
      const resWebs = await fetch('/api/websites');
      const dataWebs = await resWebs.json();
      setWebsites(dataWebs);

      // Fetch Users (for the modal selects)
      const resUsers = await fetch('/api/users');
      const dataUsers = await resUsers.json();
      setUsers(dataUsers);
    } catch (error) {
      console.error('Error fetching data:', error);
      showNotification('Không thể tải dữ liệu!', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveWebsite = async (formData) => {
    try {
      // Nếu là yêu cầu Fix, luôn dùng POST để tạo Task mới
      const isFix = formData.isFixMode;
      const url = (editingWebsite && !isFix) ? `/api/websites/${editingWebsite.id}` : '/api/websites';
      const method = (editingWebsite && !isFix) ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        showNotification(isFix ? 'Đã gửi yêu cầu Fix thành công!' : (editingWebsite ? 'Cập nhật website thành công!' : 'Khởi tạo website thành công!'), 'success');
        setIsModalOpen(false);
        fetchData();
      } else {
        const err = await res.json();
        showNotification(err.error || 'Có lỗi xảy ra!', 'error');
      }
    } catch (error) {
      showNotification('Lỗi kết nối server!', 'error');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    const item = websites.find(w => String(w.id) === String(id));
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
        setWebsites(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
        showNotification(`Đã cập nhật trạng thái: ${newStatus}`, 'info');
      }
    } catch (error) {
      showNotification('Lỗi cập nhật trạng thái!', 'error');
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
        showNotification(`Đã cập nhật trạng thái và tài khoản!`, 'success');
        setPendingStatusChange(null);
        fetchData();
      } else {
        showNotification('Lỗi server khi cập nhật!', 'error');
      }
    } catch (error) {
      showNotification('Lỗi kết nối!', 'error');
    }
  };

  const openEditModal = (website) => {
    setEditingWebsite(website);
    setIsModalOpen(true);
  };

  const filteredWebsites = websites.filter(site => {
    const matchesId = String(site.siteId).toLowerCase().includes(searchId.toLowerCase());
    const matchesGlobal = 
      site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (site.domain || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || site.status === statusFilter;
    
    return matchesId && matchesGlobal && matchesStatus;
  });

  const totalPages = Math.ceil(filteredWebsites.length / itemsPerPage);
  const paginatedWebsites = filteredWebsites.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="app-container">
      <Sidebar />

      <main className="main-content">
        <Topbar
          onAddTask={() => { setEditingWebsite(null); setIsModalOpen(true); }}
          buttonText="Website mới"
          searchQuery={searchTerm}
          onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
        />

        <header className="page-header" style={{ padding: '24px 40px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 700 }}>Quản lý Websites</h1>
              <p style={{ color: '#64748b' }}>Quản lý định danh ID, demo và tiến độ bàn giao dự án.</p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <select 
                className="btn btn-outline" 
                value={statusFilter} 
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                style={{ borderRadius: '12px', padding: '10px 20px', minWidth: '180px' }}
              >
                <option value="all">Tất cả tiến độ</option>
                <option value="Đã tiếp nhận">Đã tiếp nhận</option>
                <option value="Đang thực hiện">Đang thực hiện</option>
                <option value="Hoàn thành demo">Hoàn thành demo</option>
                <option value="Bàn giao">Bàn giao</option>
              </select>
            </div>
          </div>
        </header>

        <section className="overview" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '24px', 
          padding: '32px 40px' 
        }}>
          <StatCard icon="bx-globe" color="purple" label="Tổng dự án" value={websites.length} />
          <StatCard icon="bx-loader-circle" color="blue" label="Đang thực hiện" value={websites.filter(s => s.status === 'Đang thực hiện').length} />
          <StatCard icon="bx-check-double" color="green" label="Hoàn thành demo" value={websites.filter(s => s.status === 'Hoàn thành demo').length} />
          <StatCard icon="bx-gift" color="red" label="Đã bàn giao" value={websites.filter(s => s.status === 'Bàn giao').length} />
        </section>

        <div className="table-container" style={{ padding: '0 40px 40px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px' }}>Đang tải dữ liệu...</div>
          ) : (
            <ProjectTable
              data={paginatedWebsites}
              onStatusChange={handleStatusChange}
              onEdit={openEditModal}
              searchId={searchId}
              onSearchId={setSearchId}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </main>

      <WebsiteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveWebsite}
        users={users}
        initialData={editingWebsite}
      />

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
    </div>
  );
}
