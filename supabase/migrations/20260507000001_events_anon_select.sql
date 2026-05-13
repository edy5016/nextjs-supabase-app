-- events: 비로그인(anon) 사용자도 이벤트 조회 가능
-- 초대 링크로 공유된 이벤트를 로그인 전에 미리볼 수 있도록 허용
CREATE POLICY "events_select_anon"
  ON events
  FOR SELECT
  TO anon
  USING (true);
