import type { AttendanceStatus, Attendee, EventInput, EventItem, Role, User } from "./types";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

type ValidationIssue = { msg: string };

function errorMessage(body: unknown): string {
  const detail = (body as { detail?: unknown } | null)?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    return (detail as ValidationIssue[]).map((d) => d.msg.replace(/^Value error, /, "")).join(" ");
  }
  return "Algo deu errado. Tente novamente.";
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      ...init,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiError(0, "Não foi possível conectar ao servidor.");
  }

  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, errorMessage(body));
  return body as T;
}

const json = (data: unknown) => JSON.stringify(data);

export const api = {
  me: () => request<User>("/auth/me"),
  login: (email: string, password: string) =>
    request<User>("/auth/login", { method: "POST", body: json({ email, password }) }),
  register: (name: string, email: string, password: string) =>
    request<User>("/auth/register", { method: "POST", body: json({ name, email, password }) }),
  logout: () => request<void>("/auth/logout", { method: "POST" }),

  events: (scope: "upcoming" | "past") => request<EventItem[]>(`/events?scope=${scope}`),
  event: (id: number) => request<EventItem>(`/events/${id}`),
  createEvent: (data: EventInput) => request<EventItem>("/events", { method: "POST", body: json(data) }),
  updateEvent: (id: number, data: EventInput) =>
    request<EventItem>(`/events/${id}`, { method: "PUT", body: json(data) }),
  deleteEvent: (id: number) => request<void>(`/events/${id}`, { method: "DELETE" }),
  setAttendance: (id: number, status: AttendanceStatus) =>
    request<EventItem>(`/events/${id}/attendance`, { method: "PUT", body: json({ status }) }),
  clearAttendance: (id: number) => request<EventItem>(`/events/${id}/attendance`, { method: "DELETE" }),
  attendees: (id: number) => request<Attendee[]>(`/events/${id}/attendees`),

  users: () => request<User[]>("/users"),
  setRole: (id: number, role: Role) =>
    request<User>(`/users/${id}/role`, { method: "PATCH", body: json({ role }) }),
};
