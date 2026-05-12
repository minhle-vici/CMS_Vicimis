import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userRole = session.user.role;
    
    // Lấy danh mục và tài khoản theo Role của user
    const categories = await prisma.accountCategory.findMany({
      where: { role: userRole },
      include: {
        accounts: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Nếu không phải manager, lọc bỏ các tài khoản bị ẩn
    if (!session.user.is_manager && userRole !== 'Admin') {
      categories.forEach(cat => {
        cat.accounts = cat.accounts.filter(acc => acc.isVisibleToTeam);
      });
    }

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    // Chỉ manager hoặc Admin mới được tạo
    if (!session.user.is_manager && session.user.role !== 'Admin') {
      return NextResponse.json({ error: "Chỉ quản lý mới có quyền thực hiện" }, { status: 403 });
    }

    const data = await request.json();
    const { type, name, username, password, note, categoryId, role } = data;

    if (type === 'category') {
      const newCategory = await prisma.accountCategory.create({
        data: {
          name,
          role: role || session.user.role
        }
      });
      return NextResponse.json(newCategory);
    } else {
      const newAccount = await prisma.accountDetail.create({
        data: {
          name,
          username,
          password,
          note,
          categoryId: parseInt(categoryId)
        }
      });
      return NextResponse.json(newAccount);
    }
  } catch (error) {
    console.error('Error creating account/category:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    if (!session.user.is_manager && session.user.role !== 'Admin') {
      return NextResponse.json({ error: "Chỉ quản lý mới có quyền thực hiện" }, { status: 403 });
    }

    const data = await request.json();
    const { id, isVisibleToTeam, name, username, password, note } = data;

    const updatedAccount = await prisma.accountDetail.update({
      where: { id: parseInt(id) },
      data: {
        isVisibleToTeam: isVisibleToTeam !== undefined ? isVisibleToTeam : undefined,
        name: name || undefined,
        username: username || undefined,
        password: password || undefined,
        note: note || undefined
      }
    });

    return NextResponse.json(updatedAccount);
  } catch (error) {
    console.error('Error updating account:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');

    if (!session.user.is_manager && session.user.role !== 'Admin') {
      return NextResponse.json({ error: "Chỉ quản lý mới có quyền thực hiện" }, { status: 403 });
    }

    if (type === 'category') {
      await prisma.accountCategory.delete({ where: { id: parseInt(id) } });
    } else {
      await prisma.accountDetail.delete({ where: { id: parseInt(id) } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
