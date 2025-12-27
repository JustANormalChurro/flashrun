import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import RetroHeader from '@/components/RetroHeader';
import RetroTable from '@/components/RetroTable';
import RetroButton from '@/components/RetroButton';

export default function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      const allMemberships = await base44.entities.RoomMembership.filter({ user_id: currentUser.id });
      const studentMemberships = allMemberships.filter(m => m.role === 'student');
      setMemberships(studentMemberships);

      if (studentMemberships.length > 0) {
        const roomIds = studentMemberships.map(m => m.room_id);
        const allRooms = await base44.entities.Room.list();
        setRooms(allRooms.filter(r => roomIds.includes(r.id)));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const leaveRoom = async (roomId) => {
    if (window.confirm('Are you sure you want to leave this class?')) {
      const membership = memberships.find(m => m.room_id === roomId);
      if (membership) {
        await base44.entities.RoomMembership.delete(membership.id);
        loadData();
      }
    }
  };

  if (loading) {
    return (
      <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '12px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
        <p style={{ padding: '20px' }}>Loading...</p>
      </div>
    );
  }

  const roomRows = rooms.map(room => ({
    data: room,
    cells: [
      room.name,
      room.teacher_name || '-',
      <a href={createPageUrl('StudentRoom') + '?id=' + room.id} style={{ color: '#003366' }}>Enter Class</a>,
      <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); leaveRoom(room.id); }} style={{ color: '#cc0000' }}>Leave</a>
    ]
  }));

  return (
    <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '12px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <RetroHeader user={user} />
      
      <div style={{ padding: '15px' }}>
        <div style={{ backgroundColor: '#ffffcc', border: '1px solid #cccc00', padding: '10px', marginBottom: '15px', fontSize: '11px' }}>
          Welcome, <strong>{user?.full_name || user?.email}</strong>! Select a class below to view tests and assignments.
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ width: '70%', verticalAlign: 'top', paddingRight: '15px' }}>
                <div style={{ backgroundColor: 'white', border: '1px solid #999999' }}>
                  <div style={{ backgroundColor: '#336699', color: 'white', padding: '8px', fontWeight: 'bold', fontSize: '12px' }}>
                    My Classes ({rooms.length})
                  </div>
                  <div style={{ padding: '15px' }}>
                    <RetroTable
                      headers={['Class Name', 'Teacher', 'Action', '']}
                      rows={roomRows}
                      emptyMessage="You haven't joined any classes yet. Use 'Join Class' to get started."
                    />
                  </div>
                </div>
              </td>
              <td style={{ width: '30%', verticalAlign: 'top' }}>
                <div style={{ backgroundColor: 'white', border: '1px solid #999999', marginBottom: '15px' }}>
                  <div style={{ backgroundColor: '#336699', color: 'white', padding: '8px', fontWeight: 'bold', fontSize: '12px' }}>
                    Quick Actions
                  </div>
                  <div style={{ padding: '10px' }}>
                    <RetroButton onClick={() => window.location.href = createPageUrl('JoinRoom')} style={{ width: '100%', marginBottom: '8px' }}>
                      Join a Class
                    </RetroButton>
                    <RetroButton onClick={() => window.location.href = createPageUrl('StudentHistory')} variant="secondary" style={{ width: '100%' }}>
                      View Past Work
                    </RetroButton>
                  </div>
                </div>

                <div style={{ backgroundColor: 'white', border: '1px solid #999999' }}>
                  <div style={{ backgroundColor: '#336699', color: 'white', padding: '8px', fontWeight: 'bold', fontSize: '12px' }}>
                    Help
                  </div>
                  <div style={{ padding: '10px', fontSize: '11px' }}>
                    <p style={{ marginBottom: '8px' }}><strong>Joining a Class:</strong></p>
                    <p>Ask your teacher for the class join code and enter it on the Join Class page.</p>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ borderTop: '1px solid #999999', padding: '10px', textAlign: 'center', fontSize: '10px', color: '#666666', backgroundColor: '#e0e0e0' }}>
        EduTest Secure Testing Browser v2.1.4 | District Technology Services | &copy; 2009
      </div>
    </div>
  );
}