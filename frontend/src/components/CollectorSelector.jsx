import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { User, Phone, Navigation, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import API_BASE_URL from '../api/config';

export default function CollectorSelector({ donation, onAssign }) {
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollectors = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/donations/collectors/near?lat=${donation.latitude}&lng=${donation.longitude}&radius=10000`);
        setCollectors(data);
      } catch (err) {
        console.error('Error fetching collectors', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCollectors();
  }, [donation]);

  const handleAssign = async (collectorId) => {
    try {
      await axios.put(`${API_BASE_URL}/donations/${donation._id}/assign`, { collectorId });
      onAssign();
    } catch (err) {
      alert('Error assigning collector');
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Searching for collectors...</div>;
  
  if (!donation?.latitude || !donation?.longitude) {
    return (
      <div className="card shadow-sm border-danger" style={{ padding: '2rem', color: 'var(--danger)', fontWeight: 'bold', background: '#FEF2F2' }}>
        ⚠️ Invalid location data for this donation. Please ensure the donation was created with a specific area search or map pin.
      </div>
    );
  }

  return (
    <div className="card animate-fade-in" style={{ padding: '1.5rem', border: '1px solid var(--primary)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
      <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Navigation size={20} /> Select a Collector Near You
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1.5fr', gap: '1.5rem', height: '550px' }}>
        {/* List Side */}
        <div style={{ overflowY: 'auto', paddingRight: '0.5rem' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.85rem' }}>
            Choose an NGO to pick up your donation.
          </p>
          {collectors.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No collectors found in this area.
            </div>
          ) : (
            collectors.map(c => (
              <div 
                key={c._id} 
                className="card shadow-sm hover:shadow-md transition-all" 
                style={{ 
                  padding: '1rem', 
                  marginBottom: '1rem', 
                  cursor: 'pointer', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px'
                }}
                onClick={() => handleAssign(c._id)}
              >
                <div style={{ fontWeight: '700', color: 'var(--primary-dark)', fontSize: '1.05rem' }}>
                  {c.organizationName || c.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.25rem' }}>
                  <Navigation size={12} style={{ display: 'inline', marginRight: '4px' }} /> {c.address || 'Address registered'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                   <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                     <Phone size={12} style={{ display: 'inline', marginRight: '4px' }} /> {c.contactNumber}
                   </div>
                   <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>Assign</button>
                </div>
                <Link to={`/profile/${c._id}`} target="_blank" style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '8px', display: 'block', textDecoration: 'none' }}>
                  <ExternalLink size={12} style={{ display: 'inline', marginRight: '4px' }} /> View Profile
                </Link>
              </div>
            ))
          )}
        </div>

        {/* Map Side */}
        <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #E5E7EB' }}>
          <MapContainer center={[donation.latitude, donation.longitude]} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            {/* Donation Marker (Current pickup point) */}
            <Marker position={[donation.latitude, donation.longitude]} icon={L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
            })}>
              <Popup>Your Pickup Spot</Popup>
            </Marker>

            {collectors.map(c => (
              <Marker key={c._id} position={[c.latitude, c.longitude]} icon={L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
              })}>
                <Popup>
                  <div style={{ textAlign: 'center' }}>
                    <strong>{c.organizationName || c.name}</strong><br/>
                    <button onClick={() => handleAssign(c._id)} className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.7rem', marginTop: '5px' }}>Assign Here</button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
