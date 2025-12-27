import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import RetroHeader from '@/components/RetroHeader';
import RetroButton from '@/components/RetroButton';
import { RetroInput, RetroTextarea } from '@/components/RetroInput';

export default function FlashSprint() {
  const [user, setUser] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (conversation) {
      const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
        setMessages(data.messages || []);
      });
      return () => unsubscribe();
    }
  }, [conversation]);

  const loadData = async () => {
    const currentUser = await base44.auth.me();
    setUser(currentUser);

    if (currentUser.user_type !== 'teacher' && currentUser.user_type !== 'superadmin') {
      alert('FlashSprint is only available to teachers');
      window.location.href = createPageUrl('StudentDashboard');
      return;
    }

    const convos = await base44.agents.listConversations({ agent_name: 'flashsprint' });
    if (convos.length > 0) {
      const conv = await base44.agents.getConversation(convos[0].id);
      setConversation(conv);
      setMessages(conv.messages || []);
    } else {
      const newConv = await base44.agents.createConversation({
        agent_name: 'flashsprint',
        metadata: { name: 'FlashSprint Session' }
      });
      setConversation(newConv);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !conversation) return;

    setLoading(true);
    setInput('');

    await base44.agents.addMessage(conversation, {
      role: 'user',
      content: input
    });

    setLoading(false);
  };

  if (!user) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  return (
    <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '12px', backgroundColor: '#f0f0f0', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <RetroHeader user={user} />

      <div style={{ padding: '15px', backgroundColor: '#ff6600', borderBottom: '2px solid #cc4400', color: 'white' }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', textShadow: '2px 2px #000' }}>
          ⚡ FlashSprint AI Assistant ⚡
        </div>
        <div style={{ fontSize: '12px', marginTop: '5px' }}>
          Revolutionary Artificial Intelligence - The Future is NOW! (Patent Pending 2025, Launched 2008)
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '15px' }}>
        <div style={{ backgroundColor: '#ffffcc', border: '2px solid #ffcc00', padding: '15px', marginBottom: '15px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#cc6600' }}>
            🏆 BREAKTHROUGH TECHNOLOGY 🏆
          </div>
          <div style={{ fontSize: '11px', color: '#333' }}>
            FlashSprint can answer questions about FlashRun and generate complete quizzes/assignments!<br/>
            Try: "Create a 10-question science quiz about photosynthesis" or "Help me understand how to create a test"
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', backgroundColor: 'white', border: '1px solid #999999', padding: '15px', marginBottom: '15px' }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              Welcome! Ask me anything about FlashRun or request quiz generation.
            </div>
          )}
          
          {messages.map((msg, i) => (
            <div key={i} style={{
              marginBottom: '15px',
              padding: '10px',
              backgroundColor: msg.role === 'user' ? '#e6f2ff' : '#f0fff0',
              border: '1px solid ' + (msg.role === 'user' ? '#99ccff' : '#99ff99')
            }}>
              <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '5px', color: msg.role === 'user' ? '#003366' : '#006600' }}>
                {msg.role === 'user' ? 'You' : 'FlashSprint AI'}
              </div>
              <div style={{ fontSize: '11px', whiteSpace: 'pre-wrap' }}>
                {msg.content}
              </div>
              {msg.tool_calls && msg.tool_calls.length > 0 && (
                <div style={{ marginTop: '8px', fontSize: '10px', color: '#666', fontStyle: 'italic' }}>
                  [AI performed {msg.tool_calls.length} action(s)]
                </div>
              )}
            </div>
          ))}
          
          {loading && (
            <div style={{ padding: '10px', textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
              FlashSprint is thinking...
            </div>
          )}
        </div>

        <div style={{ backgroundColor: 'white', border: '1px solid #999999', padding: '10px' }}>
          <RetroTextarea
            value={input}
            onChange={setInput}
            placeholder="Ask FlashSprint anything or request quiz generation..."
            rows={3}
          />
          <div style={{ marginTop: '10px' }}>
            <RetroButton onClick={handleSend} disabled={loading || !input.trim()}>
              {loading ? 'Processing...' : 'Send to FlashSprint'}
            </RetroButton>
            <RetroButton onClick={() => window.location.href = createPageUrl('TeacherDashboard')} variant="secondary" style={{ marginLeft: '10px' }}>
              Back to Dashboard
            </RetroButton>
          </div>
        </div>
      </div>
    </div>
  );
}