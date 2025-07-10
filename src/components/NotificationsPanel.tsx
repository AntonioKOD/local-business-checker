'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Notification {
  id: string;
  message: string;
  createdAt: string;
}

interface NotificationsPanelProps {
  userId: string;
  onClose: () => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ userId, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // TODO: Create this endpoint
        const response = await fetch(`/api/notifications?userId=${userId}&unread=true`);
        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [userId]);

  const handleMarkAsRead = async (id: string) => {
    // Optimistically update UI
    setNotifications(prev => prev.filter(n => n.id !== id));

    try {
      // TODO: Create this endpoint
      await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      });
    } catch (error) {
      console.error("Failed to mark notification as read", error);
      // Revert if API call fails (logic not shown for brevity)
    }
  };

  return (
    <div className="absolute top-16 right-0 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      <div className="flex justify-between items-center p-3 border-b">
        <h4 className="font-semibold">Notifications</h4>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100"><X size={18}/></button>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {loading && <p className="p-4 text-center text-gray-500">Loading...</p>}
        {!loading && notifications.length === 0 && (
          <p className="p-4 text-center text-gray-500">No new notifications.</p>
        )}
        {notifications.map(notification => (
          <div key={notification.id} className="p-3 border-b hover:bg-gray-50">
            <p className="text-sm">{notification.message}</p>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-400">{new Date(notification.createdAt).toLocaleString()}</span>
              <button onClick={() => handleMarkAsRead(notification.id)} className="text-xs text-blue-500 hover:underline">Mark as read</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPanel; 