import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import RetroButton from '@/components/RetroButton';
import { RetroInput } from '@/components/RetroInput';

export default function StudentVerification() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', studentId: '' });
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      if (currentUser.is_verified) {
        window.location.href = createPageUrl('StudentDashboard');
        return;
      }
      
      if (currentUser.user_type === 'teacher' || currentUser.user_type === 'superadmin') {
        window.location.href = createPageUrl('TeacherDashboard');
        return;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError('');
    if (!form.name || !form.studentId) {
      setError('Please enter both name and student ID');
      return;
    }

    setVerifying(true);
    try {
      const allUsers = await base44.entities.User.list();
      const match = allUsers.find(u => 
        u.designated_name?.toLowerCase() === form.name.toLowerCase() &&
        u.student_id === form.studentId
      );

      if (match && match.id !== user.id) {
        setError('This student ID is already claimed by another account');
        setVerifying(false);
        return;
      }

      await base44.auth.updateMe({
        designated_name: form.name,
        student_id: form.studentId,
        is_verified: true,
        user_type: 'student'
      });

      window.location.href = createPageUrl('StudentDashboard');
    } catch (e) {
      setError('Verification failed. Please check your credentials with your administrator.');
      setVerifying(false);
    }
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
      <div style={{ backgroundColor: '#003366', borderBottom: '2px solid #002244', padding: '15px', color: 'white' }}>
        <h2 style={{ margin: 0, fontSize: '16px' }}>FlashRun Secure Testing Browser - Student Verification</h2>
      </div>
      
      <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ backgroundColor: 'white', border: '1px solid #999999' }}>
          <div style={{ backgroundColor: '#336699', color: 'white', padding: '10px', fontWeight: 'bold' }}>
            Student Identity Verification Required
          </div>
          <div style={{ padding: '20px' }}>
            <div style={{ backgroundColor: '#ffffcc', border: '1px solid #cccc00', padding: '12px', marginBottom: '20px', fontSize: '11px' }}>
              <strong>Security Notice:</strong> To access FlashRun, you must verify your identity using the credentials provided by your administrator.
            </div>

            {error && (
              <div style={{ backgroundColor: '#ffcccc', border: '1px solid #cc0000', padding: '10px', marginBottom: '15px', fontSize: '11px', color: '#cc0000' }}>
                <strong>Error:</strong> {error}
              </div>
            )}

            <RetroInput
              label="Your Full Name"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
              placeholder="Enter name as provided by administrator"
              required
            />
            
            <RetroInput
              label="Student ID"
              value={form.studentId}
              onChange={(v) => setForm({ ...form, studentId: v })}
              placeholder="Enter your 15-character secure student ID"
              required
            />

            <div style={{ marginTop: '20px', fontSize: '10px', color: '#666666' }}>
              <p>Your Student ID is a secure 15-character code provided by your school administrator.</p>
              <p>If you don't have these credentials, please contact your teacher or administrator.</p>
            </div>

            <div style={{ marginTop: '20px' }}>
              <RetroButton onClick={handleVerify} disabled={verifying}>
                {verifying ? 'Verifying...' : 'Verify Identity'}
              </RetroButton>
              <RetroButton 
                onClick={() => base44.auth.logout(createPageUrl('Home'))} 
                variant="secondary" 
                style={{ marginLeft: '10px' }}
              >
                Sign Out
              </RetroButton>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '10px', color: '#666666' }}>
          FlashRun Secure Testing Browser v2.1.4<br />
          District Technology Services | &copy; 2009
        </div>
      </div>
    </div>
  );
}