export type UserRole = "user" | "admin";

export type EventStatus = "upcoming" | "ongoing" | "ended";

export type ParticipantRole = "host" | "participant";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string;
  start_at: string;
  end_at: string;
  max_participants: number;
  cover_image_url: string | null;
  invite_code: string;
  status: EventStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  role: ParticipantRole;
  joined_at: string;
}

export type EventWithHost = Event & {
  host: Pick<User, "id" | "name" | "avatar_url">;
};

export type EventWithCount = Event & {
  participant_count: number;
};

export type EventWithParticipants = EventWithHost & {
  participants: (EventParticipant & { user: User })[];
};

export type ApiResponse<T> = {
  data: T | null;
  error: string | null;
};

export type PaginatedResponse<T> = {
  data: T[];
  count: number;
  page: number;
  per_page: number;
};
