import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import RetroHeader from '@/components/RetroHeader';
import RetroButton from '@/components/RetroButton';
import { RetroInput, RetroCheckbox } from '@/components/RetroInput';
import MarkdownEditor from '@/components/MarkdownEditor';

export default function CreateAnnouncement() {
  const [user, setUser] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    allow_comments: true,
    allow_likes: true
  });

  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get('room_id');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const currentUser = await base44.auth.me();
    setUser(currentUser);
    
    if (roomId) {
      const rooms = await base44.entities.Room.filter({ id: roomId });
      if (rooms.length > 0) setRoom(rooms[0]);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      alert('Title is required');
      return;
    }
    if (!form.content.trim()) {
      alert('Content is required');
      return;
    }
    
    setSaving(true);
    const announcement = await base44.entities.Announcement.create({
      room_id: roomId,
      title: form.title,
      content: form.content,
      author_id: user.id,
      author_name: user.full_name || user.email,
      allow_comments: form.allow_comments,
      allow_likes: form.allow_likes,
      likes: [],
      comments: []
    });

    // Send notifications to all students in the room
    const memberships = await base44.entities.RoomMembership.filter({ room_id: roomId });
    const students = memberships.filter(m => m.role === 'student');
    
    for (const student of students) {
      await base44.entities.Notification.create({
        user_id: student.user_id,
        type: 'announcement',
        room_id: roomId,
        room_name: room.name,
        content_id: announcement.id,
        title: form.title,
        message: 'New announcement posted'
      });
    }
    
    window.location.href = createPageUrl('RoomDetail') + '?id=' + roomId;
  };

  if (loading) {
    return (
      <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '12px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
        <p style={{ padding: '20px' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '12px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <RetroHeader user={user} />
      
      <div style={{ padding: '15px' }}>
        <div style={{ backgroundColor: 'white', border: '1px solid #999999', marginBottom: '15px' }}>
          <div style={{ backgroundColor: '#336699', color: 'white', padding: '8px', fontWeight: 'bold', fontSize: '12px' }}>
            Create New Announcement - {room?.name}
          </div>
          <div style={{ padding: '15px' }}>
            <RetroInput
              label="Announcement Title"
              value={form.title}
              onChange={(v) => setForm({ ...form, title: v })}
              placeholder="e.g., Upcoming Test Reminder"
              required
            />

            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '11px' }}>
                Announcement Content <span style={{ color: '#cc0000' }}>*</span>
              </label>
              <MarkdownEditor
                value={form.content}
                onChange={(v) => setForm({ ...form, content: v })}
              />
            </div>

            <div style={{ marginTop: '15px', borderTop: '1px solid #dddddd', paddingTop: '15px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Settings:</div>
              <RetroCheckbox
                label="Allow students to comment"
                checked={form.allow_comments}
                onChange={(v) => setForm({ ...form, allow_comments: v })}
              />
              <RetroCheckbox
                label="Allow students to like"
                checked={form.allow_likes}
                onChange={(v) => setForm({ ...form, allow_likes: v })}
              />
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', border: '1px solid #999999', padding: '15px' }}>
          <RetroButton onClick={handleSave} disabled={saving}>
            {saving ? 'Posting...' : 'Post Announcement'}
          </RetroButton>
          <RetroButton onClick={() => window.location.href = createPageUrl('RoomDetail') + '?id=' + roomId} variant="secondary" style={{ marginLeft: '10px' }}>
            Cancel
          </RetroButton>
        </div>
      </div>
    </div>
  );
}