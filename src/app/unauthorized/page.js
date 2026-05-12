export default function UnauthorizedPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-main)',
      fontFamily: 'Poppins, sans-serif',
      gap: '16px',
    }}>
      <i className='bx bx-shield-x' style={{ fontSize: '72px', color: '#ef4444' }} />
      <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-main)' }}>Không có quyền truy cập</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Tài khoản của bạn không có quyền xem trang này.</p>
      <a href="/" className="btn btn-primary" style={{ marginTop: '8px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <i className='bx bx-home' /> Về trang chủ
      </a>
    </div>
  );
}
