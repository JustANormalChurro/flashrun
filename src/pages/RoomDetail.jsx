import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import RetroHeader from '@/components/RetroHeader';
import RetroTable from '@/components/RetroTable';
import RetroButton from '@/components/RetroButton';
import FloatingAI from '@/components/FloatingAI';

export default function RoomDetail() {
  const [user, setUser] = useState(null);
  const [room, setRoom] = useState(null);
  const [tests, setTests] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [members, setMembers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tests');
  const [searchQuery, setSearchQuery] = useState('');

  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get('id');

  useEffect(() => {
    if (roomId) loadData();
  }, [roomId]);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const roomData = await base44.entities.Room.filter({ id: roomId });
      if (roomData.length > 0) setRoom(roomData[0]);

      const allTests = await base44.entities.Test.filter({ room_id: roomId });
      setTests(allTests);

      const allAssignments = await base44.entities.Assignment.filter({ room_id: roomId });
      setAssignments(allAssignments);

      const allAnnouncements = await base44.entities.Announcement.filter({ room_id: roomId });
      setAnnouncements(allAnnouncements);

      const allMembers = await base44.entities.RoomMembership.filter({ room_id: roomId });
      setMembers(allMembers);

      const allRequests = await base44.entities.Request.filter({ room_id: roomId });
      setRequests(allRequests);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const deleteTest = async (id) => {
    if (window.confirm('Delete this test?')) {
      await base44.entities.Test.delete(id);
      loadData();
    }
  };

  const deleteAssignment = async (id) => {
    if (window.confirm('Delete this assignment?')) {
      await base44.entities.Assignment.delete(id);
      loadData();
    }
  };

  const deleteAnnouncement = async (id) => {
    if (window.confirm('Delete this announcement?')) {
      await base44.entities.Announcement.delete(id);
      loadData();
    }
  };

  if (loading) {
    return (
      <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '12px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
        <p style={{ padding: '20px' }}>Loading...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '12px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
        <RetroHeader user={user} />
        <p style={{ padding: '20px' }}>Room not found.</p>
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

  const filteredTests = tests.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredAssignments = assignments.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.description && a.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const testRows = filteredTests.map(test => {
    const isNew = new Date(test.created_date) > new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    return {
      data: test,
      cells: [
        <>
          {test.title}
          {isNew && <span style={{ backgroundColor: '#cc0000', color: 'white', fontSize: '9px', padding: '1px 4px', marginLeft: '5px' }}>NEW</span>}
        </>,
        test.is_published ? 'Published' : 'Draft',
        test.questions?.length || 0,
        <>
          <a href={createPageUrl('EditTest') + '?id=' + test.id} style={{ color: '#003366', marginRight: '10px' }}>Edit</a>
          <a href={createPageUrl('TestResults') + '?id=' + test.id} style={{ color: '#006600', marginRight: '10px' }}>Results</a>
          <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteTest(test.id); }} style={{ color: '#cc0000' }}>Delete</a>
        </>
      ]
    };
  });

  const assignmentRows = filteredAssignments.map(a => ({
    data: a,
    cells: [
      a.title,
      a.is_published ? 'Published' : 'Draft',
      a.questions?.length || 0,
      a.max_attempts || 1,
      <>
        <a href={createPageUrl('EditAssignment') + '?id=' + a.id} style={{ color: '#003366', marginRight: '10px' }}>Edit</a>
        <a href={createPageUrl('AssignmentResults') + '?id=' + a.id} style={{ color: '#006600', marginRight: '10px' }}>Results</a>
        <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteAssignment(a.id); }} style={{ color: '#cc0000' }}>Delete</a>
      </>
    ]
  }));

  const announcementRows = announcements.map(a => ({
    data: a,
    cells: [
      a.title,
      a.author_name || '-',
      new Date(a.created_date).toLocaleDateString(),
      a.likes?.length || 0,
      a.comments?.length || 0,
      <>
        <a href={createPageUrl('EditAnnouncement') + '?id=' + a.id} style={{ color: '#003366', marginRight: '10px' }}>Edit</a>
        <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteAnnouncement(a.id); }} style={{ color: '#cc0000' }}>Delete</a>
      </>
    ]
  }));

  const studentMembers = members.filter(m => m.role === 'student');
  const memberRows = studentMembers.map(m => ({
    data: m,
    cells: [
      m.user_name || m.user_email,
      m.user_email,
      new Date(m.created_date).toLocaleDateString()
    ]
  }));

  const handleApproveRequest = async (request) => {
    await base44.entities.Request.update(request.id, { status: 'approved' });
    if (request.content_type === 'test') {
      await base44.entities.Test.update(request.content_id, { is_published: true });
    } else if (request.content_type === 'assignment') {
      await base44.entities.Assignment.update(request.content_id, { is_published: true });
    }
    loadData();
  };

  const handleRejectRequest = async (request) => {
    if (window.confirm('Reject this request?')) {
      await base44.entities.Request.update(request.id, { status: 'rejected' });
      loadData();
    }
  };

  const handleRevertRequest = async (request) => {
    if (window.confirm('Revert these changes?')) {
      if (request.original_data && request.content_id) {
        if (request.content_type === 'test') {
          await base44.entities.Test.update(request.content_id, request.original_data);
        } else if (request.content_type === 'assignment') {
          await base44.entities.Assignment.update(request.content_id, request.original_data);
        }
      }
      await base44.entities.Request.update(request.id, { status: 'reverted' });
      loadData();
    }
  };

  const requestRows = requests.filter(r => r.status === 'pending').map(r => ({
    data: r,
    cells: [
      <>
        {r.title}
        {r.requester_id === 'ai' && <span style={{ backgroundColor: '#ff6600', color: 'white', fontSize: '9px', padding: '1px 4px', marginLeft: '5px' }}>AI</span>}
      </>,
      r.content_type,
      r.requester_name || 'AI',
      r.changes_description || r.type.replace('_', ' '),
      new Date(r.created_date).toLocaleDateString(),
      <>
        <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleApproveRequest(r); }} style={{ color: '#006600', marginRight: '10px' }}>Approve</a>
        <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRejectRequest(r); }} style={{ color: '#cc0000', marginRight: '10px' }}>Reject</a>
        {r.original_data && (
          <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRevertRequest(r); }} style={{ color: '#cc6600' }}>Revert</a>
        )}
      </>
    ]
  }));

  return (
    <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '12px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <RetroHeader user={user} />
      
      <div style={{ padding: '15px' }}>
        <div style={{ backgroundColor: 'white', border: '1px solid #999999', marginBottom: '15px' }}>
          <div style={{ backgroundColor: '#336699', color: 'white', padding: '8px', fontWeight: 'bold', fontSize: '14px' }}>
            {room.name}
          </div>
          <div style={{ padding: '10px' }}>
            <table style={{ fontSize: '11px' }}>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 'bold', paddingRight: '15px' }}>Teacher:</td>
                  <td>{room.teacher_name || '-'}</td>
                  <td style={{ fontWeight: 'bold', paddingLeft: '30px', paddingRight: '15px' }}>Student Code:</td>
                  <td>
                    <span style={{ fontFamily: 'Courier New', backgroundColor: '#ffffcc', padding: '2px 6px', border: '1px solid #cccc00' }}>
                      {room.student_code}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold', paddingRight: '15px' }}>Description:</td>
                  <td>{room.description || '-'}</td>
                  <td style={{ fontWeight: 'bold', paddingLeft: '30px', paddingRight: '15px' }}>Teacher Code:</td>
                  <td>
                    <span style={{ fontFamily: 'Courier New', backgroundColor: '#ffcccc', padding: '2px 6px', border: '1px solid #cc0000' }}>
                      {room.teacher_code}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {(activeTab === 'tests' || activeTab === 'assignments') && (
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '300px',
                padding: '4px 6px',
                border: '1px solid #999999',
                fontFamily: 'Tahoma, Arial, sans-serif',
                fontSize: '11px'
              }}
            />
            {searchQuery && (
              <span style={{ marginLeft: '10px', fontSize: '11px', color: '#666' }}>
                Found: {activeTab === 'tests' ? filteredTests.length : filteredAssignments.length} results
              </span>
            )}
          </div>
        )}

        <div style={{ marginBottom: '-1px' }}>
          <span style={tabStyle('tests')} onClick={() => setActiveTab('tests')}>Tests/Exams ({tests.length})</span>
          <span style={tabStyle('assignments')} onClick={() => setActiveTab('assignments')}>Assignments ({assignments.length})</span>
          <span style={tabStyle('announcements')} onClick={() => setActiveTab('announcements')}>Announcements ({announcements.length})</span>
          <span style={tabStyle('students')} onClick={() => setActiveTab('students')}>Students ({studentMembers.length})</span>
          <span style={tabStyle('requests')} onClick={() => setActiveTab('requests')}>Requests ({requests.filter(r => r.status === 'pending').length})</span>
        </div>

        <div style={{ backgroundColor: 'white', border: '1px solid #999999', padding: '15px' }}>
          {activeTab === 'tests' && (
            <>
              <div style={{ marginBottom: '10px' }}>
                <RetroButton onClick={() => window.location.href = createPageUrl('CreateTest') + '?room_id=' + room.id}>
                  + Create New Test
                </RetroButton>
              </div>
              <RetroTable
                headers={['Title', 'Status', 'Questions', 'Actions']}
                rows={testRows}
                emptyMessage="No tests created yet"
              />
            </>
          )}

          {activeTab === 'assignments' && (
            <>
              <div style={{ marginBottom: '10px' }}>
                <RetroButton onClick={() => window.location.href = createPageUrl('CreateAssignment') + '?room_id=' + room.id}>
                  + Create New Assignment
                </RetroButton>
              </div>
              <RetroTable
                headers={['Title', 'Status', 'Questions', 'Max Attempts', 'Actions']}
                rows={assignmentRows}
                emptyMessage="No assignments created yet"
              />
            </>
          )}

          {activeTab === 'announcements' && (
            <>
              <div style={{ marginBottom: '10px' }}>
                <RetroButton onClick={() => window.location.href = createPageUrl('CreateAnnouncement') + '?room_id=' + room.id}>
                  + Create New Announcement
                </RetroButton>
              </div>
              <RetroTable
                headers={['Title', 'Author', 'Posted', 'Likes', 'Comments', 'Actions']}
                rows={announcementRows}
                emptyMessage="No announcements posted yet"
              />
            </>
          )}

          {activeTab === 'students' && (
            <>
              <div style={{ marginBottom: '10px', backgroundColor: '#ffffcc', border: '1px solid #cccc00', padding: '8px', fontSize: '11px' }}>
                Students can join using code: <strong>{room.student_code}</strong>
              </div>
              <RetroTable
                headers={['Name', 'Email', 'Joined']}
                rows={memberRows}
                emptyMessage="No students have joined yet"
              />
            </>
          )}

          {activeTab === 'requests' && (
            <>
              <div style={{ marginBottom: '10px', backgroundColor: '#ffffcc', border: '1px solid #ffcc00', padding: '8px', fontSize: '11px' }}>
                Review changes made by collaborating teachers and AI-generated content before publishing.
              </div>
              <RetroTable
                headers={['Title', 'Type', 'Requested By', 'Change', 'Date', 'Actions']}
                rows={requestRows}
                emptyMessage="No pending requests"
              />
            </>
          )}
        </div>

        <FloatingAI roomId={roomId} room={room} />

        <div style={{ marginTop: '15px' }}>
          <RetroButton onClick={() => window.location.href = createPageUrl('ManageRooms')} variant="secondary">
            &lt; Back to Rooms
          </RetroButton>
        </div>
      </div>
    </div>
  );
}