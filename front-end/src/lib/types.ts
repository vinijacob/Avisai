export type Role = "admin" | "student";
export type AttendanceStatus = "going" | "not_going";
export type Area = "technology" | "health" | "business" | "engineering" | "humanities";
export type Shift = "morning" | "afternoon" | "evening" | "full_time";

export type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
  course: string | null;
  area: Area | null;
  semester: number | null;
  shift: Shift | null;
  birth_date: string | null;
  age: number | null;
  registration: string | null;
  phone: string | null;
  bio: string;
  created_at: string;
};

export type ProfileInput = {
  name: string;
  course: string | null;
  semester: number | null;
  shift: Shift | null;
  birth_date: string | null;
  registration: string | null;
  phone: string | null;
  bio: string;
};

export type Catalog = {
  areas: { value: Area; label: string }[];
  courses: { name: string; area: Area }[];
};

export type EventItem = {
  id: number;
  title: string;
  description: string;
  location: string | null;
  category: string | null;
  area: Area | null;
  starts_at: string;
  ends_at: string | null;
  capacity: number | null;
  author: { id: number; name: string };
  created_at: string;
  going_count: number;
  my_status: AttendanceStatus | null;
  can_attend: boolean;
};

export type EventInput = {
  title: string;
  description: string;
  location: string | null;
  category: string | null;
  area: Area | null;
  starts_at: string;
  ends_at: string | null;
  capacity: number | null;
};

export type Attendee = {
  user: { id: number; name: string };
  email: string;
  course: string | null;
  status: AttendanceStatus;
  updated_at: string;
};
