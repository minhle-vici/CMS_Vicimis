const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Đang xóa dữ liệu cũ...')
  try {
    await prisma.task_IT.deleteMany()
    await prisma.website.deleteMany()
    await prisma.user.deleteMany()
  } catch (e) {
    console.log('Chưa có bảng để xóa, bỏ qua...')
  }

  console.log('🌱 Đang tạo User...')
  const admin = await prisma.user.upsert({
    where: { email: 'admin@vicimis.com' },
    update: {},
    create: { name: 'Admin', email: 'admin@vicimis.com', role: 'Admin', is_manager: true },
  })

  const users = [
    { name: 'Quân', email: 'quan@vicimis.com', role: 'IT', is_manager: false },
    { name: 'Minh', email: 'minh@vicimis.com', role: 'IT', is_manager: false },
    { name: 'Huyền', email: 'huyen@vicimis.com', role: 'AM', is_manager: false },
    { name: 'Nhi', email: 'nhi@vicimis.com', role: 'AM', is_manager: false },
    { name: 'Phương', email: 'phuong@vicimis.com', role: 'AM', is_manager: false },
    { name: 'Mai', email: 'mai@vicimis.com', role: 'AM', is_manager: false },
    { name: 'Gia', email: 'gia@vicimis.com', role: 'AM', is_manager: false },
  ]

  const createdUsers = [admin]
  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u
    })
    createdUsers.push(user)
  }

  console.log('🌱 Đang tạo Website mẫu...')
  const initialWebsites = [
    { id: '739', name: 'Vicimis Nails 739', address: 'Main St', domain: 'nails739.com' },
    { id: '605A', name: 'Vicimis Nails 605A', address: 'Broadway', domain: 'nails605a.com' },
    { id: '698', name: 'Vicimis Nails 698', address: 'Market St', domain: 'nails698.com' },
    { id: '650', name: 'Vicimis Nails 650', address: '5th Ave', domain: 'nails650.com' },
    { id: '234', name: 'Vicimis Nails 234', address: 'Ocean Blvd', domain: 'nails234.com' },
    { id: '186', name: 'Vicimis Nails 186', address: 'Lake Rd', domain: 'nails186.com' },
    { id: '566', name: 'Vicimis Nails 566', address: 'Pine St', domain: 'nails566.com' },
    { id: '232', name: 'Vicimis Nails 232', address: 'Sunset Blvd', domain: 'nails232.com' },
    { id: '476', name: 'Vicimis Nails 476', address: 'Hill St', domain: 'nails476.com' },
    { id: '617A', name: 'Vicimis Nails 617A', address: 'Park Ave', domain: 'nails617a.com' },
    { id: '323', name: 'Vicimis Nails 323', address: 'River Rd', domain: 'nails323.com' },
    { id: '626', name: 'Vicimis Nails 626', address: 'Beach Dr', domain: 'nails626.com' },
    { id: '222', name: 'Vicimis Nails 222', address: 'Valley View', domain: 'nails222.com' },
    { id: '688', name: 'Vicimis Nails 688', address: 'Skyline Dr', domain: 'nails688.com' },
  ]

  for (const w of initialWebsites) {
    await prisma.website.upsert({
      where: { id: w.id },
      update: {},
      create: w
    })
  }

  console.log('🌱 Đang tạo Task_IT...')
  const initialTasks = [
    { amName: 'Nhi', websiteId: '739', title: 'fix demo webiste https://docs.google.com/document/d/1KsiVZ_GtThUKTsiiFiVPtGIWOcM-PlrRANfmbUW8Zl4/edit?tab=t.0', desc: '', category: 'Bình thường (24h)', user: 'Minh', status: 'Đã hoàn thành' },
    { amName: 'Huyền', websiteId: '605A', title: 'pop up coupon 05/10 gỡ', desc: '05/10 gỡ', category: 'Bình thường (24h)', user: 'Quân', status: 'Đang thực hiện' },
    { amName: 'Phương', websiteId: '698', title: 'Update them menu', desc: '', category: 'Bình thường (24h)', user: 'Minh', status: 'Đã hoàn thành' },
    { amName: 'Mai', websiteId: '650', title: 'fix website', desc: '', category: 'Bình thường (24h)', user: 'Quân', status: 'Đã hoàn thành' },
    { amName: 'Gia', websiteId: '234', title: 'pop up coupon 05/11 gỡ', desc: '05/11 gỡ', category: 'Bình thường (24h)', user: 'Minh', status: 'Đã hoàn thành' },
    { amName: 'Gia', websiteId: '186', title: 'pop up coupon 05/11 gỡ', desc: '05/11 gỡ', category: 'Bình thường (24h)', user: 'Quân', status: 'Đã hoàn thành' },
    { amName: 'Gia', websiteId: '566', title: 'pop up coupon', desc: '', category: 'Bình thường (24h)', user: 'Minh', status: 'Đã hoàn thành' },
    { amName: 'Huyền', websiteId: '232', title: 'thay link booking thành link này: https://www.lldtek.org/salon/appt/VkZoZk1URTVORGs9', desc: '', category: 'Bình thường (24h)', user: 'Quân', status: 'Đã hoàn thành' },
    { amName: 'Nhi', websiteId: '739', title: 'fix demo website hot stone có Collagen spa Volcano deluxe spa $64 xóa Coarse Callus Removal bỏ $10 ra khỏi list', desc: '', category: 'Bình thường (24h)', user: 'Minh', status: 'Đã hoàn thành' },
    { amName: 'Phương', websiteId: '476', title: 'seo WEB BOG', desc: '', category: 'Bình thường (24h)', user: 'Minh', status: 'Đã hoàn thành' },
    { amName: 'Phương', websiteId: '617A', title: 'fIXX BOOKING MỚI', desc: '', category: 'Bình thường (24h)', user: 'Minh', status: 'Đã hoàn thành' },
    { amName: 'Mai', websiteId: '323', title: 'up coupon', desc: '', category: 'Bình thường (24h)', user: 'Quân', status: 'Đã hoàn thành' },
    { amName: 'Phương', websiteId: '626', title: 'Đổi số booking nhận tin sms 4047977790', desc: '', category: 'Bình thường (24h)', user: 'Quân', status: 'Đã hoàn thành' },
    { amName: 'Phương', websiteId: '698', title: 'Fix website + booking https://docs.google.com/document/d/1dWjYgw1oComDdfP4r-2-FaE_LLmlSBS_76Yul_LaXjA/edit?usp=sharing', desc: '', category: 'Bình thường (24h)', user: 'Minh', status: 'Đã hoàn thành' },
    { amName: 'Mai', websiteId: '222', title: 'update them menu', desc: '', category: 'Bình thường (24h)', user: 'Minh', status: 'Đã hoàn thành' },
    { amName: 'Phương', websiteId: '617A', title: 'ĐỔI SỐ NHẬN BOOKING +1 8634096444', desc: '', category: 'Bình thường (24h)', user: 'Minh', status: 'Đã hoàn thành' },
    { amName: 'Huyền', websiteId: '232', title: 'đổi số phone trên web thành: (956) 329-1066', desc: '', category: 'Bình thường (24h)', user: 'Minh', status: 'Đã hoàn thành' },
    { amName: 'Phương', websiteId: '698', title: 'fix đỡ booking online bên kia đang lỗi khách xài lại booking mình :)))', desc: '', category: 'Bình thường (24h)', user: 'Quân', status: 'Đã hoàn thành' },
    { amName: 'Mai', websiteId: '688', title: 'check booking', desc: '', category: 'Bình thường (24h)', user: 'Quân', status: 'Đã hoàn thành' },
  ]

  for (const t of initialTasks) {
    const assignedUser = createdUsers.find(u => u.name === t.user)
    const brieferUser = createdUsers.find(u => u.name === t.amName)
    
    await prisma.task_IT.create({
      data: {
        title: t.title,
        desc: t.desc,
        category: t.category,
        status: t.status,
        websiteId: t.websiteId,
        assignedToId: assignedUser ? assignedUser.id : null,
        briefedById: brieferUser ? brieferUser.id : null
      }
    })
  }

  console.log('✅ Seed dữ liệu thành công!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
