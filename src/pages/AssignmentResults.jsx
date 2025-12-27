import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import RetroHeader from '@/components/RetroHeader';
import RetroTable from '@/components/RetroTable';
import RetroButton from '@/components/RetroButton';

export default function AssignmentResults() {
  const [user, setUser] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  const urlParams = new URLSearchParams(window.location.search);
  const assignmentId = urlParams.get('id');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const currentUser = await base44.auth.me();
    setUser(currentUser);
    
    if (assignmentId) {
      const assignments = await base44.entities.Assignment.filter({ id: assignmentId });
      if (assignments.length > 0) setAssignment(assignments[0]);

      const allSubmissions = await base44.entities.AssignmentSubmission.filter({ assignment_id: assignmentId });
      setSubmissions(allSubmissions.filter(s => s.is_complete));
    }
    setLoading(false);
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
      `Attempt ${s.attempt_number || 1}`,
      `${s.score || 0} / ${s.total_questions || 0}`,
      s.total_questions ? Math.round((s.score / s.total_questions) * 100) + '%' : '-',
      s.completed_at ? new Date(s.completed_at).toLocaleString() : '-',
      <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedSubmission(s); }} style={{ color: '#003366' }}>
        View
      </a>
    ]
  }));

  return (
    <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '12px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <RetroHeader user={user} />
      
      <div style={{ padding: '15px' }}>
        <div style={{ backgroundColor: 'white', border: '1px solid #999999', marginBottom: '15px' }}>
          <div style={{ backgroundColor: '#336699', color: 'white', padding: '8px', fontWeight: 'bold', fontSize: '12px' }}>
            Assignment Results: {assignment?.title}
          </div>
          <div style={{ padding: '10px', fontSize: '11px', borderBottom: '1px solid #dddddd' }}>
            Total Submissions: {submissions.length} | Max Attempts: {assignment?.max_attempts || 1}
          </div>
          <div style={{ padding: '15px' }}>
            <RetroTable
              headers={['Student', 'Attempt', 'Score', 'Percentage', 'Submitted', 'Actions']}
              rows={submissionRows}
              emptyMessage="No submissions yet"
            />
          </div>
        </div>

        {selectedSubmission && (
          <div style={{ backgroundColor: 'white', border: '1px solid #999999', marginBottom: '15px' }}>
            <div style={{ backgroundColor: '#336699', color: 'white', padding: '8px', fontWeight: 'bold', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Results: {selectedSubmission.student_name}</span>
              <a href="#" onClick={(e) => { e.preventDefault(); setSelectedSubmission(null); }} style={{ color: 'white' }}>Close</a>
            </div>
            <div style={{ padding: '15px' }}>
              {assignment?.questions?.map((q, index) => {
                const answer = selectedSubmission.answers?.find(a => a.question_id === q.id);
                const isEssay = q.question_type === 'essay';
                return (
                  <div key={q.id} style={{
                    border: '1px solid #dddddd',
                    marginBottom: '10px',
                    backgroundColor: isEssay ? '#ffffcc' : (answer?.is_correct ? '#ccffcc' : '#ffcccc')
                  }}>
                    <div style={{ padding: '8px', borderBottom: '1px solid #dddddd', fontWeight: 'bold', fontSize: '11px' }}>
                      Question {index + 1} ({q.question_type}): {isEssay ? 'MANUAL REVIEW' : (answer?.is_correct ? 'CORRECT' : 'INCORRECT')}
                    </div>
                    <div style={{ padding: '10px', fontSize: '11px' }}>
                      <p style={{ marginBottom: '8px' }}><strong>Q:</strong> {q.question_text}</p>
                      <p><strong>Answer:</strong> {answer?.answer || answer?.answers?.join(', ') || 'No answer'}</p>
                      {!isEssay && q.correct_answer && (
                        <p><strong>Correct:</strong> {q.correct_answer}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <RetroButton onClick={() => window.location.href = createPageUrl('RoomDetail') + '?id=' + assignment?.room_id} variant="secondary">
          &lt; Back to Room
        </RetroButton>
      </div>
    </div>
  );
}