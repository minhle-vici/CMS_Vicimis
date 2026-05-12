"use client";
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

export default function AdminDashboardClient({ websites, userStats, allTasks }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Topbar 
          searchQuery={searchQuery} 
          onSearchChange={setSearchQuery} 
          onAddTask={() => {}}
          buttonText={activeTab === 'dashboard' ? 'Thêm mới' : `Thêm ${activeTab}`}
        />

        <div className="admin-dashboard" style={{ padding: '24px 40px' }}>
          
          {activeTab === 'dashboard' ? (
            <div className="quick-actions" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '30px', marginTop: '40px' }}>
               <div onClick={() => setActiveTab('website')} className="action-card" style={{ background: '#1e3a8a', color: 'white', padding: '40px', borderRadius: '24px', cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 10px 25px rgba(30, 58, 138, 0.2)', textAlign: 'center' }}>
                  <i className='bx bx-globe' style={{ fontSize: '48px', marginBottom: '16px' }}></i>
                  <h3 style={{ fontSize: '24px' }}>Quản lý Website</h3>
                  <p style={{ opacity: 0.8, marginTop: '8px' }}>{websites.length} websites đang hoạt động</p>
               </div>
               
               <div onClick={() => setActiveTab('booking')} className="action-card" style={{ background: '#047857', color: 'white', padding: '40px', borderRadius: '24px', cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 10px 25px rgba(4, 120, 87, 0.2)', textAlign: 'center' }}>
                  <i className='bx bx-calendar-event' style={{ fontSize: '48px', marginBottom: '16px' }}></i>
                  <h3 style={{ fontSize: '24px' }}>Quản lý Booking</h3>
                  <p style={{ opacity: 0.8, marginTop: '8px' }}>Cấu hình & Quản lý ID</p>
               </div>

               <div onClick={() => setActiveTab('domain')} className="action-card" style={{ background: '#b45309', color: 'white', padding: '40px', borderRadius: '24px', cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 10px 25px rgba(180, 83, 9, 0.2)', textAlign: 'center' }}>
                  <i className='bx bx-link' style={{ fontSize: '48px', marginBottom: '16px' }}></i>
                  <h3 style={{ fontSize: '24px' }}>Quản lý Domain</h3>
                  <p style={{ opacity: 0.8, marginTop: '8px' }}>Quản lý tên miền hệ thống</p>
               </div>

               <div onClick={() => setActiveTab('user')} className="action-card" style={{ background: '#6d28d9', color: 'white', padding: '40px', borderRadius: '24px', cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 10px 25px rgba(109, 40, 217, 0.2)', textAlign: 'center' }}>
                  <i className='bx bx-user-circle' style={{ fontSize: '48px', marginBottom: '16px' }}></i>
                  <h3 style={{ fontSize: '24px' }}>Quản lý User & Tasks</h3>
                  <p style={{ opacity: 0.8, marginTop: '8px' }}>Thống kê KPI phòng ban</p>
               </div>
            </div>
          ) : (
            <div>
              <button 
                onClick={() => setActiveTab('dashboard')} 
                className="btn btn-outline" 
                style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className='bx bx-arrow-back'></i> Quay lại Dashboard
              </button>

              {activeTab === 'website' && (
                <div className="website-management">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Quản lý Danh sách Website</h2>
                  </div>
                  <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead style={{ background: 'rgba(0,0,0,0.02)' }}>
                        <tr>
                          <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', fontSize: '13px', color: 'var(--text-muted)' }}>ID</th>
                          <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', fontSize: '13px', color: 'var(--text-muted)' }}>TÊN WEBSITE</th>
                          <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', fontSize: '13px', color: 'var(--text-muted)' }}>DOMAIN</th>
                          <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', fontSize: '13px', color: 'var(--text-muted)' }}>ĐỊA CHỈ</th>
                          <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', fontSize: '13px', color: 'var(--text-muted)' }}>THAO TÁC</th>
                        </tr>
                      </thead>
                      <tbody>
                        {websites.map(web => (
                          <tr key={web.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '16px 20px', fontWeight: 'bold' }}>#{web.siteId}</td>
                            <td style={{ padding: '16px 20px' }}>{web.name}</td>
                            <td style={{ padding: '16px 20px', color: '#3b82f6' }}>{web.domain || 'N/A'}</td>
                            <td style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>{web.address || 'N/A'}</td>
                            <td style={{ padding: '16px 20px' }}>
                              <button className="btn-icon-small"><i className='bx bx-edit'></i></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'user' && (
                <div className="user-management">
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Thống kê Task phòng ban</h2>
                  <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden', marginBottom: '40px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead style={{ background: 'rgba(0,0,0,0.02)' }}>
                        <tr>
                          <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', fontSize: '13px', color: 'var(--text-muted)' }}>NHÂN SỰ</th>
                          <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', fontSize: '13px', color: 'var(--text-muted)' }}>PHÒNG BAN</th>
                          <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', fontSize: '13px', color: 'var(--text-muted)' }}>MỚI TIẾP NHẬN</th>
                          <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', fontSize: '13px', color: 'var(--text-muted)' }}>ĐANG THỰC HIỆN</th>
                          <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', fontSize: '13px', color: 'var(--text-muted)' }}>ĐẢ HOÀN THÀNH</th>
                          <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', fontSize: '13px', color: 'var(--text-muted)' }}>TỔNG CỘNG</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userStats.map((stat, index) => (
                          <tr key={stat.name} style={{ borderBottom: index === userStats.length - 1 ? 'none' : '1px solid var(--border-color)' }}>
                            <td style={{ padding: '16px 20px', fontWeight: 'bold', fontSize: '14px' }}>{stat.name}</td>
                            <td style={{ padding: '16px 20px' }}>
                              <span style={{ fontSize: '12px', background: '#e2e8f0', color: '#475569', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{stat.role}</span>
                            </td>
                            <td style={{ padding: '16px 20px', fontWeight: 'bold', color: 'var(--text-muted)' }}>{stat.received}</td>
                            <td style={{ padding: '16px 20px', fontWeight: 'bold', color: '#3b82f6' }}>{stat.inProgress}</td>
                            <td style={{ padding: '16px 20px', fontWeight: 'bold', color: '#10b981' }}>{stat.completed}</td>
                            <td style={{ padding: '16px 20px', fontWeight: 'bold' }}>{stat.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Chi tiết Task (IT)</h2>
                  <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead style={{ background: 'rgba(0,0,0,0.02)' }}>
                        <tr>
                          <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', fontSize: '13px', color: 'var(--text-muted)' }}>MÃ WEB</th>
                          <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', fontSize: '13px', color: 'var(--text-muted)' }}>NGƯỜI BRIEF</th>
                          <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', fontSize: '13px', color: 'var(--text-muted)' }}>NỘI DUNG YÊU CẦU</th>
                          <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', fontSize: '13px', color: 'var(--text-muted)' }}>MỨC ĐỘ</th>
                          <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', fontSize: '13px', color: 'var(--text-muted)' }}>NGƯỜI NHẬN</th>
                          <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', fontSize: '13px', color: 'var(--text-muted)' }}>TRẠNG THÁI</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allTasks.map(task => (
                          <tr key={task.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '16px 20px', fontWeight: 'bold' }}>#{task.website?.siteId || '---'}</td>
                            <td style={{ padding: '16px 20px' }}>
                              <span style={{ background: '#fce7f3', color: '#db2777', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                                {task.briefedBy?.name || 'N/A'}
                              </span>
                            </td>
                            <td style={{ padding: '16px 20px', maxWidth: '300px' }}>
                              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{task.title}</div>
                              {task.desc && <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{task.desc}</div>}
                            </td>
                            <td style={{ padding: '16px 20px' }}>
                              <span style={{ fontSize: '12px', background: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: '4px' }}>
                                {task.category}
                              </span>
                            </td>
                            <td style={{ padding: '16px 20px', fontWeight: 'bold', color: '#3b82f6' }}>
                              {task.assignedTo?.name || 'N/A'}
                            </td>
                            <td style={{ padding: '16px 20px' }}>
                              <span style={{ 
                                fontSize: '12px', 
                                padding: '6px 10px', 
                                borderRadius: '12px', 
                                fontWeight: 'bold',
                                background: task.status === 'Đã hoàn thành' ? '#d1fae5' : task.status === 'Đang thực hiện' ? '#dbeafe' : '#f3f4f6',
                                color: task.status === 'Đã hoàn thành' ? '#059669' : task.status === 'Đang thực hiện' ? '#2563eb' : '#4b5563'
                              }}>
                                {task.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'booking' && (
                <div className="booking-management">
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Danh sách Booking</h2>
                  <div style={{ background: 'var(--bg-surface)', padding: '40px', borderRadius: '16px', textAlign: 'center', border: '1px dashed var(--border-color)' }}>
                    <i className='bx bx-time' style={{ fontSize: '48px', color: 'var(--text-muted)', marginBottom: '16px' }}></i>
                    <h3 style={{ fontSize: '18px', color: 'var(--text-muted)' }}>Tính năng đang phát triển...</h3>
                  </div>
                </div>
              )}

              {activeTab === 'domain' && (
                <div className="domain-management">
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Danh sách Domain</h2>
                  <div style={{ background: 'var(--bg-surface)', padding: '40px', borderRadius: '16px', textAlign: 'center', border: '1px dashed var(--border-color)' }}>
                    <i className='bx bx-cog' style={{ fontSize: '48px', color: 'var(--text-muted)', marginBottom: '16px' }}></i>
                    <h3 style={{ fontSize: '18px', color: 'var(--text-muted)' }}>Tính năng đang phát triển...</h3>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
