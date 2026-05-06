import Link from 'next/link';

export default function BookingTable({ bookings }) {
  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên Tiệm</th>
            <th>Trạng thái</th>
            <th>Orders (AM)</th>
            <th>Nhận (IT)</th>
            <th>Link Booking</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr 
              key={booking.id} 
              style={{ 
                background: booking.isLinked ? 'rgba(191, 42, 63, 0.03)' : 'transparent',
                borderLeft: booking.isLinked ? '2px solid var(--secondary)' : 'none'
              }}
            >
              <td>
                <span className="website-id" style={{ background: booking.isLinked ? 'var(--primary)' : 'rgba(168, 85, 247, 0.1)', color: booking.isLinked ? 'white' : 'var(--primary)' }}>
                  {booking.id}
                </span>
              </td>
              <td>
                <div style={{ fontWeight: 600 }}>{booking.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{booking.phone}</div>
                {booking.isLinked && (
                  <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 600 }}>
                    <i className='bx bx-link'></i> Đã kết nối Website
                  </span>
                )}
              </td>
              <td>
                <span className={`status-badge ${
                  booking.status === 'Đã Bàn Giao' ? 'status-handed-over' : 'status-in-progress'
                }`}>
                  {booking.status}
                </span>
              </td>
              <td>{booking.am}</td>
              <td>{booking.it}</td>
              <td>
                <a href={booking.link} target="_blank" className="external-link">
                  <i className='bx bx-calendar-event'></i> Open Link
                </a>
              </td>
              <td>
                <div className="action-btns">
                  <button className="btn-icon-small" title="View Detail Info"><i className='bx bx-show'></i></button>
                  <button className="btn-icon-small"><i className='bx bx-copy'></i></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
