import { Award, Heart, Shield, Globe, TrendingUp } from 'lucide-react';

export default function Impact() {
  const leaders = [
    { name: 'Indiranagar Relief', type: 'NGO', points: 1450, icons: <Shield className="text-secondary" /> },
    { name: 'Hotel Royal Orchid', type: 'Donor', points: 1200, icons: <Heart className="text-danger" /> },
    { name: 'Koramangala Helpers', type: 'NGO', points: 980, icons: <Shield className="text-secondary" /> },
    { name: 'Tech Park Canteen', type: 'Donor', points: 850, icons: <Heart className="text-danger" /> },
    { name: 'Whitefield Charity', type: 'NGO', points: 720, icons: <Shield className="text-secondary" /> },
  ];

  const handleDownloadReport = () => {
    const reportData = [
      ['Rank', 'Name', 'Type', 'Impact Points'],
      ...leaders.map((l, i) => [i + 1, l.name, l.type, l.points]),
      ['', '', '', ''],
      ['Summary Statistics', '', '', ''],
      ['Total Meals Saved', '12450', '', ''],
      ['Environmental Savings (CO2)', '5 Tons', '', ''],
      ['Report Generated On', new Date().toLocaleDateString(), '', '']
    ];

    const csvContent = reportData.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `FoodSaver_Impact_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fade-in hero-gradient" style={{ minHeight: '80vh', padding: '4rem 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem' }}>
            Community <span className="text-gradient">Impact</span> Leaders
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            Celebrating the donors and organizations making a real difference in reducing food waste across Bengaluru.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '3rem' }}>
          {/* Main Leaderboard */}
          <div className="card shadow-xl" style={{ borderRadius: '24px', padding: '2rem' }}>
            <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Award className="text-warning" size={28} /> Wall of Food Saviors
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {leaders.map((l, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', background: i === 0 ? 'rgba(16, 185, 129, 0.05)' : 'white', borderRadius: '16px', border: i === 0 ? '2px solid var(--primary)' : '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: '800', color: i === 0 ? 'var(--primary)' : 'var(--text-muted)', width: '30px' }}>#{i + 1}</div>
                    <div style={{ background: '#F1F5F9', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       {l.icons}
                    </div>
                    <div>
                        <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{l.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{l.type}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }}>{l.points}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>IMPACT POINTS</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Impact Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="card glass-card" style={{ padding: '2rem', border: 'none', background: 'linear-gradient(135deg, #10B981, #065F46)', color: 'white' }}>
               <TrendingUp size={40} style={{ marginBottom: '1rem', opacity: 0.8 }} />
               <h4 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Monthly Growth</h4>
               <p style={{ opacity: 0.9, marginBottom: '1.5rem' }}>We've seen a 40% increase in food rescues this month compared to last.</p>
               <div style={{ height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '70%', height: '100%', background: 'white' }}></div>
               </div>
            </div>

            <div className="card shadow-lg" style={{ padding: '2rem', borderRadius: '24px' }}>
               <Globe size={40} className="text-secondary" style={{ marginBottom: '1rem' }} />
               <h4>Environmental Savings</h4>
               <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '1rem' }}>
                 Every meal saved prevents approximately **0.5kg of methane emissions**. together, we've prevented over **5 tons** of waste.
               </p>
               <button className="btn btn-secondary" style={{ width: '100%', marginTop: '2rem' }} onClick={handleDownloadReport}>Download Report</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
