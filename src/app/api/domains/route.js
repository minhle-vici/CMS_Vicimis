import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const domains = await prisma.domain.findMany({
      include: {
        website: {
          select: {
            name: true,
            siteId: true
          }
        }
      },
      orderBy: { expiryDate: 'asc' }
    });
    return NextResponse.json(domains);
  } catch (error) {
    console.error('Error fetching domains:', error);
    return NextResponse.json({ error: 'Failed to fetch domains' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const domain = await prisma.domain.create({
      data: {
        url: data.url,
        provider: data.provider,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        price: parseFloat(data.price) || 0,
        renewalPrice: parseFloat(data.renewalPrice) || 0,
        status: data.status || 'Đang hoạt động',
        websiteId: data.websiteId ? parseInt(data.websiteId) : null,
      }
    });
    return NextResponse.json(domain, { status: 201 });
  } catch (error) {
    console.error('Error creating domain:', error);
    return NextResponse.json({ error: 'Failed to create domain' }, { status: 500 });
  }
}
