import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import RetroHeader from '@/components/RetroHeader';
import RetroTable from '@/components/RetroTable';
import RetroButton from '@/components/RetroButton';
import ReactMarkdown from 'react-markdown';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function StudentRoom() {
  const [user, setUser] = useState(null);
  const [room, setRoom] = useState(null);
  const [tests, setTests] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [myTestSubmissions, setMyTestSubmissions] = useState([]);
  const [myAssignmentSubmissions, setMyAssignmentSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tests');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get('id');

  useEffect(() => {
    if (roomId) loadData();
  }, [roomId]);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const rooms = await base44.entities.Room.filter({ id: roomId });
      if (rooms.length > 0) setRoom(rooms[0]);

      const allTests = await base44.entities.Test.filter({ room_id: roomId });
      setTests(allTests.filter(t => t.is_published));

      const allAssignments = await base44.entities.Assignment.filter({ room_id: roomId });
      setAssignments(allAssignments.filter(a => a.is_published));

      const allAnnouncements = await base44.entities.Announcement.filter({ room_id: roomId });
      setAnnouncements(allAnnouncements.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));

      const testSubs = await base44.entities.TestSubmission.filter({ room_id: roomId, student_id: currentUser.id });
      setMyTestSubmissions(testSubs);

      const assignSubs = await base44.entities.AssignmentSubmission.filter({ room_id: roomId, student_id: currentUser.id });
      setMyAssignmentSubmissions(assignSubs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const likeAnnouncement = async (announcement) => {
    if (!announcement.allow_likes) return;
    const likes = announcement.likes || [];
    const newLikes = likes.includes(user.id) 
      ? likes.filter(l => l !== user.id)
      : [...likes, user.id];
    await base44.entities.Announcement.update(announcement.id, { likes: newLikes });
    loadData();
  };

  if (loading) {
    return <LoadingSpinner message="Loading Class" />;
  }

  if (!room) {
    return (
      <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '12px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
        <RetroHeader user={user} />
        <p style={{ padding: '20px' }}>Class not found.</p>
      </div>
    );
  }

  const tabStyle = (tab) => ({
    padding: '8px 15px',
    backgroundColor: activeTab === tab ? 'white' : '#e0e0e0',
    border: '1px solid #999999',
    borderBottom: activeTab === tab ? 'none' : '1px solid #999999',
    cursor: 'pointer',
    marginRight: '2px',
    fontSize: '11px',
    fontWeight: activeTab === tab ? 'bold' : 'normal'
  });

  const testRows = tests.map(test => {
    const submission = myTestSubmissions.find(s => s.test_id === test.id && s.is_complete);
    const isNew = new Date(test.created_date) > new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    return {
      data: test,
      cells: [
        <>
          {test.title}
          {isNew && <span style={{ backgroundColor: '#cc0000', color: 'white', fontSize: '9px', padding: '1px 4px', marginLeft: '5px' }}>NEW</span>}
        </>,
        test.questions?.length || 0,
        test.time_limit_minutes ? test.time_limit_minutes + ' min' : 'No limit',
        submission ? (
          <span style={{ color: '#006600' }}>Completed ({submission.score}/{submission.total_questions})</span>
        ) : (
          <a href={createPageUrl('TakeTest') + '?id=' + test.id} style={{ color: '#003366' }}>Start Test</a>
        )
      ]
    };
  });

  const assignmentRows = assignments.map(a => {
    const submissions = myAssignmentSubmissions.filter(s => s.assignment_id === a.id && s.is_complete);
    const attemptsUsed = submissions.length;
    const bestScore = submissions.length > 0 ? Math.max(...submissions.map(s => s.score || 0)) : null;
    const canRetry = attemptsUsed < (a.max_attempts || 1);

    return {
      data: a,
      cells: [
        a.title,
        a.questions?.length || 0,
        `${attemptsUsed} / ${a.max_attempts || 1}`,
        bestScore !== null ? `${bestScore}/${a.questions?.length || 0}` : '-',
        attemptsUsed === 0 ? (
          <a href={createPageUrl('TakeAssignment') + '?id=' + a.id} style={{ color: '#003366' }}>Start</a>
        ) : canRetry ? (
          <a href={createPageUrl('TakeAssignment') + '?id=' + a.id} style={{ color: '#003366' }}>Retry</a>
        ) : (
          <span style={{ color: '#666666' }}>Complete</span>
        )
      ]
    };
  });

  return (
    <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '12px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <RetroHeader user={user} />
      
      <div style={{ padding: '15px' }}>
        <div style={{ backgroundColor: 'white', border: '1px solid #999999', marginBottom: '15px' }}>
          <div style={{ backgroundColor: '#336699', color: 'white', padding: '8px', fontWeight: 'bold', fontSize: '14px' }}>
            {room.name}
          </div>
          <div style={{ padding: '10px', fontSize: '11px' }}>
            <strong>Teacher:</strong> {room.teacher_name || '-'}
            {room.description && <span style={{ marginLeft: '20px' }}>{room.description}</span>}
          </div>
        </div>

        <div style={{ marginBottom: '-1px' }}>
          <span style={tabStyle('tests')} onClick={() => setActiveTab('tests')}>Tests ({tests.length})</span>
          <span style={tabStyle('assignments')} onClick={() => setActiveTab('assignments')}>Assignments ({assignments.length})</span>
          <span style={tabStyle('inbox')} onClick={() => setActiveTab('inbox')}>Class Inbox ({announcements.length})</span>
        </div>

        <div style={{ backgroundColor: 'white', border: '1px solid #999999', padding: '15px' }}>
          {activeTab === 'tests' && (
            <RetroTable
              headers={['Test Name', 'Questions', 'Time Limit', 'Status']}
              rows={testRows}
              emptyMessage="No tests available"
            />
          )}

          {activeTab === 'assignments' && (
            <RetroTable
              headers={['Assignment', 'Questions', 'Attempts', 'Best Score', 'Action']}
              rows={assignmentRows}
              emptyMessage="No assignments available"
            />
          )}

          {activeTab === 'inbox' && (
            <div>
              {announcements.length === 0 ? (
                <p style={{ color: '#666666', fontStyle: 'italic' }}>No announcements</p>
              ) : (
                announcements.map(a => (
                  <div key={a.id} style={{ border: '1px solid #dddddd', marginBottom: '10px', backgroundColor: selectedAnnouncement?.id === a.id ? '#fffff0' : 'white' }}>
                    <div
                      style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eeeeee' }}
                      onClick={() => setSelectedAnnouncement(selectedAnnouncement?.id === a.id ? null : a)}
                    >
                      <div style={{ fontWeight: 'bold' }}>{a.title}</div>
                      <div style={{ fontSize: '10px', color: '#666666', marginTop: '3px' }}>
                        Posted by {a.author_name} on {new Date(a.created_date).toLocaleDateString()}
                        {a.allow_likes && (
                          <span style={{ marginLeft: '15px' }}>
                            <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); likeAnnouncement(a); }} style={{ color: (a.likes || []).includes(user.id) ? '#cc0000' : '#666666' }}>
                              [{(a.likes || []).length} likes]
                            </a>
                          </span>
                        )}
                      </div>
                    </div>
                    {selectedAnnouncement?.id === a.id && (
                      <div style={{ padding: '10px', backgroundColor: '#f9f9f9' }}>
                        <ReactMarkdown>{a.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div style={{ marginTop: '15px' }}>
          <RetroButton onClick={() => window.location.href = createPageUrl('StudentDashboard')} variant="secondary">
            &lt; Back to My Classes
          </RetroButton>
        </div>
      </div>
    </div>
  );
}