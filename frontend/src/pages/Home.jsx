import { Link } from 'react-router-dom';
import { Heart, Shield, Globe, Users, ArrowRight, Zap, Target, Award } from 'lucide-react';

export default function Home() {
  const stats = [
    { label: 'Meals Saved', value: '12,450+', icon: <Heart className="text-danger" /> },
    { label: 'Verified NGOs', value: '85+', icon: <Shield className="text-secondary" /> },
    { label: 'Food Safe', value: '98%', icon: <Zap className="text-warning" /> },
    { label: 'Communities', value: '12', icon: <Globe className="text-primary" /> },
  ];

  return (
    <div className="hero-gradient" style={{ minHeight: '100vh', paddingBottom: '5rem' }}>
      {/* Hero Section */}
      <section className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', paddingTop: '6rem' }}>
        <div className="animate-fade-in">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary-dark)', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700', marginBottom: '1.5rem' }}>
             <Award size={16} /> #1 Food Rescue Platform in Bengaluru
          </div>
          <h1 style={{ fontSize: '4.5rem', lineHeight: '1.1', marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
            Turn your <span className="text-gradient">Surplus</span> into <span className="text-gradient">Smiles</span>.
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '2.5rem', maxWidth: '550px' }}>
            The smartest way to connect restaurants and donors with verified rescue missions. Stop waste, feed hope, and track your impact in real-time.
          </p>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
              Join the Mission <ArrowRight size={20} />
            </Link>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
              Member Login
            </Link>
          </div>
          
          <div style={{ marginTop: '3rem', borderTop: '1px solid #E2E8F0', paddingTop: '2rem', display: 'flex', gap: '2.5rem' }}>
            {stats.map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)' }}>{s.value}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="animate-slide-in" style={{ position: 'relative' }}>
          <div className="floating" style={{ borderRadius: '30px', overflow: 'hidden', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.25)' }}>
            <img 
              src="/C:/Users/anjal/.gemini/antigravity/brain/b5e09315-9c1b-44a4-9ae3-d8a326d25c4b/hero_food_donation_modern_webp_1773321849672.png" 
              alt="Food Donation Mission" 
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>
          {/* Floating Impact Card */}
          <div className="glass-card" style={{ position: 'absolute', bottom: '40px', left: '-40px', padding: '1.25rem', width: '220px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'var(--primary)', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '1rem' }}>Live Rescue</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>10 kg saved just now</div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container" style={{ marginTop: '10rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Built for <span className="text-secondary">Action</span>.</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Everything you need to manage food rescue in one high-performance dashboard.</p>
        </div>

        <div className="grid-features">
          <div className="card glass-card" style={{ padding: '2.5rem' }}>
             <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <Target size={28} />
             </div>
             <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Precise Mapping</h3>
             <p style={{ color: 'var(--text-muted)' }}>Locate donations and collectors in real-time with high-precision GPS integration.</p>
          </div>
          
          <div className="card glass-card" style={{ padding: '2.5rem' }}>
             <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--secondary)', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <Users size={28} />
             </div>
             <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Smart Matching</h3>
             <p style={{ color: 'var(--text-muted)' }}>Our algorithm connects donors with the nearest available NGO to minimize transit time.</p>
          </div>

          <div className="card glass-card" style={{ padding: '2.5rem' }}>
             <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent)', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <Zap size={28} />
             </div>
             <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Instant Handshake</h3>
             <p style={{ color: 'var(--text-muted)' }}>Secure acceptance logic ensures food is claimed only by authorized volunteers.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
