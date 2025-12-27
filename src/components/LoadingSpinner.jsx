import React from 'react';

export default function LoadingSpinner({ message = "Loading" }) {
  return (
    <div style={{
      fontFamily: 'Tahoma, Arial, sans-serif',
      fontSize: '12px',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column'
    }}>
      <div style={{ position: 'relative', width: '80px', height: '80px' }}>
        {/* Outer spinning border */}
        <div style={{
          position: 'absolute',
          width: '80px',
          height: '80px',
          border: '4px solid #003366',
          borderTop: '4px solid #99ccff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        
        {/* Inner spinning element */}
        <div style={{
          position: 'absolute',
          width: '50px',
          height: '50px',
          top: '15px',
          left: '15px',
          border: '3px solid #336699',
          borderBottom: '3px solid #66aaff',
          borderRadius: '50%',
          animation: 'spin 1.5s linear infinite reverse'
        }} />
        
        {/* Center dot */}
        <div style={{
          position: 'absolute',
          width: '12px',
          height: '12px',
          top: '34px',
          left: '34px',
          backgroundColor: '#003366',
          borderRadius: '50%',
          animation: 'pulse 1s ease-in-out infinite'
        }} />
      </div>
      
      <div style={{
        marginTop: '20px',
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#003366'
      }}>
        {message}
      </div>
      
      <div style={{
        marginTop: '5px',
        fontSize: '10px',
        color: '#666666'
      }}>
        FlashRun Secure Testing Browser v2.1.4
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
}