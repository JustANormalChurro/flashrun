import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

export default function AuthRedirect() {
  useEffect(() => {
    const redirect = async () => {
      try {
        const user = await base44.auth.me();
        if (user.user_type === 'teacher' || user.user_type === 'superadmin' || user.role === 'admin') {
          window.location.href = createPageUrl('TeacherDashboard');
        } else {
          window.location.href = createPageUrl('StudentDashboard');
        }
      } catch (e) {
        window.location.href = createPageUrl('Login');
      }
    };
    redirect();
  }, []);

  return (
    <div style={{
      fontFamily: 'Tahoma, Arial, sans-serif',
      fontSize: '12px',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #999999',
        padding: '20px',
        textAlign: 'center'
      }}>
        <p>Redirecting to your dashboard...</p>
        <p style={{ fontSize: '10px', color: '#666666' }}>Please wait</p>
      </div>
    </div>
  );
}