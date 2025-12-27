import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import RetroHeader from '@/components/RetroHeader';
import RetroButton from '@/components/RetroButton';
import { createPageUrl } from '@/utils';

export default function TeacherHelp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const currentUser = await base44.auth.me();
    setUser(currentUser);
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '12px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
        <p style={{ padding: '20px' }}>Loading...</p>
      </div>
    );
  }

  const sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'rooms', label: 'Creating Rooms' },
    { id: 'tests', label: 'Creating Tests' },
    { id: 'json', label: 'JSON Import/Export' },
    { id: 'assignments', label: 'Assignments' },
    { id: 'announcements', label: 'Announcements' }
  ];

  return (
    <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '12px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <RetroHeader user={user} />
      
      <div style={{ padding: '15px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ width: '200px', verticalAlign: 'top', paddingRight: '15px' }}>
                <div style={{ backgroundColor: 'white', border: '1px solid #999999' }}>
                  <div style={{ backgroundColor: '#336699', color: 'white', padding: '8px', fontWeight: 'bold', fontSize: '12px' }}>
                    Documentation
                  </div>
                  <div style={{ padding: '5px' }}>
                    {sections.map(s => (
                      <div
                        key={s.id}
                        onClick={() => setActiveSection(s.id)}
                        style={{
                          padding: '8px 10px',
                          cursor: 'pointer',
                          backgroundColor: activeSection === s.id ? '#ffffcc' : 'transparent',
                          borderBottom: '1px solid #eeeeee',
                          fontSize: '11px'
                        }}
                      >
                        {activeSection === s.id ? '> ' : ''}{s.label}
                      </div>
                    ))}
                  </div>
                </div>
              </td>
              <td style={{ verticalAlign: 'top' }}>
                <div style={{ backgroundColor: 'white', border: '1px solid #999999' }}>
                  <div style={{ backgroundColor: '#336699', color: 'white', padding: '8px', fontWeight: 'bold', fontSize: '12px' }}>
                    {sections.find(s => s.id === activeSection)?.label}
                  </div>
                  <div style={{ padding: '15px', fontSize: '11px', lineHeight: '1.6' }}>
                    {activeSection === 'overview' && (
                      <div>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Welcome to FlashRun Documentation</h3>
                        <p>FlashRun Secure Testing Browser is a district-approved platform for creating and administering tests, assignments, and classroom announcements.</p>
                        <h4 style={{ marginTop: '15px' }}>Key Features:</h4>
                        <ul style={{ marginLeft: '20px' }}>
                          <li>Create secure testing environments (Rooms)</li>
                          <li>Design multiple choice tests with various settings</li>
                          <li>Create assignments with multiple question types</li>
                          <li>Post announcements with rich formatting</li>
                          <li>View detailed student results and analytics</li>
                        </ul>
                      </div>
                    )}

                    {activeSection === 'rooms' && (
                      <div>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Creating Classrooms</h3>
                        <p>Rooms are virtual classrooms where you organize tests, assignments, and announcements.</p>
                        <h4 style={{ marginTop: '15px' }}>Steps to Create a Room:</h4>
                        <ol style={{ marginLeft: '20px' }}>
                          <li>Click "Manage Rooms" from the dashboard</li>
                          <li>Click "Create New Classroom"</li>
                          <li>Enter the room name and your name</li>
                          <li>Add an optional description</li>
                          <li>Click "Create Classroom"</li>
                        </ol>
                        <h4 style={{ marginTop: '15px' }}>Room Codes:</h4>
                        <p><strong>Student Code:</strong> Share this with students so they can join your class.</p>
                        <p><strong>Teacher Code:</strong> Share with other teachers for collaboration access.</p>
                      </div>
                    )}

                    {activeSection === 'tests' && (
                      <div>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Creating Tests</h3>
                        <p>Tests are formal assessments with multiple choice questions.</p>
                        <h4 style={{ marginTop: '15px' }}>Test Settings:</h4>
                        <ul style={{ marginLeft: '20px' }}>
                          <li><strong>Randomize Questions:</strong> Each student sees questions in different order</li>
                          <li><strong>Save Progress:</strong> Students can exit and resume later</li>
                          <li><strong>Access Code:</strong> Require a code before starting</li>
                          <li><strong>Time Limit:</strong> Set a maximum time for completion</li>
                        </ul>
                        <h4 style={{ marginTop: '15px' }}>Adding Questions:</h4>
                        <ol style={{ marginLeft: '20px' }}>
                          <li>Click "Add Question"</li>
                          <li>Enter the question text</li>
                          <li>Add answer choices</li>
                          <li>Select the correct answer</li>
                          <li>Optionally add images or videos</li>
                        </ol>
                      </div>
                    )}

                    {activeSection === 'json' && (
                      <div>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>JSON Import/Export</h3>
                        <p>You can import and export test questions as JSON files for faster creation.</p>
                        <h4 style={{ marginTop: '15px' }}>JSON Format:</h4>
                        <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', border: '1px solid #cccccc', overflow: 'auto', fontSize: '10px' }}>
{`[
  {
    "question_text": "What is 2 + 2?",
    "choices": ["3", "4", "5", "6"],
    "correct_answer": "4",
    "image_url": "",
    "video_url": ""
  },
  {
    "question_text": "Capital of Texas?",
    "choices": ["Houston", "Austin", "Dallas", "San Antonio"],
    "correct_answer": "Austin"
  }
]`}
                        </pre>
                        <h4 style={{ marginTop: '15px' }}>Tips:</h4>
                        <ul style={{ marginLeft: '20px' }}>
                          <li>Use double quotes for all strings</li>
                          <li>Separate questions with commas</li>
                          <li>correct_answer must exactly match one choice</li>
                          <li>image_url and video_url are optional</li>
                        </ul>
                      </div>
                    )}

                    {activeSection === 'assignments' && (
                      <div>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Creating Assignments</h3>
                        <p>Assignments offer more flexibility than tests with multiple question types.</p>
                        <h4 style={{ marginTop: '15px' }}>Question Types:</h4>
                        <ul style={{ marginLeft: '20px' }}>
                          <li><strong>Multiple Choice:</strong> Single correct answer</li>
                          <li><strong>Checkbox:</strong> Multiple correct answers</li>
                          <li><strong>Short Answer:</strong> Text response with auto-grading</li>
                          <li><strong>Essay:</strong> Long text response (manual grading)</li>
                          <li><strong>Mix and Match:</strong> Pair items together</li>
                        </ul>
                        <h4 style={{ marginTop: '15px' }}>Multiple Attempts:</h4>
                        <p>Unlike tests, assignments can allow multiple attempts. Set the maximum number when creating.</p>
                      </div>
                    )}

                    {activeSection === 'announcements' && (
                      <div>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Announcements</h3>
                        <p>Post announcements to communicate with your class.</p>
                        <h4 style={{ marginTop: '15px' }}>Markdown Formatting:</h4>
                        <ul style={{ marginLeft: '20px' }}>
                          <li><code>**bold**</code> for <strong>bold text</strong></li>
                          <li><code>*italic*</code> for <em>italic text</em></li>
                          <li><code># Header</code> for headers</li>
                          <li><code>- item</code> for bullet lists</li>
                          <li><code>[text](url)</code> for links</li>
                          <li><code>![alt](url)</code> for images</li>
                        </ul>
                        <h4 style={{ marginTop: '15px' }}>Interaction Settings:</h4>
                        <p>You can enable/disable comments and likes for each announcement.</p>
                      </div>
                    )}
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginTop: '15px' }}>
          <RetroButton onClick={() => window.location.href = createPageUrl('TeacherDashboard')} variant="secondary">
            &lt; Back to Dashboard
          </RetroButton>
        </div>
      </div>
    </div>
  );
}