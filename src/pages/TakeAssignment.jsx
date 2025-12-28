import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import RetroHeader from '@/components/RetroHeader';
import RetroButton from '@/components/RetroButton';
import { RetroTextarea } from '@/components/RetroInput';

export default function TakeAssignment() {
  const [user, setUser] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [attemptNumber, setAttemptNumber] = useState(1);

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
      if (assignments.length > 0) {
        const a = assignments[0];
        setAssignment(a);
        
        const rooms = await base44.entities.Room.filter({ id: a.room_id });
        if (rooms.length > 0) setRoom(rooms[0]);

        const existingSubs = await base44.entities.AssignmentSubmission.filter({ 
          assignment_id: assignmentId, 
          student_id: currentUser.id 
        });
        const completedSubs = existingSubs.filter(s => s.is_complete);
        setAttemptNumber(completedSubs.length + 1);
      }
    }
    setLoading(false);
  };

  const questions = (assignment?.questions || []).map((q, idx) => ({
    ...q,
    id: q.id || `q_${idx}`
  }));

  const selectAnswer = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const toggleCheckboxAnswer = (questionId, choice) => {
    const current = answers[questionId] || [];
    const updated = current.includes(choice)
      ? current.filter(c => c !== choice)
      : [...current, choice];
    setAnswers(prev => ({ ...prev, [questionId]: updated }));
  };

  const handleSubmit = async () => {
    if (!window.confirm('Submit your assignment?')) return;

    setSubmitting(true);

    const answersArray = questions.map(q => {
      const studentAnswer = answers[q.id];
      let isCorrect = false;

      if (q.question_type === 'multiple_choice') {
        isCorrect = studentAnswer === q.correct_answer;
      } else if (q.question_type === 'checkbox') {
        const correctSet = new Set(q.correct_answers || []);
        const studentSet = new Set(studentAnswer || []);
        isCorrect = correctSet.size === studentSet.size && [...correctSet].every(a => studentSet.has(a));
      } else if (q.question_type === 'short_answer') {
        isCorrect = studentAnswer?.toLowerCase().trim() === q.correct_answer?.toLowerCase().trim();
      }

      return {
        question_id: q.id,
        answer: Array.isArray(studentAnswer) ? null : studentAnswer,
        answers: Array.isArray(studentAnswer) ? studentAnswer : null,
        is_correct: isCorrect
      };
    });

    const autoGradable = questions.filter(q => q.question_type !== 'essay');
    const correctCount = answersArray.filter((a, i) => 
      questions[i].question_type !== 'essay' && a.is_correct
    ).length;

    await base44.entities.AssignmentSubmission.create({
      assignment_id: assignmentId,
      room_id: assignment.room_id,
      student_id: user.id,
      student_name: user.full_name || user.email,
      attempt_number: attemptNumber,
      answers: answersArray,
      score: correctCount,
      total_questions: autoGradable.length,
      is_complete: true,
      completed_at: new Date().toISOString()
    });

    setScore(correctCount);
    setSubmitted(true);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '12px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
        <p style={{ padding: '20px' }}>Loading...</p>
      </div>
    );
  }

  if (submitted) {
    const autoGradable = questions.filter(q => q.question_type !== 'essay').length;
    const hasEssays = questions.some(q => q.question_type === 'essay');
    
    return (
      <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '12px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
        <RetroHeader user={user} />
        <div style={{ padding: '15px' }}>
          <div style={{ backgroundColor: 'white', border: '1px solid #999999', padding: '20px', textAlign: 'center' }}>
            <div style={{ backgroundColor: '#ccffcc', border: '1px solid #00cc00', padding: '15px', marginBottom: '20px' }}>
              <h3 style={{ margin: '0' }}>Assignment Submitted!</h3>
            </div>
            {assignment?.show_score_to_student ? (
              <>
                <p style={{ fontSize: '16px' }}>
                  <strong>Auto-Graded Score:</strong> {score} / {autoGradable}
                </p>
                {hasEssays && (
                  <p style={{ fontSize: '12px', color: '#666666', marginTop: '10px' }}>
                    Essay questions will be graded by your teacher.
                  </p>
                )}
              </>
            ) : (
              <p style={{ fontSize: '13px', color: '#666666' }}>
                Your assignment has been submitted. Your teacher will review and provide your score.
              </p>
            )}
            <div style={{ marginTop: '20px' }}>
              <RetroButton onClick={() => window.location.href = createPageUrl('StudentRoom') + '?id=' + assignment.room_id}>
                Back to Class
              </RetroButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '12px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
        <RetroHeader user={user} />
        <div style={{ padding: '15px', maxWidth: '600px' }}>
          <div style={{ backgroundColor: 'white', border: '1px solid #999999' }}>
            <div style={{ backgroundColor: '#336699', color: 'white', padding: '8px', fontWeight: 'bold' }}>
              {assignment?.title}
            </div>
            <div style={{ padding: '15px' }}>
              <p style={{ marginBottom: '15px' }}>{assignment?.description || 'No description.'}</p>
              <table style={{ marginBottom: '15px', fontSize: '11px' }}>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 'bold', paddingRight: '15px' }}>Questions:</td>
                    <td>{questions.length}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold', paddingRight: '15px' }}>Attempt:</td>
                    <td>{attemptNumber} of {assignment?.max_attempts || 1}</td>
                  </tr>
                </tbody>
              </table>
              <div style={{ marginTop: '15px' }}>
                <RetroButton onClick={() => setStarted(true)}>
                  Start Assignment
                </RetroButton>
                <RetroButton onClick={() => window.location.href = createPageUrl('StudentRoom') + '?id=' + assignment.room_id} variant="secondary" style={{ marginLeft: '10px' }}>
                  Cancel
                </RetroButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '12px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <div style={{ backgroundColor: '#003366', color: 'white', padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
        <span><strong>FlashRun</strong> - {assignment?.title}</span>
        <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
      </div>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 50px)' }}>
        <div style={{ width: '150px', backgroundColor: '#e0e0e0', padding: '10px', borderRight: '1px solid #999999' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '11px' }}>Questions</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {questions.map((q, i) => {
              const hasAnswer = answers[q.id] !== undefined && 
                (Array.isArray(answers[q.id]) ? answers[q.id].length > 0 : answers[q.id] !== '');
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(i)}
                  style={{
                    width: '30px',
                    height: '30px',
                    border: '1px solid #999999',
                    backgroundColor: hasAnswer ? '#ccffcc' : (i === currentQuestionIndex ? '#ffffcc' : 'white'),
                    cursor: 'pointer',
                    fontSize: '10px'
                  }}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ flex: 1, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', border: '1px solid #999999', padding: '20px' }}>
            <div style={{ marginBottom: '10px', fontSize: '10px', color: '#666666' }}>
              Type: {currentQuestion?.question_type?.replace('_', ' ').toUpperCase()}
            </div>
            <div style={{ marginBottom: '20px' }}>
              <strong>Question {currentQuestionIndex + 1}:</strong>
              <p style={{ marginTop: '10px', fontSize: '13px' }}>{currentQuestion?.question_text}</p>
              
              {currentQuestion?.image_url && (
                <img src={currentQuestion.image_url} alt="" style={{ maxWidth: '400px', marginTop: '10px', border: '1px solid #ccc' }} />
              )}
            </div>

            <div style={{ marginTop: '20px' }}>
              {currentQuestion?.question_type === 'multiple_choice' && currentQuestion?.choices?.map((choice, i) => (
                <div
                  key={i}
                  onClick={() => selectAnswer(currentQuestion.id, choice)}
                  style={{
                    padding: '10px',
                    border: '1px solid #999999',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    backgroundColor: answers[currentQuestion.id] === choice ? '#ffffcc' : 'white'
                  }}
                >
                  <input type="radio" checked={answers[currentQuestion.id] === choice} onChange={() => {}} style={{ marginRight: '10px' }} />
                  {String.fromCharCode(65 + i)}. {choice}
                </div>
              ))}

              {currentQuestion?.question_type === 'checkbox' && currentQuestion?.choices?.map((choice, i) => (
                <div
                  key={i}
                  onClick={() => toggleCheckboxAnswer(currentQuestion.id, choice)}
                  style={{
                    padding: '10px',
                    border: '1px solid #999999',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    backgroundColor: (answers[currentQuestion.id] || []).includes(choice) ? '#ffffcc' : 'white'
                  }}
                >
                  <input type="checkbox" checked={(answers[currentQuestion.id] || []).includes(choice)} onChange={() => {}} style={{ marginRight: '10px' }} />
                  {choice}
                </div>
              ))}

              {currentQuestion?.question_type === 'short_answer' && (
                <input
                  type="text"
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => selectAnswer(currentQuestion.id, e.target.value)}
                  placeholder="Type your answer..."
                  style={{ width: '100%', padding: '8px', border: '1px solid #999999', fontSize: '12px' }}
                />
              )}

              {currentQuestion?.question_type === 'essay' && (
                <RetroTextarea
                  value={answers[currentQuestion.id] || ''}
                  onChange={(v) => selectAnswer(currentQuestion.id, v)}
                  placeholder="Write your essay response..."
                  rows={8}
                />
              )}

              {currentQuestion?.question_type === 'mix_match' && (
                <div>
                  <p style={{ fontSize: '11px', color: '#666666', marginBottom: '10px' }}>Match items from the left column to the right column:</p>
                  {(currentQuestion.match_pairs || []).map((pair, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ width: '150px', padding: '5px', border: '1px solid #999999', backgroundColor: '#f5f5f5' }}>{pair.left}</span>
                      <span style={{ margin: '0 10px' }}>=</span>
                      <select
                        value={(answers[currentQuestion.id] || {})[pair.left] || ''}
                        onChange={(e) => {
                          const current = answers[currentQuestion.id] || {};
                          selectAnswer(currentQuestion.id, { ...current, [pair.left]: e.target.value });
                        }}
                        style={{ padding: '5px', border: '1px solid #999999' }}
                      >
                        <option value="">Select...</option>
                        {(currentQuestion.match_pairs || []).map((p, j) => (
                          <option key={j} value={p.right}>{p.right}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <RetroButton onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)} variant="secondary" disabled={currentQuestionIndex === 0}>
                &lt; Previous
              </RetroButton>
              <RetroButton onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)} variant="secondary" style={{ marginLeft: '10px' }} disabled={currentQuestionIndex === questions.length - 1}>
                Next &gt;
              </RetroButton>
            </div>
            <RetroButton onClick={handleSubmit} variant="success" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Assignment'}
            </RetroButton>
          </div>
        </div>
      </div>
    </div>
  );
}