import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import RetroHeader from '@/components/RetroHeader';
import RetroButton from '@/components/RetroButton';
import RetroTable from '@/components/RetroTable';
import { RetroInput, RetroTextarea } from '@/components/RetroInput';

export default function DirectMessages() {
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showStart, setShowStart] = useState(false);
  const [targetId, setTargetId] = useState('');
  const [students, setStudents] = useState([]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedConvo) {
      loadMessages();
    }
  }, [selectedConvo]);

  const loadData = async () => {
    const currentUser = await base44.auth.me();
    setUser(currentUser);

    if (currentUser.user_type === 'teacher' || currentUser.user_type === 'superadmin') {
      const allUsers = await base44.entities.User.list();
      setStudents(allUsers.filter(u => u.user_type === 'student' && u.is_verified));
    }

    loadConversations();
  };

  const loadConversations = async () => {
    if (!user) return;
    
    const allDMs = await base44.entities.DirectMessage.list('-created_date', 200);
    const myDMs = allDMs.filter(dm => dm.sender_id === user.id || dm.receiver_id === user.id);
    
    const convoMap = {};
    myDMs.forEach(dm => {
      if (!convoMap[dm.conversation_id]) {
        const otherUserId = dm.sender_id === user.id ? dm.receiver_id : dm.sender_id;
        const otherUserName = dm.sender_id === user.id ? dm.receiver_name : dm.sender_name;
        convoMap[dm.conversation_id] = {
          id: dm.conversation_id,
          otherUserId,
          otherUserName,
          lastMessage: dm.message,
          lastDate: dm.created_date,
          unread: dm.receiver_id === user.id && !dm.is_read ? 1 : 0
        };
      } else {
        if (dm.receiver_id === user.id && !dm.is_read) {
          convoMap[dm.conversation_id].unread++;
        }
      }
    });

    setConversations(Object.values(convoMap).sort((a, b) => new Date(b.lastDate) - new Date(a.lastDate)));
  };

  const loadMessages = async () => {
    if (!selectedConvo) return;
    
    const msgs = await base44.entities.DirectMessage.filter({ conversation_id: selectedConvo.id }, 'created_date', 100);
    setMessages(msgs);

    const unreadMsgs = msgs.filter(m => m.receiver_id === user.id && !m.is_read);
    for (const msg of unreadMsgs) {
      await base44.entities.DirectMessage.update(msg.id, { is_read: true });
    }
    
    loadConversations();
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConvo) return;

    await base44.entities.DirectMessage.create({
      conversation_id: selectedConvo.id,
      sender_id: user.id,
      sender_name: user.full_name || user.email,
      receiver_id: selectedConvo.otherUserId,
      receiver_name: selectedConvo.otherUserName,
      message: newMessage
    });

    await base44.integrations.Core.SendEmail({
      to: selectedConvo.otherUserName,
      subject: 'New message from ' + (user.full_name || user.email),
      body: 'You have a new message in FlashRun. Log in to view it.'
    });

    setNewMessage('');
    loadMessages();
  };

  const handleStartConvo = async () => {
    if (!targetId) {
      alert('Enter student ID');
      return;
    }

    const targetUser = students.find(s => s.student_id === targetId);
    if (!targetUser) {
      alert('Student not found');
      return;
    }

    const convoId = [user.id, targetUser.id].sort().join('_');
    const newConvo = {
      id: convoId,
      otherUserId: targetUser.id,
      otherUserName: targetUser.full_name || targetUser.email
    };

    setSelectedConvo(newConvo);
    setShowStart(false);
    setTargetId('');
  };

  if (!user) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  const convoRows = conversations.map(c => ({
    data: c,
    cells: [
      c.otherUserName,
      c.lastMessage.substring(0, 40) + (c.lastMessage.length > 40 ? '...' : ''),
      c.unread > 0 ? <span style={{ color: '#cc0000', fontWeight: 'bold' }}>({c.unread} new)</span> : '-',
      <span style={{ color: '#003366' }}>Open</span>
    ]
  }));

  return (
    <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '12px', backgroundColor: '#f0f0f0', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <RetroHeader user={user} />
      
      <div style={{ padding: '15px', flex: 1, display: 'flex', gap: '15px' }}>
        <div style={{ width: '350px', backgroundColor: 'white', border: '1px solid #999999' }}>
          <div style={{ backgroundColor: '#336699', color: 'white', padding: '8px', fontWeight: 'bold' }}>
            Direct Messages
          </div>
          <div style={{ padding: '10px' }}>
            {(user.user_type === 'teacher' || user.user_type === 'superadmin') && (
              <RetroButton onClick={() => setShowStart(!showStart)} style={{ marginBottom: '10px', width: '100%' }}>
                + New Conversation
              </RetroButton>
            )}

            {showStart && (
              <div style={{ backgroundColor: '#ffffee', border: '1px solid #cccc00', padding: '10px', marginBottom: '10px' }}>
                <RetroInput
                  label="Student ID"
                  value={targetId}
                  onChange={setTargetId}
                  placeholder="Enter student ID"
                />
                <RetroButton onClick={handleStartConvo} style={{ marginTop: '5px' }}>Start</RetroButton>
                <RetroButton onClick={() => setShowStart(false)} variant="secondary" style={{ marginLeft: '5px', marginTop: '5px' }}>Cancel</RetroButton>
              </div>
            )}

            <RetroTable
              headers={['Contact', 'Last Message', 'Unread', 'Action']}
              rows={convoRows}
              onRowClick={(row) => setSelectedConvo(row.data)}
              emptyMessage="No conversations yet"
            />
          </div>
        </div>

        <div style={{ flex: 1, backgroundColor: 'white', border: '1px solid #999999', display: 'flex', flexDirection: 'column' }}>
          {!selectedConvo ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
              Select a conversation or start a new one
            </div>
          ) : (
            <>
              <div style={{ backgroundColor: '#336699', color: 'white', padding: '10px', fontWeight: 'bold' }}>
                Conversation with {selectedConvo.otherUserName}
              </div>
              
              <div style={{ flex: 1, overflowY: 'auto', padding: '15px' }}>
                {messages.map(msg => (
                  <div key={msg.id} style={{
                    marginBottom: '15px',
                    padding: '10px',
                    backgroundColor: msg.sender_id === user.id ? '#e6f2ff' : '#f5f5f5',
                    border: '1px solid #cccccc',
                    maxWidth: '70%',
                    marginLeft: msg.sender_id === user.id ? 'auto' : '0'
                  }}>
                    <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '5px', color: '#003366' }}>
                      {msg.sender_name}
                      <span style={{ marginLeft: '10px', fontWeight: 'normal', color: '#666' }}>
                        {new Date(msg.created_date).toLocaleString()}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px' }}>{msg.message}</div>
                  </div>
                ))}
              </div>

              <div style={{ padding: '10px', borderTop: '1px solid #999999', backgroundColor: '#f5f5f5' }}>
                <RetroTextarea
                  value={newMessage}
                  onChange={setNewMessage}
                  placeholder="Type your message..."
                  rows={3}
                />
                <RetroButton onClick={handleSend} style={{ marginTop: '10px' }}>
                  Send Message
                </RetroButton>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}