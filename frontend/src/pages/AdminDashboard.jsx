import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, ShoppingBag, Truck, CheckCircle, BarChart3, Mail } from 'lucide-react';
import API_BASE_URL from '../api/config';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aRes, uRes, dRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/admin/analytics`),
          axios.get(`${API_BASE_URL}/admin/users`),
          axios.get(`${API_BASE_URL}/admin/donations`)
        ]);
        setAnalytics(aRes.data);
        setUsers(uRes.data);
        setDonations(dRes.data);
      } catch (err) {
        console.error('Error fetching admin data', err);
        setError('Failed to load admin data. Ensure you are logged in as an admin.');
      }
    };
    fetchData();
  }, []);

  if (error) return <div className="card" style={{ color: 'var(--danger)', margin: '2rem' }}>{error}</div>;
  if (!analytics) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Dashboard...</div>;

  return (
    <div className="animate-fade-in">
      <h2 style={{ marginBottom: '2rem', color: 'var(--primary-dark)' }}>Admin Control Center</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <ShoppingBag size={32} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
          <h3>{analytics.totalDonations}</h3>
          <p style={{ color: 'var(--text-muted)' }}>Total Donations</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <CheckCircle size={32} color="#10B981" style={{ margin: '0 auto 1rem' }} />
          <h3>{analytics.foodSaved}</h3>
          <p style={{ color: 'var(--text-muted)' }}>Food Saved (Deliveries)</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <Users size={32} color="#6366F1" style={{ margin: '0 auto 1rem' }} />
          <h3>{analytics.totalUsers}</h3>
          <p style={{ color: 'var(--text-muted)' }}>Total Users</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <Truck size={32} color="#F59E0B" style={{ margin: '0 auto 1rem' }} />
          <h3>{analytics.totalNGOs}</h3>
          <p style={{ color: 'var(--text-muted)' }}>NGOs/Collectors</p>
        </div>
      </div>

      <div className="card" style={{ padding: '0' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB' }}>
          <button 
            onClick={() => setActiveTab('overview')}
            style={{ padding: '1rem 2rem', border: 'none', background: activeTab === 'overview' ? 'white' : '#F9FAFB', borderBottom: activeTab === 'overview' ? '2px solid var(--primary)' : 'none', cursor: 'pointer', fontWeight: '500' }}
          >
            Donations
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            style={{ padding: '1rem 2rem', border: 'none', background: activeTab === 'users' ? 'white' : '#F9FAFB', borderBottom: activeTab === 'users' ? '2px solid var(--primary)' : 'none', cursor: 'pointer', fontWeight: '500' }}
          >
            Users
          </button>
        </div>

        <div style={{ padding: '2rem' }}>
          {activeTab === 'overview' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid #F3F4F6' }}>
                    <th style={{ padding: '1rem' }}>Food</th>
                    <th style={{ padding: '1rem' }}>Donor</th>
                    <th style={{ padding: '1rem' }}>Collector</th>
                    <th style={{ padding: '1rem' }}>Status</th>
                    <th style={{ padding: '1rem' }}>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map(d => (
                    <tr key={d._id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '500' }}>{d.foodName || d.foodType}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{d.quantity}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>{d.donor?.name || 'Unknown'}</td>
                      <td style={{ padding: '1rem' }}>{d.collector?.name || 'Unassigned'}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.8rem', 
                          background: d.status === 'accepted' || d.status === 'delivered' ? '#D1FAE5' : '#F3F4F6',
                          color: d.status === 'accepted' || d.status === 'delivered' ? '#065F46' : '#374151'
                        }}>
                          {d.status === 'accepted-by-collector' ? 'NGO ACCEPTED' : d.status.toUpperCase()}
                        </span>
                        {d.isCostAgreed && <div style={{ fontSize: '0.7rem', color: '#10B981', marginTop: '2px' }}>Cost Agreed</div>}
                      </td>
                      <td style={{ padding: '1rem' }}>₹{d.estimatedCost || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'users' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid #F3F4F6' }}>
                    <th style={{ padding: '1rem' }}>Name</th>
                    <th style={{ padding: '1rem' }}>Email</th>
                    <th style={{ padding: '1rem' }}>Role</th>
                    <th style={{ padding: '1rem' }}>Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '1rem', fontWeight: '500' }}>{u.name}</td>
                      <td style={{ padding: '1rem' }}>{u.email}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ textTransform: 'capitalize' }}>{u.role}</span>
                      </td>
                      <td style={{ padding: '1rem' }}>{u.contactNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
