import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import RetroHeader from '@/components/RetroHeader';
import RetroTable from '@/components/RetroTable';
import RetroButton from '@/components/RetroButton';
import { RetroSelect } from '@/components/RetroInput';

export default function SuperAdmin() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      if (currentUser.user_type !== 'superadmin') {
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

  if (loading) {
    return (
      <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '12px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
        <p style={{ padding: '20px' }}>Loading...</p>
      </div>
    );
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