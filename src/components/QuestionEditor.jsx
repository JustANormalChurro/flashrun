import React, { useState } from 'react';
import RetroButton from '@/components/RetroButton';
import { RetroInput, RetroTextarea, RetroSelect } from '@/components/RetroInput';

export default function QuestionEditor({ 
  questions, 
  setQuestions, 
  questionTypes = ['multiple_choice', 'short_answer', 'mix_match', 'essay', 'checkbox'] 
}) {
  const [editingIndex, setEditingIndex] = useState(null);

  const addQuestion = () => {
    const newQ = {
      id: 'q_' + Date.now(),
      question_text: '',
      question_type: questionTypes[0],
      choices: ['', '', '', ''],
      correct_answer: '',
      correct_answers: [],
      match_pairs: [],
      image_url: '',
      video_url: ''
    };
    setQuestions([...questions, newQ]);
    setEditingIndex(questions.length);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateChoice = (qIndex, cIndex, value) => {
    const updated = [...questions];
    const choices = [...updated[qIndex].choices];
    choices[cIndex] = value;
    updated[qIndex].choices = choices;
    setQuestions(updated);
  };

  const addChoice = (qIndex) => {
    const updated = [...questions];
    updated[qIndex].choices = [...updated[qIndex].choices, ''];
    setQuestions(updated);
  };

  const removeChoice = (qIndex, cIndex) => {
    const updated = [...questions];
    updated[qIndex].choices = updated[qIndex].choices.filter((_, i) => i !== cIndex);
    setQuestions(updated);
  };

  const duplicateQuestion = (index) => {
    const q = { ...questions[index], id: 'q_' + Date.now() };
    setQuestions([...questions.slice(0, index + 1), q, ...questions.slice(index + 1)]);
  };

  const deleteQuestion = (index) => {
    if (window.confirm('Delete this question?')) {
      setQuestions(questions.filter((_, i) => i !== index));
      if (editingIndex === index) setEditingIndex(null);
    }
  };

  const moveQuestion = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= questions.length) return;
    const updated = [...questions];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setQuestions(updated);
    setEditingIndex(newIndex);
  };

  const typeLabels = {
    multiple_choice: 'Multiple Choice',
    short_answer: 'Short Answer',
    mix_match: 'Mix and Match',
    essay: 'Essay',
    checkbox: 'Checkbox (Select Multiple)'
  };

  return (
    <div>
      {questions.map((q, index) => (
        <div key={q.id} style={{
          border: '1px solid #999999',
          marginBottom: '10px',
          backgroundColor: editingIndex === index ? '#fffff0' : '#ffffff'
        }}>
          <div style={{
            backgroundColor: '#e0e0e0',
            padding: '5px 10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #999999'
          }}>
            <span style={{ fontWeight: 'bold', fontSize: '11px' }}>
              Question {index + 1} - {typeLabels[q.question_type] || q.question_type}
            </span>
            <span>
              <a href="#" onClick={(e) => { e.preventDefault(); moveQuestion(index, -1); }} style={{ marginRight: '8px', color: '#003366', fontSize: '10px' }}>Up</a>
              <a href="#" onClick={(e) => { e.preventDefault(); moveQuestion(index, 1); }} style={{ marginRight: '8px', color: '#003366', fontSize: '10px' }}>Down</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setEditingIndex(editingIndex === index ? null : index); }} style={{ marginRight: '8px', color: '#003366', fontSize: '10px' }}>
                {editingIndex === index ? 'Collapse' : 'Edit'}
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); duplicateQuestion(index); }} style={{ marginRight: '8px', color: '#006600', fontSize: '10px' }}>Duplicate</a>
              <a href="#" onClick={(e) => { e.preventDefault(); deleteQuestion(index); }} style={{ color: '#cc0000', fontSize: '10px' }}>Delete</a>
            </span>
          </div>
          
          {editingIndex === index ? (
            <div style={{ padding: '10px' }}>
              {questionTypes.length > 1 && (
                <RetroSelect
                  label="Question Type"
                  value={q.question_type}
                  onChange={(v) => updateQuestion(index, 'question_type', v)}
                  options={questionTypes.map(t => ({ value: t, label: typeLabels[t] }))}
                />
              )}
              
              <RetroTextarea
                label="Question Text"
                value={q.question_text}
                onChange={(v) => updateQuestion(index, 'question_text', v)}
                placeholder="Enter your question..."
                rows={2}
              />

              <RetroInput
                label="Image URL (optional, e.g., imgur link)"
                value={q.image_url}
                onChange={(v) => updateQuestion(index, 'image_url', v)}
                placeholder="https://i.imgur.com/..."
              />

              <RetroInput
                label="Video URL (optional, e.g., YouTube link)"
                value={q.video_url}
                onChange={(v) => updateQuestion(index, 'video_url', v)}
                placeholder="https://youtube.com/..."
              />

              {q.image_url && (
                <div style={{ marginBottom: '10px' }}>
                  <img src={q.image_url} alt="Preview" style={{ maxWidth: '200px', maxHeight: '150px', border: '1px solid #cccccc' }} />
                </div>
              )}

              {(q.question_type === 'multiple_choice' || q.question_type === 'checkbox') && (
                <>
                  <div style={{ fontWeight: 'bold', fontSize: '11px', marginBottom: '5px', marginTop: '10px' }}>
                    Answer Choices:
                  </div>
                  {q.choices.map((choice, cIndex) => (
                    <div key={cIndex} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                      <input
                        type={q.question_type === 'checkbox' ? 'checkbox' : 'radio'}
                        name={'correct_' + q.id}
                        checked={q.question_type === 'checkbox' 
                          ? (q.correct_answers || []).includes(choice)
                          : q.correct_answer === choice
                        }
                        onChange={() => {
                          if (q.question_type === 'checkbox') {
                            const current = q.correct_answers || [];
                            const updated = current.includes(choice)
                              ? current.filter(c => c !== choice)
                              : [...current, choice];
                            updateQuestion(index, 'correct_answers', updated);
                          } else {
                            updateQuestion(index, 'correct_answer', choice);
                          }
                        }}
                        style={{ marginRight: '8px' }}
                      />
                      <input
                        type="text"
                        value={choice}
                        onChange={(e) => updateChoice(index, cIndex, e.target.value)}
                        placeholder={'Choice ' + String.fromCharCode(65 + cIndex)}
                        style={{
                          flex: 1,
                          padding: '3px 6px',
                          border: '1px solid #999999',
                          fontFamily: 'Tahoma, Arial, sans-serif',
                          fontSize: '11px'
                        }}
                      />
                      <a href="#" onClick={(e) => { e.preventDefault(); removeChoice(index, cIndex); }} style={{ marginLeft: '8px', color: '#cc0000', fontSize: '10px' }}>Remove</a>
                    </div>
                  ))}
                  <RetroButton onClick={() => addChoice(index)} variant="secondary" style={{ padding: '2px 8px', fontSize: '10px' }}>
                    + Add Choice
                  </RetroButton>
                  <div style={{ fontSize: '10px', color: '#666666', marginTop: '5px' }}>
                    {q.question_type === 'checkbox' ? 'Check all correct answers' : 'Select the correct answer'}
                  </div>
                </>
              )}

              {q.question_type === 'short_answer' && (
                <RetroInput
                  label="Expected Answer (for auto-grading)"
                  value={q.correct_answer}
                  onChange={(v) => updateQuestion(index, 'correct_answer', v)}
                  placeholder="Enter the expected answer..."
                />
              )}

              {q.question_type === 'essay' && (
                <div style={{ fontSize: '10px', color: '#666666', fontStyle: 'italic' }}>
                  Essay questions require manual grading by the teacher.
                </div>
              )}

              {q.question_type === 'mix_match' && (
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '11px', marginBottom: '5px' }}>Match Pairs:</div>
                  {(q.match_pairs || []).map((pair, pIndex) => (
                    <div key={pIndex} style={{ display: 'flex', gap: '10px', marginBottom: '5px' }}>
                      <input
                        type="text"
                        value={pair.left || ''}
                        onChange={(e) => {
                          const pairs = [...(q.match_pairs || [])];
                          pairs[pIndex] = { ...pairs[pIndex], left: e.target.value };
                          updateQuestion(index, 'match_pairs', pairs);
                        }}
                        placeholder="Left item"
                        style={{ flex: 1, padding: '3px 6px', border: '1px solid #999999', fontSize: '11px' }}
                      />
                      <span style={{ alignSelf: 'center' }}>=</span>
                      <input
                        type="text"
                        value={pair.right || ''}
                        onChange={(e) => {
                          const pairs = [...(q.match_pairs || [])];
                          pairs[pIndex] = { ...pairs[pIndex], right: e.target.value };
                          updateQuestion(index, 'match_pairs', pairs);
                        }}
                        placeholder="Right item"
                        style={{ flex: 1, padding: '3px 6px', border: '1px solid #999999', fontSize: '11px' }}
                      />
                      <a href="#" onClick={(e) => {
                        e.preventDefault();
                        const pairs = (q.match_pairs || []).filter((_, i) => i !== pIndex);
                        updateQuestion(index, 'match_pairs', pairs);
                      }} style={{ color: '#cc0000', fontSize: '10px' }}>X</a>
                    </div>
                  ))}
                  <RetroButton onClick={() => {
                    const pairs = [...(q.match_pairs || []), { left: '', right: '' }];
                    updateQuestion(index, 'match_pairs', pairs);
                  }} variant="secondary" style={{ padding: '2px 8px', fontSize: '10px' }}>
                    + Add Pair
                  </RetroButton>
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: '10px', fontSize: '11px' }}>
              {q.question_text || <span style={{ color: '#999999', fontStyle: 'italic' }}>No question text</span>}
            </div>
          )}
        </div>
      ))}

      <RetroButton onClick={addQuestion}>
        + Add Question
      </RetroButton>
    </div>
  );
}