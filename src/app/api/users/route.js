import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    
    let where = {};
    if (role) {
      where.role = role;
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: [
        { role: 'asc' },
        { is_manager: 'desc' },
        { name: 'asc' }
      ]
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const { name, email, role, password, is_manager } = data;

    // TODO: Hash password in a real app (e.g. using bcrypt)
    // For now we'll store it in plain text to get things moving.
    
    // If setting as manager, you might want to ensure only one manager per department
    if (is_manager) {
      await prisma.user.updateMany({
        where: { role, is_manager: true },
        data: { is_manager: false }
      });
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        role,
        password: password || null,
        is_manager: is_manager || false
      }
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
