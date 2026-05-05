export default function TaskCard({ task, onDragStart }) {
  const getTagColor = (category) => {
    switch (category) {
      case 'Development': return 'tag-purple';
      case 'Research': return 'tag-green';
      case 'Design': return 'tag-blue';
      default: return 'tag-blue';
    }
  };

  return (
    <div 
      className={`task-card ${task.status === 'done' ? 'done' : ''}`} 
      draggable="true"
      onDragStart={(e) => onDragStart(e, task.id)}
    >
      <div className="task-tags">
        <span className={`tag ${getTagColor(task.category)}`}>{task.category}</span>
      </div>
      <h5 className="task-title">{task.title}</h5>
      <p className="task-desc">{task.desc}</p>
      <div className="task-footer">
        <div className="task-meta"><i className='bx bx-message-square-detail'></i> {task.comments || 0}</div>
        <img 
          src={`https://ui-avatars.com/api/?name=${task.user || 'User'}&background=${task.userColor || '3b82f6'}&color=fff`} 
          className="avatar-small" 
          alt="User"
        />
      </div>
    </div>
  );
}
