import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Search, CheckCircle, Navigation, MessageCircle, Clock } from 'lucide-react';
import L from 'leaflet';
import Chat from '../components/Chat';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';
import API_BASE_URL from '../api/config';

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function CalculateDistance({ donorLat, donorLng, userLat, userLng }) {
  if (!donorLat || !donorLng || !userLat || !userLng) return null;

  // Haversine formula
  const R = 6371; // km
  const dLat = (donorLat - userLat) * Math.PI / 180;
  const dLng = (donorLng - userLng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(userLat * Math.PI / 180) * Math.cos(donorLat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return (
    <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold' }}>
      {distance.toFixed(2)} km away
    </span>
  );
}

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function NGODashboard() {
  const { user } = useContext(AuthContext);
  const [donations, setDonations] = useState([]);
  const [myDonations, setMyDonations] = useState([]);
  const [locationFilter, setLocationFilter] = useState('');
  const [view, setView] = useState('list'); // 'list', 'map', 'active'
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [costAgreements, setCostAgreements] = useState({});
  const [optimizedRoute, setOptimizedRoute] = useState([]);

  const toggleCostAgreement = (id) => {
    setCostAgreements(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const calculateOptimizedRoute = () => {
    if (myDonations.length === 0) return;
    let unvisited = [...myDonations];
    let route = [];
    let currentPos = userLocation || { lat: 12.9716, lng: 77.5946 };
    while (unvisited.length > 0) {
      let closestIdx = 0;
      let minDistance = Infinity;
      unvisited.forEach((d, index) => {
        const dist = Math.sqrt(Math.pow(d.latitude - currentPos.lat, 2) + Math.pow(d.longitude - currentPos.lng, 2));
        if (dist < minDistance) {
          minDistance = dist;
          closestIdx = index;
        }
      });
      const next = unvisited.splice(closestIdx, 1)[0];
      route.push(next);
      currentPos = { lat: next.latitude, lng: next.longitude };
    }
    setOptimizedRoute(route);
  };

  const fetchAvailableDonations = async (signal) => {
    try {
      console.log('Fetching available donations for:', { locationFilter, userLocation });
      let url = `${API_BASE_URL}/donations`;
      const params = new URLSearchParams();
      if (locationFilter) params.append('location', locationFilter);
      if (userLocation) {
        params.append('lat', userLocation.lat);
        params.append('lng', userLocation.lng);
      }
      
      const { data } = await axios.get(`${url}?${params.toString()}`, { signal });
      console.log('Available donations fetched:', data);
      setDonations(data);
    } catch (err) {
      if (!axios.isCancel(err)) {
        console.error('Error fetching available donations:', err);
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  const fetchMyDonations = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/donations/my`);
      setMyDonations(data);
    } catch (err) {
      console.error('Error fetching my donations:', err);
    }
  };

  useEffect(() => {
    fetchMyDonations();
  }, []);

  useEffect(() => {
    if (!userLocation) return;
    const controller = new AbortController();
    // Only show full loading if we have no donations yet
    if (donations.length === 0) setLoading(true);
    fetchAvailableDonations(controller.signal);
    return () => controller.abort();
  }, [locationFilter, userLocation?.lat, userLocation?.lng]); // Use coordinate values directly

  useEffect(() => {
    // If profile has data, use it immediately
    if (user?.latitude && user?.longitude) {
      console.log('NGODashboard: Using profile location');
      setUserLocation({ lat: user.latitude, lng: user.longitude });
    } else {
      // Otherwise fallback to browser geolocation
      console.log('NGODashboard: Profile location missing, trying browser...');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => {
          console.log('NGODashboard: Falling back to default Bengaluru');
          setUserLocation({ lat: 12.9716, lng: 77.5946 });
        }
      );
    }
  }, [user?.latitude, user?.longitude]);

  const acceptDonation = async (id, isCostAgreed) => {
    try {
      await axios.put(`${API_BASE_URL}/donations/${id}/accept`, { isCostAgreed });
      alert('Donation accepted! Now wait for donor confirmation.');
      fetchAvailableDonations();
      fetchMyDonations();
      setView('active');
    } catch (err) {
      alert(err.response?.data?.message || 'Error accepting donation');
    }
  };

  const rejectDonation = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/donations/${id}/reject`);
      alert('Request rejected.');
      fetchAvailableDonations();
      fetchMyDonations();
    } catch (err) {
      alert('Error rejecting request');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API_BASE_URL}/donations/${id}/status`, { status });
      fetchMyDonations();
    } catch (err) {
      alert('Error updating status');
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '5rem' }}>
      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="card shadow-sm border-0" style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)', color: 'white' }}>
          <div style={{ opacity: 0.8, fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Missions Completed</div>
          <div style={{ fontSize: '2.25rem', fontWeight: '800' }}>{myDonations.filter(d => d.status === 'delivered').length}</div>
        </div>
        <div className="card glass-card">
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Pickups</div>
          <div style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--secondary)' }}>{myDonations.length}</div>
        </div>
        <div className="card glass-card">
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CO2 Prevented</div>
          <div style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--primary)' }}>{myDonations.filter(d => d.status === 'delivered').length * 4.5}kg</div>
        </div>
        <div className="card glass-card">
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Efficiency</div>
          <div style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--accent)' }}>94%</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <h2 style={{ color: 'var(--text-main)', fontSize: '2.25rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
          Collector <span className="text-gradient">Dashboard</span>
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={`btn ${view === 'list' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('list')}>Browse</button>
          <button className={`btn ${view === 'map' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('map')}>Map</button>
          <button className={`btn ${view === 'active' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('active')}>Active ({myDonations.length})</button>
        </div>
      </div>

      {view !== 'active' && (
        <div style={{ marginBottom: '1.5rem', position: 'relative', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by area..."
            className="form-control"
            style={{ paddingLeft: '2.5rem' }}
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          />
        </div>
      )}

      {view === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Section: Direct Invitations */}
          {donations.filter(d => d.status === 'requested').length > 0 && (
            <div>
              <h3 style={{ fontSize: '1.2rem', color: '#B45309', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={20} /> Direct Pickup Requests ({donations.filter(d => d.status === 'requested').length})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                {donations.filter(d => d.status === 'requested').map(d => (
                  <div key={d._id} className="card shadow-md border-amber-200" style={{ borderRadius: '16px', overflow: 'hidden', border: '2px solid #FCD34D', background: '#FFFBEB' }}>
                    <div style={{ padding: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#92400E', margin: 0 }}>{d.foodName || d.foodType}</h4>
                        <CalculateDistance donorLat={d.latitude} donorLng={d.longitude} userLat={userLocation.lat} userLng={userLocation.lng} />
                      </div>
                      <div style={{ fontSize: '0.75rem', background: '#F59E0B', color: 'white', padding: '4px 12px', borderRadius: '20px', marginBottom: '1rem', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
                        INVITATION FROM DONOR
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <p style={{ margin: 0, fontSize: '0.95rem', color: '#4B5563' }}><strong>Qty:</strong> {d.quantity} | <strong>Value:</strong> ₹{d.estimatedCost || 0}</p>
                        <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6B7280', fontSize: '0.9rem' }}><MapPin size={16} /> {d.location}</p>
                        <p style={{ margin: 0, color: '#6B7280', fontSize: '0.9rem' }}><strong>Donor:</strong> {d.donor?.name}</p>
                      </div>
                      <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: costAgreements[d._id] ? '1px solid var(--primary)' : '1px solid #E5E7EB' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => toggleCostAgreement(d._id)}>
                          <input type="checkbox" checked={costAgreements[d._id] || false} readOnly />
                          <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', cursor: 'pointer' }}>Agree to value (₹{d.estimatedCost || 0})</label>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => acceptDonation(d._id, costAgreements[d._id])} disabled={!costAgreements[d._id]}>Accept Request</button>
                        <button className="btn btn-secondary" style={{ flex: 1, color: '#EF4444', background: '#FEF2F2' }} onClick={() => rejectDonation(d._id)}>Reject</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Public Browse */}
          <div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-dark)', marginBottom: '1rem' }}>
              Available for Pickup ({donations.filter(d => d.status === 'pending').length})
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
              {donations.filter(d => d.status === 'pending').map(d => (
                <div key={d._id} className="card shadow-md border-0 transition-all hover:shadow-lg" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <h4 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary-dark)', margin: 0 }}>{d.foodName || d.foodType}</h4>
                      <CalculateDistance donorLat={d.latitude} donorLng={d.longitude} userLat={userLocation.lat} userLng={userLocation.lng} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                      <p style={{ margin: 0, fontSize: '0.95rem', color: '#4B5563' }}><strong>Qty:</strong> {d.quantity} | <strong>Value:</strong> ₹{d.estimatedCost || 0}</p>
                      <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6B7280', fontSize: '0.9rem' }}><MapPin size={16} /> {d.location}</p>
                    </div>
                    <div style={{ background: '#F9FAFB', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: costAgreements[d._id] ? '1px solid var(--primary)' : '1px solid #E5E7EB' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => toggleCostAgreement(d._id)}>
                        <input type="checkbox" checked={costAgreements[d._id] || false} readOnly />
                        <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', cursor: 'pointer' }}>Agree to value (₹{d.estimatedCost || 0})</label>
                      </div>
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => acceptDonation(d._id, costAgreements[d._id])} disabled={!costAgreements[d._id]}>Accept Pickup</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <div className="spinner-border text-primary" role="status"></div>
              <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Searching for donations...</p>
            </div>
          ) : donations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
              <MapPin size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p style={{ fontSize: '1.1rem' }}>No donations available within 100km.</p>
              <p style={{ fontSize: '0.9rem' }}>Try searching by area or city name above.</p>
            </div>
          ) : null}
        </div>
      )}

      {view === 'map' && (
        <div className="card shadow-lg border-0" style={{ height: '600px', padding: 0, overflow: 'hidden', borderRadius: '20px' }}>
          <MapContainer
            center={donations.length > 0 ? [donations[0].latitude, donations[0].longitude] : [userLocation.lat, userLocation.lng]}
            zoom={donations.length > 0 ? 12 : 11}
            style={{ height: '100%', width: '100%' }}
          >
            <ChangeView
              center={donations.length > 0 ? [donations[0].latitude, donations[0].longitude] : [userLocation.lat, userLocation.lng]}
              zoom={donations.length > 0 ? 12 : 11}
            />
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* NGO Marker (Smaller/Different to avoid confusion) */}
            <Marker position={[userLocation.lat, userLocation.lng]} icon={L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [20, 32], iconAnchor: [10, 32], popupAnchor: [1, -34], shadowSize: [32, 32]
            })}>
              <Popup>Your Office Location</Popup>
            </Marker>

            {donations.map(d => (
              <Marker key={d._id} position={[d.latitude, d.longitude]} icon={L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
              })}>
                <Popup>
                  <div style={{ minWidth: '220px', padding: '4px' }}>
                    <h5 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#C2410C' }}>{d.foodName || d.foodType}</h5>
                    <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#6B7280' }}><strong>Location:</strong> {d.location}</p>
                    <CalculateDistance donorLat={d.latitude} donorLng={d.longitude} userLat={userLocation.lat} userLng={userLocation.lng} /><br />

                    <div style={{ marginTop: '12px', background: '#FFF7ED', padding: '8px', borderRadius: '8px', border: '1px solid #FED7AA' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }} onClick={() => toggleCostAgreement(d._id)}>
                        <input type="checkbox" checked={costAgreements[d._id] || false} onChange={() => { }} />
                        <label> Agree to value: ₹{d.estimatedCost || 0}</label>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <button
                        className="btn btn-primary"
                        style={{ flex: 1, padding: '6px 10px', fontSize: '0.8rem', background: '#C2410C', border: 'none' }}
                        disabled={!costAgreements[d._id]}
                        onClick={() => acceptDonation(d._id, costAgreements[d._id])}
                      >
                        Accept Food
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      {view === 'active' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: 'var(--primary-dark)' }}>My Active Missions ({myDonations.length})</h3>
            {myDonations.length > 1 && (
              <button
                className="btn btn-primary"
                onClick={calculateOptimizedRoute}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}
              >
                <Navigation size={18} /> Optimize Pickup Route
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: selectedDonation ? '1fr 1fr' : '1.2fr 0.8fr', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {(optimizedRoute.length > 0 ? optimizedRoute : myDonations).map((d, index) => (
                <div
                  key={d._id}
                  className={`card transition-all ${selectedDonation?._id === d._id ? 'border-primary shadow-lg' : 'hover:shadow-md'}`}
                  style={{
                    cursor: 'pointer',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    border: selectedDonation?._id === d._id ? '2px solid var(--primary)' : '1px solid #E5E7EB',
                    position: 'relative'
                  }}
                  onClick={() => setSelectedDonation(d)}
                >
                  {optimizedRoute.length > 0 && (
                    <div style={{
                      position: 'absolute', left: '-10px', top: '50%', transform: 'translateY(-50%)',
                      width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)',
                      color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: '700', fontSize: '0.8rem', border: '2px solid white', zIndex: 10
                    }}>
                      {index + 1}
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, fontWeight: '700' }}>{d.foodName || d.foodType}</h4>
                    <span style={{
                      fontSize: '0.75rem',
                      padding: '0.3rem 0.75rem',
                      borderRadius: '20px',
                      background: d.status === 'accepted' ? '#DBEAFE' : d.status === 'collected' ? '#D1FAE5' : '#FEF3C7',
                      color: d.status === 'accepted' ? '#1E40AF' : d.status === 'collected' ? '#065F46' : '#92400E',
                      fontWeight: '700'
                    }}>
                      {d.status.toUpperCase().replace(/-/g, ' ')}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.9rem', color: '#6B7280', margin: '0.75rem 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} /> {d.location}
                  </p>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <select
                        className="form-control"
                        value={d.status}
                        onChange={(e) => updateStatus(d._id, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ height: '38px', borderRadius: '8px', fontSize: '0.85rem' }}
                      >
                        <option value="accepted">Accepted</option>
                        <option value="accepted-by-collector">Waiting for Donor</option>
                        <option value="in-transit">In Transit</option>
                        <option value="collected">Collected</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>
                    <button
                      className="btn btn-secondary"
                      onClick={(e) => { e.stopPropagation(); setSelectedDonation(d); }}
                      style={{ height: '38px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <MessageCircle size={18} /> Chat
                    </button>
                  </div>
                </div>
              ))}
              {myDonations.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                  <CheckCircle size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                  <p style={{ fontSize: '1.1rem' }}>No active pickups. Browse for donations to get started!</p>
                </div>
              )}
            </div>

            <div style={{ position: 'sticky', top: '2rem', height: 'fit-content' }}>
              {selectedDonation ? (
                <div className="card shadow-xl animate-slide-in" style={{ borderRadius: '20px', padding: '1rem', border: 'none' }}>
                  <Chat donationId={selectedDonation._id} currentUser={user} />
                </div>
              ) : (
                <div className="card shadow-md" style={{ height: '550px', padding: 0, overflow: 'hidden', borderRadius: '20px' }}>
                  <MapContainer center={[userLocation.lat, userLocation.lng]} zoom={12} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                    {/* NGO Home Marker */}
                    <Marker position={[userLocation.lat, userLocation.lng]} icon={L.icon({
                      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                      iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
                    })}>
                      <Popup>Your Office</Popup>
                    </Marker>

                    {myDonations.map((d, index) => (
                      <Marker key={d._id} position={[d.latitude, d.longitude]} icon={L.icon({
                        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
                      })}>
                        <Popup>
                          <strong>{d.foodName || d.foodType}</strong><br />
                          {d.location}
                        </Popup>
                      </Marker>
                    ))}

                    {optimizedRoute.length > 0 && (
                      <Polyline
                        positions={[
                          [userLocation.lat, userLocation.lng],
                          ...optimizedRoute.map(d => [d.latitude, d.longitude])
                        ]}
                        color="#6366F1"
                        weight={4}
                        dashArray="10, 10"
                      />
                    )}
                  </MapContainer>
                  <div style={{ padding: '1rem', fontSize: '0.85rem', color: '#6B7280', textAlign: 'center' }}>
                    {optimizedRoute.length > 0 ? "Route lines show the optimized pickup sequence." : "Overview of your active missions."}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

