"use client";
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import Link from 'next/link';

export default function BookingDetailPage({ params }) {
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    // Giả lập lấy dữ liệu theo ID
    const mockBooking = {
      id: params.id,
      name: 'The One Nail Lounge & Spa',
      am: 'Huyền',
      it: 'Quân',
      status: 'Đã hoàn thành',
      phone: '(519) 755-7841',
      email: 'it/Vici@201023!',
      bookingLink: 'https://theonenailloungespa.vicibooking.com/',
      businessHours: 'Mon - Sat: 10 am - 8 pm, Sun: 10 am - 6 pm',
      address: '789 Beauty Blvd, Toronto, ON',
      linkedWebsite: 'ID#24'
    };
    setBooking(mockBooking);
  }, [params.id]);

  if (!booking) return <div className="loading">Đang tải...</div>;

  return (
    <div className="app-container">
      <Sidebar />
      
      <main className="main-content">
        <Topbar onAddTask={() => {}} />

        <header style={{ padding: '0 40px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Link href="/booking" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
              <i className='bx bx-left-arrow-alt'></i> Quay lại danh sách
            </Link>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 700 }}>Chi tiết Booking: {booking.name}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Thông tin quản lý đặt hẹn cho dự án {booking.id}</p>
        </header>

        <div style={{ padding: '0 40px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
          <div className="card" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className='bx bx-info-circle' style={{ color: 'var(--primary)' }}></i> Thông tin liên hệ & Vận hành
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Phone nhận Booking</label>
                <p style={{ fontSize: '16px', fontWeight: 500 }}>{booking.phone}</p>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Mail khách / Account</label>
                <p style={{ fontSize: '16px', fontWeight: 500 }}>{booking.email}</p>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Business Hours</label>
                <p style={{ fontSize: '15px', lineHeight: '1.6' }}>{booking.businessHours}</p>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Link Booking</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '8px' }}>
                  <input readOnly value={booking.bookingLink} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', fontSize: '13px' }} />
                  <a href={booking.bookingLink} target="_blank" className="btn btn-primary btn-sm">Mở Link</a>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div className="card" style={{ padding: '24px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '20px' }}>Nhân sự phụ trách</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img src={`https://ui-avatars.com/api/?name=${booking.am}&background=f472b6&color=fff`} style={{ width: '40px', height: '40px', borderRadius: '10px' }} />
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 600 }}>{booking.am}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>AM (Account Manager)</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img src={`https://ui-avatars.com/api/?name=${booking.it}&background=3b82f6&color=fff`} style={{ width: '40px', height: '40px', borderRadius: '10px' }} />
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 600 }}>{booking.it}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>IT (Technical Support)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '24px', borderLeft: '4px solid var(--primary)' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>Liên kết Website</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>Project này đã được liên kết với Website ID:</p>
              <div style={{ padding: '12px', background: 'var(--bg-surface-hover)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="website-id" style={{ fontSize: '16px' }}>{booking.linkedWebsite}</span>
                <Link href={`/websites/${booking.linkedWebsite.replace('#', '')}`} style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}>Xem Web <i className='bx bx-right-arrow-alt'></i></Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
