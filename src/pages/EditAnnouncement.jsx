import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import RetroHeader from '@/components/RetroHeader';
import RetroButton from '@/components/RetroButton';
import { RetroInput, RetroCheckbox } from '@/components/RetroInput';
import MarkdownEditor from '@/components/MarkdownEditor';

export default function EditAnnouncement() {
  const [user, setUser] = useState(null);
  const [announcement, setAnnouncement] = useState(null);
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
  const announcementId = urlParams.get('id');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const currentUser = await base44.auth.me();
    setUser(currentUser);
    
    if (announcementId) {
      const announcements = await base44.entities.Announcement.filter({ id: announcementId });
      if (announcements.length > 0) {
        const a = announcements[0];
        setAnnouncement(a);
        setForm({
          title: a.title || '',
          content: a.content || '',
          allow_comments: a.allow_comments !== false,
          allow_likes: a.allow_likes !== false
        });

        const rooms = await base44.entities.Room.filter({ id: a.room_id });
        if (rooms.length > 0) setRoom(rooms[0]);
      }
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      alert('Title and content are required');
      return;
    }
    
    setSaving(true);
    await base44.entities.Announcement.update(announcementId, {
      title: form.title,
      content: form.content,
      allow_comments: form.allow_comments,
      allow_likes: form.allow_likes
    });
    
    window.location.href = createPageUrl('RoomDetail') + '?id=' + announcement.room_id;
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
            Edit Announcement - {room?.name}
          </div>
          <div style={{ padding: '15px' }}>
            <RetroInput
              label="Announcement Title"
              value={form.title}
              onChange={(v) => setForm({ ...form, title: v })}
              required
            />

            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '11px' }}>
                Content
              </label>
              <MarkdownEditor
                value={form.content}
                onChange={(v) => setForm({ ...form, content: v })}
              />
            </div>

            <div style={{ marginTop: '15px', borderTop: '1px solid #dddddd', paddingTop: '15px' }}>
              <RetroCheckbox
                label="Allow comments"
                checked={form.allow_comments}
                onChange={(v) => setForm({ ...form, allow_comments: v })}
              />
              <RetroCheckbox
                label="Allow likes"
                checked={form.allow_likes}
                onChange={(v) => setForm({ ...form, allow_likes: v })}
              />
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', border: '1px solid #999999', padding: '15px' }}>
          <RetroButton onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </RetroButton>
          <RetroButton onClick={() => window.location.href = createPageUrl('RoomDetail') + '?id=' + announcement?.room_id} variant="secondary" style={{ marginLeft: '10px' }}>
            Cancel
          </RetroButton>
        </div>
      </div>
    </div>
  );
}