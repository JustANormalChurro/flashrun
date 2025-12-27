import React from 'react';

export default function RetroButton({ 
  children, 
  onClick, 
  variant = 'primary', 
  disabled = false,
  type = 'button',
  style = {}
}) {
  const baseStyle = {
    padding: '5px 15px',
    fontFamily: 'Tahoma, Arial, sans-serif',
    fontSize: '11px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    border: '1px solid',
    ...style
  };

  const variants = {
    primary: {
      backgroundColor: disabled ? '#999999' : '#003366',
      color: 'white',
      borderColor: '#002244'
    },
    secondary: {
      backgroundColor: disabled ? '#cccccc' : '#e0e0e0',
      color: '#333333',
      borderColor: '#999999'
    },
    danger: {
      backgroundColor: disabled ? '#cc9999' : '#cc0000',
      color: 'white',
      borderColor: '#990000'
    },
    success: {
      backgroundColor: disabled ? '#99cc99' : '#006600',
      color: 'white',
      borderColor: '#004400'
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ ...baseStyle, ...variants[variant] }}
    >
      {children}
    </button>
  );
}