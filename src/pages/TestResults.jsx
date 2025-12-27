import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import RetroHeader from '@/components/RetroHeader';
import RetroTable from '@/components/RetroTable';
import RetroButton from '@/components/RetroButton';

export default function TestResults() {
  const [user, setUser] = useState(null);
  const [test, setTest] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  const urlParams = new URLSearchParams(window.location.search);
  const testId = urlParams.get('id');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const currentUser = await base44.auth.me();
    setUser(currentUser);
    
    if (testId) {
      const tests = await base44.entities.Test.filter({ id: testId });
      if (tests.length > 0) setTest(tests[0]);

      const allSubmissions = await base44.entities.TestSubmission.filter({ test_id: testId });
      setSubmissions(allSubmissions.filter(s => s.is_complete));
    }
    setLoading(false);
  };

  const formatTime = (seconds) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '12px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
        <p style={{ padding: '20px' }}>Loading...</p>
      </div>
    );
  }

  const submissionRows = submissions.map(s => ({
    data: s,
    cells: [
      s.student_name || 'Unknown Student',
      `${s.score || 0} / ${s.total_questions || 0}`,
      s.total_questions ? Math.round((s.score / s.total_questions) * 100) + '%' : '-',
      formatTime(s.total_time_seconds),
      s.completed_at ? new Date(s.completed_at).toLocaleString() : '-',
      <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedSubmission(s); }} style={{ color: '#003366' }}>
        View Details
      </a>
    ]
  }));

  return (
    <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '12px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <RetroHeader user={user} />
      
      <div style={{ padding: '15px' }}>
        <div style={{ backgroundColor: 'white', border: '1px solid #999999', marginBottom: '15px' }}>
          <div style={{ backgroundColor: '#336699', color: 'white', padding: '8px', fontWeight: 'bold', fontSize: '12px' }}>
            Test Results: {test?.title}
          </div>
          <div style={{ padding: '10px', fontSize: '11px', borderBottom: '1px solid #dddddd' }}>
            Total Submissions: {submissions.length} | 
            Average Score: {submissions.length > 0 ? Math.round(submissions.reduce((sum, s) => sum + ((s.score / s.total_questions) * 100 || 0), 0) / submissions.length) : 0}%
          </div>
          <div style={{ padding: '15px' }}>
            <RetroTable
              headers={['Student', 'Score', 'Percentage', 'Time', 'Submitted', 'Actions']}
              rows={submissionRows}
              emptyMessage="No submissions yet"
            />
          </div>
        </div>

        {selectedSubmission && (
          <div style={{ backgroundColor: 'white', border: '1px solid #999999', marginBottom: '15px' }}>
            <div style={{ backgroundColor: '#336699', color: 'white', padding: '8px', fontWeight: 'bold', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Detailed Results: {selectedSubmission.student_name}</span>
              <a href="#" onClick={(e) => { e.preventDefault(); setSelectedSubmission(null); }} style={{ color: 'white' }}>Close</a>
            </div>
            <div style={{ padding: '15px' }}>
              {test?.questions?.map((q, index) => {
                const answer = selectedSubmission.answers?.find(a => a.question_id === q.id);
                return (
                  <div key={q.id} style={{
                    border: '1px solid #dddddd',
                    marginBottom: '10px',
                    backgroundColor: answer?.is_correct ? '#ccffcc' : '#ffcccc'
                  }}>
                    <div style={{ padding: '8px', borderBottom: '1px solid #dddddd', fontWeight: 'bold', fontSize: '11px' }}>
                      Question {index + 1}: {answer?.is_correct ? 'CORRECT' : 'INCORRECT'}
                      {answer?.time_spent_seconds && <span style={{ fontWeight: 'normal', marginLeft: '15px' }}>Time: {formatTime(answer.time_spent_seconds)}</span>}
                    </div>
                    <div style={{ padding: '10px', fontSize: '11px' }}>
                      <p style={{ marginBottom: '8px' }}><strong>Q:</strong> {q.question_text}</p>
                      <p><strong>Student Answer:</strong> {answer?.answer || answer?.answers?.join(', ') || 'No answer'}</p>
                      <p><strong>Correct Answer:</strong> {q.correct_answer || q.correct_answers?.join(', ')}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <RetroButton onClick={() => window.location.href = createPageUrl('RoomDetail') + '?id=' + test?.room_id} variant="secondary">
          &lt; Back to Room
        </RetroButton>
      </div>
    </div>
  );
}