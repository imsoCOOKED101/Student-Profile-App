import { useEffect, useState } from "react";
import { Navigate, NavLink, Outlet, useNavigate } from "react-router-dom";
import Icon, { type IconName } from "@/components/Icon";
import { ApiError, apiRequest, clearToken, errorMessage, getToken, type User } from "@/lib/api";

const navigation: { label: string; to: string; icon: IconName }[] = [
  { label: "Dashboard", to: "/dashboard", icon: "dashboard" },
  { label: "Student", to: "/profile", icon: "user" },
  { label: "Subjects", to: "/subjects", icon: "book" },
  { label: "Class Schedules", to: "/schedule", icon: "calendar" },
  { label: "Announcement", to: "/announcements", icon: "home" },
  { label: "Notifications", to: "/notifications", icon: "bell" },
  { label: "Settings", to: "/settings", icon: "settings" },
];

export default function PortalLayout() {
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(Boolean(getToken()));
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!getToken()) return;

    Promise.all([
      apiRequest<{ user: User }>("/auth/me"),
      apiRequest<{ unread_count: number }>("/notifications?per_page=1"),
    ])
      .then(([{ user: currentUser }, notificationSummary]) => {
        setUser(currentUser);
        setUnreadCount(notificationSummary.unread_count);
      })
      .catch((requestError: unknown) => {
        if (requestError instanceof ApiError && requestError.status === 401) {
          clearToken();
        } else {
          setError(errorMessage(requestError));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleLogout() {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      clearToken();
      navigate("/login", { replace: true });
    }
  }

  if (loading) return <div className="auth-loading">Loading your student portal...</div>;
  if (!getToken()) return <Navigate replace to="/login" />;
  if (error) return <div className="portal-error" role="alert">{error}</div>;

  return (
    <div className="portal">
      <aside className={`sidebar${menuOpen ? " menu-open" : ""}`}>
        <NavLink className="brand" to="/dashboard">
          <span className="brand-mark">
            <Icon name="student" size={18} />
          </span>
          <span>Student Profile</span>
        </NavLink>
        <nav className="side-nav" aria-label="Main navigation">
          {navigation.map((item) => (
            <NavLink
              className={({ isActive }) =>
                `side-link${isActive ? " active" : ""}`
              }
              key={item.to}
              to={item.to}
              onClick={() => setMenuOpen(false)}
            >
              <Icon name={item.icon} size={15} />
              <span>{item.label}</span>
              {item.label === "Notifications" && unreadCount > 0 && (
                <span className="nav-count">{unreadCount}</span>
              )}
            </NavLink>
          ))}
          <button
            className="side-link side-button"
            onClick={() => void handleLogout()}
            type="button"
          >
            <Icon name="logout" size={15} />
            <span>Logout</span>
          </button>
        </nav>
        <div className="sidebar-footer">
          <div className="mini-avatar">{user?.name.slice(0, 2).toUpperCase() ?? "ST"}</div>
          <div>
            <strong>{user?.name}</strong>
            <span>Student</span>
          </div>
          <Icon className="sidebar-more" name="chevron-down" size={14} />
        </div>
      </aside>

      <div className="portal-main">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            aria-label="Open menu"
            onClick={() => setMenuOpen(!menuOpen)}
            type="button"
          >
            <Icon name="menu" size={18} />
          </button>
          <label className="search-box">
            <Icon name="search" size={15} />
            <input
              aria-label="Search"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search"
              value={search}
            />
            {search && (
              <button
                aria-label="Clear search"
                className="clear-search"
                onClick={() => setSearch("")}
                type="button"
              >
                ×
              </button>
            )}
          </label>
          <div className="topbar-actions">
            <button
              className="icon-button notification-button"
              aria-label="Notifications"
              onClick={() => navigate("/notifications")}
              type="button"
            >
              <Icon name="bell" size={16} />
              <i />
            </button>
            <button className="account-menu" type="button">
              <span className="mini-avatar">{user?.name.slice(0, 2).toUpperCase() ?? "ST"}</span>
              <span className="account-copy">
                <strong>{user?.name}</strong>
                <small>Student</small>
              </span>
              <Icon name="chevron-down" size={13} />
            </button>
          </div>
        </header>
        <main className="page-content">
          <Outlet context={{ updateLayoutUnreadCount: setUnreadCount }} />
        </main>
      </div>
    </div>
  );
}
