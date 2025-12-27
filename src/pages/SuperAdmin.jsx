import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import RetroHeader from '@/components/RetroHeader';
import RetroTable from '@/components/RetroTable';
import RetroButton from '@/components/RetroButton';
import { RetroSelect, RetroInput } from '@/components/RetroInput';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function SuperAdmin() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({ designated_name: '', student_id: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      if (currentUser.user_type !== 'superadmin' && currentUser.email !== 'admin.simplstream@protonmail.com') {
        window.location.href = createPageUrl('TeacherDashboard');
        return;
      }

      const allUsers = await base44.entities.User.list();
      setUsers(allUsers);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setSaving(true);
    await base44.entities.User.update(userId, { user_type: newRole });
    await loadData();
    setEditingUser(null);
    setSaving(false);
  };

  const handleSuspend = async (userId, suspend) => {
    if (suspend && !window.confirm('Are you sure you want to suspend this account?')) return;
    await base44.entities.User.update(userId, { is_suspended: suspend });
    loadData();
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this account? This action cannot be undone.')) return;
    await base44.entities.User.delete(userId);
    loadData();
  };

  const generateSecureId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let id = '';
    for (let i = 0; i < 15; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  };

  const handleAddDesignatedStudent = async () => {
    if (!newStudent.designated_name || !newStudent.student_id) {
      alert('Please fill in both name and student ID');
      return;
    }
    
    const existing = users.find(u => u.student_id === newStudent.student_id);
    if (existing) {
      alert('Student ID already exists');
      return;
    }

    const designation = {
      designated_name: newStudent.designated_name,
      student_id: newStudent.student_id,
      created_by_admin: user.email,
      created_at: new Date().toISOString()
    };
    
    alert(`Designated Student Created:\n\nName: ${designation.designated_name}\nStudent ID: ${designation.student_id}\n\nThis student must verify with these credentials when they first sign in.`);
    
    setNewStudent({ designated_name: '', student_id: '' });
    setShowAddStudent(false);
  };

  if (loading) {
    return <LoadingSpinner message="Loading Admin Panel" />;
  }

  const userRows = users.filter(u => u.id !== user.id).map(u => ({
    data: u,
    cells: [
      u.full_name || '-',
      u.email,
      u.teacher_id || u.student_id || '-',
      <span style={{ 
        color: u.user_type === 'superadmin' ? '#cc6600' : (u.user_type === 'teacher' ? '#003366' : '#006600'),
        fontWeight: 'bold'
      }}>
        {(u.user_type || 'student').toUpperCase()}
      </span>,
      u.is_suspended ? (
        <span style={{ color: '#cc0000' }}>SUSPENDED</span>
      ) : (
        <span style={{ color: '#006600' }}>Active</span>
      ),
      <>
        {editingUser === u.id ? (
          <span>
            <select
              onChange={(e) => handleRoleChange(u.id, e.target.value)}
              defaultValue={u.user_type || 'student'}
              style={{ padding: '2px', fontSize: '10px', marginRight: '5px' }}
              disabled={saving}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="superadmin">SuperAdmin</option>
            </select>
            <a href="#" onClick={(e) => { e.preventDefault(); setEditingUser(null); }} style={{ color: '#666666', fontSize: '10px' }}>Cancel</a>
          </span>
        ) : (
          <>
            <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingUser(u.id); }} style={{ color: '#003366', marginRight: '10px', fontSize: '10px' }}>
              Change Role
            </a>
            {u.is_suspended ? (
              <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSuspend(u.id, false); }} style={{ color: '#006600', marginRight: '10px', fontSize: '10px' }}>
                Unsuspend
              </a>
            ) : (
              <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSuspend(u.id, true); }} style={{ color: '#cc6600', marginRight: '10px', fontSize: '10px' }}>
                Suspend
              </a>
            )}
            <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(u.id); }} style={{ color: '#cc0000', fontSize: '10px' }}>
              Delete
            </a>
          </>
        )}
      </>
    ]
  }));

  return (
    <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '12px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <RetroHeader user={user} />
      
      <div style={{ padding: '15px' }}>
        <div style={{ backgroundColor: '#ffcccc', border: '1px solid #cc0000', padding: '10px', marginBottom: '15px', fontSize: '11px' }}>
          <strong>SuperAdmin Panel</strong> - You have elevated privileges. Changes made here affect all users.
        </div>

        <div style={{ backgroundColor: 'white', border: '1px solid #999999', marginBottom: '15px' }}>
          <div style={{ backgroundColor: '#cc0000', color: 'white', padding: '8px', fontWeight: 'bold', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Designated Students</span>
            <RetroButton onClick={() => setShowAddStudent(!showAddStudent)} variant="secondary" style={{ padding: '3px 10px' }}>
              + Create Student Designation
            </RetroButton>
          </div>
          {showAddStudent && (
            <div style={{ padding: '15px', backgroundColor: '#ffffee', borderBottom: '1px solid #cccc00' }}>
              <RetroInput
                label="Student Name"
                value={newStudent.designated_name}
                onChange={(v) => setNewStudent({ ...newStudent, designated_name: v })}
                placeholder="Full name as it should appear"
              />
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <RetroInput
                    label="Student ID (15 characters secure)"
                    value={newStudent.student_id}
                    onChange={(v) => setNewStudent({ ...newStudent, student_id: v })}
                    placeholder="e.g., Xk9#mP2$vN7!Qr3"
                  />
                </div>
                <RetroButton onClick={() => setNewStudent({ ...newStudent, student_id: generateSecureId() })} variant="secondary">
                  Generate
                </RetroButton>
              </div>
              <div style={{ marginTop: '10px' }}>
                <RetroButton onClick={handleAddDesignatedStudent}>
                  Create Designation
                </RetroButton>
                <RetroButton onClick={() => { setShowAddStudent(false); setNewStudent({ designated_name: '', student_id: '' }); }} variant="secondary" style={{ marginLeft: '10px' }}>
                  Cancel
                </RetroButton>
              </div>
              <div style={{ marginTop: '10px', fontSize: '10px', color: '#666' }}>
                Note: Student must verify with this name and ID on first sign in. Store this information securely.
              </div>
            </div>
          )}
        </div>

        <div style={{ backgroundColor: 'white', border: '1px solid #999999' }}>
          <div style={{ backgroundColor: '#cc0000', color: 'white', padding: '8px', fontWeight: 'bold', fontSize: '12px' }}>
            User Management ({users.length - 1} users)
          </div>
          <div style={{ padding: '15px' }}>
            <RetroTable
              headers={['Name', 'Email', 'ID', 'Role', 'Status', 'Actions']}
              rows={userRows}
              emptyMessage="No other users found"
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