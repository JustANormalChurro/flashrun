import React from 'react';
import { createPageUrl } from '@/utils';
import RetroButton from '@/components/RetroButton';

export default function Orvit() {
  return (
    <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '12px', backgroundColor: '#003366', minHeight: '100vh', color: 'white' }}>
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '10px', color: '#99ff99', textShadow: '2px 2px #000' }}>
            Orvit by FlashRun
          </div>
          <div style={{ fontSize: '18px', marginBottom: '30px', color: '#cccccc' }}>
            Revolutionary Teacher Collaboration Platform
          </div>
          
          <div style={{ backgroundColor: '#004488', border: '2px solid #0066cc', padding: '30px', marginBottom: '30px' }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px', color: '#99ff99' }}>
              ⚡ The Future of Educational Communication - Today! ⚡
            </div>
            
            <div style={{ textAlign: 'left', fontSize: '13px', lineHeight: '1.8' }}>
              <div style={{ marginBottom: '15px' }}>
                <span style={{ color: '#ffcc00', fontWeight: 'bold' }}>► </span>
                Create and join secure chat rooms with unique access codes
              </div>
              <div style={{ marginBottom: '15px' }}>
                <span style={{ color: '#ffcc00', fontWeight: 'bold' }}>► </span>
                Collaborate with fellow educators in real-time
              </div>
              <div style={{ marginBottom: '15px' }}>
                <span style={{ color: '#ffcc00', fontWeight: 'bold' }}>► </span>
                Share files, discuss curriculum, plan assignments
              </div>
              <div style={{ marginBottom: '15px' }}>
                <span style={{ color: '#ffcc00', fontWeight: 'bold' }}>► </span>
                Build your professional network with the Friend system
              </div>
              <div style={{ marginBottom: '15px' }}>
                <span style={{ color: '#ffcc00', fontWeight: 'bold' }}>► </span>
                Advanced moderation tools for room owners
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffcc', color: '#333', padding: '20px', border: '2px solid #ffcc00', marginBottom: '30px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '10px' }}>
              🏆 BREAKTHROUGH TECHNOLOGY - 2008 🏆
            </div>
            <div style={{ fontSize: '11px' }}>
              Winner: Innovation in Educational Technology Award<br/>
              "The most advanced teacher communication system ever created"
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <RetroButton 
              onClick={() => window.location.href = createPageUrl('OrbitRooms')}
              variant="success"
              style={{ padding: '12px 30px', fontSize: '14px', fontWeight: 'bold' }}
            >
              Enter Orvit
            </RetroButton>
            <RetroButton 
              onClick={() => window.location.href = createPageUrl('TeacherDashboard')}
              variant="secondary"
              style={{ padding: '12px 30px', fontSize: '14px' }}
            >
              Back to Dashboard
            </RetroButton>
          </div>

          <div style={{ marginTop: '40px', fontSize: '10px', color: '#999999' }}>
            Orvit™ - Powered by FlashRun Secure Testing Browser<br/>
            Patent Pending Technology | © 2008
          </div>
        </div>
      </div>
    </div>
  );
}