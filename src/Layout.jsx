import React from 'react';

export default function Layout({ children }) {
  return (
    <div style={{ 
      fontFamily: 'Tahoma, Arial, sans-serif', 
      fontSize: '12px',
      minHeight: '100vh'
    }}>
      {children}
    </div>
  );
}