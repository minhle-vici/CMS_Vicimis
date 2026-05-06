export default function TaskCard({ task, onDragStart }) {
  const getTagColor = (category) => {
    switch (category) {
      case 'Ưu tiên (60p)': return 'tag-red';
      case 'Bình thường (24h)': return 'tag-blue';
      case 'Không cần gấp': return 'tag-green';
      default: return 'tag-blue';
    }
  };

  return (
    <div 
      className={`task-card ${task.status === 'done' ? 'done' : ''}`} 
      draggable="true"
      onDragStart={(e) => onDragStart(e, task.id)}
    >
      <div className="task-tags" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className={`tag ${getTagColor(task.category)}`}>{task.category}</span>
        {task.websiteId && (
          <span className="website-id" style={{ fontSize: '10px', padding: '1px 5px' }}>{task.websiteId}</span>
        )}
      </div>
      <h5 className="task-title">{task.title}</h5>
      <p className="task-desc">{task.desc}</p>
      <div className="task-footer">
        <div className="task-meta">
          <i className='bx bx-message-square-detail'></i> {task.comments || 0}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{task.user}</span>
          <img 
            src={`https://ui-avatars.com/api/?name=${task.user || 'User'}&background=${task.userColor || '3b82f6'}&color=fff`} 
            className="avatar-small" 
            alt="User"
          />
        </div>
      </div>
    </div>
  );
}

