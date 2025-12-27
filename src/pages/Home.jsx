import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import RetroButton from '@/components/RetroButton';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Home() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const user = await base44.auth.me();
        if (user.user_type === 'teacher' || user.user_type === 'superadmin' || user.role === 'admin') {
          window.location.href = createPageUrl('TeacherDashboard');
        } else {
          window.location.href = createPageUrl('StudentDashboard');
        }
      } else {
        setChecking(false);
      }
    } catch (e) {
      setChecking(false);
    }
  };

  const handleLogin = () => {
    base44.auth.redirectToLogin(createPageUrl('AuthRedirect'));
  };

  if (checking) {
    return <LoadingSpinner message="Loading FlashRun" />;
  }

  return (
    <div style={{
      fontFamily: 'Tahoma, Arial, sans-serif',
      fontSize: '12px',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <div style={{
        backgroundColor: '#003366',
        borderBottom: '2px solid #002244',
        padding: '10px 20px'
      }}>
        <table style={{ width: '100%' }}>
          <tbody>
            <tr>
              <td style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>
                FlashRun Secure Testing Browser
              </td>
              <td style={{ textAlign: 'right' }}>
                <RetroButton onClick={handleLogin} style={{ padding: '5px 20px' }}>
                  Sign In
                </RetroButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{
        backgroundColor: '#336699',
        padding: '5px 20px',
        borderBottom: '1px solid #4477aa',
        fontSize: '11px',
        color: '#99ccff'
      }}>
        District-Approved Secure Testing Platform | Version 2.1.4
      </div>

      <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #999999',
          marginBottom: '20px'
        }}>
          <div style={{
            backgroundColor: '#336699',
            color: 'white',
            padding: '10px 15px',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            Welcome to FlashRun
          </div>
          <div style={{ padding: '20px' }}>
            <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
              FlashRun Secure Testing Browser is the district's official platform for online assessments, 
              homework assignments, and classroom communication.
            </p>
            
            <table style={{ width: '100%', marginTop: '20px' }}>
              <tbody>
                <tr>
                  <td style={{ width: '50%', verticalAlign: 'top', paddingRight: '15px' }}>
                    <div style={{ border: '1px solid #cccccc', padding: '15px' }}>
                      <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#003366' }}>For Teachers</h3>
                      <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '11px', lineHeight: '1.8' }}>
                        <li>Create secure testing environments</li>
                        <li>Design multiple choice tests</li>
                        <li>Create varied assignments</li>
                        <li>Post class announcements</li>
                        <li>View detailed student results</li>
                        <li>Import/Export questions via JSON</li>
                      </ul>
                    </div>
                  </td>
                  <td style={{ width: '50%', verticalAlign: 'top', paddingLeft: '15px' }}>
                    <div style={{ border: '1px solid #cccccc', padding: '15px' }}>
                      <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#003366' }}>For Students</h3>
                      <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '11px', lineHeight: '1.8' }}>
                        <li>Join classes with a simple code</li>
                        <li>Take tests in a secure environment</li>
                        <li>Complete homework assignments</li>
                        <li>View class announcements</li>
                        <li>Track your progress and scores</li>
                        <li>Access from any computer</li>
                      </ul>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <div style={{ textAlign: 'center', marginTop: '30px' }}>
              <RetroButton onClick={handleLogin} style={{ padding: '10px 40px', fontSize: '13px' }}>
                Sign In to Get Started
              </RetroButton>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffcc',
          border: '1px solid #cccc00',
          padding: '15px',
          marginBottom: '20px'
        }}>
          <strong>System Requirements:</strong>
          <ul style={{ margin: '10px 0 0 20px', fontSize: '11px' }}>
            <li>Internet Explorer 7+ or Firefox 3+</li>
            <li>JavaScript enabled</li>
            <li>Cookies enabled</li>
            <li>Screen resolution: 1024x768 minimum</li>
          </ul>
        </div>

        <div style={{
          backgroundColor: '#e0e0e0',
          border: '1px solid #999999',
          padding: '15px',
          fontSize: '11px'
        }}>
          <strong>Technical Support:</strong> Contact your campus technology coordinator for login assistance. 
          For system issues, contact the District Technology Help Desk.
        </div>
      </div>

      <div style={{
        borderTop: '1px solid #999999',
        padding: '15px',
        textAlign: 'center',
        fontSize: '10px',
        color: '#666666',
        backgroundColor: '#e0e0e0',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0
      }}>
        FlashRun Secure Testing Browser v2.1.4 | District Technology Services | &copy; 2025 | Created 2008 | 
        <a href="#" style={{ color: '#003366', marginLeft: '10px' }}>Privacy Policy</a> | 
        <a href="#" style={{ color: '#003366', marginLeft: '10px' }}>Terms of Use</a> | 
        <a href="#" style={{ color: '#003366', marginLeft: '10px' }}>Acceptable Use Policy</a>
      </div>
    </div>
  );
}