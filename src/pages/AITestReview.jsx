import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import RetroHeader from '@/components/RetroHeader';
import RetroButton from '@/components/RetroButton';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AITestReview() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [testData, setTestData] = useState(null);

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
      if (tests.length > 0) {
        setTestData(tests[0]);
      }
    }
    setLoading(false);
  };

  const handlePublish = async () => {
    if (!window.confirm('Publish this test to students?')) return;
    
    setPublishing(true);
    await base44.entities.Test.update(testId, { is_published: true });

    // Send notifications
    const memberships = await base44.entities.RoomMembership.filter({ room_id: testData.room_id });
    const students = memberships.filter(m => m.role === 'student');
    
    const rooms = await base44.entities.Room.filter({ id: testData.room_id });
    const roomName = rooms[0]?.name || '';

    for (const student of students) {
      await base44.entities.Notification.create({
        user_id: student.user_id,
        type: 'test',
        room_id: testData.room_id,
        room_name: roomName,
        content_id: testId,
        title: testData.title,
        message: 'New AI-generated test available'
      });
    }
    
    window.location.href = createPageUrl('RoomDetail') + '?id=' + testData.room_id;
  };

  const handleEdit = () => {
    window.location.href = createPageUrl('EditTest') + '?id=' + testId;
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this AI-generated test?')) return;
    await base44.entities.Test.delete(testId);
    window.location.href = createPageUrl('RoomDetail') + '?id=' + testData.room_id;
  };

  if (loading) {
    return <LoadingSpinner message="Loading AI Test Review" />;
  }

  if (!testData) {
    return (
      <div style={{ padding: '20px' }}>
        <p>Test not found</p>
      </div>
    );
  }

  const typeLabels = {
    multiple_choice: 'Multiple Choice',
    short_answer: 'Short Answer',
    mix_match: 'Mix and Match',
    essay: 'Essay',
    checkbox: 'Checkbox (Select Multiple)'
  };

  return (
    <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '12px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <RetroHeader user={user} />
      
      <div style={{ padding: '15px' }}>
        <div style={{ backgroundColor: '#ff9933', color: 'white', padding: '15px', marginBottom: '15px', border: '2px solid #cc6600' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
            ⚡ FlashSprint AI Generated Test - Review & Publish
          </div>
          <div style={{ fontSize: '11px', marginTop: '5px' }}>
            Revolutionary AI-Created Content Ready for Your Approval
          </div>
        </div>

        <div style={{ backgroundColor: 'white', border: '1px solid #999999', marginBottom: '15px' }}>
          <div style={{ backgroundColor: '#336699', color: 'white', padding: '8px', fontWeight: 'bold' }}>
            Test Information
          </div>
          <div style={{ padding: '15px' }}>
            <table style={{ width: '100%', fontSize: '11px' }}>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 'bold', padding: '5px', width: '150px' }}>Title:</td>
                  <td style={{ padding: '5px' }}>{testData.title}</td>
                </tr>
                {testData.description && (
                  <tr>
                    <td style={{ fontWeight: 'bold', padding: '5px', verticalAlign: 'top' }}>Description:</td>
                    <td style={{ padding: '5px' }}>{testData.description}</td>
                  </tr>
                )}
                <tr>
                  <td style={{ fontWeight: 'bold', padding: '5px' }}>Total Questions:</td>
                  <td style={{ padding: '5px' }}>{testData.questions?.length || 0}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold', padding: '5px' }}>Status:</td>
                  <td style={{ padding: '5px' }}>
                    <span style={{ color: '#cc6600', fontWeight: 'bold' }}>DRAFT - Awaiting Review</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', border: '1px solid #999999', marginBottom: '15px' }}>
          <div style={{ backgroundColor: '#336699', color: 'white', padding: '8px', fontWeight: 'bold' }}>
            Question Preview ({testData.questions?.length || 0} questions)
          </div>
          <div style={{ padding: '15px' }}>
            {testData.questions && testData.questions.length > 0 ? (
              testData.questions.map((q, index) => (
                <div key={index} style={{ 
                  border: '1px solid #cccccc', 
                  padding: '10px', 
                  marginBottom: '10px',
                  backgroundColor: '#fafafa'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#003366' }}>
                    Question {index + 1} - {typeLabels[q.question_type] || q.question_type}
                  </div>
                  <div style={{ marginBottom: '8px', fontSize: '11px' }}>
                    {q.question_text}
                  </div>
                  
                  {q.image_url && (
                    <div style={{ marginBottom: '8px' }}>
                      <img src={q.image_url} alt="Question" style={{ maxWidth: '300px', border: '1px solid #999' }} />
                    </div>
                  )}

                  {(q.question_type === 'multiple_choice' || q.question_type === 'checkbox') && q.choices && (
                    <div style={{ marginLeft: '15px', fontSize: '10px' }}>
                      {q.choices.map((choice, cIndex) => {
                        const isCorrect = q.question_type === 'checkbox'
                          ? (q.correct_answers || []).includes(choice)
                          : q.correct_answer === choice;
                        return (
                          <div key={cIndex} style={{ marginBottom: '3px' }}>
                            <span style={{ 
                              fontWeight: isCorrect ? 'bold' : 'normal',
                              color: isCorrect ? '#006600' : '#000'
                            }}>
                              {String.fromCharCode(65 + cIndex)}. {choice}
                              {isCorrect && ' ✓'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {q.question_type === 'short_answer' && q.correct_answer && (
                    <div style={{ marginLeft: '15px', fontSize: '10px', color: '#006600' }}>
                      Expected Answer: {q.correct_answer}
                    </div>
                  )}

                  {q.question_type === 'essay' && (
                    <div style={{ marginLeft: '15px', fontSize: '10px', fontStyle: 'italic', color: '#666' }}>
                      Requires manual grading
                    </div>
                  )}

                  {q.question_type === 'mix_match' && q.match_pairs && (
                    <div style={{ marginLeft: '15px', fontSize: '10px' }}>
                      {q.match_pairs.map((pair, pIndex) => (
                        <div key={pIndex}>
                          {pair.left} = {pair.right}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div style={{ color: '#666', fontStyle: 'italic' }}>No questions found</div>
            )}
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffcc', border: '2px solid #ffcc00', padding: '15px', marginBottom: '15px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#cc6600' }}>
            Review Checklist:
          </div>
          <div style={{ fontSize: '11px', lineHeight: '1.6' }}>
            ☐ All questions are accurate and appropriate<br/>
            ☐ Correct answers are properly marked<br/>
            ☐ Question difficulty matches your requirements<br/>
            ☐ No duplicate or confusing questions<br/>
            ☐ Ready to publish to students
          </div>
        </div>

        <div style={{ backgroundColor: 'white', border: '1px solid #999999', padding: '15px' }}>
          <RetroButton onClick={handlePublish} variant="success" disabled={publishing}>
            {publishing ? 'Publishing...' : '✓ Approve & Publish to Students'}
          </RetroButton>
          <RetroButton onClick={handleEdit} variant="secondary" style={{ marginLeft: '10px' }}>
            Edit Test
          </RetroButton>
          <RetroButton onClick={handleDelete} variant="danger" style={{ marginLeft: '10px' }}>
            Delete Test
          </RetroButton>
          <RetroButton onClick={() => window.location.href = createPageUrl('FlashSprint')} variant="secondary" style={{ marginLeft: '10px' }}>
            Back to FlashSprint
          </RetroButton>
        </div>
      </div>
    </div>
  );
}