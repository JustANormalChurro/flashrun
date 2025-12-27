import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import RetroHeader from '@/components/RetroHeader';
import RetroButton from '@/components/RetroButton';
import { RetroInput, RetroTextarea } from '@/components/RetroInput';

export default function ChatRoom() {
  const [user, setUser] = useState(null);
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteId, setInviteId] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get('id');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadData = async () => {
    const currentUser = await base44.auth.me();
    setUser(currentUser);

    const rooms = await base44.entities.ChatRoom.filter({ id: roomId });
    if (rooms.length > 0) {
      setRoom(rooms[0]);
    }

    loadMessages();
  };

  const loadMessages = async () => {
    const msgs = await base44.entities.ChatMessage.filter({ chatroom_id: roomId }, '-created_date', 100);
    setMessages(msgs.reverse());
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    await base44.entities.ChatMessage.create({
      chatroom_id: roomId,
      sender_id: user.id,
      sender_name: user.full_name || user.email,
      message: newMessage
    });

    setNewMessage('');
    loadMessages();
  };

  const handleEdit = async (msgId) => {
    await base44.entities.ChatMessage.update(msgId, {
      message: editText,
      is_edited: true,
      edited_at: new Date().toISOString()
    });
    setEditingId(null);
    setEditText('');
    loadMessages();
  };

  const handleDelete = async (msgId) => {
    if (!window.confirm('Delete this message?')) return;
    await base44.entities.ChatMessage.delete(msgId);
    loadMessages();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      await base44.entities.ChatMessage.create({
        chatroom_id: roomId,
        sender_id: user.id,
        sender_name: user.full_name || user.email,
        message: '[File Attachment]',
        file_url: file_url,
        file_name: file.name
      });

      loadMessages();
    } catch (e) {
      alert('File upload failed');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteId) {
      alert('Enter teacher ID');
      return;
    }

    const users = await base44.entities.User.filter({ teacher_id: inviteId });
    if (users.length === 0) {
      alert('Teacher ID not found');
      return;
    }

    const invitedUser = users[0];
    const members = room.member_ids || [];
    if (!members.includes(invitedUser.id)) {
      members.push(invitedUser.id);
      await base44.entities.ChatRoom.update(roomId, { member_ids: members });
      alert('Invited ' + (invitedUser.full_name || invitedUser.email));
      loadData();
    } else {
      alert('User already a member');
    }

    setInviteId('');
    setShowInvite(false);
  };

  const handleKick = async (userId) => {
    if (!window.confirm('Remove this user from the room?')) return;
    const members = (room.member_ids || []).filter(id => id !== userId);
    await base44.entities.ChatRoom.update(roomId, { member_ids: members });
    loadData();
  };

  const handleBan = async (userId) => {
    if (!window.confirm('Ban this user?')) return;
    const banned = room.banned_ids || [];
    banned.push(userId);
    const members = (room.member_ids || []).filter(id => id !== userId);
    await base44.entities.ChatRoom.update(roomId, { member_ids: members, banned_ids: banned });
    loadData();
  };

  if (!room) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  const isOwner = room.owner_id === user?.id;

  return (
    <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '12px', backgroundColor: '#f0f0f0', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <RetroHeader user={user} />
      
      <div style={{ padding: '10px', backgroundColor: '#336699', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <strong>{room.name}</strong> | Code: {room.room_code} | Members: {(room.member_ids || []).length}
        </div>
        <div>
          {isOwner && (
            <RetroButton onClick={() => setShowInvite(!showInvite)} variant="secondary" style={{ padding: '3px 8px', marginRight: '5px' }}>
              Invite
            </RetroButton>
          )}
          <RetroButton onClick={() => window.location.href = createPageUrl('OrbitRooms')} variant="secondary" style={{ padding: '3px 8px' }}>
            Exit
          </RetroButton>
        </div>
      </div>

      {showInvite && (
        <div style={{ padding: '10px', backgroundColor: '#ffffee', borderBottom: '1px solid #cccc00' }}>
          <RetroInput
            label="Invite by Teacher ID"
            value={inviteId}
            onChange={setInviteId}
            placeholder="Enter teacher ID"
          />
          <RetroButton onClick={handleInvite} style={{ marginTop: '5px' }}>Send Invite</RetroButton>
          <RetroButton onClick={() => setShowInvite(false)} variant="secondary" style={{ marginLeft: '5px', marginTop: '5px' }}>Cancel</RetroButton>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '15px', backgroundColor: 'white' }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ marginBottom: '15px', padding: '10px', backgroundColor: msg.sender_id === user?.id ? '#e6f2ff' : '#f5f5f5', border: '1px solid #cccccc' }}>
                <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '5px', color: '#003366' }}>
                  {msg.sender_name}
                  <span style={{ marginLeft: '10px', fontWeight: 'normal', color: '#666' }}>
                    {new Date(msg.created_date).toLocaleString()}
                  </span>
                  {msg.is_edited && <span style={{ marginLeft: '5px', color: '#999', fontStyle: 'italic' }}>(edited)</span>}
                </div>
                
                {editingId === msg.id ? (
                  <div>
                    <RetroTextarea
                      value={editText}
                      onChange={setEditText}
                      rows={3}
                    />
                    <RetroButton onClick={() => handleEdit(msg.id)} style={{ marginTop: '5px' }}>Save</RetroButton>
                    <RetroButton onClick={() => { setEditingId(null); setEditText(''); }} variant="secondary" style={{ marginLeft: '5px', marginTop: '5px' }}>Cancel</RetroButton>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: '11px', marginBottom: '8px' }}>{msg.message}</div>
                    
                    {msg.file_url && (
                      <div style={{ marginTop: '8px' }}>
                        <a href={msg.file_url} target="_blank" rel="noopener noreferrer" style={{ color: '#003366', fontSize: '11px', textDecoration: 'underline' }}>
                          📎 {msg.file_name || 'Download File'}
                        </a>
                      </div>
                    )}
                    
                    {msg.sender_id === user?.id && (
                      <div style={{ marginTop: '5px' }}>
                        <a href="#" onClick={(e) => { e.preventDefault(); setEditingId(msg.id); setEditText(msg.message); }} style={{ fontSize: '10px', color: '#003366', marginRight: '10px' }}>
                          Edit
                        </a>
                        <a href="#" onClick={(e) => { e.preventDefault(); handleDelete(msg.id); }} style={{ fontSize: '10px', color: '#cc0000' }}>
                          Delete
                        </a>
                      </div>
                    )}
                    
                    {isOwner && msg.sender_id !== user?.id && (
                      <div style={{ marginTop: '5px' }}>
                        <a href="#" onClick={(e) => { e.preventDefault(); handleKick(msg.sender_id); }} style={{ fontSize: '10px', color: '#cc6600', marginRight: '10px' }}>
                          Kick User
                        </a>
                        <a href="#" onClick={(e) => { e.preventDefault(); handleBan(msg.sender_id); }} style={{ fontSize: '10px', color: '#cc0000' }}>
                          Ban User
                        </a>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ padding: '10px', backgroundColor: '#e0e0e0', borderTop: '1px solid #999999' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <RetroTextarea
                  value={newMessage}
                  onChange={setNewMessage}
                  placeholder="Type your message..."
                  rows={2}
                />
              </div>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <RetroButton onClick={() => fileInputRef.current?.click()} variant="secondary" disabled={uploadingFile}>
                  {uploadingFile ? 'Uploading...' : '📎 File'}
                </RetroButton>
                <RetroButton onClick={handleSend} style={{ marginTop: '5px' }}>
                  Send
                </RetroButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}