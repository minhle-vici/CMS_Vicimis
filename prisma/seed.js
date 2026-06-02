const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
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

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 10)
  const defaultPassword = await bcrypt.hash('vicimis2024', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@vicimix.com' },
    update: {},
    create: { name: 'Admin', email: 'admin@vicimix.com', role: 'Admin', is_manager: true, password: adminPassword },
  })

  const users = [
    { name: 'Quân', email: 'quan@vicimis.com', role: 'IT', is_manager: false, password: defaultPassword },
    { name: 'Minh', email: 'minh@vicimis.com', role: 'IT', is_manager: false, password: defaultPassword },
    { name: 'Huyền', email: 'huyen@vicimis.com', role: 'AM', is_manager: false, password: defaultPassword },
    { name: 'Nhi', email: 'nhi@vicimis.com', role: 'AM', is_manager: true, password: defaultPassword },
    { name: 'Phương', email: 'phuong@vicimis.com', role: 'AM', is_manager: false, password: defaultPassword },
    { name: 'Mai', email: 'mai@vicimis.com', role: 'AM', is_manager: false, password: defaultPassword },
    { name: 'Gia', email: 'gia@vicimis.com', role: 'AM', is_manager: false, password: defaultPassword },
  ]

  const createdUsers = [admin]
  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { is_manager: u.is_manager },
      create: u
    })
    createdUsers.push(user)
  }

  // Cấu trúc phân cấp: Manager quản lý nhân viên
  console.log('🌱 Đang cấu trúc lại phân cấp quản lý...')
  const amManager = createdUsers.find(u => u.name === 'Nhi')
  const itManager = createdUsers.find(u => u.name === 'Admin')

  // Gán nhân viên AM cho Nhi
  await prisma.user.updateMany({
    where: { name: { in: ['Huyền', 'Phương', 'Mai', 'Gia'] } },
    data: { managerId: amManager.id }
  })

  // Gán nhân viên IT cho Admin
  await prisma.user.updateMany({
    where: { name: { in: ['Quân', 'Minh'] } },
    data: { managerId: itManager.id }
  })

  console.log('🌱 Đang tạo Website mẫu...')
  const initialWebsites = [
    { siteId: 739, name: 'Vicimis Nails 739', briefer: 'Nhi', assignee: 'Minh', status: 'Đang thực hiện', domain: 'nails739.com' },
    { siteId: 605, name: 'Vicimis Nails 605', briefer: 'Huyền', assignee: 'Quân', status: 'Đã tiếp nhận', domain: 'nails605.com' },
    { siteId: 698, name: 'Vicimis Nails 698', briefer: 'Phương', assignee: 'Minh', status: 'Hoàn thành demo', domain: 'nails698.com' },
    { siteId: 650, name: 'Vicimis Nails 650', briefer: 'Mai', assignee: 'Quân', status: 'Bàn giao', domain: 'nails650.com' },
    { siteId: 234, name: 'Vicimis Nails 234', briefer: 'Gia', assignee: 'Minh', status: 'Đang thực hiện', domain: 'nails234.com' },
  ]

  const createdWebsites = []
  for (const w of initialWebsites) {
    const briefUser = createdUsers.find(u => u.name === w.briefer)
    const assignUser = createdUsers.find(u => u.name === w.assignee)
    
    const website = await prisma.website.create({
      data: {
        siteId: w.siteId,
        name: w.name,
        domain: w.domain,
        status: w.status,
        briefById: briefUser ? briefUser.id : null,
        assignedToId: assignUser ? assignUser.id : null,
        info: `Dữ liệu mẫu cho website ${w.name}. Giao cho ${w.assignee} bởi ${w.briefer}.`,
        demoUrl: `https://demo.vicimis.com`,
        demoUser: 'admin',
        demoPass: '123456',
        contractValue: 15000000,
        paidAmount: w.status === 'Bàn giao' ? 15000000 : 5000000,
        paymentStatus: w.status === 'Bàn giao' ? 'Đã thanh toán' : 'Một phần'
      }
    })
    
    // Tạo domain tương ứng
    if (w.domain) {
      await prisma.domain.create({
        data: {
          url: w.domain,
          provider: 'Mắt Bão',
          purchaseDate: new Date(),
          expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
          price: 350000,
          renewalPrice: 350000,
          status: 'Đang hoạt động',
          websiteId: website.id
        }
      })
    }
    createdWebsites.push(website)
  }

  console.log('🌱 Đang tạo Task_IT lẻ...')
  // Dùng ID của các website vừa tạo
  const taskData = [
    { amName: 'Nhi', webIndex: 0, title: 'Fix demo mobile view', desc: 'Sửa lỗi menu không hiện trên điện thoại', category: 'Fix lỗi', user: 'Minh', status: 'Hoàn thành' },
    { amName: 'Huyền', webIndex: 1, title: 'Pop up coupon', desc: 'Thêm popup khuyến mãi mùa hè', category: 'Fix lỗi', user: 'Quân', status: 'Đang thực hiện' },
  ]

  for (const t of taskData) {
    const assignedUser = createdUsers.find(u => u.name === t.user)
    const brieferUser = createdUsers.find(u => u.name === t.amName)
    const targetWeb = createdWebsites[t.webIndex]
    
    await prisma.task_IT.create({
      data: {
        title: t.title,
        desc: t.desc,
        category: t.category,
        status: t.status,
        websiteId: targetWeb.id,
        assignedToId: assignedUser ? assignedUser.id : null,
        briefedById: brieferUser ? brieferUser.id : null
      }
    })
  }

  console.log('✅ Seed dữ liệu thành công!')
  console.log('')
  console.log('📌 Tài khoản đăng nhập:')
  console.log('   Admin:  admin@vicimix.com / admin123')
  console.log('   IT/AM:  [email]@vicimis.com / vicimis2024')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
