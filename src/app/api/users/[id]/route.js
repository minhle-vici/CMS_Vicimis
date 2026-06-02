import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function PUT(request, { params }) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const data = await request.json();
    const { name, email, role, password, is_manager, managerId } = data;

    // Logic đảm bảo 1 manager mỗi phòng (Nếu cần thiết, ở đây mình tắt để linh hoạt hơn)
    // if (is_manager) {
    //   await prisma.user.updateMany({
    //     where: { role, is_manager: true, id: { not: id } },
    //     data: { is_manager: false }
    //   });
    // }

    const updateData = { 
      name, 
      email, 
      role, 
      is_manager,
      managerId: managerId ? parseInt(managerId) : null
    };
    
    // Only update password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    await prisma.user.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
