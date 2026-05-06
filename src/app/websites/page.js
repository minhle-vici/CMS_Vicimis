"use client";
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import StatCard from '@/components/StatCard';
import ProjectTable from '@/components/WebsiteTable';
import TaskModal from '@/components/TaskModal';
import WebsiteModal from '@/components/WebsiteModal';

export default function WebsitesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWebsiteModalOpen, setIsWebsiteModalOpen] = useState(false);
  const [users] = useState([
    { id: 1, name: 'Quân', role: 'IT', color: '3b82f6' },
    { id: 2, name: 'Minh', role: 'IT', color: '10b981' },
    { id: 3, name: 'Huyền', role: 'AM', color: 'f472b6' },
    { id: 4, name: 'Nhi', role: 'AM', color: 'a855f7' },
    { id: 5, name: 'Admin', role: 'IT', color: '6366f1' },
  ]);
  // Initial mock data
  const initialWebsites = [
    { id: '739', am: 'Nhi', it: 'Minh', name: 'Vicimis Nails 739', type: 'Nails & Spa', status: 'Đang thực hiện', domain: 'nails739.com', demo: '', createdAt: '2026-05-01' },
    { id: '605A', am: 'Huyền', it: 'Quân', name: 'Vicimis Nails 605A', type: 'Nails & Spa', status: 'Đang thực hiện', domain: 'nails605a.com', demo: '', createdAt: '2026-05-01' },
    { id: '698', am: 'Phương', it: 'Minh', name: 'Vicimis Nails 698', type: 'Nails & Spa', status: 'Đã hoàn thành', domain: 'nails698.com', demo: '', createdAt: '2026-05-01' },
    { id: '650', am: 'Mai', it: 'Quân', name: 'Vicimis Nails 650', type: 'Nails & Spa', status: 'Đã hoàn thành', domain: 'nails650.com', demo: '', createdAt: '2026-05-01' },
    { id: '234', am: 'Gia', it: 'Minh', name: 'Vicimis Nails 234', type: 'Nails & Spa', status: 'Đã hoàn thành', domain: 'nails234.com', demo: '', createdAt: '2026-05-01' },
    { id: '186', am: 'Gia', it: 'Quân', name: 'Vicimis Nails 186', type: 'Nails & Spa', status: 'Đã hoàn thành', domain: 'nails186.com', demo: '', createdAt: '2026-05-01' },
    { id: '566', am: 'Gia', it: 'Minh', name: 'Vicimis Nails 566', type: 'Nails & Spa', status: 'Đã hoàn thành', domain: 'nails566.com', demo: '', createdAt: '2026-05-01' },
    { id: '232', am: 'Huyền', it: 'Quân', name: 'Vicimis Nails 232', type: 'Nails & Spa', status: 'Đã hoàn thành', domain: 'nails232.com', demo: '', createdAt: '2026-05-01' },
    { id: '476', am: 'Phương', it: 'Minh', name: 'Vicimis Nails 476', type: 'Nails & Spa', status: 'Đã hoàn thành', domain: 'nails476.com', demo: '', createdAt: '2026-05-04' },
    { id: '617A', am: 'Phương', it: 'Minh', name: 'Vicimis Nails 617A', type: 'Nails & Spa', status: 'Đã hoàn thành', domain: 'nails617a.com', demo: '', createdAt: '2026-05-04' },
    { id: '323', am: 'Mai', it: 'Quân', name: 'Vicimis Nails 323', type: 'Nails & Spa', status: 'Đã hoàn thành', domain: 'nails323.com', demo: '', createdAt: '2026-05-04' },
    { id: '626', am: 'Phương', it: 'Quân', name: 'Vicimis Nails 626', type: 'Nails & Spa', status: 'Đã hoàn thành', domain: 'nails626.com', demo: '', createdAt: '2026-05-04' },
    { id: '222', am: 'Mai', it: 'Minh', name: 'Vicimis Nails 222', type: 'Nails & Spa', status: 'Đã hoàn thành', domain: 'nails222.com', demo: '', createdAt: '2026-05-04' },
    { id: '688', am: 'Mai', it: 'Quân', name: 'Vicimis Nails 688', type: 'Nails & Spa', status: 'Đã hoàn thành', domain: 'nails688.com', demo: '', createdAt: '2026-05-05' },
  ];

  const [websites, setWebsites] = useState(initialWebsites);

  // Persistence logic
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('🔄 Đang kiểm tra bộ nhớ trình duyệt cho Websites...');
      const saved = localStorage.getItem('vicimis_websites');
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('✅ Đã tải danh sách Websites từ localStorage:', parsed);
        setWebsites(parsed);
      } else {
        console.log('ℹ️ Chưa có dữ liệu cũ, sử dụng dữ liệu mẫu mặc định.');
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('💾 Đang lưu thay đổi Websites vào localStorage...', websites);
      localStorage.setItem('vicimis_websites', JSON.stringify(websites));
    }
  }, [websites]);

  const handleAddWebsite = (newWebsite) => {
    setWebsites([...websites, newWebsite]);
  };

  const [searchTerm, setSearchTerm] = useState(''); // Global search (Name, Address, etc.)
  const [searchId, setSearchId] = useState('');     // Local ID search
  const [timeFilter, setTimeFilter] = useState('month'); // default to month
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [amFilter, setAmFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleStatusChange = (id, newStatus) => {
    setWebsites(prev => prev.map(site =>
      site.id === id ? { ...site, status: newStatus } : site
    ));
  };

  const filteredWebsites = websites.filter(site => {
    // 1. ID Match (Local)
    const matchesId = site.id.toLowerCase().includes(searchId.toLowerCase());

    // 2. Global Match (Name, Domain, etc.)
    const matchesGlobal =
      site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (site.domain || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (site.address || '').toLowerCase().includes(searchTerm.toLowerCase());

    // 3. Time Filter
    let matchesTime = true;
    const createdDate = new Date(site.createdAt);
    const now = new Date();
    // ... logic for matchesTime ... (I will fix it in the replacement)

    if (timeFilter === 'day') {
      const diffDays = Math.ceil(Math.abs(now - createdDate) / (1000 * 60 * 60 * 24));
      if (diffDays > 1) matchesTime = false;
    }

    if (timeFilter === 'week') {
      const diffDays = Math.ceil(Math.abs(now - createdDate) / (1000 * 60 * 60 * 24));
      if (diffDays > 7) matchesTime = false;
    }

    if (timeFilter === 'month') {
      const siteMonth = site.createdAt.slice(0, 7);
      if (siteMonth !== selectedMonth) matchesTime = false;
    }

    const matchesAm = amFilter === 'all' || site.am === amFilter;
    const matchesStatus = statusFilter === 'all' || site.status === statusFilter;

    return matchesId && matchesGlobal && matchesTime && matchesAm && matchesStatus;
  });

  const totalPages = Math.ceil(filteredWebsites.length / itemsPerPage);
  const paginatedWebsites = filteredWebsites.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="app-container">
      <Sidebar />

      <main className="main-content">
        <Topbar
          onAddTask={() => setIsWebsiteModalOpen(true)}
          buttonText="Website mới"
          searchQuery={searchTerm}
          onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
        />

        <header className="page-header" style={{ padding: '24px 40px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
            <div className="header-info">
              <h1>Quản lý Websites (ID Web)</h1>
              <p>Tra cứu dữ liệu dự án theo thời gian.</p>
            </div>

            <div className="filter-group" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ display: 'flex', background: 'var(--bg-surface-hover)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                {['day', 'week'].map((range) => (
                  <button
                    key={range}
                    onClick={() => { setTimeFilter(range); setCurrentPage(1); }}
                    className={`btn btn-sm ${timeFilter === range ? 'btn-primary' : 'btn-ghost'}`}
                    style={{
                      textTransform: 'capitalize',
                      padding: '6px 16px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      background: timeFilter === range ? 'var(--bg-surface)' : 'transparent',
                      color: timeFilter === range ? 'var(--text-light)' : 'var(--text-muted)',
                      boxShadow: timeFilter === range ? 'var(--shadow-sm)' : 'none',
                      border: 'none'
                    }}
                  >
                    {range === 'day' ? 'Hôm nay' : 'Tuần này'}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', padding: '12px 0' }}>
              <select
                className="btn btn-outline"
                value={amFilter}
                onChange={(e) => { setAmFilter(e.target.value); setCurrentPage(1); }}
                style={{ borderRadius: '12px', fontSize: '14px', padding: '12px 20px', width: '160px' }}
              >
                <option value="all">Tất cả AM</option>
                <option value="Huyền">Huyền</option>
                <option value="Nhi">Nhi</option>
              </select>

              <select
                className="btn btn-outline"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                style={{ borderRadius: '12px', fontSize: '14px', padding: '12px 20px', width: '180px' }}
              >
                <option value="all">Tất cả tiến độ</option>
                <option value="Đã tiếp nhận">Đã tiếp nhận</option>
                <option value="Đang thực hiện">Đang thực hiện</option>
                <option value="Đã hoàn thành">Đã hoàn thành</option>
              </select>
            </div>

            <div style={{ position: 'relative' }}>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => { setSelectedMonth(e.target.value); setTimeFilter('month'); setCurrentPage(1); }}
                className={`filter-control ${timeFilter === 'month' ? 'active' : ''}`}
                style={{ width: '180px' }}
              />
              <span style={{ position: 'absolute', top: '-22px', left: '4px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px' }}>CHỌN THÁNG</span>
            </div>
          </div>
        </header>

        <section className="overview" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: '24px', 
          padding: '0 40px',
          margin: '32px 0' 
        }}>
          <StatCard icon="bx-globe" color="purple" label="Đang hiển thị" value={filteredWebsites.length} />
          <StatCard icon="bx-check-double" color="green" label="Đã hoàn thành" value={filteredWebsites.filter(s => s.status === 'Đã hoàn thành').length} />
          <StatCard icon="bx-loader-circle" color="blue" label="Đang thực hiện" value={filteredWebsites.filter(s => s.status === 'Đang thực hiện').length} />
          <StatCard icon="bx-time" color="red" label="Đã tiếp nhận" value={filteredWebsites.filter(s => s.status === 'Đã tiếp nhận').length} />
        </section>

        <div className="table-container" style={{ padding: '0 40px 40px' }}>
          <ProjectTable
            data={paginatedWebsites}
            onStatusChange={handleStatusChange}
            searchId={searchId}
            onSearchId={setSearchId}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            linkLabel="Link Website"
            detailPath="websites"
          />
        </div>
      </main>

      <WebsiteModal
        isOpen={isWebsiteModalOpen}
        onClose={() => setIsWebsiteModalOpen(false)}
        onSave={handleAddWebsite}
        users={users}
      />

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={() => setIsModalOpen(false)}
        users={users}
        websites={websites}
        showBooking={false}
      />
    </div>
  );
}
