import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import RetroButton from '@/components/RetroButton';

export default function FloatingAI({ roomId, room }) {
  const [isOpen, setIsOpen] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && !conversation) {
      initConversation();
    }
  }, [isOpen]);

  useEffect(() => {
    if (conversation) {
      const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
        setMessages(data.messages || []);
      });
      return () => unsubscribe();
    }
  }, [conversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initConversation = async () => {
    const convos = await base44.agents.listConversations({ agent_name: 'flashrun_ai' });
    const roomConvos = convos.filter(c => c.metadata?.room_id === roomId);
    
    if (roomConvos.length > 0) {
      const conv = await base44.agents.getConversation(roomConvos[0].id);
      setConversation(conv);
      setMessages(conv.messages || []);
    } else {
      const newConv = await base44.agents.createConversation({
        agent_name: 'flashrun_ai',
        metadata: { 
          name: 'FlashRun AI - ' + room.name,
          room_id: roomId,
          room_name: room.name
        }
      });
      setConversation(newConv);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !conversation || sending) return;

    setSending(true);
    const userMessage = input;
    setInput('');

    await base44.agents.addMessage(conversation, {
      role: 'user',
      content: userMessage
    });

    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <div
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          backgroundColor: '#ff6600',
          border: '3px solid #cc4400',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
          zIndex: 1000,
          fontWeight: 'bold',
          color: 'white',
          fontSize: '14px',
          animation: 'pulse 2s infinite',
          fontFamily: 'Courier New, monospace'
        }}
        title="FlashRun AI Assistant"
      >
        <div style={{ textAlign: 'center', lineHeight: '1' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>AI</div>
          <div style={{ fontSize: '8px' }}>v2.1</div>
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '400px',
      height: '500px',
      backgroundColor: 'white',
      border: '2px solid #999999',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Tahoma, Arial, sans-serif',
      fontSize: '11px'
    }}>
      <div style={{
        backgroundColor: '#ff6600',
        color: 'white',
        padding: '10px',
        fontWeight: 'bold',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '2px solid #cc4400'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ 
            backgroundColor: 'white', 
            color: '#ff6600', 
            padding: '2px 6px', 
            borderRadius: '3px',
            fontSize: '10px',
            fontFamily: 'Courier New, monospace',
            fontWeight: 'bold'
          }}>AI</span>
          FlashRun AI - {room.name}
        </span>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '16px',
            cursor: 'pointer',
            padding: '0 5px'
          }}
        >
          X
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '10px', backgroundColor: '#f9f9f9' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            <div style={{ 
              backgroundColor: 'white', 
              color: '#ff6600', 
              padding: '4px 8px', 
              borderRadius: '3px',
              fontSize: '12px',
              fontFamily: 'Courier New, monospace',
              fontWeight: 'bold',
              display: 'inline-block',
              marginBottom: '10px'
            }}>AI v2.1</div>
            <div>Hi! I'm FlashRun AI, your classroom assistant. I can help you create tests and assignments, review existing content, and answer questions about this room.</div>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div key={i} style={{
            marginBottom: '10px',
            padding: '8px',
            backgroundColor: msg.role === 'user' ? '#e6f2ff' : '#f0fff0',
            border: '1px solid ' + (msg.role === 'user' ? '#99ccff' : '#99ff99'),
            borderRadius: '4px',
            maxWidth: '85%',
            marginLeft: msg.role === 'user' ? 'auto' : '0',
            marginRight: msg.role === 'user' ? '0' : 'auto'
          }}>
            <div style={{ fontSize: '9px', fontWeight: 'bold', marginBottom: '3px', color: msg.role === 'user' ? '#003366' : '#006600' }}>
              {msg.role === 'user' ? 'You' : 'FlashRun AI'}
            </div>
            <div style={{ fontSize: '11px', whiteSpace: 'pre-wrap' }}>
              {msg.content}
            </div>
            {msg.tool_calls && msg.tool_calls.length > 0 && (
              <div style={{ marginTop: '5px', fontSize: '9px', color: '#666', fontStyle: 'italic' }}>
                [Performed {msg.tool_calls.length} action(s)]
              </div>
            )}
          </div>
        ))}
        
        {sending && (
          <div style={{ padding: '8px', textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
            FlashRun AI is thinking...
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: '8px', borderTop: '1px solid #999', backgroundColor: 'white' }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask FlashRun AI... (Shift+Enter for new line)"
          style={{
            width: '100%',
            minHeight: '50px',
            padding: '6px',
            border: '1px solid #999',
            fontFamily: 'Tahoma, Arial, sans-serif',
            fontSize: '11px',
            resize: 'vertical',
            boxSizing: 'border-box'
          }}
        />
        <div style={{ marginTop: '5px' }}>
          <RetroButton onClick={handleSend} disabled={sending || !input.trim()} style={{ padding: '4px 12px', fontSize: '10px' }}>
            {sending ? 'Sending...' : 'Send'}
          </RetroButton>
        </div>
      </div>
    </div>
  );
}