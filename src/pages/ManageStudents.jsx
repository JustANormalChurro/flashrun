import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import RetroHeader from '@/components/RetroHeader';
import RetroTable from '@/components/RetroTable';
import RetroButton from '@/components/RetroButton';
import { RetroInput, RetroSelect } from '@/components/RetroInput';

export default function ManageStudents() {
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [inviteRole, setInviteRole] = useState('user');
  const [newUser, setNewUser] = useState({ email: '' });
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState('students');

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
      
      const teacherUsers = allUsers.filter(u => u.user_type === 'teacher' || u.role === 'admin');
      setTeachers(teacherUsers);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!newUser.email.trim()) {
      alert('Email is required');
      return;
    }
    
    setCreating(true);
    try {
      await base44.users.inviteUser(newUser.email, inviteRole);
      alert('Invitation sent to ' + newUser.email + ' as ' + (inviteRole === 'admin' ? 'teacher' : 'student'));
      setShowCreate(false);
      setNewUser({ email: '' });
      loadData();
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading Students" />;
  }

  const isSuperAdmin = user?.user_type === 'superadmin' || user?.email === 'admin.simplstream@protonmail.com';

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

  const teacherRows = teachers.map(t => ({
    data: t,
    cells: [
      t.full_name || '-',
      t.email,
      t.teacher_id || '-',
      t.user_type === 'superadmin' ? <span style={{ color: '#cc6600', fontWeight: 'bold' }}>SUPERADMIN</span> : <span style={{ color: '#003366' }}>Teacher</span>,
      new Date(t.created_date).toLocaleDateString()
    ]
  }));

  const tabStyle = (tab) => ({
    padding: '8px 15px',
    backgroundColor: activeTab === tab ? 'white' : '#e0e0e0',
    border: '1px solid #999999',
    borderBottom: activeTab === tab ? 'none' : '1px solid #999999',
    cursor: 'pointer',
    marginRight: '2px',
    fontSize: '11px',
    fontWeight: activeTab === tab ? 'bold' : 'normal'
  });

  return (
    <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '12px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <RetroHeader user={user} />
      
      <div style={{ padding: '15px' }}>
        {isSuperAdmin && (
          <div style={{ backgroundColor: '#ffffcc', border: '1px solid #cccc00', padding: '10px', marginBottom: '15px', fontSize: '11px' }}>
            <strong>Super Admin Access:</strong> You can invite both students and teachers.
          </div>
        )}

        <div style={{ marginBottom: '-1px' }}>
          <span style={tabStyle('students')} onClick={() => setActiveTab('students')}>Students ({students.length})</span>
          {isSuperAdmin && (
            <span style={tabStyle('teachers')} onClick={() => setActiveTab('teachers')}>Teachers ({teachers.length})</span>
          )}
        </div>

        <div style={{ backgroundColor: 'white', border: '1px solid #999999' }}>
          <div style={{ backgroundColor: '#336699', color: 'white', padding: '8px', fontWeight: 'bold', fontSize: '12px' }}>
            Manage {activeTab === 'students' ? 'Students' : 'Teachers'}
          </div>
          <div style={{ padding: '15px' }}>
            <div style={{ marginBottom: '15px' }}>
              <RetroButton onClick={() => { setShowCreate(!showCreate); setInviteRole(activeTab === 'students' ? 'user' : 'admin'); }}>
                {showCreate ? 'Cancel' : `+ Invite New ${activeTab === 'students' ? 'Student' : 'Teacher'}`}
              </RetroButton>
            </div>

            {showCreate && (
              <div style={{ backgroundColor: '#f5f5f5', border: '1px solid #cccccc', padding: '15px', marginBottom: '15px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
                  Invite {activeTab === 'students' ? 'Student' : 'Teacher'}
                </div>
                <RetroInput
                  label="Email Address"
                  value={newUser.email}
                  onChange={(v) => setNewUser({ email: v })}
                  placeholder={activeTab === 'students' ? 'student@school.edu' : 'teacher@school.edu'}
                  required
                />
                <div style={{ fontSize: '10px', color: '#666666', marginBottom: '10px' }}>
                  An invitation email will be sent to this address.
                </div>
                <RetroButton onClick={handleInvite} disabled={creating}>
                  {creating ? 'Sending...' : 'Send Invitation'}
                </RetroButton>
              </div>
            )}

            {activeTab === 'students' && (
              <RetroTable
                headers={['Name', 'Email', 'Student ID', 'Status', 'Joined']}
                rows={studentRows}
                emptyMessage="No students found"
              />
            )}

            {activeTab === 'teachers' && (
              <RetroTable
                headers={['Name', 'Email', 'Teacher ID', 'Role', 'Joined']}
                rows={teacherRows}
                emptyMessage="No teachers found"
              />
            )}
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