-- ============================================================
-- event_participants RLS 무한 재귀 문제 수정
-- 원인: 이전 마이그레이션(20260508000001)에서 event_participants 정책이
--       event_participants 자체를 EXISTS 서브쿼리로 참조 →
--       RLS 평가 시 무한 재귀 발생 (PostgreSQL infinite recursion in policy)
-- 해결: SECURITY DEFINER 함수로 RLS 없이 참여 여부만 확인
-- ============================================================

-- 재귀 문제가 있는 정책 삭제
DROP POLICY IF EXISTS "event_participants_select_member_or_host" ON event_participants;

-- SECURITY DEFINER 함수: RLS를 우회하여 현재 사용자가 이벤트 참여자인지 확인
-- SET search_path = public: 보안 권고사항 (search_path injection 방지)
CREATE OR REPLACE FUNCTION public.is_event_participant(p_event_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.event_participants
    WHERE event_id = p_event_id
      AND user_id = auth.uid()
  );
$$;

-- 정책 재생성: 자기참조 EXISTS 대신 SECURITY DEFINER 함수 사용
CREATE POLICY "event_participants_select_member_or_host"
  ON event_participants
  FOR SELECT
  TO authenticated
  USING (
    -- 본인 참가 행
    auth.uid() = user_id
    -- 이벤트 주최자
    OR EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_participants.event_id
        AND events.created_by = auth.uid()
    )
    -- 같은 이벤트의 참여자 (SECURITY DEFINER 함수로 재귀 방지)
    OR is_event_participant(event_participants.event_id)
  );
