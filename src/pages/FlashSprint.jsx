import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import RetroHeader from '@/components/RetroHeader';
import RetroButton from '@/components/RetroButton';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function FlashSprint() {
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeConvo) {
      const unsubscribe = base44.agents.subscribeToConversation(activeConvo.id, (data) => {
        setMessages(data.messages || []);
      });
      return () => unsubscribe();
    }
  }, [activeConvo]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadData = async () => {
    const currentUser = await base44.auth.me();
    setUser(currentUser);

    if (currentUser.user_type !== 'teacher' && currentUser.user_type !== 'superadmin') {
      alert('FlashSprint is only available to teachers');
      window.location.href = createPageUrl('StudentDashboard');
      return;
    }

    const convos = await base44.agents.listConversations({ agent_name: 'flashsprint' });
    setConversations(convos);
    
    if (convos.length > 0) {
      const conv = await base44.agents.getConversation(convos[0].id);
      setActiveConvo(conv);
      setMessages(conv.messages || []);
    }
    
    setLoading(false);
  };

  const createNewChat = async () => {
    const newConv = await base44.agents.createConversation({
      agent_name: 'flashsprint',
      metadata: { name: 'New Chat - ' + new Date().toLocaleString() }
    });
    setConversations([newConv, ...conversations]);
    setActiveConvo(newConv);
    setMessages([]);
  };

  const handleSend = async () => {
    if (!input.trim() || !activeConvo || sending) return;

    setSending(true);
    const userMessage = input;
    setInput('');

    await base44.agents.addMessage(activeConvo, {
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

  const formatText = (text) => {
    if (!text) return text;
    
    // Bold: **text**
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // Italic: *text*
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    // Headers: # Header
    text = text.replace(/^# (.+)$/gm, '<div style="font-size: 14px; font-weight: bold; margin: 10px 0;">$1</div>');
    
    // Bullet points: - item
    text = text.replace(/^- (.+)$/gm, '<div style="margin-left: 15px;">• $1</div>');
    
    // Numbered lists: 1. item
    text = text.replace(/^\d+\. (.+)$/gm, '<div style="margin-left: 15px;">$&</div>');
    
    return text;
  };

  if (loading) {
    return <LoadingSpinner message="Loading FlashSprint AI" />;
  }

  return (
    <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '12px', backgroundColor: '#f0f0f0', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <RetroHeader user={user} />

      <div style={{ padding: '10px', backgroundColor: '#ff6600', borderBottom: '2px solid #cc4400', color: 'white' }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', textShadow: '2px 2px #000' }}>
          ⚡ FlashSprint AI Assistant ⚡
        </div>
        <div style={{ fontSize: '11px', marginTop: '3px' }}>
          Revolutionary Artificial Intelligence - Patent Pending 2025, Launched 2008
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{ width: '200px', backgroundColor: '#e0e0e0', borderRight: '1px solid #999', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '10px', borderBottom: '1px solid #999' }}>
            <RetroButton onClick={createNewChat} style={{ width: '100%', padding: '5px' }}>
              + New Chat
            </RetroButton>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => {
                  setActiveConvo(conv);
                  base44.agents.getConversation(conv.id).then(c => setMessages(c.messages || []));
                }}
                style={{
                  padding: '8px',
                  cursor: 'pointer',
                  backgroundColor: activeConvo?.id === conv.id ? '#ffffff' : 'transparent',
                  borderBottom: '1px solid #ccc',
                  fontSize: '10px'
                }}
              >
                {conv.metadata?.name || 'Chat'}
              </div>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {!activeConvo ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
              Click "New Chat" to start
            </div>
          ) : (
            <>
              <div style={{ backgroundColor: '#ffffcc', border: '1px solid #ffcc00', padding: '8px', margin: '10px', fontSize: '10px' }}>
                <strong>Formatting:</strong> **bold** *italic* # Header - bullet 1. number | Shift+Enter: new line | Enter: send
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '15px', backgroundColor: 'white' }}>
                {messages.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    Ask FlashSprint anything about FlashRun or request quiz generation!
                  </div>
                )}
                
                {messages.map((msg, i) => (
                  <div key={i} style={{
                    marginBottom: '15px',
                    padding: '10px',
                    backgroundColor: msg.role === 'user' ? '#e6f2ff' : '#f0fff0',
                    border: '1px solid ' + (msg.role === 'user' ? '#99ccff' : '#99ff99'),
                    maxWidth: '85%',
                    marginLeft: msg.role === 'user' ? 'auto' : '0',
                    marginRight: msg.role === 'user' ? '0' : 'auto'
                  }}>
                    <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '5px', color: msg.role === 'user' ? '#003366' : '#006600' }}>
                      {msg.role === 'user' ? 'You' : 'FlashSprint AI'}
                    </div>
                    <div 
                      style={{ fontSize: '11px', whiteSpace: 'pre-wrap' }}
                      dangerouslySetInnerHTML={{ __html: formatText(msg.content) }}
                    />
                    {msg.tool_calls && msg.tool_calls.length > 0 && (
                      <div style={{ marginTop: '8px', fontSize: '10px', color: '#666', fontStyle: 'italic' }}>
                        [AI performed {msg.tool_calls.length} action(s)]
                      </div>
                    )}
                  </div>
                ))}
                
                {sending && (
                  <div style={{ padding: '10px', textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                    FlashSprint is thinking...
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div style={{ padding: '10px', borderTop: '1px solid #999', backgroundColor: '#f5f5f5' }}>
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message... (Shift+Enter for new line)"
                  style={{
                    width: '100%',
                    minHeight: '60px',
                    padding: '8px',
                    border: '1px solid #999',
                    fontFamily: 'Tahoma, Arial, sans-serif',
                    fontSize: '11px',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
                <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '10px', color: '#666' }}>
                    Supports **bold** *italic* # headers - bullets 1. numbers
                  </div>
                  <RetroButton onClick={handleSend} disabled={sending || !input.trim()}>
                    {sending ? 'Sending...' : 'Send to FlashSprint'}
                  </RetroButton>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}