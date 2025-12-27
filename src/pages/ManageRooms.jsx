import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import RetroHeader from '@/components/RetroHeader';
import RetroTable from '@/components/RetroTable';
import RetroButton from '@/components/RetroButton';

export default function ManageRooms() {
  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      const allRooms = await base44.entities.Room.list();
      const myRooms = allRooms.filter(r => 
        r.owner_id === currentUser.id || 
        r.created_by === currentUser.email ||
        (r.collaborator_ids && r.collaborator_ids.includes(currentUser.id))
      );
      setRooms(myRooms);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const deleteRoom = async (roomId) => {
    if (window.confirm('Are you sure you want to delete this room? All tests, assignments, and announcements will be permanently removed.')) {
      await base44.entities.Room.delete(roomId);
      loadData();
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading Rooms" />;
  }

  const roomRows = rooms.map(room => ({
    data: room,
    cells: [
      room.name,
      room.teacher_name || '-',
      room.description || '-',
      <span style={{ fontFamily: 'Courier New', backgroundColor: '#f0f0f0', padding: '2px 5px', border: '1px solid #cccccc' }}>{room.student_code}</span>,
      <span style={{ fontFamily: 'Courier New', backgroundColor: '#fff0f0', padding: '2px 5px', border: '1px solid #cccccc' }}>{room.teacher_code}</span>,
      <>
        <a href={createPageUrl('RoomDetail') + '?id=' + room.id} style={{ color: '#003366', marginRight: '10px' }}>View</a>
        <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteRoom(room.id); }} style={{ color: '#cc0000' }}>Delete</a>
      </>
    ]
  }));

  return (
    <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '12px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <RetroHeader user={user} />
      
      <div style={{ padding: '15px' }}>
        <div style={{ backgroundColor: 'white', border: '1px solid #999999' }}>
          <div style={{ backgroundColor: '#336699', color: 'white', padding: '8px', fontWeight: 'bold', fontSize: '12px' }}>
            Manage Classrooms
          </div>
          <div style={{ padding: '15px' }}>
            <div style={{ marginBottom: '15px' }}>
              <RetroButton onClick={() => window.location.href = createPageUrl('CreateRoom')}>
                + Create New Classroom
              </RetroButton>
            </div>

            <RetroTable
              headers={['Room Name', 'Teacher', 'Description', 'Student Code', 'Teacher Code', 'Actions']}
              rows={roomRows}
              emptyMessage="No classrooms created. Click 'Create New Classroom' to get started."
            />
          </div>
        </div>

        <div style={{ marginTop: '15px' }}>
          <RetroButton onClick={() => window.location.href = createPageUrl('TeacherDashboard')} variant="secondary">
            &lt; Back to Dashboard
          </RetroButton>
        </div>
      </div>
    </div>
  );
}