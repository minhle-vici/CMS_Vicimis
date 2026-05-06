import { prisma } from '@/lib/prisma'
import AdminDashboardClient from './AdminDashboardClient'

export default async function AdminDashboard() {
  const websites = await prisma.website.findMany()
  const users = await prisma.user.findMany({
    include: { tasksIT: true }
  })
  
  const allTasks = await prisma.task_IT.findMany({
    include: {
      briefedBy: true,
      assignedTo: true,
      website: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
  
  // Biến đổi dữ liệu user thành số liệu thống kê
  const userStats = users.map(user => ({
    name: user.name,
    role: user.role,
    total: user.tasksIT.length,
    completed: user.tasksIT.filter(t => t.status === 'Đã hoàn thành').length,
    inProgress: user.tasksIT.filter(t => t.status === 'Đang thực hiện').length,
    received: user.tasksIT.filter(t => t.status === 'Đã tiếp nhận').length,
  }))

  return <AdminDashboardClient websites={websites} userStats={userStats} allTasks={allTasks} />
}
