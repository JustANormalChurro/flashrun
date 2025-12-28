import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import RetroHeader from '@/components/RetroHeader';
import RetroButton from '@/components/RetroButton';
import { RetroInput } from '@/components/RetroInput';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function JoinRoom() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const currentUser = await base44.auth.me();
    setUser(currentUser);
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!code.trim()) {
      setMessage({ type: 'error', text: 'Please enter a class code' });
      return;
    }

    setJoining(true);
    setMessage(null);

    const allRooms = await base44.entities.Room.list();
    const room = allRooms.find(r => r.student_code === code.trim().toUpperCase());

    if (!room) {
      setMessage({ type: 'error', text: 'Invalid class code. Please check and try again.' });
      setJoining(false);
      return;
    }

    const existingMemberships = await base44.entities.RoomMembership.filter({ 
      room_id: room.id, 
      user_id: user.id 
    });

    if (existingMemberships.length > 0) {
      setMessage({ type: 'error', text: 'You are already enrolled in this class.' });
      setJoining(false);
      return;
    }

    await base44.entities.RoomMembership.create({
      room_id: room.id,
      user_id: user.id,
      user_email: user.email,
      user_name: user.full_name || user.email,
      role: 'student'
    });

    setMessage({ type: 'success', text: 'Successfully joined: ' + room.name });
    setTimeout(() => {
      window.location.href = createPageUrl('StudentDashboard');
    }, 1500);
  };

  if (loading) {
    return <LoadingSpinner message="Loading" />;
  }

  return (
    <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '12px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <RetroHeader user={user} />
      
      <div style={{ padding: '15px', maxWidth: '500px' }}>
        <div style={{ backgroundColor: 'white', border: '1px solid #999999' }}>
          <div style={{ backgroundColor: '#336699', color: 'white', padding: '8px', fontWeight: 'bold', fontSize: '12px' }}>
            Join a Class
          </div>
          <div style={{ padding: '15px' }}>
            <p style={{ marginBottom: '15px', fontSize: '11px' }}>
              Enter the class code provided by your teacher to join a class.
            </p>

            {message && (
              <div style={{
                padding: '10px',
                marginBottom: '15px',
                border: '1px solid',
                borderColor: message.type === 'error' ? '#cc0000' : '#00cc00',
                backgroundColor: message.type === 'error' ? '#ffcccc' : '#ccffcc',
                fontSize: '11px'
              }}>
                {message.text}
              </div>
            )}

            <RetroInput
              label="Class Code"
              value={code}
              onChange={setCode}
              placeholder="e.g., ABC123"
              style={{ textTransform: 'uppercase', fontFamily: 'Courier New', fontSize: '14px' }}
            />

            <div style={{ marginTop: '15px' }}>
              <RetroButton onClick={handleJoin} disabled={joining}>
                {joining ? 'Joining...' : 'Join Class'}
              </RetroButton>
              <RetroButton onClick={() => window.location.href = createPageUrl('StudentDashboard')} variant="secondary" style={{ marginLeft: '10px' }}>
                Cancel
              </RetroButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}