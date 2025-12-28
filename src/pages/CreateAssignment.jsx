import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import RetroHeader from '@/components/RetroHeader';
import RetroButton from '@/components/RetroButton';
import { RetroInput, RetroTextarea, RetroCheckbox } from '@/components/RetroInput';
import QuestionEditor from '@/components/QuestionEditor';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function CreateAssignment() {
  const [user, setUser] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    max_attempts: 1,
    due_date: '',
    show_score_to_student: true
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
      alert('Assignment title is required');
      return;
    }
    
    setSaving(true);
    const assignment = await base44.entities.Assignment.create({
      room_id: roomId,
      title: form.title,
      description: form.description,
      questions: questions,
      max_attempts: parseInt(form.max_attempts) || 1,
      due_date: form.due_date || null,
      show_score_to_student: form.show_score_to_student,
      is_published: publish
    });

    // Send notifications to students if published
    if (publish) {
      const memberships = await base44.entities.RoomMembership.filter({ room_id: roomId });
      const students = memberships.filter(m => m.role === 'student');
      
      for (const student of students) {
        await base44.entities.Notification.create({
          user_id: student.user_id,
          type: 'assignment',
          room_id: roomId,
          room_name: room.name,
          content_id: assignment.id,
          title: form.title,
          message: 'New assignment available'
        });
      }
    }
    
    window.location.href = createPageUrl('RoomDetail') + '?id=' + roomId;
  };

  if (loading) {
    return <LoadingSpinner message="Loading" />;
  }

  return (
    <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '12px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <RetroHeader user={user} />
      
      <div style={{ padding: '15px' }}>
        <div style={{ backgroundColor: 'white', border: '1px solid #999999', marginBottom: '15px' }}>
          <div style={{ backgroundColor: '#336699', color: 'white', padding: '8px', fontWeight: 'bold', fontSize: '12px' }}>
            Create New Assignment - {room?.name}
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
                      placeholder="e.g., Chapter 5 Homework"
                      required
                    />
                    <RetroTextarea
                      label="Description"
                      value={form.description}
                      onChange={(v) => setForm({ ...form, description: v })}
                      placeholder="Instructions for students..."
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
                      label="Due Date (Optional)"
                      value={form.due_date}
                      onChange={(v) => setForm({ ...form, due_date: v })}
                      type="datetime-local"
                    />
                    <div style={{ marginTop: '10px' }}>
                      <RetroCheckbox
                        label="Hide score from students after completion"
                        checked={!form.show_score_to_student}
                        onChange={(v) => setForm({ ...form, show_score_to_student: !v })}
                      />
                    </div>
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
            <div style={{ backgroundColor: '#ffffcc', border: '1px solid #cccc00', padding: '8px', marginBottom: '15px', fontSize: '11px' }}>
              Assignments support multiple question types: Multiple Choice, Short Answer, Mix and Match, Essay, and Checkbox.
            </div>
            <QuestionEditor
              questions={questions}
              setQuestions={setQuestions}
              questionTypes={['multiple_choice', 'short_answer', 'mix_match', 'essay', 'checkbox']}
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