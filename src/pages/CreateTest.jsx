import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import RetroHeader from '@/components/RetroHeader';
import RetroButton from '@/components/RetroButton';
import { RetroInput, RetroTextarea, RetroCheckbox } from '@/components/RetroInput';
import QuestionEditor from '@/components/QuestionEditor';

export default function CreateTest() {
  const [user, setUser] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    randomize_questions: false,
    save_progress: true,
    require_access_code: false,
    access_code: '',
    time_limit_minutes: ''
  });
  const [questions, setQuestions] = useState([]);

  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get('room_id');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const currentUser = await base44.auth.me();
    setUser(currentUser);
    
    if (roomId) {
      const rooms = await base44.entities.Room.filter({ id: roomId });
      if (rooms.length > 0) setRoom(rooms[0]);
    }
    setLoading(false);
  };

  const handleSave = async (publish = false) => {
    if (!form.title.trim()) {
      alert('Test title is required');
      return;
    }
    
    setSaving(true);
    await base44.entities.Test.create({
      room_id: roomId,
      title: form.title,
      description: form.description,
      questions: questions,
      randomize_questions: form.randomize_questions,
      save_progress: form.save_progress,
      require_access_code: form.require_access_code,
      access_code: form.access_code,
      time_limit_minutes: form.time_limit_minutes ? parseInt(form.time_limit_minutes) : null,
      is_published: publish
    });
    
    window.location.href = createPageUrl('RoomDetail') + '?id=' + roomId;
  };

  const handleImport = () => {
    const input = prompt('Paste your JSON questions array:');
    if (input) {
      try {
        const imported = JSON.parse(input);
        if (Array.isArray(imported)) {
          const formatted = imported.map((q, i) => ({
            id: 'q_' + Date.now() + '_' + i,
            question_text: q.question_text || q.question || '',
            question_type: 'multiple_choice',
            choices: q.choices || q.options || [],
            correct_answer: q.correct_answer || q.answer || '',
            image_url: q.image_url || '',
            video_url: q.video_url || ''
          }));
          setQuestions([...questions, ...formatted]);
          alert('Imported ' + formatted.length + ' questions');
        }
      } catch (e) {
        alert('Invalid JSON format');
      }
    }
  };

  const handleExport = () => {
    const json = JSON.stringify(questions, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = form.title.replace(/\s+/g, '_') + '_questions.json';
    a.click();
  };

  if (loading) {
    return (
      <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '12px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
        <p style={{ padding: '20px' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '12px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <RetroHeader user={user} />
      
      <div style={{ padding: '15px' }}>
        <div style={{ backgroundColor: 'white', border: '1px solid #999999', marginBottom: '15px' }}>
          <div style={{ backgroundColor: '#336699', color: 'white', padding: '8px', fontWeight: 'bold', fontSize: '12px' }}>
            Create New Test - {room?.name}
          </div>
          <div style={{ padding: '15px' }}>
            <table style={{ width: '100%' }}>
              <tbody>
                <tr>
                  <td style={{ width: '50%', verticalAlign: 'top', paddingRight: '15px' }}>
                    <RetroInput
                      label="Test Title"
                      value={form.title}
                      onChange={(v) => setForm({ ...form, title: v })}
                      placeholder="e.g., Chapter 5 Exam"
                      required
                    />
                    <RetroTextarea
                      label="Description"
                      value={form.description}
                      onChange={(v) => setForm({ ...form, description: v })}
                      placeholder="Instructions for students..."
                      rows={3}
                    />
                    <RetroInput
                      label="Time Limit (minutes, leave blank for no limit)"
                      value={form.time_limit_minutes}
                      onChange={(v) => setForm({ ...form, time_limit_minutes: v })}
                      type="number"
                      placeholder="e.g., 60"
                    />
                  </td>
                  <td style={{ width: '50%', verticalAlign: 'top', paddingLeft: '15px', borderLeft: '1px solid #dddddd' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Test Settings:</div>
                    <RetroCheckbox
                      label="Randomize question order for each student"
                      checked={form.randomize_questions}
                      onChange={(v) => setForm({ ...form, randomize_questions: v })}
                    />
                    <RetroCheckbox
                      label="Save progress if student exits (can resume)"
                      checked={form.save_progress}
                      onChange={(v) => setForm({ ...form, save_progress: v })}
                    />
                    <RetroCheckbox
                      label="Require access code to start test"
                      checked={form.require_access_code}
                      onChange={(v) => setForm({ ...form, require_access_code: v })}
                    />
                    {form.require_access_code && (
                      <RetroInput
                        label="Access Code"
                        value={form.access_code}
                        onChange={(v) => setForm({ ...form, access_code: v })}
                        placeholder="Enter access code"
                      />
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', border: '1px solid #999999', marginBottom: '15px' }}>
          <div style={{ backgroundColor: '#336699', color: 'white', padding: '8px', fontWeight: 'bold', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Questions ({questions.length})</span>
            <span>
              <RetroButton onClick={handleImport} variant="secondary" style={{ marginRight: '5px', padding: '3px 10px' }}>
                Import JSON
              </RetroButton>
              <RetroButton onClick={handleExport} variant="secondary" style={{ padding: '3px 10px' }}>
                Export JSON
              </RetroButton>
            </span>
          </div>
          <div style={{ padding: '15px' }}>
            <QuestionEditor
              questions={questions}
              setQuestions={setQuestions}
              questionTypes={['multiple_choice']}
            />
          </div>
        </div>

        <div style={{ backgroundColor: 'white', border: '1px solid #999999', padding: '15px' }}>
          <RetroButton onClick={() => handleSave(false)} disabled={saving}>
            {saving ? 'Saving...' : 'Save as Draft'}
          </RetroButton>
          <RetroButton onClick={() => handleSave(true)} variant="success" style={{ marginLeft: '10px' }} disabled={saving}>
            Save & Publish
          </RetroButton>
          <RetroButton onClick={() => window.location.href = createPageUrl('RoomDetail') + '?id=' + roomId} variant="secondary" style={{ marginLeft: '10px' }}>
            Cancel
          </RetroButton>
        </div>
      </div>
    </div>
  );
}