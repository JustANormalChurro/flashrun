import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import RetroHeader from '@/components/RetroHeader';
import RetroTable from '@/components/RetroTable';
import RetroButton from '@/components/RetroButton';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function StudentHistory() {
  const [user, setUser] = useState(null);
  const [testSubmissions, setTestSubmissions] = useState([]);
  const [assignmentSubmissions, setAssignmentSubmissions] = useState([]);
  const [tests, setTests] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tests');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const testSubs = await base44.entities.TestSubmission.filter({ student_id: currentUser.id });
      setTestSubmissions(testSubs.filter(s => s.is_complete));

      const assignSubs = await base44.entities.AssignmentSubmission.filter({ student_id: currentUser.id });
      setAssignmentSubmissions(assignSubs.filter(s => s.is_complete));

      const allTests = await base44.entities.Test.list();
      setTests(allTests);

      const allAssignments = await base44.entities.Assignment.list();
      setAssignments(allAssignments);

      const allRooms = await base44.entities.Room.list();
      setRooms(allRooms);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading History" />;
  }

  const testRows = testSubmissions.map(s => {
    const test = tests.find(t => t.id === s.test_id);
    const room = rooms.find(r => r.id === s.room_id);
    return {
      data: s,
      cells: [
        test?.title || 'Unknown Test',
        room?.name || '-',
        `${s.score || 0} / ${s.total_questions || 0}`,
        s.total_questions ? Math.round((s.score / s.total_questions) * 100) + '%' : '-',
        s.completed_at ? new Date(s.completed_at).toLocaleDateString() : '-'
      ]
    };
  });

  const assignmentRows = assignmentSubmissions.map(s => {
    const assignment = assignments.find(a => a.id === s.assignment_id);
    const room = rooms.find(r => r.id === s.room_id);
    return {
      data: s,
      cells: [
        assignment?.title || 'Unknown Assignment',
        room?.name || '-',
        `Attempt ${s.attempt_number || 1}`,
        `${s.score || 0} / ${s.total_questions || 0}`,
        s.completed_at ? new Date(s.completed_at).toLocaleDateString() : '-'
      ]
    };
  });

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

  return (
    <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '12px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <RetroHeader user={user} />
      
      <div style={{ padding: '15px' }}>
        <div style={{ marginBottom: '-1px' }}>
          <span style={tabStyle('tests')} onClick={() => setActiveTab('tests')}>
            Completed Tests ({testSubmissions.length})
          </span>
          <span style={tabStyle('assignments')} onClick={() => setActiveTab('assignments')}>
            Completed Assignments ({assignmentSubmissions.length})
          </span>
        </div>

        <div style={{ backgroundColor: 'white', border: '1px solid #999999', padding: '15px' }}>
          {activeTab === 'tests' && (
            <RetroTable
              headers={['Test', 'Class', 'Score', 'Percentage', 'Date']}
              rows={testRows}
              emptyMessage="No completed tests"
            />
          )}

          {activeTab === 'assignments' && (
            <RetroTable
              headers={['Assignment', 'Class', 'Attempt', 'Score', 'Date']}
              rows={assignmentRows}
              emptyMessage="No completed assignments"
            />
          )}
        </div>

        <div style={{ marginTop: '15px' }}>
          <RetroButton onClick={() => window.location.href = createPageUrl('StudentDashboard')} variant="secondary">
            &lt; Back to Dashboard
          </RetroButton>
        </div>
      </div>
    </div>
  );
}