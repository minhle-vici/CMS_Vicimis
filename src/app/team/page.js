"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

export default function TeamPage() {
  const { data: session } = useSession();
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [teamTasks, setTeamTasks] = useState({});
  
  // Modal state
  const [selectedMember, setSelectedMember] = useState(null);

  const fetchTeamAndTasks = async () => {
    if (!session?.user?.role) return;
    setLoading(true);
    try {
      const resUsers = await fetch('/api/users');
      const allUsers = await resUsers.json();
      const myTeam = allUsers.filter(u => u.role === session.user.role && u.id !== parseInt(session.user.id));
      setTeamMembers(myTeam);

      const resTasks = await fetch(`/api/websites?month=${selectedMonth}`);
      const allTasks = await resTasks.json();
      
      const taskMap = {};
      myTeam.forEach(member => {
        taskMap[member.id] = allTasks.filter(t => t.assignedToId === member.id || t.briefById === member.id);
      });
      setTeamTasks(taskMap);
    } catch (error) {
      console.error('Error fetching team data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchTeamAndTasks();
  }, [session, selectedMonth]);

  const ROLE_ICONS = {
    'IT': 'bx-terminal',
    'AM': 'bx-user-voice',
    'Sale': 'bx-trending-up',
    'Designer': 'bx-palette',
    'Admin': 'bx-shield-quarter'
  };

  const ROLE_COLORS = {
    'IT': '#3b82f6',
    'AM': '#f472b6',
    'Sale': '#f59e0b',
    'Designer': '#10b981',
    'Admin': '#ef4444'
  };

  const getStatusColor = (status) => {
    if (status.includes('Bàn giao') || status.includes('Hoàn thành')) return '#10b981';
    if (status.includes('Đang thực hiện')) return '#3b82f6';
    return '#64748b';
  };

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Topbar />
        
        <div style={{ padding: '0 40px 40px' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '32px 0' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Quản lý Team {session?.user?.role}</h1>
              <p style={{ color: 'var(--text-muted)' }}>Theo dõi hiệu suất nhân sự trong tháng.</p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'white', padding: '10px 20px', borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>XEM THÁNG:</label>
              <input 
                type="month" 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                style={{ border: 'none', outline: 'none', fontWeight: 700, color: '#1e293b', cursor: 'pointer' }}
              />
            </div>
          </header>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px' }}>Đang tải dữ liệu team...</div>
          ) : teamMembers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px', background: 'white', borderRadius: '32px', border: '1px dashed #cbd5e1' }}>
              <i className='bx bx-user-x' style={{ fontSize: '60px', color: '#cbd5e1', marginBottom: '16px' }}></i>
              <p style={{ color: '#64748b' }}>Bạn hiện chưa có nhân sự nào trong team.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '24px' }}>
              {teamMembers.map(member => {
                const tasks = teamTasks[member.id] || [];
                const completed = tasks.filter(t => t.status.includes('Bàn giao') || t.status.includes('Hoàn thành')).length;
                const progress = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

                return (
                  <div key={member.id} style={{ 
                    background: 'white', 
                    padding: '32px', 
                    borderRadius: '32px', 
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ position: 'relative' }}>
                          <img 
                            src={`https://ui-avatars.com/api/?name=${member.name}&background=${(ROLE_COLORS[member.role] || '6366f1').replace('#', '')}&color=fff&size=100`} 
                            alt={member.name}
                            style={{ width: '64px', height: '64px', borderRadius: '20px' }}
                          />
                          {member.is_manager && <div style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#f59e0b', color: 'white', padding: '2px', borderRadius: '6px', fontSize: '12px', border: '2px solid white' }}><i className='bx bxs-crown'></i></div>}
                        </div>
                        <div>
                          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>{member.name}</h3>
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px' }}>{member.role}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '20px', fontWeight: 900, color: progress === 100 ? '#10b981' : '#1e293b' }}>{progress}%</div>
                        <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>HOÀN THÀNH</div>
                      </div>
                    </div>

                    <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', marginBottom: '32px', overflow: 'hidden' }}>
                      <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #ef4444)', borderRadius: '4px' }}></div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '24px', textAlign: 'center', marginBottom: '32px' }}>
                       <div style={{ fontSize: '24px', fontWeight: 900, color: '#1e293b' }}>{tasks.length}</div>
                       <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Công việc trong tháng</div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button className="btn btn-outline" style={{ flex: 1, padding: '14px', borderRadius: '16px' }}><i className='bx bx-chat'></i> Chat</button>
                      <button 
                        className="btn btn-primary" 
                        style={{ flex: 2, padding: '14px', borderRadius: '16px', fontWeight: 700 }}
                        onClick={() => setSelectedMember({ ...member, tasks })}
                      >
                        <i className='bx bx-search-alt'></i> Xem Chi tiết
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Member Details Modal */}
      {selectedMember && (
        <div className="modal-overlay active" style={{ zIndex: 10000 }}>
          <div className="modal" style={{ maxWidth: '600px', padding: '0', borderRadius: '32px', overflow: 'hidden', border: 'none' }}>
            <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #ef4444 100%)', padding: '40px', color: 'white', display: 'flex', alignItems: 'center', gap: '24px' }}>
              <img 
                src={`https://ui-avatars.com/api/?name=${selectedMember.name}&background=fff&color=${(ROLE_COLORS[selectedMember.role] || '6366f1').replace('#', '')}&size=128`} 
                alt={selectedMember.name}
                style={{ width: '80px', height: '80px', borderRadius: '24px', border: '4px solid rgba(255,255,255,0.2)' }}
              />
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 800 }}>{selectedMember.name}</h3>
                <p style={{ margin: '5px 0 0', opacity: 0.8, fontSize: '14px' }}>Bộ phận {selectedMember.role} • {selectedMember.tasks.length} Task trong tháng</p>
              </div>
              <button onClick={() => setSelectedMember(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer' }}>
                <i className='bx bx-x' style={{ fontSize: '24px' }}></i>
              </button>
            </div>
            
            <div style={{ padding: '40px', background: 'white', maxHeight: '500px', overflowY: 'auto' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#64748b', marginBottom: '20px', textTransform: 'uppercase' }}>Danh sách công việc chi tiết</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {selectedMember.tasks.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Không có công việc nào trong tháng này.</div>
                ) : (
                  selectedMember.tasks.map(task => (
                    <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                       <div>
                         <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>{task.name}</div>
                         <div style={{ fontSize: '12px', color: '#64748b' }}>
                           <span style={{ fontWeight: 700, color: '#3b82f6' }}>#{task.siteId}</span> • 
                           Bắt đầu: {new Date(task.startDate).toLocaleDateString('vi-VN')}
                         </div>
                       </div>
                       <div style={{ 
                         fontSize: '11px', 
                         fontWeight: 800, 
                         color: getStatusColor(task.status),
                         background: `${getStatusColor(task.status)}15`,
                         padding: '6px 12px',
                         borderRadius: '8px'
                       }}>
                         {task.status}
                       </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={{ padding: '24px 40px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', textAlign: 'right' }}>
              <button className="btn btn-primary" onClick={() => setSelectedMember(null)} style={{ borderRadius: '16px', padding: '12px 32px' }}>Đóng lại</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
