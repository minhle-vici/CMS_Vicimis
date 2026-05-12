import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role');
  const userId = searchParams.get('userId');

  try {
    const unacknowledged = searchParams.get('unacknowledged') === 'true';
    
    const where = {};
    if (role === 'IT' && userId) {
      where.OR = [
        { assignedToId: parseInt(userId) },
        { assignedToId: null }
      ];
    } else if (role === 'AM' && userId) {
      where.briefById = parseInt(userId);
    }

    if (unacknowledged) {
      where.isAcknowledged = false;
    }

    const websites = await prisma.website.findMany({
      where,
      include: {
        briefedBy: { select: { id: true, name: true, role: true } },
        assignedTo: { select: { id: true, name: true, role: true } },
        tasksIT: true
      },
      orderBy: { startDate: 'desc' }
    });

    return NextResponse.json(websites);
  } catch (error) {
    console.error('Error fetching websites:', error);
    return NextResponse.json({ error: 'Failed to fetch websites' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      id, name, briefById, assignedToId, 
      startDate, endDate, demoUrl, demoUser, demoPass, 
      domain, templateUrl, status, info,
      isFixMode 
    } = body;

    if (isFixMode) {
      if (!id) return NextResponse.json({ error: 'ID Website không hợp lệ' }, { status: 400 });
      
      const websiteId = parseInt(id);
      
      // 1. Cập nhật Website
      await prisma.website.update({
        where: { id: websiteId },
        data: {
          status: status || 'Đang thực hiện',
          info: info,
          isAcknowledged: false,
          assignedToId: assignedToId ? parseInt(assignedToId) : null,
          briefById: briefById ? parseInt(briefById) : null,
        }
      });

      // 2. Tạo Task IT
      const newTask = await prisma.task_IT.create({
        data: {
          title: `Fix: ${name}`,
          desc: info,
          category: 'Fix lỗi',
          status: status || 'Đã tiếp nhận',
          websiteId: websiteId,
          assignedToId: assignedToId ? parseInt(assignedToId) : null,
          briefedById: briefById ? parseInt(briefById) : null,
        }
      });

      return NextResponse.json({ success: true, task: newTask });
    }

    // TẠO MỚI (Tự động tính siteId tiếp theo)
    const maxSite = await prisma.website.findFirst({
      orderBy: { siteId: 'desc' }
    });
    const nextSiteId = maxSite ? maxSite.siteId + 1 : 1;

    const newWebsite = await prisma.website.create({
      data: {
        siteId: nextSiteId,
        name,
        briefById: briefById ? parseInt(briefById) : null,
        assignedToId: assignedToId ? parseInt(assignedToId) : null,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        demoUrl,
        demoUser,
        demoPass,
        domain,
        templateUrl,
        status: status || 'Đã tiếp nhận',
        info,
        isAcknowledged: false
      }
    });

    return NextResponse.json(newWebsite);
  } catch (error) {
    console.error('Error creating website:', error);
    return NextResponse.json({ error: 'Failed to create website' }, { status: 500 });
  }
}
