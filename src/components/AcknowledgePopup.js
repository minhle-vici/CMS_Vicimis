"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function AcknowledgePopup() {
  const { data: session } = useSession();
  const [newTasks, setNewTasks] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // CHỈ IT MỚI NHẬN THÔNG BÁO WEB
    if (!session?.user?.id || session?.user?.role !== 'IT') return;

    const fetchNewTasks = async () => {
      try {
        const checkedTasks = JSON.parse(localStorage.getItem('vici_checked_tasks') || '[]');
        
        const res = await fetch(`/api/websites?role=${session.user.role}&userId=${session.user.id}&unacknowledged=true&t=${Date.now()}`, {
          cache: 'no-store'
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            // Lọc bỏ những task đã có trong danh sách đen
            const filteredData = data.filter(t => !checkedTasks.includes(String(t.id)));
            
            if (filteredData.length > 0) {
              setNewTasks(filteredData);
              setIsVisible(true);
            } else {
              setNewTasks([]);
              setIsVisible(false);
            }
          } else {
            setNewTasks([]);
            setIsVisible(false);
          }
        }
      } catch (error) {
        console.error('Error fetching unacknowledged tasks:', error);
      }
    };

    fetchNewTasks();
    const interval = setInterval(fetchNewTasks, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [session]);

  const handleAcknowledgeAll = async () => {
    const checkedTasks = JSON.parse(localStorage.getItem('vici_checked_tasks') || '[]');
    
    // Gửi yêu cầu xác nhận cho tất cả task
    const promises = newTasks.map(async (task) => {
      if (!checkedTasks.includes(String(task.id))) {
        checkedTasks.push(String(task.id));
      }

      const updatePayload = { isAcknowledged: true };
      if (!task.assignedToId) {
        updatePayload.assignedToId = parseInt(session.user.id);
      }

      return fetch(`/api/websites/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload)
      });
    });

    try {
      await Promise.all(promises);
      localStorage.setItem('vici_checked_tasks', JSON.stringify(checkedTasks));
      setNewTasks([]);
      setIsVisible(false);
    } catch (error) {
      console.error('Error acknowledging tasks:', error);
    }
  };

  if (!isVisible || newTasks.length === 0) return null;

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      zIndex: 99999, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(30px)'
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes liquid-pulse {
          0% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.4), 0 0 40px rgba(239, 68, 68, 0.2); }
          50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.7), 0 0 60px rgba(239, 68, 68, 0.4); }
          100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.4), 0 0 40px rgba(239, 68, 68, 0.2); }
        }
        .liquid-glass {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(45px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 40px;
          padding: 40px;
          width: 90%;
          max-width: 500px;
          text-align: center;
          animation: liquid-pulse 4s infinite ease-in-out;
        }
        .pulse-icon-new {
          width: 100px;
          height: 100px;
          background: linear-gradient(135deg, #3b82f6 0%, #ef4444 100%);
          color: white;
          border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 45px;
          margin: 0 auto 30px;
          box-shadow: 0 15px 35px rgba(59, 130, 246, 0.4);
          animation: blob-animate 5s linear infinite;
        }
        @keyframes blob-animate {
          0%, 100% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
          50% { border-radius: 50% 50% 30% 70% / 50% 60% 40% 50%; }
        }
        .task-list-preview {
          max-height: 150px;
          overflow-y: auto;
          margin-bottom: 30px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          padding: 10px;
        }
        .task-item-line {
          padding: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          color: white;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
      `}} />

      <div className="liquid-glass">
        <div className="pulse-icon-new">
          <i className='bx bxs-bell-ring'></i>
        </div>

        <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#ffffff', marginBottom: '10px' }}>THÔNG BÁO MỚI!</h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '18px', marginBottom: '25px' }}>
          Bạn có <strong style={{ color: '#ef4444', fontSize: '24px' }}>{newTasks.length}</strong> yêu cầu công việc mới cần xác nhận.
        </p>

        <div className="task-list-preview">
          {newTasks.map(task => (
            <div key={task.id} className="task-item-line">
              <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>#{task.siteId}</span>
              <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.name}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          <button 
            onClick={handleAcknowledgeAll}
            style={{ 
              flex: 1, 
              padding: '18px', 
              borderRadius: '20px', 
              background: '#ffffff', 
              color: '#1e293b', 
              border: 'none', 
              fontWeight: 800, 
              fontSize: '16px', 
              cursor: 'pointer'
            }}
          >
            Xác nhận tất cả
          </button>
          <button 
             onClick={() => window.location.href = '/my-tasks'}
             style={{ 
               flex: 1, 
               padding: '18px', 
               borderRadius: '20px', 
               background: 'linear-gradient(135deg, #3b82f6 0%, #ef4444 100%)', 
               color: '#ffffff', 
               border: 'none', 
               fontWeight: 800, 
               fontSize: '16px', 
               cursor: 'pointer'
             }}
          >
            Xem danh sách
          </button>
        </div>
      </div>
    </div>
  );
}
