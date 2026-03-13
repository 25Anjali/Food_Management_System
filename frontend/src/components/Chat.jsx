import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, User as UserIcon, MessageSquare } from 'lucide-react';

export default function Chat({ donationId, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/messages/${donationId}`);
      setMessages(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching messages', err);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Polling every 3 seconds
    return () => clearInterval(interval);
  }, [donationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await axios.post('http://localhost:5000/api/messages', {
        donationId,
        content: newMessage
      });
      setNewMessage('');
      fetchMessages();
    } catch (err) {
      alert('Error sending message');
    }
  };

  if (loading) return <div>Loading chat...</div>;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '400px', padding: '0' }}>
      <div style={{ padding: '1rem', borderBottom: '1px solid #E5E7EB', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <MessageSquare size={18} color="var(--primary)" /> Coordination Chat
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {messages.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No messages yet. Start the conversation!</p>}
        {messages.map(msg => {
          const isOwn = msg.sender._id === currentUser._id;
          return (
            <div key={msg._id} style={{ alignSelf: isOwn ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
              <div style={{ 
                padding: '0.6rem 1rem', 
                borderRadius: '1rem', 
                background: isOwn ? 'var(--primary)' : '#F3F4F6', 
                color: isOwn ? 'white' : 'inherit',
                borderBottomRightRadius: isOwn ? '0.1rem' : '1rem',
                borderBottomLeftRadius: isOwn ? '1rem' : '0.1rem',
              }}>
                <div style={{ fontSize: '0.7rem', opacity: 0.8, marginBottom: '0.2rem', display: 'flex', gap: '0.5rem' }}>
                   <span>{msg.sender.name}</span>
                   <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div>{msg.content}</div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} style={{ padding: '1rem', borderTop: '1px solid #E5E7EB', display: 'flex', gap: '0.5rem' }}>
        <input 
          type="text" 
          className="form-control" 
          placeholder="Type a message..." 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem' }}>
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}
