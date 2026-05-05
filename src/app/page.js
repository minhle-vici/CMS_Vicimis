"use client";
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import StatCard from '@/components/StatCard';
import KanbanBoard from '@/components/KanbanBoard';
import TaskModal from '@/components/TaskModal';

export default function Home() {
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Design landing page mockups', desc: 'Create high-fidelity mockups for the new product launch.', category: 'Design', status: 'todo', comments: 3, user: 'Admin', userColor: 'a855f7' },
    { id: '2', title: 'Setup project repository', desc: 'Initialize Git repo and configure ESLint/Prettier.', category: 'Development', status: 'todo', comments: 1, user: 'Admin', userColor: 'a855f7' },
    { id: '3', title: 'Competitor analysis', desc: 'Analyze top 3 competitors\' feature sets.', category: 'Research', status: 'in-progress', comments: 5, user: 'Admin', userColor: 'a855f7' },
    { id: '4', title: 'Implement authentication', desc: 'Integrate JWT based login and registration flow.', category: 'Development', status: 'review', comments: 8, user: 'Admin', userColor: 'a855f7' },
    { id: '5', title: 'Wireframe sketch', desc: 'Initial sketches for the dashboard layout.', category: 'Design', status: 'done', comments: 2, user: 'Admin', userColor: 'a855f7' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddTask = (newTask) => {
    const task = {
      ...newTask,
      id: Date.now().toString(),
      comments: 0,
      user: 'Admin',
      userColor: 'a855f7'
    };
    setTasks([...tasks, task]);
  };

  const handleTaskMove = (taskId, newStatus) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  return (
    <div className="app-container">
      <Sidebar />
      
      <main className="main-content">
        <Topbar onAddTask={() => setIsModalOpen(true)} />

        <section className="overview">
          <StatCard icon="bx-layer" color="purple" label="Total Tasks" value={tasks.length} />
          <StatCard icon="bx-loader-circle" color="blue" label="In Progress" value={tasks.filter(t => t.status === 'in-progress').length} />
          <StatCard icon="bx-check-circle" color="green" label="Completed" value={tasks.filter(t => t.status === 'done').length} />
          <StatCard icon="bx-time-five" color="red" label="Overdue" value="4" />
        </section>

        <KanbanBoard tasks={tasks} onTaskMove={handleTaskMove} />
      </main>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleAddTask} 
      />
    </div>
  );
}
