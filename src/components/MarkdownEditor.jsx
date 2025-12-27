import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function MarkdownEditor({ value, onChange }) {
  const [showPreview, setShowPreview] = useState(false);

  const insertFormat = (before, after = '') => {
    const textarea = document.getElementById('markdown-editor');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    onChange(newText);
  };

  const toolbarButtons = [
    { label: 'B', title: 'Bold', action: () => insertFormat('**', '**') },
    { label: 'I', title: 'Italic', action: () => insertFormat('*', '*') },
    { label: 'U', title: 'Underline', action: () => insertFormat('<u>', '</u>') },
    { label: 'H1', title: 'Header 1', action: () => insertFormat('# ') },
    { label: 'H2', title: 'Header 2', action: () => insertFormat('## ') },
    { label: 'H3', title: 'Header 3', action: () => insertFormat('### ') },
    { label: '•', title: 'Bullet List', action: () => insertFormat('- ') },
    { label: '1.', title: 'Number List', action: () => insertFormat('1. ') },
    { label: 'Link', title: 'Insert Link', action: () => insertFormat('[', '](url)') },
    { label: 'Img', title: 'Insert Image', action: () => insertFormat('![alt](', ')') },
    { label: 'Red', title: 'Red Text', action: () => insertFormat('<span style="color:red">', '</span>') },
    { label: 'Blue', title: 'Blue Text', action: () => insertFormat('<span style="color:blue">', '</span>') },
    { label: 'Green', title: 'Green Text', action: () => insertFormat('<span style="color:green">', '</span>') }
  ];

  return (
    <div style={{ border: '1px solid #999999' }}>
      <div style={{ backgroundColor: '#e0e0e0', padding: '5px', borderBottom: '1px solid #999999', display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
        {toolbarButtons.map((btn, i) => (
          <button
            key={i}
            type="button"
            title={btn.title}
            onClick={btn.action}
            style={{
              padding: '3px 8px',
              backgroundColor: '#f0f0f0',
              border: '1px solid #999999',
              cursor: 'pointer',
              fontFamily: 'Tahoma, Arial, sans-serif',
              fontSize: '10px',
              fontWeight: btn.label === 'B' ? 'bold' : 'normal',
              fontStyle: btn.label === 'I' ? 'italic' : 'normal',
              textDecoration: btn.label === 'U' ? 'underline' : 'none'
            }}
          >
            {btn.label}
          </button>
        ))}
        <span style={{ marginLeft: 'auto' }}>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            style={{
              padding: '3px 8px',
              backgroundColor: showPreview ? '#003366' : '#f0f0f0',
              color: showPreview ? 'white' : '#333333',
              border: '1px solid #999999',
              cursor: 'pointer',
              fontFamily: 'Tahoma, Arial, sans-serif',
              fontSize: '10px'
            }}
          >
            {showPreview ? 'Edit' : 'Preview'}
          </button>
        </span>
      </div>

      {showPreview ? (
        <div style={{
          padding: '10px',
          minHeight: '200px',
          backgroundColor: 'white',
          fontFamily: 'Tahoma, Arial, sans-serif',
          fontSize: '12px'
        }}>
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h1 style={{ fontSize: '18px', fontWeight: 'bold', margin: '10px 0' }}>{children}</h1>,
              h2: ({ children }) => <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: '8px 0' }}>{children}</h2>,
              h3: ({ children }) => <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '6px 0' }}>{children}</h3>,
              p: ({ children }) => <p style={{ margin: '5px 0' }}>{children}</p>,
              ul: ({ children }) => <ul style={{ marginLeft: '20px', listStyle: 'disc' }}>{children}</ul>,
              ol: ({ children }) => <ol style={{ marginLeft: '20px', listStyle: 'decimal' }}>{children}</ol>,
              a: ({ href, children }) => <a href={href} style={{ color: '#003366', textDecoration: 'underline' }}>{children}</a>,
              img: ({ src, alt }) => <img src={src} alt={alt} style={{ maxWidth: '100%', border: '1px solid #cccccc' }} />
            }}
          >
            {value || '*No content*'}
          </ReactMarkdown>
        </div>
      ) : (
        <textarea
          id="markdown-editor"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write your announcement here... Use the toolbar above for formatting."
          style={{
            width: '100%',
            minHeight: '200px',
            padding: '10px',
            border: 'none',
            fontFamily: 'Courier New, monospace',
            fontSize: '12px',
            resize: 'vertical',
            boxSizing: 'border-box'
          }}
        />
      )}

      <div style={{ backgroundColor: '#f5f5f5', padding: '5px 10px', borderTop: '1px solid #dddddd', fontSize: '10px', color: '#666666' }}>
        Supports Markdown formatting. Use toolbar or type: **bold**, *italic*, # Header, - list, [link](url), ![image](url)
      </div>
    </div>
  );
}