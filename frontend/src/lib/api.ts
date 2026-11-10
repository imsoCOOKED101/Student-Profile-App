export type Student = {
  id: number;
  user_id: number;
  student_number: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  course: string;
  year_level: string;
  birthdate: string | null;
  gender: string | null;
  nationality: string | null;
  phone: string | null;
  address: string | null;
};

export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  student: Student | null;
};

export type Subject = {
  id: number;
  subject_code: string;
  subject_title: string;
  units: number;
  instructor: string;
  pivot: { status: string; semester: string; academic_year: string; grade: number | null };
  schedules: Schedule[];
};

export type Schedule = {
  id: number;
  day: string;
  start_time: string;
  end_time: string;
  room: string;
  section: string | null;
  subject: Pick<Subject, "id" | "subject_code" | "subject_title" | "instructor">;
};

export type Assignment = {
  id: number;
  title: string;
  description: string | null;
  due_at: string | null;
  subject: Pick<Subject, "id" | "subject_code" | "subject_title">;
  pivot: { status: string; completed_at: string | null };
};

export type Announcement = {
  id: number;
  title: string;
  message: string;
  type: string;
  published_at: string;
};

export type StudentNotification = {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

export type StudentDocument = {
  id: number;
  name: string;
  mime_type: string;
  file_size: number;
  status: string;
  uploaded_at: string;
};

export type Dashboard = {
  student: Student;
  stats: {
    enrolled_subjects: number;
    classes_this_week: number;
    pending_assignments: number;
    unread_notifications: number;
  };
  today_schedule: Schedule[];
  subjects: Subject[];
  assignments: Assignment[];
  announcements: Announcement[];
};

export class ApiError extends Error {
  readonly status: number;
  readonly errors: Record<string, string[]>;

  constructor(
    message: string,
    status: number,
    errors: Record<string, string[]> = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8000/api").replace(/\/$/, "");
const TOKEN_KEY = "student_portal_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const payload = await response.json();

  if (!response.ok) {
    const errors = (payload.errors ?? {}) as Record<string, string[]>;
    const message = (payload.message ?? "The request could not be completed.") as string;
    throw new ApiError(message, response.status, errors);
  }

  return payload as T;
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const firstFieldError = Object.values(error.errors).flat()[0];
    return firstFieldError ?? error.message;
  }
  return error instanceof Error ? error.message : "Something went wrong.";
}
