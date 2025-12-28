import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import RetroHeader from '@/components/RetroHeader';
import RetroButton from '@/components/RetroButton';
import { RetroInput, RetroTextarea } from '@/components/RetroInput';
import LoadingSpinner from '@/components/LoadingSpinner';

function generateCode(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function CreateRoom() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    teacher_name: '',
    description: ''
  });
  const [created, setCreated] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const currentUser = await base44.auth.me();
    setUser(currentUser);
    setForm(prev => ({ ...prev, teacher_name: currentUser.full_name || '' }));
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert('Room name is required');
      return;
    }
    
    setSaving(true);
    const studentCode = generateCode(6);
    const teacherCode = generateCode(8);

    const room = await base44.entities.Room.create({
      name: form.name,
      teacher_name: form.teacher_name,
      description: form.description,
      student_code: studentCode,
      teacher_code: teacherCode,
      owner_id: user.id,
      collaborator_ids: []
    });

    setCreated({ ...room, student_code: studentCode, teacher_code: teacherCode });
    setSaving(false);
  };

  if (loading) {
    return <LoadingSpinner message="Loading" />;
  }

  return (
    <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '12px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <RetroHeader user={user} />
      
      <div style={{ padding: '15px', maxWidth: '600px' }}>
        <div style={{ backgroundColor: 'white', border: '1px solid #999999' }}>
          <div style={{ backgroundColor: '#336699', color: 'white', padding: '8px', fontWeight: 'bold', fontSize: '12px' }}>
            Create New Classroom
          </div>
          <div style={{ padding: '15px' }}>
            {created ? (
              <div>
                <div style={{ backgroundColor: '#ccffcc', border: '1px solid #00cc00', padding: '10px', marginBottom: '15px' }}>
                  <strong>Classroom Created Successfully!</strong>
                </div>
                
                <table style={{ width: '100%', marginBottom: '15px' }}>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 'bold', padding: '5px', width: '150px' }}>Room Name:</td>
                      <td style={{ padding: '5px' }}>{created.name}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 'bold', padding: '5px' }}>Student Code:</td>
                      <td style={{ padding: '5px' }}>
                        <span style={{ fontFamily: 'Courier New', fontSize: '14px', backgroundColor: '#ffffcc', padding: '3px 8px', border: '1px solid #cccc00' }}>
                          {created.student_code}
                        </span>
                        <span style={{ marginLeft: '10px', fontSize: '10px', color: '#666666' }}>Share this with students</span>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 'bold', padding: '5px' }}>Teacher Code:</td>
                      <td style={{ padding: '5px' }}>
                        <span style={{ fontFamily: 'Courier New', fontSize: '14px', backgroundColor: '#ffcccc', padding: '3px 8px', border: '1px solid #cc0000' }}>
                          {created.teacher_code}
                        </span>
                        <span style={{ marginLeft: '10px', fontSize: '10px', color: '#666666' }}>Share with collaborating teachers</span>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <RetroButton onClick={() => window.location.href = createPageUrl('RoomDetail') + '?id=' + created.id}>
                  Go to Classroom
                </RetroButton>
                <RetroButton onClick={() => setCreated(null)} variant="secondary" style={{ marginLeft: '10px' }}>
                  Create Another
                </RetroButton>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <RetroInput
                  label="Room Name"
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                  placeholder="e.g., Period 3 - Algebra II"
                  required
                />
                <RetroInput
                  label="Teacher Name"
                  value={form.teacher_name}
                  onChange={(v) => setForm({ ...form, teacher_name: v })}
                  placeholder="e.g., Mr. Smith"
                />
                <RetroTextarea
                  label="Description (Optional)"
                  value={form.description}
                  onChange={(v) => setForm({ ...form, description: v })}
                  placeholder="Add any notes about this classroom..."
                  rows={3}
                />

                <div style={{ borderTop: '1px solid #cccccc', paddingTop: '15px', marginTop: '15px' }}>
                  <RetroButton type="submit" disabled={saving}>
                    {saving ? 'Creating...' : 'Create Classroom'}
                  </RetroButton>
                  <RetroButton 
                    onClick={() => window.location.href = createPageUrl('ManageRooms')} 
                    variant="secondary" 
                    style={{ marginLeft: '10px' }}
                  >
                    Cancel
                  </RetroButton>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}