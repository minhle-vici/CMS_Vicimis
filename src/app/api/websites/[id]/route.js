import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const website = await prisma.website.findUnique({
      where: { id: parseInt(id) },
      include: {
        briefedBy: { select: { id: true, name: true, role: true } },
        assignedTo: { select: { id: true, name: true, role: true } }
      }
    });

    if (!website) return NextResponse.json({ error: "Website not found" }, { status: 404 });
    return NextResponse.json(website);
  } catch (error) {
    console.error('Error fetching website detail:', error);
    return NextResponse.json({ error: 'Failed to fetch website detail' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const websiteId = parseInt(id);
    const data = await request.json();
    
    // 1. Lấy dữ liệu website hiện tại để kiểm tra quyền
    const currentWebsite = await prisma.website.findUnique({
      where: { id: websiteId }
    });

    if (!currentWebsite) return NextResponse.json({ error: "Website not found" }, { status: 404 });

    // 2. Kiểm tra quyền đổi Status
    if (data.status && data.status !== currentWebsite.status) {
      const isOwner = currentWebsite.briefById === parseInt(session.user.id);
      const isAssignee = currentWebsite.assignedToId === parseInt(session.user.id);
      const isAdmin = session.user.role === 'Admin';

      if (!isOwner && !isAssignee && !isAdmin) {
        return NextResponse.json({ 
          error: "Bạn không có quyền thay đổi trạng thái của dự án này. Chỉ người giao hoặc người nhận task mới được đổi." 
        }, { status: 403 });
      }
    }

    const updateData = {};
    const fields = [
      'name', 'demoUrl', 'demoUser', 'demoPass', 
      'domain', 'templateUrl', 'status', 'priority', 'info', 'isAcknowledged'
    ];

    fields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    });

    if (data.briefById !== undefined) {
      updateData.briefById = (data.briefById && !isNaN(data.briefById)) ? parseInt(data.briefById) : null;
    }
    if (data.assignedToId !== undefined) {
      updateData.assignedToId = (data.assignedToId && !isNaN(data.assignedToId)) ? parseInt(data.assignedToId) : null;
    }
    if (data.startDate !== undefined) {
      updateData.startDate = data.startDate ? new Date(data.startDate) : null;
    }
    if (data.endDate !== undefined) {
      updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    }

    const updatedWebsite = await prisma.website.update({
      where: { id: websiteId },
      data: updateData,
      include: {
        briefedBy: { select: { id: true, name: true, role: true } },
        assignedTo: { select: { id: true, name: true, role: true } }
      }
    });

    return NextResponse.json(updatedWebsite);
  } catch (error) {
    console.error('Error updating website:', error);
    return NextResponse.json({ error: 'Failed to update website' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await prisma.website.delete({
      where: { id: parseInt(id) }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting website:', error);
    return NextResponse.json({ error: 'Failed to delete website' }, { status: 500 });
  }
}
