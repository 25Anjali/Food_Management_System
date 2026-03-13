import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Phone, MapPin, Building, Calendar, ArrowLeft, Shield, Globe } from 'lucide-react';

export default function Profile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/auth/user/${id}`);
        setProfile(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile', err);
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading profile...</div>;
  if (!profile) return <div style={{ textAlign: 'center', padding: '4rem' }}>User not found</div>;

  return (
    <div className="animate-fade-in hero-gradient" style={{ minHeight: '80vh', padding: '4rem 0' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={18} /> Back
        </button>

        <div className="card shadow-2xl border-0" style={{ borderRadius: '30px', padding: '3rem', position: 'relative', overflow: 'hidden' }}>
          {/* Background Accent */}
          <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: 'var(--primary-glow)', borderRadius: '50%', filter: 'blur(80px)', zIndex: 0 }}></div>
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '3.5rem', flexWrap: 'wrap' }}>
              <div style={{ width: '120px', height: '120px', borderRadius: '30px', background: 'var(--surface-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.05)' }}>
                {profile.role === 'ngo' ? <Shield size={56} className="text-secondary" /> : <User size={56} className="text-primary" />}
              </div>
              <div>
                <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>{profile.organizationName || profile.name}</h2>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: profile.role === 'ngo' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: profile.role === 'ngo' ? 'var(--secondary)' : 'var(--primary-dark)', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700' }}>
                   <Globe size={14} /> Verified {profile.role?.toUpperCase()} Member
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="card glass-card" style={{ padding: '1.5rem' }}>
                 <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>Email Infrastructure</div>
                 <div style={{ fontWeight: '700', fontSize: '1.05rem' }}>{profile.email}</div>
              </div>
              <div className="card glass-card" style={{ padding: '1.5rem' }}>
                 <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>Verified Contact</div>
                 <div style={{ fontWeight: '700', fontSize: '1.05rem' }}>{profile.contactNumber || 'Contact Hidden'}</div>
              </div>
            </div>

            <div className="card shadow-sm" style={{ background: '#F8FAFC', padding: '2.5rem', border: '1px solid #E2E8F0', borderRadius: '24px' }}>
              <h4 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', fontWeight: '800' }}>
                <MapPin size={22} className="text-primary" /> Registered Base Location
              </h4>
              <p style={{ color: 'var(--text-main)', fontSize: '1.15rem', lineHeight: '1.6' }}>
                {profile.address || 'This user has not listed a public address yet.'}
              </p>
              
              <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '2rem' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                   <Calendar size={16} /> Joined {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'March 2026'}
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                   <Shield size={16} /> Trust Score: <span style={{ color: 'var(--primary)', fontWeight: '700' }}>9.8/10</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
