import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import RetroHeader from '@/components/RetroHeader';
import RetroTable from '@/components/RetroTable';
import RetroButton from '@/components/RetroButton';
import { RetroInput } from '@/components/RetroInput';

export default function ManageStudents() {
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newStudent, setNewStudent] = useState({ email: '', full_name: '', student_id: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      const allUsers = await base44.entities.User.list();
      const studentUsers = allUsers.filter(u => u.user_type === 'student' || (!u.user_type && u.role !== 'admin'));
      setStudents(studentUsers);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteStudent = async () => {
    if (!newStudent.email.trim()) {
      alert('Email is required');
      return;
    }
    
    setCreating(true);
    try {
      await base44.users.inviteUser(newStudent.email, 'user');
      alert('Invitation sent to ' + newStudent.email);
      setShowCreate(false);
      setNewStudent({ email: '', full_name: '', student_id: '' });
      loadData();
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '12px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
        <p style={{ padding: '20px' }}>Loading...</p>
      </div>
    );
  }

  const studentRows = students.map(s => ({
    data: s,
    cells: [
      s.full_name || '-',
      s.email,
      s.student_id || '-',
      s.is_suspended ? <span style={{ color: '#cc0000' }}>Suspended</span> : <span style={{ color: '#006600' }}>Active</span>,
      new Date(s.created_date).toLocaleDateString()
    ]
  }));

  return (
    <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '12px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <RetroHeader user={user} />
      
      <div style={{ padding: '15px' }}>
        <div style={{ backgroundColor: 'white', border: '1px solid #999999' }}>
          <div style={{ backgroundColor: '#336699', color: 'white', padding: '8px', fontWeight: 'bold', fontSize: '12px' }}>
            Manage Students
          </div>
          <div style={{ padding: '15px' }}>
            <div style={{ marginBottom: '15px' }}>
              <RetroButton onClick={() => setShowCreate(!showCreate)}>
                {showCreate ? 'Cancel' : '+ Invite New Student'}
              </RetroButton>
            </div>

            {showCreate && (
              <div style={{ backgroundColor: '#f5f5f5', border: '1px solid #cccccc', padding: '15px', marginBottom: '15px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Invite Student</div>
                <RetroInput
                  label="Student Email"
                  value={newStudent.email}
                  onChange={(v) => setNewStudent({ ...newStudent, email: v })}
                  placeholder="student@school.edu"
                  required
                />
                <div style={{ fontSize: '10px', color: '#666666', marginBottom: '10px' }}>
                  An invitation email will be sent to this address.
                </div>
                <RetroButton onClick={handleInviteStudent} disabled={creating}>
                  {creating ? 'Sending...' : 'Send Invitation'}
                </RetroButton>
              </div>
            )}

            <RetroTable
              headers={['Name', 'Email', 'Student ID', 'Status', 'Joined']}
              rows={studentRows}
              emptyMessage="No students found"
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