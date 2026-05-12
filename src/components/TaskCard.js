"use client";
import { useState } from 'react';

export default function TaskCard({ site, itUsers, currentUserId, onPassTask, onDragStart, onDragEnd, columnColor }) {
  return (
    <div 
      draggable="true"
      onDragStart={(e) => onDragStart(e, site.id)}
      onDragEnd={onDragEnd}
      className="task-card-item"
      style={{ 
        background: 'var(--card-bg)', 
        padding: '20px', 
        borderRadius: '24px', 
        boxShadow: 'var(--shadow)', 
        border: '1px solid var(--border-color)', 
        cursor: 'grab', 
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <style jsx>{`
        .task-card-item:hover {
          border-color: var(--primary) !important;
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.1);
        }
        :global(.dark) .task-card-item:hover {
          box-shadow: 0 12px 40px rgba(0,0,0,0.4);
        }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <span style={{ 
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', 
          color: 'white', 
          fontSize: '11px', 
          fontWeight: 700, 
          padding: '4px 10px', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          #{site.siteId || 'N/A'}
        </span>
        <div style={{ display: 'flex', gap: '6px' }}>
          {site.demoUrl && <a href={site.demoUrl} target="_blank" title="Demo"><i className='bx bx-link' style={{ color: '#3b82f6' }}></i></a>}
          {site.domain && <a href={`https://${site.domain}`} target="_blank" title="Domain"><i className='bx bx-globe' style={{ color: '#10b981' }}></i></a>}
        </div>
      </div>

      <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>{site.name}</h4>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '16px' }}>
        {site.info || 'Không có ghi chú thêm.'}
      </p>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
         <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
           Brief: <span style={{ color: '#db2777', fontWeight: 600 }}>{site.briefedBy?.name}</span>
         </div>
         
         <div className="pass-task-container">
           <select 
             onChange={(e) => {
               if (e.target.value) onPassTask(site.id, parseInt(e.target.value));
             }}
             style={{ 
               fontSize: '10px', 
               padding: '4px 8px', 
               borderRadius: '8px', 
               border: '1px solid var(--border-color)', 
               background: 'var(--bg-surface-hover)', 
               color: 'var(--text-muted)', 
               cursor: 'pointer', 
               outline: 'none' 
             }}
             value=""
           >
             <option value="">Chuyển giao...</option>
             {itUsers.filter(u => u.id !== currentUserId).map(u => (
               <option key={u.id} value={u.id}>{u.name}</option>
             ))}
           </select>
         </div>
      </div>
    </div>
  );
}
