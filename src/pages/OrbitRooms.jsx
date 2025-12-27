import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import RetroHeader from '@/components/RetroHeader';
import RetroButton from '@/components/RetroButton';
import RetroTable from '@/components/RetroTable';
import { RetroInput, RetroTextarea } from '@/components/RetroInput';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function OrbitRooms() {
  const [user, setUser] = useState(null);
  const [myRooms, setMyRooms] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', code: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const currentUser = await base44.auth.me();
    setUser(currentUser);

    const rooms = await base44.entities.ChatRoom.list('-created_date');
    
    if (currentUser.user_type === 'superadmin') {
      setAllRooms(rooms);
    }
    
    const userRooms = rooms.filter(r => 
      r.owner_id === currentUser.id || 
      (r.member_ids && r.member_ids.includes(currentUser.id))
    );
    setMyRooms(userRooms);
    setLoading(false);
  };

  const generateCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreate = async () => {
    if (!form.name) {
      alert('Room name required');
      return;
    }
    
    const code = generateCode();
    await base44.entities.ChatRoom.create({
      name: form.name,
      description: form.description,
      room_code: code,
      owner_id: user.id,
      owner_name: user.full_name || user.email,
      member_ids: [user.id]
    });
    
    setForm({ name: '', description: '', code: '' });
    setShowCreate(false);
    loadData();
  };

  const handleJoin = async () => {
    if (!form.code) {
      alert('Enter room code');
      return;
    }
    
    const rooms = await base44.entities.ChatRoom.filter({ room_code: form.code.toUpperCase() });
    if (rooms.length === 0) {
      alert('Invalid room code');
      return;
    }
    
    const room = rooms[0];
    if (room.banned_ids && room.banned_ids.includes(user.id)) {
      alert('You are banned from this room');
      return;
    }
    
    const members = room.member_ids || [];
    if (!members.includes(user.id)) {
      members.push(user.id);
      await base44.entities.ChatRoom.update(room.id, { member_ids: members });
    }
    
    window.location.href = createPageUrl('ChatRoom') + '?id=' + room.id;
  };

  const handleDelete = async (roomId) => {
    if (!window.confirm('Delete this chat room?')) return;
    await base44.entities.ChatRoom.delete(roomId);
    loadData();
  };

  if (loading) {
    return <LoadingSpinner message="Loading Orvit Rooms" />;
  }

  const myRoomRows = myRooms.map(r => ({
    data: r,
    cells: [
      r.name,
      r.owner_name,
      r.room_code,
      (r.member_ids || []).length,
      <span style={{ color: '#003366' }}>Open</span>
    ]
  }));

  const allRoomRows = allRooms.map(r => ({
    data: r,
    cells: [
      r.name,
      r.owner_name,
      r.room_code,
      (r.member_ids || []).length,
      <>
        <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = createPageUrl('ChatRoom') + '?id=' + r.id; }} style={{ color: '#003366', marginRight: '10px' }}>View</a>
        <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(r.id); }} style={{ color: '#cc0000' }}>Delete</a>
      </>
    ]
  }));

  return (
    <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '12px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <RetroHeader user={user} />
      
      <div style={{ padding: '15px' }}>
        <div style={{ backgroundColor: '#004488', color: 'white', padding: '15px', marginBottom: '15px', border: '2px solid #0066cc' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#99ff99' }}>
            Orvit Chat Rooms
          </div>
          <div style={{ fontSize: '11px', marginTop: '5px' }}>
            Revolutionary real-time collaboration for educators
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <RetroButton onClick={() => setShowCreate(!showCreate)} style={{ marginRight: '10px' }}>
            + Create Room
          </RetroButton>
          <RetroButton onClick={() => setShowJoin(!showJoin)} variant="secondary">
            Join Room
          </RetroButton>
        </div>

        {showCreate && (
          <div style={{ backgroundColor: 'white', border: '1px solid #999999', padding: '15px', marginBottom: '15px' }}>
            <RetroInput
              label="Room Name"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
            />
            <RetroTextarea
              label="Description"
              value={form.description}
              onChange={(v) => setForm({ ...form, description: v })}
              rows={3}
            />
            <RetroButton onClick={handleCreate}>Create</RetroButton>
            <RetroButton onClick={() => setShowCreate(false)} variant="secondary" style={{ marginLeft: '10px' }}>Cancel</RetroButton>
          </div>
        )}

        {showJoin && (
          <div style={{ backgroundColor: 'white', border: '1px solid #999999', padding: '15px', marginBottom: '15px' }}>
            <RetroInput
              label="Room Code"
              value={form.code}
              onChange={(v) => setForm({ ...form, code: v.toUpperCase() })}
              placeholder="Enter 6-character code"
            />
            <RetroButton onClick={handleJoin}>Join</RetroButton>
            <RetroButton onClick={() => setShowJoin(false)} variant="secondary" style={{ marginLeft: '10px' }}>Cancel</RetroButton>
          </div>
        )}

        <div style={{ backgroundColor: 'white', border: '1px solid #999999', marginBottom: '15px' }}>
          <div style={{ backgroundColor: '#336699', color: 'white', padding: '8px', fontWeight: 'bold' }}>
            My Chat Rooms
          </div>
          <div style={{ padding: '15px' }}>
            <RetroTable
              headers={['Room Name', 'Owner', 'Code', 'Members', 'Action']}
              rows={myRoomRows}
              onRowClick={(row) => window.location.href = createPageUrl('ChatRoom') + '?id=' + row.data.id}
              emptyMessage="No rooms yet. Create or join one!"
            />
          </div>
        </div>

        {user?.user_type === 'superadmin' && (
          <div style={{ backgroundColor: 'white', border: '1px solid #999999' }}>
            <div style={{ backgroundColor: '#cc0000', color: 'white', padding: '8px', fontWeight: 'bold' }}>
              All Chat Rooms (Admin View)
            </div>
            <div style={{ padding: '15px' }}>
              <RetroTable
                headers={['Room Name', 'Owner', 'Code', 'Members', 'Actions']}
                rows={allRoomRows}
                emptyMessage="No rooms in system"
              />
            </div>
          </div>
        )}

        <div style={{ marginTop: '15px' }}>
          <RetroButton onClick={() => window.location.href = createPageUrl('Orvit')} variant="secondary">
            Back to Orvit
          </RetroButton>
        </div>
      </div>
    </div>
  );
}