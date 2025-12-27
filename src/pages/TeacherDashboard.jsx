import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import RetroHeader from '@/components/RetroHeader';
import RetroTable from '@/components/RetroTable';
import RetroButton from '@/components/RetroButton';

export default function TeacherDashboard() {
  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [recentTests, setRecentTests] = useState([]);
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      const allRooms = await base44.entities.Room.list();
      const myRooms = allRooms.filter(r => 
        r.owner_id === currentUser.id || 
        r.created_by === currentUser.email ||
        (r.collaborator_ids && r.collaborator_ids.includes(currentUser.id))
      );
      setRooms(myRooms);

      if (myRooms.length > 0) {
        const roomIds = myRooms.map(r => r.id);
        const allTests = await base44.entities.Test.list('-created_date', 10);
        setRecentTests(allTests.filter(t => roomIds.includes(t.room_id)));

        const allAssignments = await base44.entities.Assignment.list('-created_date', 10);
        setRecentAssignments(allAssignments.filter(a => roomIds.includes(a.room_id)));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '12px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
        <p style={{ padding: '20px' }}>Loading...</p>
      </div>
    );
  }

  const roomRows = rooms.map(room => ({
    data: room,
    cells: [
      room.name,
      room.teacher_name || '-',
      room.student_code,
      <span style={{ color: '#003366', textDecoration: 'underline' }}>View Room</span>
    ]
  }));

  const testRows = recentTests.slice(0, 5).map(test => {
    const room = rooms.find(r => r.id === test.room_id);
    const isNew = new Date(test.created_date) > new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    return {
      data: test,
      cells: [
        <>
          {test.title}
          {isNew && <span style={{ backgroundColor: '#cc0000', color: 'white', fontSize: '9px', padding: '1px 4px', marginLeft: '5px' }}>NEW</span>}
        </>,
        room?.name || '-',
        test.is_published ? 'Published' : 'Draft',
        test.questions?.length || 0
      ]
    };
  });

  const assignmentRows = recentAssignments.slice(0, 5).map(assignment => {
    const room = rooms.find(r => r.id === assignment.room_id);
    return {
      data: assignment,
      cells: [
        assignment.title,
        room?.name || '-',
        assignment.is_published ? 'Published' : 'Draft',
        assignment.questions?.length || 0
      ]
    };
  });

  return (
    <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '12px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <RetroHeader user={user} />
      
      <div style={{ padding: '15px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ width: '50%', verticalAlign: 'top', paddingRight: '10px' }}>
                <div style={{ backgroundColor: 'white', border: '1px solid #999999', marginBottom: '15px' }}>
                  <div style={{ backgroundColor: '#336699', color: 'white', padding: '8px', fontWeight: 'bold', fontSize: '12px' }}>
                    My Classrooms ({rooms.length})
                  </div>
                  <div style={{ padding: '10px' }}>
                    <RetroTable
                      headers={['Room Name', 'Teacher', 'Student Code', 'Action']}
                      rows={roomRows}
                      onRowClick={(row) => window.location.href = createPageUrl('RoomDetail') + '?id=' + row.data.id}
                      emptyMessage="No classrooms created yet"
                    />
                    <div style={{ marginTop: '10px' }}>
                      <RetroButton onClick={() => window.location.href = createPageUrl('ManageRooms')}>
                        Manage Rooms
                      </RetroButton>
                    </div>
                  </div>
                </div>
              </td>
              <td style={{ width: '50%', verticalAlign: 'top', paddingLeft: '10px' }}>
                <div style={{ backgroundColor: 'white', border: '1px solid #999999', marginBottom: '15px' }}>
                  <div style={{ backgroundColor: '#336699', color: 'white', padding: '8px', fontWeight: 'bold', fontSize: '12px' }}>
                    Quick Actions
                  </div>
                  <div style={{ padding: '10px' }}>
                    <table style={{ width: '100%' }}>
                      <tbody>
                        <tr>
                          <td style={{ padding: '5px' }}>
                            <RetroButton onClick={() => window.location.href = createPageUrl('CreateRoom')} style={{ width: '100%' }}>
                              + Create New Room
                            </RetroButton>
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: '5px' }}>
                            <RetroButton onClick={() => window.location.href = createPageUrl('ManageStudents')} variant="secondary" style={{ width: '100%' }}>
                              Manage Students
                            </RetroButton>
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: '5px' }}>
                            <RetroButton onClick={() => window.location.href = createPageUrl('TeacherHelp')} variant="secondary" style={{ width: '100%' }}>
                              View Documentation
                            </RetroButton>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div style={{ backgroundColor: '#ffffcc', border: '1px solid #cccc00', padding: '10px', fontSize: '11px' }}>
                  <strong>System Notice:</strong> FlashRun v2.1.4 - All tests are automatically saved and logged.
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
          <tbody>
            <tr>
              <td style={{ width: '50%', verticalAlign: 'top', paddingRight: '10px' }}>
                <div style={{ backgroundColor: 'white', border: '1px solid #999999' }}>
                  <div style={{ backgroundColor: '#336699', color: 'white', padding: '8px', fontWeight: 'bold', fontSize: '12px' }}>
                    Recent Tests
                  </div>
                  <div style={{ padding: '10px' }}>
                    <RetroTable
                      headers={['Title', 'Room', 'Status', 'Questions']}
                      rows={testRows}
                      onRowClick={(row) => window.location.href = createPageUrl('EditTest') + '?id=' + row.data.id}
                      emptyMessage="No tests created yet"
                    />
                  </div>
                </div>
              </td>
              <td style={{ width: '50%', verticalAlign: 'top', paddingLeft: '10px' }}>
                <div style={{ backgroundColor: 'white', border: '1px solid #999999' }}>
                  <div style={{ backgroundColor: '#336699', color: 'white', padding: '8px', fontWeight: 'bold', fontSize: '12px' }}>
                    Recent Assignments
                  </div>
                  <div style={{ padding: '10px' }}>
                    <RetroTable
                      headers={['Title', 'Room', 'Status', 'Questions']}
                      rows={assignmentRows}
                      onRowClick={(row) => window.location.href = createPageUrl('EditAssignment') + '?id=' + row.data.id}
                      emptyMessage="No assignments created yet"
                    />
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ borderTop: '1px solid #999999', padding: '10px', textAlign: 'center', fontSize: '10px', color: '#666666', backgroundColor: '#e0e0e0' }}>
        FlashRun Secure Testing Browser v2.1.4 | District Technology Services | &copy; 2025 | Created 2008
      </div>
    </div>
  );
}