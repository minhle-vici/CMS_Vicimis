# Vicimis CMS

Hệ thống quản lý nội bộ (CMS) dành cho Vicimis, được xây dựng với Next.js, Prisma ORM, và NextAuth.js. Hệ thống giúp quản lý tài khoản, phân quyền, giao việc (Task), quản lý website, booking và các dự án của phòng ban.

## 🚀 Công nghệ sử dụng
- **Framework**: [Next.js (App Router)](https://nextjs.org/)
- **Cơ sở dữ liệu**: [SQLite](https://www.sqlite.org/) (có thể dễ dàng chuyển sang PostgreSQL/MySQL)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Xác thực & Phân quyền**: [NextAuth.js](https://next-auth.js.org/)
- **Giao diện**: HTML/CSS thuần (CSS Modules + Global CSS) với phong cách Glassmorphism.

---

## 🛠 Hướng dẫn Cài đặt & Chạy chương trình

### 1. Cài đặt các gói phụ thuộc (Dependencies)
Mở terminal tại thư mục gốc của dự án (`d:\WORKSPACE\cms`) và chạy:
```bash
npm install
```

### 2. Thiết lập môi trường (Environment Variables)
Đảm bảo bạn có file `.env` ở thư mục gốc chứa cấu hình cơ bản sau:
```env
# Mật khẩu / Secret cho NextAuth
NEXTAUTH_SECRET="chuoi-bi-mat-bat-ky-cua-ban"
NEXTAUTH_URL="http://localhost:3000"

# Đường dẫn đến file DB SQLite
DATABASE_URL="file:./dev.db"
```

### 3. Thiết lập Database (Prisma)
Để tạo bảng và cấu trúc cơ sở dữ liệu dựa trên file `prisma/schema.prisma`, chạy lệnh:
```bash
npx prisma db push
```
*(Nếu làm việc nhóm hoặc muốn lưu trữ lịch sử thay đổi DB, bạn có thể dùng `npx prisma migrate dev` thay cho `db push`)*

**Tạo dữ liệu mẫu ban đầu (Seeding):**
Để có tài khoản Admin và các dữ liệu khởi tạo, chạy:
```bash
npx prisma db seed
```
*(Mặc định tài khoản Admin là: `admin@vicimix.com` / Pass: `admin123` - tham khảo trong `prisma/seed.js`)*

### 4. Chạy chương trình ở môi trường dev
```bash
npm run dev
```
Sau đó truy cập: [http://localhost:3000](http://localhost:3000)

---

## 🗄 Quản lý Database (Xem, Sửa, Xóa Data Trực tiếp)

Prisma cung cấp sẵn công cụ giao diện trực quan để xem DB ngay trên trình duyệt (Prisma Studio). Để mở:
```bash
npx prisma studio
```
Lệnh này sẽ mở một tab mới tại `http://localhost:5555`, cho phép bạn xem và chỉnh sửa trực tiếp các bảng `User`, `Website`, `Booking`, v.v. giống như dùng Excel.

---

## 📁 Tổ chức Cấu trúc Thư mục

Dưới đây là sơ đồ và giải thích cấu trúc mã nguồn của dự án (kiến trúc Next.js App Router):

```text
cms/
├── prisma/                 # 🗄 Cấu hình & Quản lý Database
│   ├── schema.prisma       # Chứa định nghĩa các Model/Bảng (User, Website, Task...)
│   └── seed.js             # Script tạo dữ liệu khởi tạo mẫu
│
├── src/
│   ├── app/                # 🌐 App Router (Định nghĩa Page & API)
│   │   ├── api/            # Backend APIs xử lý data từ DB (auth, users, websites, domains...)
│   │   ├── accounts/       # Trang Quản lý tài khoản mạng xã hội / thông tin nội bộ
│   │   ├── booking/        # Trang Quản lý Booking (Domain, Hosting...)
│   │   ├── login/          # Trang Đăng nhập (NextAuth)
│   │   ├── users/          # Trang Quản lý Nhân sự (CRUD User)
│   │   ├── websites/       # Trang Quản lý Dự án Website
│   │   ├── team/           # Trang Quản lý Đội nhóm / Báo cáo Task
│   │   ├── my-tasks/       # Trang Task cá nhân
│   │   ├── globals.css     # File CSS định dạng Global (Font, Colors, Utilities...)
│   │   └── layout.js       # Root Layout (bọc toàn bộ ứng dụng bằng AuthProvider, Notification)
│   │
│   ├── components/         # 🧩 Các Component UI tái sử dụng
│   │   ├── Sidebar.js      # Thanh menu bên trái
│   │   ├── Topbar.js       # Thanh menu phía trên (Avatar, Search...)
│   │   ├── WebsiteModal.js # Popup Form (Thêm/Sửa Website)
│   │   ├── KanbanBoard.js  # Bảng Kanban kéo thả Task
│   │   └── ...             # Các component như Notification, Table, Card...
│   │
│   └── lib/                # ⚙️ Các file cấu hình hệ thống
│       ├── auth.js         # Config NextAuth (Strategy đăng nhập, callback xử lý Session/JWT)
│       └── prisma.js       # Khởi tạo Global Prisma Client để query DB
│
├── .env                    # Biến môi trường (DB URL, Auth Secret)
├── package.json            # Các thư viện NPM và Scripts
└── next.config.js          # Cấu hình Next.js
```

### Giải thích các khối chức năng chính:
- **`src/app/api/...`**: Đóng vai trò là tầng Backend. Khi Frontend cần lấy/thêm/sửa dữ liệu, nó sẽ gọi `fetch()` đến các API này. Ví dụ file `api/users/route.js` sẽ chứa `GET` và `POST` để query Prisma.
- **`src/components/...`**: Đây là nơi thiết kế giao diện UI. Tách nhỏ ra để tái sử dụng ở nhiều trang (Ví dụ: `WebsiteModal` có thể được gọi từ cả `websites/page.js` hoặc `my-tasks/page.js`).
- **`Prisma Schema`**: Mọi thay đổi về cấu trúc bảng (thêm trường, xóa trường) đều thực hiện tại `prisma/schema.prisma`. Sau khi sửa xong, bắt buộc phải chạy `npx prisma db push` để cập nhật cấu trúc thực tế vào file `.db`.
