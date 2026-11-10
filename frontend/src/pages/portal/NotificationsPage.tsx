import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import Icon from "@/components/Icon";
import PageTitle from "@/components/PageTitle";
import { apiRequest, errorMessage, type StudentNotification } from "@/lib/api";

type NotificationResponse = {
  notifications: { data: StudentNotification[] };
  unread_count: number;
};

export default function NotificationsPage() {
  const { updateLayoutUnreadCount } = useOutletContext<{ updateLayoutUnreadCount: (count: number) => void }>();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [notifications, setNotifications] = useState<StudentNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState("");

  const loadNotifications = useCallback((unread: boolean) => {
    apiRequest<NotificationResponse>(`/notifications${unread ? "?unread=1" : ""}`)
      .then(({ notifications: result, unread_count }) => {
        setNotifications(result.data);
        setUnreadCount(unread_count);
        updateLayoutUnreadCount(unread_count);
      })
      .catch((requestError: unknown) => setError(errorMessage(requestError)));
  }, [updateLayoutUnreadCount]);

  useEffect(() => {
    loadNotifications(unreadOnly);
  }, [loadNotifications, unreadOnly]);

  async function markAllRead() {
    setError("");
    try {
      await apiRequest("/notifications/read-all", { method: "PATCH" });
      setUnreadCount(0);
      updateLayoutUnreadCount(0);
      loadNotifications(unreadOnly);
    } catch (requestError) {
      setError(errorMessage(requestError));
    }
  }

  async function markRead(id: number) {
    setError("");
    try {
      await apiRequest(`/notifications/${id}/read`, { method: "PATCH" });
      loadNotifications(unreadOnly);
    } catch (requestError) {
      setError(errorMessage(requestError));
    }
  }

  return (
    <>
      <PageTitle title="Notifications" subtitle="Updates and reminders from your student portal." actions={<button className="text-button" onClick={() => void markAllRead()} type="button">Mark all as read</button>} />
      <section className="panel full-panel notifications-panel">
        <div className="notification-toolbar"><div className="tab-bar"><button className={!unreadOnly ? "tab active" : "tab"} onClick={() => setUnreadOnly(false)} type="button">All notifications</button><button className={unreadOnly ? "tab active" : "tab"} onClick={() => setUnreadOnly(true)} type="button">Unread</button></div><span>{unreadCount} unread</span></div>
        {error && <p className="portal-message error" role="alert">{error}</p>}
        {notifications.map((notification, index) => (
          <button className={`notification-item${notification.is_read ? "" : " unread"}`} key={notification.id} onClick={() => void markRead(notification.id)} type="button">
            <span className={`announcement-icon large ${["blue", "green", "purple", "orange"][index % 4]}`}><Icon name="bell" size={17} /></span>
            <span className="notice-copy"><strong className="notification-title">{notification.title}</strong><span className="notification-message">{notification.message}</span><small>{new Date(notification.created_at).toLocaleString()}</small></span>
            {notification.is_read ? <span className="tiny-tag blue">Read</span> : <span className="unread-dot" />}
          </button>
        ))}
        {notifications.length === 0 && !error && <p className="empty-notices">You’re all caught up.</p>}
      </section>
    </>
  );
}
