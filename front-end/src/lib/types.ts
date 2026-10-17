export type Role = "admin" | "student";
export type AttendanceStatus = "going" | "not_going";

export type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
  created_at: string;
};

export type EventItem = {
  id: number;
  title: string;
  description: string;
  location: string | null;
  category: string | null;
  starts_at: string;
  ends_at: string | null;
  capacity: number | null;
  author: { id: number; name: string };
  created_at: string;
  going_count: number;
  my_status: AttendanceStatus | null;
};

export type EventInput = {
  title: string;
  description: string;
  location: string | null;
  category: string | null;
  starts_at: string;
  ends_at: string | null;
  capacity: number | null;
};

export type Attendee = {
  user: { id: number; name: string };
  email: string;
  status: AttendanceStatus;
  updated_at: string;
};
