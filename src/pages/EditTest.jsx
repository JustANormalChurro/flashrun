import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import RetroHeader from '@/components/RetroHeader';
import RetroButton from '@/components/RetroButton';
import { RetroInput, RetroTextarea, RetroCheckbox } from '@/components/RetroInput';
import QuestionEditor from '@/components/QuestionEditor';

export default function EditTest() {
  const [user, setUser] = useState(null);
  const [test, setTest] = useState(null);
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
    time_limit_minutes: '',
    show_score_to_student: true
  });
  const [questions, setQuestions] = useState([]);

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
        const t = tests[0];
        setTest(t);
        setForm({
          title: t.title || '',
          description: t.description || '',
          randomize_questions: t.randomize_questions || false,
          save_progress: t.save_progress !== false,
          require_access_code: t.require_access_code || false,
          access_code: t.access_code || '',
          time_limit_minutes: t.time_limit_minutes || '',
          show_score_to_student: t.show_score_to_student !== false
        });
        setQuestions(t.questions || []);

        const rooms = await base44.entities.Room.filter({ id: t.room_id });
        if (rooms.length > 0) setRoom(rooms[0]);
      }
    }
    setLoading(false);
  };

  const handleSave = async (publish = null) => {
    if (!form.title.trim()) {
      alert('Test title is required');
      return;
    }
    
    setSaving(true);
    const updateData = {
      title: form.title,
      description: form.description,
      questions: questions,
      randomize_questions: form.randomize_questions,
      save_progress: form.save_progress,
      require_access_code: form.require_access_code,
      access_code: form.access_code,
      time_limit_minutes: form.time_limit_minutes ? parseInt(form.time_limit_minutes) : null,
      show_score_to_student: form.show_score_to_student
    };
    
    if (publish !== null) {
      updateData.is_published = publish;
    }

    await base44.entities.Test.update(testId, updateData);

    // Send notifications if publishing
    if (publish === true && !test.is_published) {
      const memberships = await base44.entities.RoomMembership.filter({ room_id: test.room_id });
      const students = memberships.filter(m => m.role === 'student');
      
      for (const student of students) {
        await base44.entities.Notification.create({
          user_id: student.user_id,
          type: 'test',
          room_id: test.room_id,
          room_name: room.name,
          content_id: testId,
          title: form.title,
          message: 'New test available'
        });
      }
    }

    window.location.href = createPageUrl('RoomDetail') + '?id=' + test.room_id;
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
            Edit Test - {room?.name}
            {test?.is_published && <span style={{ marginLeft: '10px', backgroundColor: '#006600', padding: '2px 6px', fontSize: '10px' }}>PUBLISHED</span>}
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
                      required
                    />
                    <RetroTextarea
                      label="Description"
                      value={form.description}
                      onChange={(v) => setForm({ ...form, description: v })}
                      rows={3}
                    />
                    <RetroInput
                      label="Time Limit (minutes)"
                      value={form.time_limit_minutes}
                      onChange={(v) => setForm({ ...form, time_limit_minutes: v })}
                      type="number"
                    />
                  </td>
                  <td style={{ width: '50%', verticalAlign: 'top', paddingLeft: '15px', borderLeft: '1px solid #dddddd' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Test Settings:</div>
                    <RetroCheckbox
                      label="Randomize question order"
                      checked={form.randomize_questions}
                      onChange={(v) => setForm({ ...form, randomize_questions: v })}
                    />
                    <RetroCheckbox
                      label="Save progress if student exits"
                      checked={form.save_progress}
                      onChange={(v) => setForm({ ...form, save_progress: v })}
                    />
                    <RetroCheckbox
                      label="Show score to student after submission"
                      checked={form.show_score_to_student}
                      onChange={(v) => setForm({ ...form, show_score_to_student: v })}
                    />
                    <RetroCheckbox
                      label="Require access code"
                      checked={form.require_access_code}
                      onChange={(v) => setForm({ ...form, require_access_code: v })}
                    />
                    {form.require_access_code && (
                      <RetroInput
                        label="Access Code"
                        value={form.access_code}
                        onChange={(v) => setForm({ ...form, access_code: v })}
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
          <RetroButton onClick={() => handleSave()} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </RetroButton>
          {!test?.is_published && (
            <RetroButton onClick={() => handleSave(true)} variant="success" style={{ marginLeft: '10px' }} disabled={saving}>
              Save & Publish
            </RetroButton>
          )}
          {test?.is_published && (
            <RetroButton onClick={() => handleSave(false)} variant="danger" style={{ marginLeft: '10px' }} disabled={saving}>
              Unpublish
            </RetroButton>
          )}
          <RetroButton onClick={() => window.location.href = createPageUrl('RoomDetail') + '?id=' + test?.room_id} variant="secondary" style={{ marginLeft: '10px' }}>
            Cancel
          </RetroButton>
        </div>
      </div>
    </div>
  );
}