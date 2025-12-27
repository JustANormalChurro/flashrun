import React from 'react';

export function RetroInput({ 
  label, 
  value, 
  onChange, 
  type = 'text', 
  placeholder = '',
  required = false,
  disabled = false,
  style = {}
}) {
  return (
    <div style={{ marginBottom: '10px' }}>
      {label && (
        <label style={{
          display: 'block',
          marginBottom: '3px',
          fontSize: '11px',
          fontWeight: 'bold',
          color: '#333333'
        }}>
          {label}{required && <span style={{ color: '#cc0000' }}> *</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '4px 6px',
          border: '1px solid #999999',
          fontFamily: 'Tahoma, Arial, sans-serif',
          fontSize: '11px',
          backgroundColor: disabled ? '#f0f0f0' : 'white',
          boxSizing: 'border-box',
          ...style
        }}
      />
    </div>
  );
}

export function RetroTextarea({ 
  label, 
  value, 
  onChange, 
  placeholder = '',
  rows = 4,
  required = false,
  disabled = false
}) {
  return (
    <div style={{ marginBottom: '10px' }}>
      {label && (
        <label style={{
          display: 'block',
          marginBottom: '3px',
          fontSize: '11px',
          fontWeight: 'bold',
          color: '#333333'
        }}>
          {label}{required && <span style={{ color: '#cc0000' }}> *</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        required={required}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '4px 6px',
          border: '1px solid #999999',
          fontFamily: 'Tahoma, Arial, sans-serif',
          fontSize: '11px',
          backgroundColor: disabled ? '#f0f0f0' : 'white',
          boxSizing: 'border-box',
          resize: 'vertical'
        }}
      />
    </div>
  );
}

export function RetroSelect({ 
  label, 
  value, 
  onChange, 
  options = [],
  required = false,
  disabled = false
}) {
  return (
    <div style={{ marginBottom: '10px' }}>
      {label && (
        <label style={{
          display: 'block',
          marginBottom: '3px',
          fontSize: '11px',
          fontWeight: 'bold',
          color: '#333333'
        }}>
          {label}{required && <span style={{ color: '#cc0000' }}> *</span>}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '4px 6px',
          border: '1px solid #999999',
          fontFamily: 'Tahoma, Arial, sans-serif',
          fontSize: '11px',
          backgroundColor: disabled ? '#f0f0f0' : 'white'
        }}
      >
        {options.map((opt, i) => (
          <option key={i} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

export function RetroCheckbox({ 
  label, 
  checked, 
  onChange, 
  disabled = false
}) {
  return (
    <div style={{ marginBottom: '8px' }}>
      <label style={{
        fontSize: '11px',
        color: '#333333',
        cursor: disabled ? 'not-allowed' : 'pointer'
      }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          style={{ marginRight: '5px' }}
        />
        {label}
      </label>
    </div>
  );
}