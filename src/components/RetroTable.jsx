import React from 'react';

export default function RetroTable({ headers, rows, onRowClick, emptyMessage = "No data available" }) {
  return (
    <table style={{
      width: '100%',
      borderCollapse: 'collapse',
      border: '1px solid #999999',
      backgroundColor: 'white'
    }}>
      <thead>
        <tr style={{ backgroundColor: '#e0e0e0' }}>
          {headers.map((header, i) => (
            <th key={i} style={{
              padding: '8px',
              textAlign: 'left',
              borderBottom: '2px solid #999999',
              borderRight: '1px solid #cccccc',
              fontSize: '11px',
              fontWeight: 'bold'
            }}>
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={headers.length} style={{
              padding: '20px',
              textAlign: 'center',
              color: '#666666',
              fontStyle: 'italic'
            }}>
              {emptyMessage}
            </td>
          </tr>
        ) : (
          rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={() => onRowClick && onRowClick(row)}
              style={{
                backgroundColor: rowIndex % 2 === 0 ? '#ffffff' : '#f5f5f5',
                cursor: onRowClick ? 'pointer' : 'default'
              }}
              onMouseOver={(e) => {
                if (onRowClick) e.currentTarget.style.backgroundColor = '#ffffcc';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = rowIndex % 2 === 0 ? '#ffffff' : '#f5f5f5';
              }}
            >
              {row.cells.map((cell, cellIndex) => (
                <td key={cellIndex} style={{
                  padding: '6px 8px',
                  borderBottom: '1px solid #dddddd',
                  borderRight: '1px solid #eeeeee',
                  fontSize: '11px'
                }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}