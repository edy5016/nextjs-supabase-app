---
description: 
alwaysApply: true
---

# CLAUDE.md

이 파일은 이 저장소에서 작업할 때 Claude Code(claude.ai/code)에게 제공되는 가이드입니다.

## 명령어

```bash
npm run dev        # 개발 서버 시작
npm run build      # 프로덕션 빌드
npm run start      # 프로덕션 서버 실행
npm run lint       # ESLint 실행
```

테스트 스위트는 설정되어 있지 않습니다.

## 환경 설정

`.env.example`을 `.env.local`로 복사한 후 다음 값을 입력하세요:

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase 프로젝트 설정에서 확인
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — Supabase 프로젝트 설정에서 확인

## 아키텍처

**Next.js 15 App Router** 기반으로 React 19, TypeScript, Tailwind CSS, shadcn/ui, Supabase(인증 및 데이터)를 사용합니다.

### Supabase 클라이언트 패턴

컨텍스트에 따라 두 가지 클라이언트를 구분해서 사용해야 합니다:

- `lib/supabase/client.ts` — 브라우저 클라이언트, Client Component(`"use client"`)에서 사용
- `lib/supabase/server.ts` — SSR 클라이언트, `@supabase/ssr`을 사용하며 쿠키 기반 세션 처리, Server Component 및 Route Handler에서 사용

서버 사이드 코드에서 브라우저 클라이언트를 사용하면 사용자 세션에 접근할 수 없습니다.

### 인증 흐름

인증 관련 라우트는 `app/auth/` 아래에 위치합니다:

- `login/`, `sign-up/`, `forgot-password/`, `update-password/` — 폼 페이지
- `confirm/route.ts` — Supabase 이메일 인증 콜백을 처리하는 Route Handler
- `error/` — 인증 오류 표시

보호된 콘텐츠는 `app/protected/` 아래에 위치합니다. `app/protected/layout.tsx`에서 인증을 강제하며, 로그인하지 않은 사용자는 리다이렉트됩니다. 새로운 보호된 페이지는 이 디렉토리 하위에 추가하세요.

### 스타일링

- 클래스 기반 다크 모드(`dark:` 접두사)를 사용하는 Tailwind
- `app/globals.css`에서 HSL 변수로 색상 시스템 정의
- `lib/utils.ts`의 `cn()` 유틸리티로 `clsx` + `tailwind-merge`를 통해 클래스명 병합
- shadcn/ui 컴포넌트는 `components.json`으로 설정; 새 컴포넌트 추가 시 `npx shadcn@latest add <component>` 사용
