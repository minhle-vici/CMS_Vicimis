"use client";

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const ROLES = [
  { id: 'admin', label: 'Quản trị viên', email: 'admin@vicimix.com', icon: 'bx-shield-quarter', color: '#BF2A3F', desc: 'Toàn quyền hệ thống' },
  { id: 'it', label: 'Kỹ thuật (IT)', email: 'quan@vicimis.com', icon: 'bx-code-alt', color: '#3b82f6', desc: 'Quản lý task & kỹ thuật' },
  { id: 'am', label: 'Account Manager', email: 'huyen@vicimis.com', icon: 'bx-user-voice', color: '#10b981', desc: 'Quản lý khách hàng' },
];

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState(null);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email: formData.email,
      password: formData.password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('Email hoặc mật khẩu không đúng. Vui lòng thử lại.');
    } else {
      router.push('/');
      router.refresh();
    }
  };

  const selectRole = (role) => {
    setActiveRole(role.id);
    setFormData({ ...formData, email: role.email, password: role.id === 'admin' ? 'admin123' : 'vicimis2024' });
    setError('');
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-orb orb-1" />
        <div className="login-orb orb-2" />
        <div className="login-orb orb-3" />
      </div>

      <div className="login-container">
        {/* Left Side: Role Info */}
        <div className="login-roles">
          <div className="role-header">
            <h2>Hệ thống <span>Roles</span></h2>
            <p>Chọn vai trò để đăng nhập nhanh</p>
          </div>

          <div className="role-grid">
            {ROLES.map((role) => (
              <div
                key={role.id}
                className={`role-item ${activeRole === role.id ? 'active' : ''}`}
                onClick={() => selectRole(role)}
                style={{ '--role-color': role.color }}
              >
                <div className="role-icon">
                  <i className={`bx ${role.icon}`} />
                </div>
                <div className="role-info">
                  <h3>{role.label}</h3>
                  <p>{role.desc}</p>
                </div>
                <div className="role-check">
                  <i className='bx bx-check-circle' />
                </div>
              </div>
            ))}
          </div>

          <div className="role-tip">
            <i className='bx bx-info-circle' />
            <p>Mỗi vai trò sẽ có giao diện và quyền hạn khác nhau trong hệ thống.</p>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="login-card">
          <div className="login-logo">
            <img src="/img/logo.webp" alt="Vicimis" style={{ width: '64px', height: '64px' }} />
            <h1>Vicimis <span>CMS</span></h1>
            <p>Chào mừng bạn quay trở lại</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="login-error">
                <i className='bx bx-error-circle' />
                <span>{error}</span>
              </div>
            )}

            <div className="login-field">
              <label htmlFor="email">Địa chỉ Email</label>
              <div className="login-input-wrap">
                <i className='bx bx-envelope' />
                <input
                  id="email"
                  type="email"
                  placeholder="name@vicimis.com"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="login-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="password">Mật khẩu</label>
                <a href="#" className="forgot-pass">Quên mật khẩu?</a>
              </div>
              <div className="login-input-wrap">
                <i className='bx bx-lock-alt' />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="login-spinner" />
                  Đang xác thực...
                </>
              ) : (
                <>
                  <span>Tiếp tục Đăng nhập</span>
                  <i className='bx bx-right-arrow-alt' />
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>© 2026 Vicimis Professional CMS</p>
          </div>
        </div>
      </div>
    </div>
  );
}
