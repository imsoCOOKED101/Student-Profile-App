import { Navigate, Route, Routes } from "react-router-dom";
import PortalLayout from "@/components/PortalLayout";
import AccountCreatedPage from "@/pages/auth/AccountCreatedPage";
import LoginPage from "@/pages/auth/LoginPage";
import PasswordResetPage from "@/pages/auth/PasswordResetPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import AnnouncementsPage from "@/pages/portal/AnnouncementsPage";
import DashboardPage from "@/pages/portal/DashboardPage";
import NotificationsPage from "@/pages/portal/NotificationsPage";
import ProfilePage from "@/pages/portal/ProfilePage";
import SchedulePage from "@/pages/portal/SchedulePage";
import SettingsPage from "@/pages/portal/SettingsPage";
import SubjectsPage from "@/pages/portal/SubjectsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate replace to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<PasswordResetPage />} />
      <Route path="/reset-password" element={<PasswordResetPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/account-created" element={<AccountCreatedPage />} />
      <Route element={<PortalLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/subjects" element={<SubjectsPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/announcements" element={<AnnouncementsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate replace to="/dashboard" />} />
    </Routes>
  );
}
