import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

export default function NotificationBell({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000); // Refresh every 30s
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    const allNotifs = await base44.entities.Notification.filter({ user_id: user.id }, '-created_date', 20);
    setNotifications(allNotifs);
    setUnreadCount(allNotifs.filter(n => !n.is_read).length);
  };

  const markAsRead = async (notifId) => {
    await base44.entities.Notification.update(notifId, { is_read: true });
    loadNotifications();
  };

  const deleteNotification = async (notifId) => {
    await base44.entities.Notification.delete(notifId);
    loadNotifications();
  };

  const getNotificationLink = (notif) => {
    if (notif.type === 'announcement') {
      return createPageUrl('StudentRoom') + '?id=' + notif.room_id;
    } else if (notif.type === 'test') {
      return createPageUrl('TakeTest') + '?id=' + notif.content_id;
    } else if (notif.type === 'assignment') {
      return createPageUrl('TakeAssignment') + '?id=' + notif.content_id;
    }
    return '#';
  };

  if (!user || user.user_type === 'teacher' || user.user_type === 'superadmin') {
    return null;
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          backgroundColor: unreadCount > 0 ? '#cc0000' : '#336699',
          color: 'white',
          border: '1px solid #003366',
          padding: '3px 8px',
          cursor: 'pointer',
          fontSize: '11px',
          fontWeight: 'bold',
          position: 'relative'
        }}
      >
        🔔 Notifications
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            backgroundColor: '#ffcc00',
            color: '#000',
            borderRadius: '50%',
            padding: '2px 5px',
            fontSize: '9px',
            fontWeight: 'bold'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #999999',
          width: '320px',
          maxHeight: '400px',
          overflowY: 'auto',
          zIndex: 1000,
          marginTop: '5px'
        }}>
          <div style={{ backgroundColor: '#336699', color: 'white', padding: '8px', fontWeight: 'bold' }}>
            Notifications ({notifications.length})
          </div>
          {notifications.length === 0 ? (
            <div style={{ padding: '15px', fontSize: '11px', textAlign: 'center', color: '#666' }}>
              No notifications
            </div>
          ) : (
            notifications.map(notif => (
              <div
                key={notif.id}
                style={{
                  padding: '10px',
                  borderBottom: '1px solid #e0e0e0',
                  backgroundColor: notif.is_read ? 'white' : '#ffffee'
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '3px' }}>
                  {notif.room_name}
                </div>
                <div style={{ fontSize: '10px', marginBottom: '5px' }}>
                  {notif.type.toUpperCase()}: {notif.title}
                </div>
                <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                  <a
                    href={getNotificationLink(notif)}
                    style={{ fontSize: '10px', color: '#003366' }}
                    onClick={() => markAsRead(notif.id)}
                  >
                    View
                  </a>
                  {!notif.is_read && (
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); markAsRead(notif.id); }}
                      style={{ fontSize: '10px', color: '#006600' }}
                    >
                      Mark Read
                    </a>
                  )}
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); deleteNotification(notif.id); }}
                    style={{ fontSize: '10px', color: '#cc0000' }}
                  >
                    Delete
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}