import type { User, EventWithCount, EventParticipant } from "@/types";

export const DUMMY_USERS: User[] = [
  {
    id: "user-001",
    email: "host@example.com",
    name: "김주최",
    avatar_url: "https://picsum.photos/seed/user1/100/100",
    role: "user",
    created_at: "2026-01-10T09:00:00Z",
    updated_at: "2026-01-10T09:00:00Z",
  },
  {
    id: "user-002",
    email: "participant1@example.com",
    name: "이참여",
    avatar_url: "https://picsum.photos/seed/user2/100/100",
    role: "user",
    created_at: "2026-01-15T09:00:00Z",
    updated_at: "2026-01-15T09:00:00Z",
  },
  {
    id: "user-003",
    email: "participant2@example.com",
    name: "박모임",
    avatar_url: "https://picsum.photos/seed/user3/100/100",
    role: "user",
    created_at: "2026-02-01T09:00:00Z",
    updated_at: "2026-02-01T09:00:00Z",
  },
];

export const DUMMY_EVENTS: EventWithCount[] = [
  {
    id: "event-001",
    title: "봄 소풍 모임",
    description: "한강에서 즐기는 봄 소풍! 음식은 각자 준비해오세요.",
    location: "한강 여의도 공원",
    event_date: "2026-05-10T11:00:00Z",
    cover_image_url: "https://picsum.photos/seed/event1/800/450",
    invite_code: "abc123",
    status: "upcoming",
    created_by: "user-001",
    created_at: "2026-04-01T09:00:00Z",
    updated_at: "2026-04-01T09:00:00Z",
    participant_count: 8,
  },
  {
    id: "event-002",
    title: "생일 파티",
    description: "친구의 30번째 생일을 축하하는 자리입니다.",
    location: "강남구 역삼동 파티룸",
    event_date: "2026-05-20T18:00:00Z",
    cover_image_url: "https://picsum.photos/seed/event2/800/450",
    invite_code: "def456",
    status: "upcoming",
    created_by: "user-001",
    created_at: "2026-04-10T09:00:00Z",
    updated_at: "2026-04-10T09:00:00Z",
    participant_count: 15,
  },
  {
    id: "event-003",
    title: "개발자 네트워킹",
    description: "프론트엔드 개발자들의 캐주얼 네트워킹 모임.",
    location: "서울 마포구 공유 오피스",
    event_date: "2026-06-05T19:00:00Z",
    cover_image_url: "https://picsum.photos/seed/event3/800/450",
    invite_code: "ghi789",
    status: "upcoming",
    created_by: "user-002",
    created_at: "2026-04-15T09:00:00Z",
    updated_at: "2026-04-15T09:00:00Z",
    participant_count: 22,
  },
  {
    id: "event-004",
    title: "주말 등산",
    description: "북한산 코스 등산 모임. 초보자도 환영!",
    location: "북한산 국립공원 입구",
    event_date: "2026-04-27T07:00:00Z",
    cover_image_url: "https://picsum.photos/seed/event4/800/450",
    invite_code: "jkl012",
    status: "ongoing",
    created_by: "user-001",
    created_at: "2026-04-20T09:00:00Z",
    updated_at: "2026-04-20T09:00:00Z",
    participant_count: 12,
  },
  {
    id: "event-005",
    title: "독서 모임",
    description: "이달의 책: 사피엔스. 다음 달 모임에서 토론합니다.",
    location: "종로구 카페 책방",
    event_date: "2026-03-15T14:00:00Z",
    cover_image_url: "https://picsum.photos/seed/event5/800/450",
    invite_code: "mno345",
    status: "ended",
    created_by: "user-002",
    created_at: "2026-03-01T09:00:00Z",
    updated_at: "2026-03-01T09:00:00Z",
    participant_count: 6,
  },
];

export const DUMMY_PARTICIPANTS: (EventParticipant & { user: User })[] = [
  {
    id: "ep-001",
    event_id: "event-001",
    user_id: "user-001",
    role: "host",
    joined_at: "2026-04-01T09:00:00Z",
    user: DUMMY_USERS[0],
  },
  {
    id: "ep-002",
    event_id: "event-001",
    user_id: "user-002",
    role: "participant",
    joined_at: "2026-04-02T10:00:00Z",
    user: DUMMY_USERS[1],
  },
  {
    id: "ep-003",
    event_id: "event-001",
    user_id: "user-003",
    role: "participant",
    joined_at: "2026-04-03T11:00:00Z",
    user: DUMMY_USERS[2],
  },
];

export function getDummyEventById(id: string): EventWithCount | undefined {
  return DUMMY_EVENTS.find((e) => e.id === id);
}

export function getDummyEventsByUserId(userId: string): EventWithCount[] {
  return DUMMY_EVENTS.filter(
    (e) =>
      e.created_by === userId ||
      DUMMY_PARTICIPANTS.some((p) => p.event_id === e.id && p.user_id === userId)
  );
}
