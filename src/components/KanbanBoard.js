"use client";
import TaskCard from './TaskCard';

export default function KanbanBoard({ tasks, onTaskMove }) {
  const columns = [
    { id: 'todo', title: 'To Do', color: '#94a3b8' },
    { id: 'in-progress', title: 'In Progress', color: '#3b82f6' },
    { id: 'review', title: 'Review', color: '#f59e0b' },
    { id: 'done', title: 'Done', color: '#10b981' },
  ];

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, status) => {
    const taskId = e.dataTransfer.getData('taskId');
    onTaskMove(taskId, status);
  };

  return (
    <section className="board">
      {columns.map(column => (
        <div 
          key={column.id} 
          className="column"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          <div className="column-header">
            <div className="column-title">
              <span className="dot" style={{ background: column.color }}></span>
              <h4>{column.title}</h4>
              <span className="count">
                {tasks.filter(t => t.status === column.id).length}
              </span>
            </div>
            <button className="btn-icon-small"><i className='bx bx-dots-horizontal-rounded'></i></button>
          </div>
          <div className="task-list">
            {tasks
              .filter(task => task.status === column.id)
              .map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onDragStart={handleDragStart}
                />
              ))
            }
          </div>
        </div>
      ))}
    </section>
  );
}
