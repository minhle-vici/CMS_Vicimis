"use client";
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import Link from 'next/link';

export default function ProjectDetailPage({ params }) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const resolvedParams = await params;
        const { id } = resolvedParams;
        
        const res = await fetch(`/api/websites/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProject(data);
        } else {
          setProject(null);
        }
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [params]);

  const calculateProgress = (status) => {
    const s = status?.toLowerCase();
    if (s?.includes('bàn giao')) return 100;
    if (s?.includes('hoàn thành demo')) return 75;
    if (s?.includes('đang thực hiện')) return 50;
    if (s?.includes('tiếp nhận')) return 25;
    return 10;
  };

  if (loading) return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="loading-spinner">
          <i className='bx bx-loader-alt bx-spin' style={{ fontSize: '48px', color: '#3b82f6' }}></i>
        </div>
      </main>
    </div>
  );

  if (!project) return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content" style={{ padding: '40px' }}>
        <div style={{ background: 'white', padding: '60px', borderRadius: '32px', textAlign: 'center' }}>
          <h2 style={{ fontWeight: 700 }}>Không tìm thấy website này.</h2>
          <Link href="/websites" className="btn btn-primary" style={{ marginTop: '20px' }}>Quay lại danh sách</Link>
        </div>
      </main>
    </div>
  );

  const progress = calculateProgress(project.status);

  return (
    <div className="app-container">
      <Sidebar />

      <main className="main-content">
        <Topbar />

        <div className="project-detail-wrapper" style={{ padding: '0 40px 40px' }}>
          
          {/* Breadcrumb */}
          <nav style={{ margin: '24px 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <Link href="/websites" style={{ color: '#64748b', textDecoration: 'none' }}>Danh sách Website</Link>
            <i className='bx bx-chevron-right' style={{ color: '#cbd5e1' }}></i>
            <span style={{ color: '#1e293b', fontWeight: 600 }}>Chi tiết Website #{project.siteId}</span>
          </nav>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '40px' }}>
            
            <div className="detail-left">
              {/* Consolidated Web Info Section */}
              <section style={{ background: 'white', padding: '40px', borderRadius: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', marginBottom: '40px', border: '1px solid #f1f5f9' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px', color: '#1e293b' }}>
                  <i className='bx bx-globe' style={{ color: '#ef4444', fontSize: '24px' }}></i>
                  THÔNG TIN WEB
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '32px' }}>
                   <div className="info-box">
                      <label style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>Tên khách hàng / Website</label>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e3a8a' }}>{project.name}</div>
                   </div>

                   <div className="info-box">
                      <label style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>Mã Website</label>
                      <span style={{ background: '#f1f5f9', color: '#1e293b', padding: '4px 12px', borderRadius: '8px', fontWeight: 700, fontSize: '14px' }}>
                        #{project.siteId}
                      </span>
                   </div>

                   <div className="info-box">
                      <label style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>Trạng thái hiện tại</label>
                      <span style={{ 
                        background: progress === 100 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)', 
                        color: progress === 100 ? '#10b981' : '#3b82f6', 
                        padding: '6px 14px', 
                        borderRadius: '10px', 
                        fontSize: '13px', 
                        fontWeight: 700,
                        border: '1px solid currentColor'
                      }}>
                        {project.status}
                      </span>
                   </div>

                   <div className="info-box">
                      <label style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>Ngày tiếp nhận</label>
                      <div style={{ fontWeight: 600, color: '#334155' }}>
                        <i className='bx bx-calendar' style={{ marginRight: '6px', color: '#94a3b8' }}></i>
                        {new Date(project.startDate || project.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                   </div>

                   <div className="info-box">
                      <label style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>Tên miền (Domain)</label>
                      <a href={`https://${project.domain}`} target="_blank" style={{ fontWeight: 700, color: '#3b82f6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {project.domain || 'Chưa cập nhật'} <i className='bx bx-link-external' style={{ fontSize: '14px' }}></i>
                      </a>
                   </div>

                   <div className="info-box">
                      <label style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>Link Demo</label>
                      <a href={project.demoUrl} target="_blank" style={{ fontWeight: 700, color: '#ef4444', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {project.demoUrl ? 'Xem bản Demo' : 'Chưa có Link'} <i className='bx bx-rocket' style={{ fontSize: '14px' }}></i>
                      </a>
                   </div>

                   <div className="info-box">
                      <label style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>Tài khoản quản trị</label>
                      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                         <div>User: <strong style={{ color: '#1e293b' }}>{project.demoUser || 'N/A'}</strong></div>
                         <div style={{ marginTop: '4px' }}>Pass: <strong style={{ color: '#1e293b' }}>{project.demoPass || 'N/A'}</strong></div>
                      </div>
                   </div>

                   <div className="info-box">
                      <label style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>Địa chỉ Website</label>
                      <div style={{ fontSize: '14px', color: '#475569', lineHeight: 1.5 }}>
                        {project.address || 'N/A'}
                      </div>
                   </div>
                </div>

                <div style={{ marginTop: '40px', borderTop: '1px solid #f1f5f9', paddingTop: '32px' }}>
                   <label style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 700, marginBottom: '16px', textTransform: 'uppercase' }}>Nội dung yêu cầu / Ghi chú</label>
                   <div style={{ background: '#fff7ed', borderLeft: '4px solid #f97316', padding: '24px', borderRadius: '0 20px 20px 0', fontSize: '14px', lineHeight: 1.7, color: '#475569' }}>
                      {project.info || 'Không có ghi chú thêm.'}
                   </div>
                </div>
              </section>
            </div>

            <div className="detail-right">
              {/* Progress Card */}
              <div style={{ background: 'white', padding: '32px', borderRadius: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', marginBottom: '32px', border: '1px solid #f1f5f9' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '24px', color: '#1e293b' }}>TIẾN ĐỘ DỰ ÁN</h4>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                   <div style={{ position: 'relative', width: '130px', height: '130px', margin: '0 auto' }}>
                      <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={progress === 100 ? '#10b981' : '#3b82f6'} strokeWidth="3" strokeDasharray={`${progress}, 100`} strokeLinecap="round" />
                      </svg>
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '24px', fontWeight: 900, color: '#1e293b' }}>
                        {progress}%
                      </div>
                   </div>
                </div>
                <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                   <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #ef4444)', borderRadius: '4px' }}></div>
                </div>
              </div>

              {/* Team Section */}
              <div style={{ background: 'white', padding: '32px', borderRadius: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '24px', color: '#1e293b' }}>NHÂN SỰ PHỤ TRÁCH</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#fce7f3', color: '#db2777', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                        <i className='bx bxs-user-detail'></i>
                      </div>
                      <div>
                        <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Account Manager</span>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{project.briefedBy?.name || 'N/A'}</span>
                      </div>
                   </div>

                   <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                        <i className='bx bxs-terminal'></i>
                      </div>
                      <div>
                        <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>IT Developer</span>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{project.assignedTo?.name || 'Chưa nhận Task'}</span>
                      </div>
                   </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <style jsx global>{`
        .loading-spinner {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
        }
      `}</style>
    </div>
  );
}
