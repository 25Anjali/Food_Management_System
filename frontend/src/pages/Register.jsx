import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'donor', contactNumber: '', address: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await register(formData);
      if (data.role === 'donor') navigate('/donor');
      else if (data.role === 'ngo') navigate('/ngo');
      else if (data.role === 'admin') navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '500px', margin: '2rem auto' }}>
      <div className="card">
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--primary-dark)' }}>Create an Account</h2>
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', padding: '0.5rem', background: '#FEE2E2', borderRadius: '6px' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Account Type</label>
            <select name="role" className="form-control" value={formData.role} onChange={handleChange}>
              <option value="donor">Donor (Restaurant, Event, Household)</option>
              <option value="ngo">NGO / Volunteer</option>
              <option value="admin">System Admin (Testing)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Name / Organization Name</label>
            <input type="text" name="name" className="form-control" required value={formData.name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" name="email" className="form-control" required value={formData.email} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" name="password" className="form-control" required value={formData.password} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Contact Number</label>
            <input type="text" name="contactNumber" className="form-control" required value={formData.contactNumber} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <input type="text" name="address" className="form-control" required value={formData.address} onChange={handleChange} />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Register</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Login</Link>
        </p>
      </div>
    </div>
  );
}
