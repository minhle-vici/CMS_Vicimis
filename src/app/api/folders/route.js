import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET: Lấy danh sách folder mà user hiện tại có quyền xem
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { role, id: userId, is_manager } = session.user;

    let folders;

    if (role === 'Admin') {
      // Admin thấy tất cả
      folders = await prisma.folder.findMany({
        include: {
          permissions: true,
          memberAccess: { include: { user: true } },
          createdBy: { select: { id: true, name: true } },
          accounts: { include: { category: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // Lấy folder có quyền theo role HOẶC quyền theo thành viên cá nhân
      folders = await prisma.folder.findMany({
        where: {
          OR: [
            { permissions: { some: { role, canView: true } } },
            { memberAccess: { some: { userId: parseInt(userId), canView: true } } },
          ],
        },
        include: {
          permissions: true,
          memberAccess: { include: { user: true } },
          createdBy: { select: { id: true, name: true } },
          accounts: { include: { category: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json(folders);
  } catch (error) {
    console.error("GET /api/folders Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Tạo folder mới
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, color, icon, type, roles } = await req.json();

    const folder = await prisma.folder.create({
      data: {
        name,
        description,
        color: color || '#3b82f6',
        icon: icon || 'bx-folder',
        type: type || 'ACCOUNT',
        createdById: parseInt(session.user.id),
        permissions: {
          create: (roles || []).map(r => ({
            role: r,
            canView: true,
            canEdit: false,
          })),
        },
      },
      include: { permissions: true, memberAccess: true },
    });

    return NextResponse.json(folder);
  } catch (error) {
    console.error("POST /api/folders Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Cập nhật folder hoặc cấp quyền thành viên
export async function PUT(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { type, folderId, ...data } = await req.json();
  const { role, id: userId, is_manager } = session.user;

  // Lấy folder hiện tại để kiểm tra quyền
  const currentFolder = await prisma.folder.findUnique({ where: { id: folderId } });
  if (!currentFolder) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const isCreator = currentFolder.createdById === parseInt(userId);
  const isFolderAdmin = role === 'Admin' || isCreator;

    // Admin hoặc Người tạo cập nhật folder
    if (type === 'folder' && isFolderAdmin) {
      const { name, description, color, icon, roles } = data;
      await prisma.folderPermission.deleteMany({ where: { folderId } });
      const folder = await prisma.folder.update({
        where: { id: folderId },
        data: {
          name, description, color, icon,
          permissions: {
            create: (roles || []).map(r => ({ role: r, canView: true, canEdit: false })),
          },
        },
        include: { permissions: true },
      });
      return NextResponse.json(folder);
    }
  
    // Bất kỳ ai cũng có thể thêm tài khoản vào folder
    if (type === 'add_account') {
      const { name, username, password, note } = data;
      const folder = await prisma.folder.update({
        where: { id: folderId },
        data: {
          accounts: {
            create: {
              name, username, password, note
            }
          }
        },
        include: { permissions: true, memberAccess: { include: { user: true } }, createdBy: { select: { id: true, name: true } }, accounts: { include: { category: true } } }
      });
      return NextResponse.json(folder);
    }

    // Cập nhật nội dung văn bản cho thư mục loại DOCUMENT
    if (type === 'update_document') {
      if (!isFolderAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      const { content } = data;
      const folder = await prisma.folder.update({
        where: { id: folderId },
        data: { content },
        include: { permissions: true, memberAccess: { include: { user: true } }, createdBy: { select: { id: true, name: true } }, accounts: { include: { category: true } } }
      });
      return NextResponse.json(folder);
    }

    // Xóa tài khoản khỏi folder
    if (type === 'remove_account' && (is_manager || isFolderAdmin)) {
      const { accountId } = data;
      await prisma.accountDetail.delete({ where: { id: parseInt(accountId) } });
      const folder = await prisma.folder.findUnique({
        where: { id: folderId },
        include: { permissions: true, memberAccess: { include: { user: true } }, createdBy: { select: { id: true, name: true } }, accounts: { include: { category: true } } }
      });
      return NextResponse.json(folder);
    }

  // Admin hoặc Người tạo tích / bỏ tích quyền phòng ban trực tiếp
  if (type === 'role_permission' && isFolderAdmin) {
    const { role: targetRole, grant } = data;
    if (grant) {
      await prisma.folderPermission.upsert({
        where: { folderId_role: { folderId, role: targetRole } },
        update: { canView: true },
        create: { folderId, role: targetRole, canView: true, canEdit: false },
      });
    } else {
      await prisma.folderPermission.deleteMany({ where: { folderId, role: targetRole } });
    }
    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
      include: { permissions: true, memberAccess: { include: { user: true } }, createdBy: { select: { id: true, name: true } } },
    });
    return NextResponse.json(folder);
  }

  // Trưởng phòng hoặc Người tạo cấp/thu quyền thành viên
  if (type === 'member_access' && (is_manager || isFolderAdmin)) {
    const { memberId, canView } = data;
    const access = await prisma.folderMemberAccess.upsert({
      where: { folderId_userId: { folderId, userId: memberId } },
      update: { canView, grantedById: parseInt(userId) },
      create: { folderId, userId: memberId, canView, grantedById: parseInt(userId) },
    });
    return NextResponse.json(access);
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// DELETE: Xóa folder (Admin hoặc Người tạo)
export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { folderId } = await req.json();
  const folder = await prisma.folder.findUnique({ where: { id: folderId } });
  
  if (!folder) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (session.user.role !== 'Admin' && folder.createdById !== parseInt(session.user.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await prisma.folder.delete({ where: { id: folderId } });
  return NextResponse.json({ success: true });
}
