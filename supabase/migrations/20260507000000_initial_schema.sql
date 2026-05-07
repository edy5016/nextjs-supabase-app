-- ============================================================
-- Gather 플랫폼 초기 DB 스키마 마이그레이션
-- 생성일: 2026-05-07
-- ============================================================

-- ============================================================
-- SECTION 1: ENUM 타입 정의
-- ============================================================

CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE event_status AS ENUM ('upcoming', 'ongoing', 'ended');
CREATE TYPE participant_role AS ENUM ('host', 'participant');

-- ============================================================
-- SECTION 2: 공통 updated_at 트리거 함수
-- ============================================================

CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================
-- SECTION 3: profiles 테이블
-- auth.users 레코드 생성 시 자동으로 프로필이 생성됩니다
-- Google OAuth 사용 시 raw_user_meta_data에서 이름을 추출합니다
-- ============================================================

CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  name        TEXT,
  avatar_url  TEXT,
  role        user_role NOT NULL DEFAULT 'user',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- profiles updated_at 자동 갱신 트리거
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- 신규 사용자 가입 시 profiles 레코드 자동 생성 함수
-- SECURITY DEFINER: 함수 소유자(superuser) 권한으로 실행하여 auth.users 접근 가능
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    -- Google OAuth의 경우 raw_user_meta_data에서 full_name 추출
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- auth.users INSERT 시 handle_new_user 트리거 실행
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- SECTION 4: events 테이블
-- ============================================================

CREATE TABLE events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT NOT NULL CHECK (char_length(title) <= 100),
  description       TEXT CHECK (char_length(description) <= 1000),
  location          TEXT NOT NULL CHECK (char_length(location) <= 200),
  start_at          TIMESTAMPTZ NOT NULL,
  end_at            TIMESTAMPTZ NOT NULL,
  max_participants  INTEGER NOT NULL DEFAULT 30 CHECK (max_participants >= 1 AND max_participants <= 1000),
  cover_image_url   TEXT,
  -- invite_code: gen_random_uuid()의 앞 8자리를 기본값으로 사용
  -- 참고: Task 009에서 nanoid 기반 충돌-방지 구현으로 교체 예정
  invite_code       TEXT NOT NULL UNIQUE DEFAULT substring(gen_random_uuid()::TEXT, 1, 8),
  status            event_status NOT NULL DEFAULT 'upcoming',
  created_by        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- 종료 시각은 반드시 시작 시각보다 늦어야 함
  CONSTRAINT events_end_after_start CHECK (end_at > start_at)
);

-- events updated_at 자동 갱신 트리거
CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- events 인덱스
CREATE UNIQUE INDEX idx_events_invite_code ON events(invite_code);
CREATE INDEX idx_events_created_by ON events(created_by);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_start_at ON events(start_at DESC);

-- ============================================================
-- SECTION 5: event_participants 테이블
-- ============================================================

CREATE TABLE event_participants (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id  UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role      participant_role NOT NULL DEFAULT 'participant',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- 동일 이벤트에 동일 사용자가 중복 참가 불가
  UNIQUE(event_id, user_id)
);

-- event_participants 인덱스
CREATE INDEX idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX idx_event_participants_user_id ON event_participants(user_id);

-- ============================================================
-- SECTION 6: RLS (Row Level Security) 정책
-- ============================================================

-- profiles RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- profiles: authenticated 사용자는 모든 프로필 조회 가능
CREATE POLICY "profiles_select_authenticated"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- profiles: 본인 프로필만 수정 가능
CREATE POLICY "profiles_update_own"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- events RLS 활성화
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- events: authenticated 사용자는 모든 이벤트 조회 가능
CREATE POLICY "events_select_authenticated"
  ON events
  FOR SELECT
  TO authenticated
  USING (true);

-- events: authenticated 사용자는 자신을 created_by로 하여 이벤트 생성 가능
CREATE POLICY "events_insert_own"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- events: 주최자(created_by)만 이벤트 수정 가능
CREATE POLICY "events_update_host"
  ON events
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- events: 주최자(created_by)만 이벤트 삭제 가능
CREATE POLICY "events_delete_host"
  ON events
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- event_participants RLS 활성화
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

-- event_participants: 해당 이벤트의 참가자이거나 이벤트 주최자인 경우만 참가자 목록 조회 가능
CREATE POLICY "event_participants_select_member_or_host"
  ON event_participants
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_participants.event_id
        AND events.created_by = auth.uid()
    )
  );

-- event_participants: 본인 참가 등록 가능
CREATE POLICY "event_participants_insert_own"
  ON event_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- event_participants: 본인 참가 취소 가능
CREATE POLICY "event_participants_delete_own"
  ON event_participants
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- SECTION 7: Storage 버킷 및 정책
-- 주의: Supabase 버전에 따라 Dashboard에서만 버킷 생성 가능할 수 있음
-- ============================================================

-- event-covers 버킷 생성 (공개 버킷, 최대 5MB, 이미지 파일만 허용)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-covers',
  'event-covers',
  true,
  5242880, -- 5MB (5 * 1024 * 1024)
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Storage 정책: authenticated 사용자는 이미지 업로드 가능
CREATE POLICY "event_covers_insert_authenticated"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'event-covers');

-- Storage 정책: 누구나 이미지 조회 가능 (public 버킷)
CREATE POLICY "event_covers_select_public"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'event-covers');

-- Storage 정책: 본인이 업로드한 이미지만 삭제 가능
-- owner 컬럼이 업로드한 사용자의 UUID를 저장함
CREATE POLICY "event_covers_delete_own"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'event-covers'
    AND owner = auth.uid()
  );

-- ============================================================
-- SECTION 8: Realtime 활성화
-- event_participants와 events 테이블의 변경사항을 실시간으로 구독 가능
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE event_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE events;

-- ============================================================
-- SECTION 9: 기존 auth.users 사용자 백필
-- 마이그레이션 실행 전에 가입한 사용자들의 profiles 레코드를 생성
-- ============================================================

INSERT INTO profiles (id, email, name, avatar_url)
SELECT
  id,
  email,
  COALESCE(
    raw_user_meta_data->>'full_name',
    raw_user_meta_data->>'name',
    split_part(email, '@', 1)
  ),
  raw_user_meta_data->>'avatar_url'
FROM auth.users
ON CONFLICT (id) DO NOTHING;
