"use client";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
      <button 
        className="btn btn-outline" 
        disabled={currentPage === 1} 
        onClick={() => onPageChange(currentPage - 1)} 
        style={{ borderRadius: '12px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <i className='bx bx-chevron-left'></i> Trước
      </button>
      
      <span style={{ fontWeight: 600, fontSize: '14px', background: 'var(--bg-surface-hover)', padding: '8px 16px', borderRadius: '12px' }}>
        Trang {currentPage} / {totalPages}
      </span>
      
      <button 
        className="btn btn-outline" 
        disabled={currentPage === totalPages} 
        onClick={() => onPageChange(currentPage + 1)} 
        style={{ borderRadius: '12px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        Sau <i className='bx bx-chevron-right'></i>
      </button>
    </div>
  );
}
