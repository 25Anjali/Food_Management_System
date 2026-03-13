import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Leaf } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'donor') return '/donor';
    if (user.role === 'ngo') return '/ngo';
    if (user.role === 'admin') return '/admin';
    return '/';
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.2rem' }}>
          <Leaf size={24} />
          <span>FoodSaver</span>
        </Link>
        <div className="nav-links">
          <Link to="/impact">Impact</Link>
          {user ? (
            <>
              {user.role === 'admin' && <Link to="/admin" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Admin Panel</Link>}
              <Link to={getDashboardLink()}>Dashboard</Link>
              <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ color: 'white' }}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
