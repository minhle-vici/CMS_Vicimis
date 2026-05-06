"use client";
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import KanbanBoard from '@/components/KanbanBoard';
import TaskModal from '@/components/TaskModal';
import Link from 'next/link';

export default function ProjectDetailPage({ params }) {
  const { id } = params;

  // Mock data for a single project based on ID
  const project = {
    id: `#${id}`,
    name: 'Lashes And Nails Studio',
    type: 'Nails',
    address: '12040 A Tierra Este Rd # 110, El Paso, TX 79938',
    am: 'Huyền',
    it: 'Minh',
    status: 'Đã Bàn Giao',
    domain: 'https://lashesandnailsstudio.com/',
    demo: 'https://lashesandnailsstudio.vicimisbook.com/',
    folder: 'https://drive.google.com/drive/folders/1pQZl3L7HiIPJarybce7sIr8QzjqVaRRW',
    adminPass: 'it / Vici@201023!',
    booking: {
      hours: 'Mon - Sat: 10 am - 8 pm, Sun: 10 am - 6 pm',
      phone: '(519) 755-7841',
      link: 'https://theonenailloungespa.vicibooking.com/'
    }
  };

  const [tasks, setTasks] = useState([
    { id: '1', title: 'Fix giờ đặt hẹn booking', desc: 'Từ 5:30 Pm là khách không được book nữa', category: 'Fix Bug', status: 'done', comments: 3, user: 'Quân', userColor: 'a855f7', websiteId: `#${id}` },
    { id: '2', title: 'Tạo thêm note đặt hẹn', desc: 'Note đặt hẹn sau 5:30PM vui lòng liên hệ phone tiệm', category: 'Feature', status: 'todo', comments: 1, user: 'Quân', userColor: 'a855f7', websiteId: `#${id}` },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTaskMove = (taskId, newStatus) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const handleAddTask = (newTask) => {
    const task = {
      ...newTask,
      id: Date.now().toString(),
      comments: 0,
      user: 'Quân',
      userColor: 'a855f7',
      websiteId: `#${id}`
    };
    setTasks([...tasks, task]);
  };

  return (
    <div className="app-container">
      <Sidebar />

      <main className="main-content">
        <Topbar onAddTask={() => setIsModalOpen(true)} />

        <div className="project-detail-container">
          <Link href="/websites" className="back-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '20px', fontSize: '14px', textDecoration: 'none' }}>
            <i className='bx bx-arrow-back'></i> Quay lại danh sách Website
          </Link>
          <header className="project-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span className="website-id">{project.id}</span>
                <span className={`status-badge ${project.status === 'Đã Bàn Giao' ? 'status-handed-over' : 'status-in-progress'}`}>
                  {project.status}
                </span>
              </div>
              <h1 style={{ fontSize: '32px', fontWeight: 700 }}>{project.name}</h1>
            </div>
            <div className="header-actions">
              <button className="btn btn-outline"><i className='bx bx-edit'></i> Edit Profile</button>
              <button className="btn btn-primary"><i className='bx bx-share-alt'></i> Share Info</button>
            </div>
          </header>

          <div className="project-detail-grid">
            {/* Sidebar: Project Info */}
            <aside className="info-sidebar" style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
              <section className="info-card">
                <h3 className="card-title"><i className='bx bx-info-circle'></i> Website Info</h3>
                <div className="info-item">
                  <span className="info-label">Address</span>
                  <div className="info-value">{project.address}</div>
                </div>
                <div className="info-item">
                  <span className="info-label">Domain</span>
                  <div className="info-value"><a href={project.domain} target="_blank">{project.domain}</a></div>
                </div>
                <div className="info-item">
                  <span className="info-label">Demo Link</span>
                  <div className="info-value"><a href={project.demo} target="_blank">{project.demo}</a></div>
                </div>
                <div className="info-item">
                  <span className="info-label">Admin / Pass</span>
                  <div className="info-value" style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px', marginTop: '4px', border: '1px solid var(--border-color)' }}>
                    <code>{project.adminPass}</code>
                  </div>
                </div>
                <div className="info-item">
                  <span className="info-label">Folder Drive</span>
                  <div className="info-value"><a href={project.folder} target="_blank">View Assets <i className='bx bx-link-external'></i></a></div>
                </div>
              </section>

              <section className="info-card">
                <h3 className="card-title"><i className='bx bx-calendar-check'></i> Booking Details</h3>
                <div className="info-item">
                  <span className="info-label">Business Hours</span>
                  <div className="info-value" style={{ whiteSpace: 'pre-line' }}>{project.booking.hours}</div>
                </div>
                <div className="info-item">
                  <span className="info-label">Phone nhận Booking</span>
                  <div className="info-value">{project.booking.phone}</div>
                </div>
                <div className="info-item">
                  <span className="info-label">Link Booking</span>
                  <div className="info-value"><a href={project.booking.link} target="_blank">{project.booking.link}</a></div>
                </div>
                <div className="info-item">
                  <span className="info-label">Mail Khách</span>
                  <div className="info-value">customer@example.com</div>
                </div>
              </section>

              <section className="info-card" style={{ gridColumn: 'span 1' }}>
                <h3 className="card-title"><i className='bx bx-line-chart'></i> Trình trạng Dự án</h3>
                <div className="info-item">
                  <span className="info-label">Tiến độ hiện tại</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                    <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ width: project.status === 'Đã Bàn Giao' ? '100%' : '60%', height: '100%', background: 'var(--primary)' }}></div>
                    </div>
                    <span style={{ fontWeight: 600 }}>{project.status === 'Đã Bàn Giao' ? '100%' : '60%'}</span>
                  </div>
                </div>
                <div className="info-item" style={{ marginTop: '20px' }}>
                  <span className="info-label">Người phụ trách</span>
                  <div style={{ display: 'flex', gap: '32px', marginTop: '10px' }}>
                    <div>
                      <span className="info-label" style={{ fontSize: '10px' }}>Brief (AM)</span>
                      <div style={{ fontWeight: 500 }}>{project.am}</div>
                    </div>
                    <div>
                      <span className="info-label" style={{ fontSize: '10px' }}>Nhận (IT)</span>
                      <div style={{ fontWeight: 500 }}>{project.it}</div>
                    </div>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

