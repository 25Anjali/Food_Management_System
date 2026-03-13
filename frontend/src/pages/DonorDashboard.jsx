import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { PlusCircle, List, Clock, MapPin, MessageCircle, Navigation, CheckCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Chat from '../components/Chat';
import CollectorSelector from '../components/CollectorSelector';

export default function DonorDashboard() {
  const { user } = useContext(AuthContext);
  const [donations, setDonations] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showCollectorSelector, setShowCollectorSelector] = useState(false);
  const [formData, setFormData] = useState({
    foodType: '', foodName: '', quantity: '', 
    location: user?.address || '', 
    latitude: user?.latitude || '', 
    longitude: user?.longitude || '', 
    expiryTime: '', 
    contactInfo: user?.contactNumber || '', 
    estimatedCost: '', preparationTime: '', notes: ''
  });

  const fetchDonations = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/donations/my');
      setDonations(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const confirmCollector = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/donations/${id}/confirm`);
      alert('Collector confirmed! Pickup is now officially scheduled.');
      fetchDonations();
    } catch (err) {
      alert('Error confirming collector');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/donations', {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        estimatedCost: parseFloat(formData.estimatedCost)
      });
      setShowAddForm(false);
      fetchDonations();
      setFormData({ foodType: '', foodName: '', quantity: '', location: '', latitude: '', longitude: '', expiryTime: '', contactInfo: '', estimatedCost: '', preparationTime: '', notes: '' });
    } catch (err) {
      alert('Error adding donation');
    }
  };


  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ color: 'var(--primary-dark)' }}>Donor Dashboard</h2>
        <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          <PlusCircle size={20} />
          {showAddForm ? 'Cancel' : 'Post Donation'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="card shadow-sm border-0" style={{ background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white' }}>
          <div style={{ opacity: 0.8, fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Total Donations</div>
          <div style={{ fontSize: '2rem', fontWeight: '800' }}>{donations.length}</div>
        </div>
        <div className="card glass-card">
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Active Pickups</div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--secondary)' }}>{donations.filter(d => ['accepted', 'in-transit', 'collected'].includes(d.status)).length}</div>
        </div>
        <div className="card glass-card">
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Meals Saved</div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)' }}>{donations.filter(d => d.status === 'delivered').length * 20}+</div>
        </div>
        <div className="card glass-card">
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Community Rank</div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent)' }}>#4</div>
        </div>
      </div>

      {showAddForm && (
        <div className="card shadow-lg border-0 mb-5 animate-fade-in" style={{ borderRadius: '24px', padding: '2rem' }}>
          <h3>Add New Donation</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Food Title (e.g., Rice & Dal)</label>
              <input type="text" name="foodName" className="form-control" required value={formData.foodName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Food Type (Category)</label>
              <input type="text" name="foodType" className="form-control" required value={formData.foodType} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input type="text" name="quantity" className="form-control" required value={formData.quantity} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Estimated Cost/Value (₹)</label>
              <input type="number" name="estimatedCost" className="form-control" value={formData.estimatedCost} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Preparation Time</label>
              <input type="text" name="preparationTime" className="form-control" value={formData.preparationTime} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Pickup Location Address</label>
              <input type="text" name="location" className="form-control" required value={formData.location} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Latitude</label>
              <input type="number" step="any" name="latitude" className="form-control" required value={formData.latitude} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Longitude</label>
              <input type="number" step="any" name="longitude" className="form-control" required value={formData.longitude} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Expiry Time</label>
              <input type="datetime-local" name="expiryTime" className="form-control" required value={formData.expiryTime} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Info</label>
              <input type="text" name="contactInfo" className="form-control" required value={formData.contactInfo} onChange={handleChange} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Notes</label>
              <textarea name="notes" className="form-control" value={formData.notes} onChange={handleChange}></textarea>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <button type="submit" className="btn btn-primary">Post Food</button>
            </div>

          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: selectedDonation ? '1fr 400px' : '1fr', gap: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {donations.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>You have not posted any donations yet.</p>
          ) : (
            donations.map(d => (
              <div key={d._id} className={`card ${selectedDonation?._id === d._id ? 'border-primary' : ''}`} style={{ cursor: d.status !== 'pending' ? 'pointer' : 'default' }} onClick={() => d.status !== 'pending' && setSelectedDonation(d)}>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <List size={20} color="var(--primary)" /> {d.foodName || d.foodType}
                </h4>
                <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}><strong>Qty:</strong> {d.quantity}</p>
                <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                  <MapPin size={16} /> {d.location}
                </p>
                <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
                  <Clock size={16} /> Expires: {new Date(d.expiryTime).toLocaleString()}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    display: 'inline-block', padding: '0.3rem 0.8rem', borderRadius: '99px', fontSize: '0.8rem', fontWeight: '500',
                    background: d.status === 'pending' ? '#E5E7EB' : 
                                d.status === 'requested' ? '#FEF3C7' : 
                                d.status === 'accepted-by-collector' ? '#DBEAFE' : 
                                d.status === 'accepted' ? '#D1FAE5' : 
                                d.status === 'rejected' ? '#FEE2E2' : '#D1FAE5',
                    color: d.status === 'pending' ? '#374151' : 
                           d.status === 'requested' ? '#92400E' : 
                           d.status === 'accepted-by-collector' ? '#1E40AF' : 
                           d.status === 'accepted' ? '#065F46' : 
                           d.status === 'rejected' ? '#B91C1C' : '#065F46'
                  }}>
                    {d.status === 'accepted-by-collector' ? 'NGO ACCEPTED' : d.status.toUpperCase()}
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {(d.status === 'pending' || d.status === 'rejected') && (
                      <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={(e) => { e.stopPropagation(); setSelectedDonation(d); setShowCollectorSelector(true); }}>
                        <Navigation size={16} /> {d.status === 'rejected' ? 'Re-assign' : 'Find Collector'}
                      </button>
                    )}
                    {d.status === 'accepted-by-collector' && (
                      <button className="btn btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={(e) => { e.stopPropagation(); confirmCollector(d._id); }}>
                        <CheckCircle size={16} /> Confirm NGO
                      </button>
                    )}
                    {d.status !== 'pending' && d.status !== 'requested' && (
                      <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={(e) => { e.stopPropagation(); setSelectedDonation(d); setShowCollectorSelector(false); }}>
                        <MessageCircle size={16} /> Chat
                      </button>
                    )}
                  </div>
                </div>
                {d.collector && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #F3F4F6', fontSize: '0.85rem' }}>
                    <strong>Collector:</strong>{' '}
                    <Link to={`/profile/${d.collector._id}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>
                      {d.collector.name} ({d.collector.organizationName || 'Individual'})
                    </Link>
                    {d.isCostAgreed && <div style={{ color: 'var(--primary)', fontSize: '0.75rem', marginTop: '2px' }}>✓ Agreed to food cost/value</div>}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        
        {selectedDonation && (
          <div className="animate-slide-in">
             {showCollectorSelector ? (
               <CollectorSelector 
                 donation={selectedDonation} 
                 onAssign={() => { fetchDonations(); setShowCollectorSelector(false); setSelectedDonation(null); }} 
               />
             ) : (
               <Chat donationId={selectedDonation._id} currentUser={user} />
             )}
          </div>
        )}
      </div>

    </div>
  );
}

