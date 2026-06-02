"use client";
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

// ── Inline SVG Donut Chart ──────────────────────────────────────────────────
function DonutChart({ data = [] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 0;
  const SIZE = 220;
  const STROKE = 36;
  const R = (SIZE - STROKE) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * R;
  const cx = SIZE / 2;
  const cy = SIZE / 2;

  const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

  let offset = 0;
  const arcs = data.map((seg, i) => {
    const fraction = total > 0 ? seg.value / total : 0;
    const dash = fraction * CIRCUMFERENCE;
    const arc = (
      <circle
        key={i}
        r={R}
        cx={cx}
        cy={cy}
        fill="transparent"
        stroke={COLORS[i % COLORS.length]}
        strokeWidth={STROKE}
        strokeDasharray={`${dash} ${CIRCUMFERENCE}`}
        strokeDashoffset={-offset}
        strokeLinecap="butt"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    );
    offset += dash;
    return arc;
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '40px', padding: '32px', background: 'white', borderRadius: '24px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
      <div style={{ position: 'relative', width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle r={R} cx={cx} cy={cy} fill="transparent" stroke="#f1f5f9" strokeWidth={STROKE} />
          {total === 0 ? (
            <circle r={R} cx={cx} cy={cy} fill="transparent" stroke="#e2e8f0" strokeWidth={STROKE} />
          ) : arcs}
        </svg>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>{total}</div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', fontWeight: 600 }}>TỔNG TASK</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '200px' }}>
        {data.map((seg, i) => {
          const pct = total > 0 ? Math.round((seg.value / total) * 100) : 0;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>{seg.label}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{seg.value} task · {pct}%</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function AdminDashboardClient({ websites, userStats, roleStats = [], allTasks, domains = [] }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const { data: session } = useSession();

  // Biểu đồ tròn: chia theo phòng ban
  const chartData = roleStats
    .filter(r => r.total > 0)
    .map(r => ({ label: r.role, value: r.total }));

  // Fallback nếu không có roleStats: chia theo trạng thái
  const fallbackChartData = [
    { label: 'Tiếp nhận',      value: userStats.reduce((s, u) => s + u.received, 0) },
    { label: 'Đang thực hiện', value: userStats.reduce((s, u) => s + u.inProgress, 0) },
    { label: 'Hoàn thành',     value: userStats.reduce((s, u) => s + u.completed, 0) },
  ];

  const donutData = chartData.length > 0 ? chartData : fallbackChartData;

  const CARDS = [
    { key: 'website', label: 'Quản lý Website',   icon: 'bx-globe',        bg: '#1e3a8a', shadow: 'rgba(30,58,138,0.2)',  desc: `${websites.length} websites đang hoạt động` },
    { key: 'booking', label: 'Quản lý Booking',   icon: 'bx-calendar-event',bg: '#047857', shadow: 'rgba(4,120,87,0.2)',   desc: 'Cấu hình & Quản lý ID' },
    { key: 'domain',  label: 'Quản lý Domain',    icon: 'bx-link',         bg: '#b45309', shadow: 'rgba(180,83,9,0.2)',   desc: 'Quản lý tên miền hệ thống' },
    { key: 'user',    label: 'Quản lý User & KPI', icon: 'bx-user-circle',  bg: '#6d28d9', shadow: 'rgba(109,40,217,0.2)', desc: 'Thống kê KPI phòng ban' },
  ];

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Topbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddTask={() => {}}
          buttonText="Dashboard Admin"
        />

        <div className="admin-dashboard" style={{ padding: '24px 40px' }}>

          {/* ── DASHBOARD TAB ── */}
          {activeTab === 'dashboard' && (
            <>
              {/* Quick-action cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginTop: '32px' }}>
                {CARDS.map(card => (
                  <div
                    key={card.key}
                    onClick={() => setActiveTab(card.key)}
                    style={{
                      background: card.bg, color: 'white',
                      padding: '36px', borderRadius: '24px',
                      cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s',
                      boxShadow: `0 10px 25px ${card.shadow}`,
                      textAlign: 'center',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 18px 36px ${card.shadow}`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.boxShadow = `0 10px 25px ${card.shadow}`; }}
                  >
                    <i className={`bx ${card.icon}`} style={{ fontSize: '48px', marginBottom: '12px' }} />
                    <h3 style={{ fontSize: '20px', fontWeight: 700 }}>{card.label}</h3>
                    <p style={{ opacity: 0.8, marginTop: '6px', fontSize: '14px' }}>{card.desc}</p>
                  </div>
                ))}
              </div>

              {/* KPI Donut Chart - phân bổ theo phòng ban */}
              <div style={{ marginTop: '40px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', color: '#1e293b' }}>
                  <i className='bx bx-pie-chart-alt-2' style={{ marginRight: '10px', color: '#3b82f6' }} />
                  Phân bổ Task theo Phòng ban
                </h2>
                <DonutChart data={donutData} />
              </div>
            </>
          )}

          {/* ── OTHER TABS ── */}
          {activeTab !== 'dashboard' && (
            <div>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="btn btn-outline"
                style={{ marginBottom: '24px', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <i className='bx bx-arrow-back' /> Quay lại Dashboard
              </button>

              {/* WEBSITE */}
              {activeTab === 'website' && (
                <div className="website-management">
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Quản lý Danh sách Website</h2>
                  <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead style={{ background: 'rgba(0,0,0,0.02)' }}>
                        <tr>
                          {['ID','TÊN WEBSITE','NGƯỜI NHẬN','BẮT ĐẦU','TIẾN ĐỘ','THAO TÁC'].map(h => (
                            <th key={h} style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', fontSize: '12px' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {websites.map(web => (
                          <tr key={web.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '16px 20px', fontWeight: 'bold' }}>#{web.siteId}</td>
                            <td style={{ padding: '16px 20px' }}>
                              <div style={{ fontWeight: 600 }}>{web.name}</div>
                              <div style={{ fontSize: '12px', color: '#3b82f6' }}>{web.domain}</div>
                            </td>
                            <td style={{ padding: '16px 20px', fontWeight: 'bold', color: '#3b82f6' }}>{web.assignedTo?.name || '---'}</td>
                            <td style={{ padding: '16px 20px', fontSize: '12px', color: '#64748b' }}>
                              {web.startDate ? new Date(web.startDate).toLocaleDateString('vi-VN') : '---'}
                            </td>
                            <td style={{ padding: '16px 20px' }}>
                              <span style={{
                                fontSize: '11px', padding: '6px 12px', borderRadius: '8px', fontWeight: 'bold',
                                background: web.status === 'Bàn giao' ? '#d1fae5' : web.status === 'Hoàn thành demo' ? '#fef3c7' : web.status === 'Đang thực hiện' ? '#dbeafe' : '#f1f5f9',
                                color: web.status === 'Bàn giao' ? '#065f46' : web.status === 'Hoàn thành demo' ? '#b45309' : web.status === 'Đang thực hiện' ? '#1d4ed8' : '#475569',
                              }}>
                                {web.status || 'Đang thực hiện'}
                              </span>
                            </td>
                            <td style={{ padding: '16px 20px' }}>
                              <button className="btn-icon-small"><i className='bx bx-edit' /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* DOMAIN */}
              {activeTab === 'domain' && (
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Quản lý Tên miền</h2>
                  <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead style={{ background: 'rgba(0,0,0,0.02)' }}>
                        <tr>
                          {['DOMAIN', 'NHÀ CUNG CẤP', 'NGÀY HẾT HẠN', 'CÒN LẠI', 'TRẠNG THÁI'].map(h => (
                            <th key={h} style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', fontSize: '12px' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {domains.map(dom => {
                          const expiry = new Date(dom.expiryDate);
                          const daysLeft = Math.ceil((expiry - new Date()) / 86400000);
                          const warn = daysLeft < 30;
                          return (
                            <tr key={dom.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                              <td style={{ padding: '16px 20px', fontWeight: 'bold', color: '#3b82f6' }}>{dom.url}</td>
                              <td style={{ padding: '16px 20px' }}>{dom.provider}</td>
                              <td style={{ padding: '16px 20px' }}>{expiry.toLocaleDateString('vi-VN')}</td>
                              <td style={{ padding: '16px 20px', color: warn ? '#ef4444' : 'inherit', fontWeight: warn ? 'bold' : 'normal' }}>{daysLeft} ngày</td>
                              <td style={{ padding: '16px 20px' }}>
                                <span style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', background: warn ? '#fee2e2' : '#d1fae5', color: warn ? '#ef4444' : '#059669' }}>
                                  {dom.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* USER / KPI */}
              {activeTab === 'user' && (
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Thống kê Task phòng ban</h2>
                  <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden', marginBottom: '40px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead style={{ background: 'rgba(0,0,0,0.02)' }}>
                        <tr>
                          {['NHÂN SỰ','PHÒNG BAN','MỚI TIẾP NHẬN','ĐANG THỰC HIỆN','ĐÃ HOÀN THÀNH','TỔNG CỘNG'].map(h => (
                            <th key={h} style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', fontSize: '13px', color: 'var(--text-muted)' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {userStats.map((stat, i) => (
                          <tr key={stat.name} style={{ borderBottom: i === userStats.length - 1 ? 'none' : '1px solid var(--border-color)' }}>
                            <td style={{ padding: '16px 20px', fontWeight: 'bold' }}>{stat.name}</td>
                            <td style={{ padding: '16px 20px' }}><span style={{ fontSize: '12px', background: '#e2e8f0', color: '#475569', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{stat.role}</span></td>
                            <td style={{ padding: '16px 20px', fontWeight: 'bold', color: 'var(--text-muted)' }}>{stat.received}</td>
                            <td style={{ padding: '16px 20px', fontWeight: 'bold', color: '#3b82f6' }}>{stat.inProgress}</td>
                            <td style={{ padding: '16px 20px', fontWeight: 'bold', color: '#10b981' }}>{stat.completed}</td>
                            <td style={{ padding: '16px 20px', fontWeight: 'bold' }}>{stat.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Chi tiết Task Website</h2>
                  <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead style={{ background: 'rgba(0,0,0,0.02)' }}>
                        <tr>
                          {['WEBSITE', 'NGƯỜI BRIEF', 'NỘI DUNG YÊU CẦU', 'MỨC ĐỘ', 'NGƯỜI NHẬN', 'TRẠNG THÁI'].map(h => (
                            <th key={h} style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', fontSize: '13px', color: 'var(--text-muted)' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {allTasks.map(task => (
                          <tr key={task.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '16px 20px', fontWeight: 'bold', color: '#3b82f6' }}>{task.website?.name || task.website?.siteId || '---'}</td>
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
                              <span style={{ fontSize: '12px', background: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: '4px' }}>{task.category}</span>
                            </td>
                            <td style={{ padding: '16px 20px', fontWeight: 'bold', color: '#3b82f6' }}>{task.assignedTo?.name || 'N/A'}</td>
                            <td style={{ padding: '16px 20px' }}>
                              <span style={{
                                fontSize: '12px', padding: '6px 10px', borderRadius: '12px', fontWeight: 'bold',
                                background: task.status === 'Đã hoàn thành' ? '#d1fae5' : task.status === 'Đang thực hiện' ? '#dbeafe' : '#f3f4f6',
                                color: task.status === 'Đã hoàn thành' ? '#059669' : task.status === 'Đang thực hiện' ? '#2563eb' : '#4b5563',
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

              {/* BOOKING */}
              {activeTab === 'booking' && (
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Danh sách Booking</h2>
                  <div style={{ background: 'var(--bg-surface)', padding: '60px', borderRadius: '16px', textAlign: 'center', border: '1px dashed var(--border-color)' }}>
                    <i className='bx bx-time' style={{ fontSize: '48px', color: 'var(--text-muted)', display: 'block', marginBottom: '16px' }} />
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
