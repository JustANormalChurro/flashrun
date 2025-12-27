import React from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

export default function RetroHeader({ user, title = "EduTest Secure Testing Browser" }) {
  const handleLogout = () => {
    base44.auth.logout(createPageUrl('Login'));
  };

  return (
    <div style={{
      backgroundColor: '#003366',
      borderBottom: '2px solid #002244'
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td style={{ padding: '10px', color: 'white', fontWeight: 'bold', fontSize: '16px' }}>
              {title}
            </td>
            <td style={{ padding: '10px', textAlign: 'right', color: 'white', fontSize: '11px' }}>
              {user && (
                <>
                  Logged in as: <strong>{user.full_name || user.email}</strong>
                  {user.teacher_id && <span> | ID: {user.teacher_id}</span>}
                  {user.user_type && <span> | Role: {user.user_type.toUpperCase()}</span>}
                  <span> | </span>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); handleLogout(); }}
                    style={{ color: '#99ccff', textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    Sign Out
                  </a>
                </>
              )}
            </td>
          </tr>
        </tbody>
      </table>
      <div style={{
        backgroundColor: '#336699',
        padding: '5px 10px',
        borderTop: '1px solid #4477aa'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ fontSize: '11px' }}>
                {user?.user_type === 'teacher' || user?.user_type === 'superadmin' || user?.role === 'admin' ? (
                  <>
                    <a href={createPageUrl('TeacherDashboard')} style={{ color: 'white', marginRight: '15px' }}>Dashboard</a>
                    <a href={createPageUrl('ManageRooms')} style={{ color: 'white', marginRight: '15px' }}>My Rooms</a>
                    <a href={createPageUrl('ManageStudents')} style={{ color: 'white', marginRight: '15px' }}>Students</a>
                    <a href={createPageUrl('TeacherHelp')} style={{ color: 'white', marginRight: '15px' }}>Help & Docs</a>
                    {user?.user_type === 'superadmin' && (
                      <a href={createPageUrl('SuperAdmin')} style={{ color: '#ffcc00', marginRight: '15px' }}>Admin Panel</a>
                    )}
                  </>
                ) : (
                  <>
                    <a href={createPageUrl('StudentDashboard')} style={{ color: 'white', marginRight: '15px' }}>My Classes</a>
                    <a href={createPageUrl('JoinRoom')} style={{ color: 'white', marginRight: '15px' }}>Join Class</a>
                  </>
                )}
              </td>
              <td style={{ textAlign: 'right', fontSize: '10px', color: '#99ccff' }}>
                {new Date().toLocaleDateString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}