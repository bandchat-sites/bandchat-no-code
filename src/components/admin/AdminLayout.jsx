import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { useSiteConfig } from '../../context/SiteConfigContext';
import '../../../styles/admin/admin.css';

function AdminLogin() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="admin__login">
      <form className="admin__login-form" onSubmit={handleSubmit}>
        <h1 className="admin__login-title">
          <span style={{ color: 'var(--color-red)' }}>Frozen</span> Admin
        </h1>
        {error && <div className="error-message" style={{ marginBottom: 'var(--space-md)' }}>{error}</div>}
        <div className="contact-field" style={{ marginBottom: 'var(--space-md)' }}>
          <label className="contact-field__label">Email</label>
          <input type="email" className="contact-field__input" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="contact-field" style={{ marginBottom: 'var(--space-lg)' }}>
          <label className="contact-field__label">Password</label>
          <input type="password" className="contact-field__input" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn--primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
    </div>
  );
}

function AdminShell() {
  const { isAuthenticated, logout } = useAuth();
  const config = useSiteConfig();

  if (!isAuthenticated) return <AdminLogin />;

  return (
    <div className="admin">
      <div className="admin__header">
        <div className="admin__logo">
          <span className="admin__logo-text">{config?.band?.name || 'Band'}</span>
          <span className="admin__label">Admin Panel</span>
        </div>
        <button className="btn btn--secondary btn--sm" onClick={logout}>Log Out</button>
      </div>

      <nav className="admin__nav">
        <NavLink to="/backstage" end className={({ isActive }) => `admin__nav-link ${isActive ? 'admin__nav-link--active' : ''}`}>Dashboard</NavLink>
        <NavLink to="/backstage/content" className={({ isActive }) => `admin__nav-link ${isActive ? 'admin__nav-link--active' : ''}`}>Content</NavLink>
        <NavLink to="/backstage/guests" className={({ isActive }) => `admin__nav-link ${isActive ? 'admin__nav-link--active' : ''}`}>Guest Lists</NavLink>
        <NavLink to="/backstage/blog/new" className={({ isActive }) => `admin__nav-link ${isActive ? 'admin__nav-link--active' : ''}`}>Blog</NavLink>
        <NavLink to="/backstage/merch" className={({ isActive }) => `admin__nav-link ${isActive ? 'admin__nav-link--active' : ''}`}>Merch</NavLink>
        <NavLink to="/backstage/agents" className={({ isActive }) => `admin__nav-link ${isActive ? 'admin__nav-link--active' : ''}`}>AI Agents</NavLink>
      </nav>

      <div className="admin__content">
        <Outlet />
      </div>
    </div>
  );
}

export default function AdminLayout() {
  return (
    <AuthProvider>
      <AdminShell />
    </AuthProvider>
  );
}
