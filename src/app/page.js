import { prisma } from '@/lib/prisma'
import AdminDashboardClient from './AdminDashboardClient'

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const websites = await prisma.website.findMany({
    include: { assignedTo: true }
  })
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
  
  // Thống kê từng user
  const userStats = users.map(user => ({
    name: user.name,
    role: user.role,
    total: user.tasksIT.length,
    completed: user.tasksIT.filter(t => t.status === 'Đã hoàn thành').length,
    inProgress: user.tasksIT.filter(t => t.status === 'Đang thực hiện').length,
    received: user.tasksIT.filter(t => t.status === 'Đã tiếp nhận').length,
  }))

  // Nhóm theo phòng ban (role) để hiển thị biểu đồ
  const roleGroupMap = {}
  userStats.forEach(s => {
    if (!roleGroupMap[s.role]) roleGroupMap[s.role] = { total: 0, completed: 0, inProgress: 0, received: 0 }
    roleGroupMap[s.role].total      += s.total
    roleGroupMap[s.role].completed  += s.completed
    roleGroupMap[s.role].inProgress += s.inProgress
    roleGroupMap[s.role].received   += s.received
  })
  const roleStats = Object.entries(roleGroupMap).map(([role, stats]) => ({ role, ...stats }))

  const domains = await prisma.domain.findMany({
    include: { website: true },
    orderBy: { expiryDate: 'asc' }
  })
  
  return (
    <AdminDashboardClient 
      websites={websites} 
      userStats={userStats}
      roleStats={roleStats}
      allTasks={allTasks} 
      domains={domains}
    />
  )
}
