-- ============================================================
-- event_participants RLS 정책 수정
-- 버그: 새 참여자(Account B)가 이벤트에 참여 후 상세 페이지에서
--       다른 참여자를 볼 수 없는 문제 수정
-- 변경: "본인 행 또는 주최자" → "해당 이벤트의 참여자라면 모든 참여자 조회 가능"
-- ============================================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "event_participants_select_member_or_host" ON event_participants;

-- 새 정책: 이벤트에 참여 중인 사용자는 해당 이벤트의 모든 참여자 목록 조회 가능
-- 이벤트 주최자(created_by)도 포함
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
    -- 같은 이벤트의 다른 참여자 (이벤트에 참여한 사람은 동료 참여자 목록 조회 가능)
    OR EXISTS (
      SELECT 1 FROM event_participants ep2
      WHERE ep2.event_id = event_participants.event_id
        AND ep2.user_id = auth.uid()
    )
  );
