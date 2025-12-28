import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import RetroHeader from '@/components/RetroHeader';
import RetroButton from '@/components/RetroButton';
import { RetroInput } from '@/components/RetroInput';

export default function TakeTest() {
  const [user, setUser] = useState(null);
  const [test, setTest] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [questionTimes, setQuestionTimes] = useState({});
  const [startTime, setStartTime] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [existingSubmission, setExistingSubmission] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const testId = urlParams.get('id');
  const isPreview = urlParams.get('preview') === 'true';
  const timerRef = useRef(null);

  useEffect(() => {
    loadData();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (started && test?.time_limit_minutes) {
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = (test.time_limit_minutes * 60) - elapsed;
        setTimeRemaining(remaining);
        if (remaining <= 0) {
          clearInterval(timerRef.current);
          handleSubmit();
        }
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [started, startTime]);

  const loadData = async () => {
    const currentUser = await base44.auth.me();
    setUser(currentUser);
    
    if (testId) {
      const tests = await base44.entities.Test.filter({ id: testId });
      if (tests.length > 0) {
        const t = tests[0];
        setTest(t);
        
        const rooms = await base44.entities.Room.filter({ id: t.room_id });
        if (rooms.length > 0) setRoom(rooms[0]);

        const existingSubs = await base44.entities.TestSubmission.filter({ test_id: testId, student_id: currentUser.id });
        const completedSub = existingSubs.find(s => s.is_complete);
        if (completedSub) {
          setExistingSubmission(completedSub);
        } else if (existingSubs.length > 0 && t.save_progress) {
          const inProgress = existingSubs[0];
          setAnswers(inProgress.answers?.reduce((acc, a) => ({ ...acc, [a.question_id]: a.answer }), {}) || {});
        }

        let qs = [...(t.questions || [])];
        if (t.randomize_questions) {
          qs = qs.sort(() => Math.random() - 0.5);
        }
        setQuestions(qs);
      }
    }
    setLoading(false);
  };

  const handleStart = () => {
    if (test.require_access_code && accessCode !== test.access_code) {
      alert('Invalid access code');
      return;
    }
    setStarted(true);
    setStartTime(Date.now());
    setQuestionStartTime(Date.now());
  };

  const selectAnswer = (questionId, answer) => {
    const now = Date.now();
    if (questionStartTime) {
      const timeSpent = Math.floor((now - questionStartTime) / 1000);
      setQuestionTimes(prev => ({
        ...prev,
        [questionId]: (prev[questionId] || 0) + timeSpent
      }));
    }
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const goToQuestion = (index) => {
    const currentQ = questions[currentQuestionIndex];
    if (currentQ && questionStartTime) {
      const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
      setQuestionTimes(prev => ({
        ...prev,
        [currentQ.id]: (prev[currentQ.id] || 0) + timeSpent
      }));
    }
    setCurrentQuestionIndex(index);
    setQuestionStartTime(Date.now());
  };

  const handleSubmit = async () => {
    if (isPreview) {
      if (window.confirm('Preview complete. Return to test editor?')) {
        window.location.href = createPageUrl('EditTest') + '?id=' + testId;
      }
      return;
    }

    if (!window.confirm('Are you sure you want to submit? You cannot change your answers after submission.')) {
      return;
    }

    setSubmitting(true);
    const totalTime = Math.floor((Date.now() - startTime) / 1000);

    const answersArray = questions.map(q => {
      const studentAnswer = answers[q.id] || '';
      let isCorrect = false;
      
      if (q.question_type === 'fill_in_the_blank') {
        isCorrect = studentAnswer.trim().toLowerCase() === (q.correct_answer || '').trim().toLowerCase();
      } else {
        isCorrect = studentAnswer === q.correct_answer;
      }
      
      return {
        question_id: q.id,
        answer: studentAnswer,
        is_correct: isCorrect,
        time_spent_seconds: questionTimes[q.id] || 0
      };
    });

    const correctCount = answersArray.filter(a => a.is_correct).length;

    await base44.entities.TestSubmission.create({
      test_id: testId,
      room_id: test.room_id,
      student_id: user.id,
      student_name: user.full_name || user.email,
      answers: answersArray,
      score: correctCount,
      total_questions: questions.length,
      total_time_seconds: totalTime,
      is_complete: true,
      started_at: new Date(startTime).toISOString(),
      completed_at: new Date().toISOString()
    });

    setScore(correctCount);
    setSubmitted(true);
    setSubmitting(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '12px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
        <p style={{ padding: '20px' }}>Loading...</p>
      </div>
    );
  }

  if (existingSubmission && !isPreview) {
    return (
      <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '12px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
        <RetroHeader user={user} />
        <div style={{ padding: '15px' }}>
          <div style={{ backgroundColor: 'white', border: '1px solid #999999', padding: '20px' }}>
            <h3 style={{ margin: '0 0 15px 0' }}>Test Already Completed</h3>
            <p>You have already completed this test.</p>
            {test?.show_score_to_student && (
              <p style={{ marginTop: '10px' }}>
                <strong>Your Score:</strong> {existingSubmission.score} / {existingSubmission.total_questions}
                ({Math.round((existingSubmission.score / existingSubmission.total_questions) * 100)}%)
              </p>
            )}
            {!test?.show_score_to_student && (
              <p style={{ marginTop: '10px', fontSize: '11px', color: '#666666' }}>
                Your score is being reviewed by your teacher.
              </p>
            )}
            <div style={{ marginTop: '20px' }}>
              <RetroButton onClick={() => window.location.href = createPageUrl('StudentRoom') + '?id=' + test.room_id}>
                Back to Class
              </RetroButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (submitted && !isPreview) {
    return (
      <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '12px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
        <RetroHeader user={user} />
        <div style={{ padding: '15px' }}>
          <div style={{ backgroundColor: 'white', border: '1px solid #999999', padding: '20px', textAlign: 'center' }}>
            <div style={{ backgroundColor: '#ccffcc', border: '1px solid #00cc00', padding: '15px', marginBottom: '20px' }}>
              <h3 style={{ margin: '0' }}>Test Submitted Successfully!</h3>
            </div>
            {test?.show_score_to_student ? (
              <>
                <p style={{ fontSize: '18px' }}>
                  <strong>Your Score:</strong> {score} / {questions.length}
                </p>
                <p style={{ fontSize: '14px', color: '#666666' }}>
                  {Math.round((score / questions.length) * 100)}%
                </p>
              </>
            ) : (
              <p style={{ fontSize: '13px', color: '#666666' }}>
                Your test has been submitted. Your teacher will review and provide your score.
              </p>
            )}
            <div style={{ marginTop: '20px' }}>
              <RetroButton onClick={() => window.location.href = createPageUrl('StudentRoom') + '?id=' + test.room_id}>
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
              {test?.title}
            </div>
            <div style={{ padding: '15px' }}>
              <p style={{ marginBottom: '15px' }}>{test?.description || 'No description provided.'}</p>
              
              <table style={{ marginBottom: '15px', fontSize: '11px' }}>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 'bold', paddingRight: '15px' }}>Questions:</td>
                    <td>{questions.length}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold', paddingRight: '15px' }}>Time Limit:</td>
                    <td>{test?.time_limit_minutes ? test.time_limit_minutes + ' minutes' : 'No limit'}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ backgroundColor: '#ffffcc', border: '1px solid #cccc00', padding: '10px', marginBottom: '15px', fontSize: '11px' }}>
                <strong>Warning:</strong> Once you start, you must complete the test. Do not close this window or navigate away.
              </div>

              {test?.require_access_code && (
                <RetroInput
                  label="Enter Access Code"
                  value={accessCode}
                  onChange={setAccessCode}
                  placeholder="Access code from teacher"
                />
              )}

              <div style={{ marginTop: '15px' }}>
                <RetroButton onClick={handleStart}>
                  Begin Test
                </RetroButton>
                {isPreview ? (
                  <RetroButton onClick={() => window.location.href = createPageUrl('EditTest') + '?id=' + testId} variant="secondary" style={{ marginLeft: '10px' }}>
                    Back to Editor
                  </RetroButton>
                ) : (
                  <RetroButton onClick={() => window.location.href = createPageUrl('StudentRoom') + '?id=' + test.room_id} variant="secondary" style={{ marginLeft: '10px' }}>
                    Cancel
                  </RetroButton>
                )}
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
      <div style={{ backgroundColor: '#003366', color: 'white', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span><strong>FlashRun</strong> - {test?.title}</span>
        <span>
          Question {currentQuestionIndex + 1} of {questions.length}
          {timeRemaining !== null && (
            <span style={{ marginLeft: '20px', backgroundColor: timeRemaining < 60 ? '#cc0000' : '#006600', padding: '3px 8px' }}>
              Time: {formatTime(timeRemaining)}
            </span>
          )}
        </span>
      </div>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 50px)' }}>
        <div style={{ width: '150px', backgroundColor: '#e0e0e0', padding: '10px', borderRight: '1px solid #999999' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '11px' }}>Questions</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => goToQuestion(i)}
                style={{
                  width: '30px',
                  height: '30px',
                  border: '1px solid #999999',
                  backgroundColor: answers[q.id] ? '#ccffcc' : (i === currentQuestionIndex ? '#ffffcc' : 'white'),
                  cursor: 'pointer',
                  fontSize: '10px',
                  fontWeight: i === currentQuestionIndex ? 'bold' : 'normal'
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div style={{ marginTop: '15px', fontSize: '10px', color: '#666666' }}>
            <div><span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#ccffcc', border: '1px solid #999999', marginRight: '5px' }}></span> Answered</div>
            <div style={{ marginTop: '3px' }}><span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: 'white', border: '1px solid #999999', marginRight: '5px' }}></span> Unanswered</div>
          </div>
        </div>

        <div style={{ flex: 1, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', border: '1px solid #999999', padding: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
              <strong>Question {currentQuestionIndex + 1}:</strong>
              <p style={{ marginTop: '10px', fontSize: '13px' }}>{currentQuestion?.question_text}</p>
              
              {currentQuestion?.image_url && (
                <div style={{ marginTop: '10px' }}>
                  <img src={currentQuestion.image_url} alt="Question" style={{ maxWidth: '400px', maxHeight: '300px', border: '1px solid #cccccc' }} />
                </div>
              )}
              
              {currentQuestion?.video_url && (
                <div style={{ marginTop: '10px' }}>
                  <a href={currentQuestion.video_url} target="_blank" rel="noopener noreferrer" style={{ color: '#003366' }}>
                    [View Video]
                  </a>
                </div>
              )}
            </div>

            <div style={{ marginTop: '20px' }}>
              {currentQuestion?.question_type === 'fill_in_the_blank' ? (
                <input
                  type="text"
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => selectAnswer(currentQuestion.id, e.target.value)}
                  placeholder="Type your answer here"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #999999',
                    fontFamily: 'Tahoma, Arial, sans-serif',
                    fontSize: '12px'
                  }}
                />
              ) : currentQuestion?.choices?.map((choice, i) => (
                <div
                  key={i}
                  onClick={() => selectAnswer(currentQuestion.id, choice)}
                  style={{
                    padding: '10px 15px',
                    border: '1px solid #999999',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    backgroundColor: answers[currentQuestion.id] === choice ? '#ffffcc' : 'white'
                  }}
                >
                  <input
                    type="radio"
                    checked={answers[currentQuestion.id] === choice}
                    onChange={() => selectAnswer(currentQuestion.id, choice)}
                    style={{ marginRight: '10px' }}
                  />
                  {String.fromCharCode(65 + i)}. {choice}
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              {isPreview && (
                <RetroButton 
                  onClick={() => window.location.href = createPageUrl('EditTest') + '?id=' + testId}
                  variant="secondary"
                  style={{ marginRight: '10px' }}
                >
                  Back to Editor
                </RetroButton>
              )}
              <RetroButton 
                onClick={() => goToQuestion(currentQuestionIndex - 1)} 
                variant="secondary"
                disabled={currentQuestionIndex === 0}
              >
                &lt; Previous
              </RetroButton>
              <RetroButton 
                onClick={() => goToQuestion(currentQuestionIndex + 1)} 
                variant="secondary"
                style={{ marginLeft: '10px' }}
                disabled={currentQuestionIndex === questions.length - 1}
              >
                Next &gt;
              </RetroButton>
            </div>
            <RetroButton onClick={handleSubmit} variant="success" disabled={submitting}>
              {submitting ? 'Submitting...' : isPreview ? 'End Preview' : 'Submit Test'}
            </RetroButton>
          </div>
        </div>
      </div>
    </div>
  );
}