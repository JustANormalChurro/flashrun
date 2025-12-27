import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import RetroHeader from '@/components/RetroHeader';
import RetroButton from '@/components/RetroButton';
import { RetroInput, RetroTextarea } from '@/components/RetroInput';
import QuestionEditor from '@/components/QuestionEditor';

export default function EditAssignment() {
  const [user, setUser] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    max_attempts: 1,
    due_date: ''
  });
  const [questions, setQuestions] = useState([]);

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
        setForm({
          title: a.title || '',
          description: a.description || '',
          max_attempts: a.max_attempts || 1,
          due_date: a.due_date ? a.due_date.slice(0, 16) : ''
        });
        setQuestions(a.questions || []);

        const rooms = await base44.entities.Room.filter({ id: a.room_id });
        if (rooms.length > 0) setRoom(rooms[0]);
      }
    }
    setLoading(false);
  };

  const handleSave = async (publish = null) => {
    if (!form.title.trim()) {
      alert('Assignment title is required');
      return;
    }
    
    setSaving(true);
    const updateData = {
      title: form.title,
      description: form.description,
      questions: questions,
      max_attempts: parseInt(form.max_attempts) || 1,
      due_date: form.due_date || null
    };
    
    if (publish !== null) {
      updateData.is_published = publish;
    }

    await base44.entities.Assignment.update(assignmentId, updateData);
    window.location.href = createPageUrl('RoomDetail') + '?id=' + assignment.room_id;
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
            Edit Assignment - {room?.name}
            {assignment?.is_published && <span style={{ marginLeft: '10px', backgroundColor: '#006600', padding: '2px 6px', fontSize: '10px' }}>PUBLISHED</span>}
          </div>
          <div style={{ padding: '15px' }}>
            <table style={{ width: '100%' }}>
              <tbody>
                <tr>
                  <td style={{ width: '50%', verticalAlign: 'top', paddingRight: '15px' }}>
                    <RetroInput
                      label="Assignment Title"
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
                  </td>
                  <td style={{ width: '50%', verticalAlign: 'top', paddingLeft: '15px', borderLeft: '1px solid #dddddd' }}>
                    <RetroInput
                      label="Maximum Attempts"
                      value={form.max_attempts}
                      onChange={(v) => setForm({ ...form, max_attempts: v })}
                      type="number"
                    />
                    <RetroInput
                      label="Due Date"
                      value={form.due_date}
                      onChange={(v) => setForm({ ...form, due_date: v })}
                      type="datetime-local"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', border: '1px solid #999999', marginBottom: '15px' }}>
          <div style={{ backgroundColor: '#336699', color: 'white', padding: '8px', fontWeight: 'bold', fontSize: '12px' }}>
            Questions ({questions.length})
          </div>
          <div style={{ padding: '15px' }}>
            <QuestionEditor
              questions={questions}
              setQuestions={setQuestions}
              questionTypes={['multiple_choice', 'short_answer', 'mix_match', 'essay', 'checkbox']}
            />
          </div>
        </div>

        <div style={{ backgroundColor: 'white', border: '1px solid #999999', padding: '15px' }}>
          <RetroButton onClick={() => handleSave()} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </RetroButton>
          {!assignment?.is_published && (
            <RetroButton onClick={() => handleSave(true)} variant="success" style={{ marginLeft: '10px' }} disabled={saving}>
              Save & Publish
            </RetroButton>
          )}
          {assignment?.is_published && (
            <RetroButton onClick={() => handleSave(false)} variant="danger" style={{ marginLeft: '10px' }} disabled={saving}>
              Unpublish
            </RetroButton>
          )}
          <RetroButton onClick={() => window.location.href = createPageUrl('RoomDetail') + '?id=' + assignment?.room_id} variant="secondary" style={{ marginLeft: '10px' }}>
            Cancel
          </RetroButton>
        </div>
      </div>
    </div>
  );
}