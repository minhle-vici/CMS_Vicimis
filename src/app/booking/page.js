"use client";
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import StatCard from '@/components/StatCard';
import ProjectTable from '@/components/WebsiteTable';

export default function BookingPage() {
  const [bookings, setBookings] = useState([
    {
      id: 'ID#24',
      name: 'The One Nail Lounge & Spa',
      am: 'Huyền',
      it: 'Quân',
      status: 'Đã hoàn thành',
      bookingLink: 'https://theonenailloungespa.vicibooking.com/',
      isLinked: true
    },
    {
      id: 'ID#58',
      name: 'Snappy Nails',
      am: 'Huyền',
      it: 'Quân',
      status: 'Đã hoàn thành',
      bookingLink: 'https://snappynails.vicibooking.com/',
      isLinked: true
    },
    {
      id: 'ID#105',
      name: 'Victory Market',
      am: 'Nhi',
      it: 'Quân',
      status: 'Đang thực hiện',
      bookingLink: 'https://victory.vicibooking.com/',
      isLinked: false
    }
  ]);

  const [searchId, setSearchId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleStatusChange = (id, newStatus) => {
    setBookings(prev => prev.map(b =>
      b.id === id ? { ...b, status: newStatus } : b
    ));
  };

  const filteredBookings = bookings.filter(b =>
    b.id.toLowerCase().includes(searchId.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="app-container">
      <Sidebar />

      <main className="main-content">
        <Topbar onAddTask={() => { }} />

        <header style={{ padding: '0 40px 24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 600 }}>Quản lý Booking</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Thông tin đặt hẹn và tài khoản quản trị của khách hàng.</p>
        </header>

        <section className="overview">
          <StatCard icon="bx-calendar-check" color="blue" label="Tổng Booking" value={bookings.length} />
          <StatCard icon="bx-link" color="green" label="Đã liên kết ID" value={bookings.filter(b => b.isLinked).length} />
          <StatCard icon="bx-link-external" color="purple" label="Chưa liên kết" value={bookings.filter(b => !b.isLinked).length} />
        </section>

        <div className="table-container">
          <ProjectTable
            data={paginatedBookings}
            onStatusChange={handleStatusChange}
            searchId={searchId}
            onSearchId={setSearchId}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            linkLabel="Link Booking"
            detailPath="booking"
          />
        </div>
      </main>
    </div>
  );
}
