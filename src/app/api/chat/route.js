import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Pusher from 'pusher';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

let pusherServer;

if (process.env.PUSHER_APP_ID) {
  pusherServer = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.NEXT_PUBLIC_PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    useTLS: true,
  });
}

// GET /api/chat — lấy danh sách conversations hoặc messages của 1 conversation
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = parseInt(session.user.id);
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    // Nếu có conversationId -> trả về messages
    if (conversationId) {
      const messages = await prisma.chatMessage.findMany({
        where: { conversationId: parseInt(conversationId) },
        include: {
          sender: { select: { id: true, name: true, role: true } }
        },
        orderBy: { createdAt: 'asc' },
        take: 200
      });
      return NextResponse.json(messages);
    }

    // Không có conversationId -> trả về danh sách conversations của user
    const conversations = await prisma.conversation.findMany({
      where: {
        members: { some: { userId } }
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, role: true } }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: { select: { id: true, name: true } }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error fetching chat:', error);
    return NextResponse.json({ error: 'Failed to fetch chat' }, { status: 500 });
  }
}

// POST /api/chat — gửi tin nhắn hoặc tạo conversation mới
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = parseInt(session.user.id);
    const body = await request.json();
    const { action } = body;

    // Tạo conversation mới (DM hoặc Group)
    if (action === 'createConversation') {
      const { memberIds, name, isGroup } = body;
      
      // DM: kiểm tra xem đã có conversation 1-1 chưa
      if (!isGroup && memberIds.length === 1) {
        const targetId = memberIds[0];
        const existing = await prisma.conversation.findFirst({
          where: {
            isGroup: false,
            AND: [
              { members: { some: { userId } } },
              { members: { some: { userId: targetId } } }
            ]
          },
          include: {
            members: {
              include: {
                user: { select: { id: true, name: true, role: true } }
              }
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: { sender: { select: { id: true, name: true } } }
            }
          }
        });
        if (existing) return NextResponse.json(existing);
      }

      const allMemberIds = [...new Set([userId, ...memberIds])];
      const conversation = await prisma.conversation.create({
        data: {
          name: isGroup ? name : null,
          isGroup: !!isGroup,
          createdById: userId,
          members: {
            create: allMemberIds.map(id => ({ userId: id }))
          }
        },
        include: {
          members: {
            include: {
              user: { select: { id: true, name: true, role: true } }
            }
          },
          messages: { take: 0 }
        }
      });
      return NextResponse.json(conversation);
    }

    // Gửi tin nhắn
    const { text, conversationId } = body;
    if (!text || !text.trim()) return NextResponse.json({ error: "Text is empty" }, { status: 400 });
    if (!conversationId) return NextResponse.json({ error: "conversationId is required" }, { status: 400 });

    const newMsg = await prisma.chatMessage.create({
      data: {
        text: text.trim(),
        senderId: userId,
        conversationId: parseInt(conversationId)
      },
      include: {
        sender: { select: { id: true, name: true, role: true } }
      }
    });

    // Cập nhật updatedAt của conversation
    await prisma.conversation.update({
      where: { id: parseInt(conversationId) },
      data: { updatedAt: new Date() }
    });

    // Pusher realtime
    if (pusherServer) {
      await pusherServer.trigger(`conversation-${conversationId}`, 'new-message', newMsg);
      // Notify tất cả members
      const members = await prisma.conversationMember.findMany({
        where: { conversationId: parseInt(conversationId) }
      });
      for (const m of members) {
        if (m.userId !== userId) {
          await pusherServer.trigger(`user-${m.userId}`, 'conversation-updated', {
            conversationId: parseInt(conversationId),
            lastMessage: newMsg
          });
        }
      }
    }

    return NextResponse.json(newMsg);
  } catch (error) {
    console.error('Error posting chat:', error);
    return NextResponse.json({ error: 'Failed to post chat' }, { status: 500 });
  }
}
