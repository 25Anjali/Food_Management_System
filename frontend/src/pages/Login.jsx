import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState(localStorage.getItem('rememberedEmail') || '');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(!!localStorage.getItem('rememberedEmail'));
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(email, password);
      
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      if (data.role === 'donor') navigate('/donor');
      else if (data.role === 'ngo') navigate('/ngo');
      else if (data.role === 'admin') navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '400px', margin: '4rem auto' }}>
      <div className="card">
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--primary-dark)' }}>Login</h2>
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', padding: '0.5rem', background: '#FEE2E2', borderRadius: '6px' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" required value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} id="rememberMe" />
            <label htmlFor="rememberMe" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>Remember Me</label>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0rem' }}>Login</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Register</Link>
        </p>
      </div>
    </div>
  );
}
