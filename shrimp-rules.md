# Development Guidelines

## 프로젝트 개요

Next.js 15 App Router + Supabase 기반 풀스택 웹 앱. 이메일/비밀번호 및 Google OAuth 인증, 보호된 라우트, shadcn/ui 컴포넌트 시스템을 사용한다.

**기술 스택**: Next.js 15, React 19, TypeScript 5 (strict), Tailwind CSS 3.4, shadcn/ui (New York), Supabase Auth + SSR

---

## 프로젝트 아키텍처

### 디렉토리 구조 및 책임

```
app/                      # Next.js App Router (Server Component 기본)
├── layout.tsx            # Root Layout (ThemeProvider 포함)
├── page.tsx              # 공개 홈페이지
├── auth/                 # 인증 관련 라우트
│   ├── callback/route.ts # OAuth 콜백 — 여기서 exchangeCodeForSession() 호출
│   ├── confirm/route.ts  # 이메일 인증 콜백
│   ├── login/page.tsx
│   ├── sign-up/page.tsx
│   ├── forgot-password/page.tsx
│   ├── update-password/page.tsx
│   ├── sign-up-success/page.tsx
│   └── error/page.tsx
└── protected/            # 인증 필수 페이지 전용 디렉토리
    ├── layout.tsx         # 이 layout에서 인증 강제
    └── page.tsx

components/
├── ui/                   # shadcn/ui 컴포넌트만 위치 (npx로만 추가)
├── *-form.tsx            # Client Component 인증 폼
└── *.tsx                 # 공용 컴포넌트

lib/
├── utils.ts              # cn() 유틸리티 및 hasEnvVars
└── supabase/
    ├── client.ts         # 브라우저 전용 Supabase 클라이언트
    ├── server.ts         # 서버 전용 Supabase 클라이언트
    └── proxy.ts          # 미들웨어 세션 업데이트 함수

proxy.ts                  # Next.js 미들웨어 진입점
```

---

## Supabase 클라이언트 사용 규칙

### 규칙 1: 컨텍스트에 따라 올바른 클라이언트 사용

| 사용 위치 | 사용할 클라이언트 | 임포트 경로 |
|-----------|-----------------|-------------|
| Server Component | 서버 클라이언트 | `lib/supabase/server.ts` |
| Route Handler | 서버 클라이언트 | `lib/supabase/server.ts` |
| Middleware | `lib/supabase/proxy.ts`의 함수 사용 | — |
| Client Component (`"use client"`) | 브라우저 클라이언트 | `lib/supabase/client.ts` |

```typescript
// ✅ Server Component에서
import { createClient } from "@/lib/supabase/server";
const supabase = await createClient();

// ✅ Client Component에서
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();

// ❌ Server Component에서 브라우저 클라이언트 절대 금지
import { createClient } from "@/lib/supabase/client"; // 금지
```

### 규칙 2: 서버 클라이언트 인스턴스 전역 저장 금지

```typescript
// ❌ 금지: Fluid Compute 환경에서 세션 공유 문제 발생
let supabaseClient: SupabaseClient;
export function getClient() {
  if (!supabaseClient) supabaseClient = await createClient();
  return supabaseClient;
}

// ✅ 올바른 방법: 매번 새로 생성
const supabase = await createClient();
```

---

## 인증 흐름 구현 규칙

### 새 보호 페이지 추가 시

- **반드시** `app/protected/` 디렉토리 하위에 배치
- `app/protected/layout.tsx`가 자동으로 인증 강제 — 별도 인증 체크 불필요
- `app/protected/` 외부에 보호 페이지 생성 금지

```typescript
// ✅ 올바른 위치: app/protected/my-feature/page.tsx
// ❌ 금지: app/my-feature/page.tsx (보호 없음)
```

### 인증 상태 확인 패턴

```typescript
// Server Component에서 사용자 확인
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();

// ❌ getSession() 대신 getUser() 사용 (보안상 이유)
```

### OAuth 콜백 처리

- Google OAuth 콜백은 `app/auth/callback/route.ts`에서만 처리
- 새 OAuth 제공자 추가 시 동일 파일에서 처리

---

## 컴포넌트 작성 규칙

### Server vs Client Component 판단

```
상태(useState) 또는 이벤트 핸들러 필요? → Client Component ("use client")
Supabase 데이터 직접 패치? → Server Component 권장
브라우저 API(window, document) 사용? → Client Component
```

### Client Component 규칙

```typescript
// ✅ 파일 최상단에 "use client" 선언
"use client";

import { useState } from "react";
```

### Suspense 사용 패턴

```typescript
// Server Component에서 async Client Component를 감쌀 때
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <AsyncComponent />
    </Suspense>
  );
}
```

### shadcn/ui 컴포넌트 추가

```bash
# ✅ 반드시 CLI로 추가
npx shadcn@latest add <component-name>

# ❌ 금지: 컴포넌트 파일 수동 복사
```

- 새 UI 컴포넌트는 자동으로 `components/ui/` 에 배치됨
- `components.json` 설정 변경 금지 (style: new-york, baseColor: neutral)

---

## 스타일링 규칙

### Tailwind CSS 사용

```typescript
// ✅ Tailwind 클래스 사용
<div className="flex items-center gap-4 rounded-lg bg-background p-4">

// ❌ 금지: 인라인 style 속성 (필요한 경우에만 예외)
<div style={{ display: "flex" }}>
```

### 클래스 병합: cn() 유틸리티 사용

```typescript
import { cn } from "@/lib/utils";

// ✅ 조건부 클래스 병합
<div className={cn("base-class", isActive && "active-class", className)}>
```

### 다크모드

- `dark:` 접두사 사용 (HTML class 기반)
- CSS 색상은 `app/globals.css`의 HSL 변수 참조
- 새 색상 추가 시 `app/globals.css`에 CSS 변수 정의 후 `tailwind.config.ts`에 등록

### 컴포넌트 variant 정의

```typescript
// ✅ CVA(class-variance-authority) 사용
import { cva } from "class-variance-authority";

const buttonVariants = cva("base-classes", {
  variants: {
    variant: { default: "...", destructive: "..." }
  }
});
```

---

## 코드 품질 규칙

### TypeScript

- `strict: true` 모드 — 타입 단언(`as`) 최소화
- 모든 함수 파라미터/반환값에 타입 명시
- `any` 타입 사용 금지, 불가피한 경우 `unknown` 사용

### 임포트 경로

```typescript
// ✅ 절대 경로 별칭 사용
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

// ❌ 상대 경로 사용 금지 (같은 디렉토리 내부 제외)
import { cn } from "../../lib/utils";
```

### 명명 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 파일 | kebab-case | `login-form.tsx` |
| 컴포넌트 함수 | PascalCase | `LoginForm` |
| 변수/함수 | camelCase | `createClient` |
| 환경 변수 | SCREAMING_SNAKE_CASE | `NEXT_PUBLIC_SUPABASE_URL` |
| 코드 주석 | 한국어 | `// 사용자 세션 확인` |

---

## 환경 변수 규칙

### 필수 환경 변수

```env
NEXT_PUBLIC_SUPABASE_URL=           # Supabase 프로젝트 URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=  # Supabase anon/publishable 키
```

### 규칙

- `NEXT_PUBLIC_` 접두사: 브라우저에 노출되는 공개 값만
- 서버 전용 비밀값(서비스 롤 키 등): `NEXT_PUBLIC_` 접두사 사용 금지
- 새 환경 변수 추가 시 `.env.example`에도 반드시 추가 (값 없이 키만)
- `hasEnvVars` 체크: `lib/utils.ts`에서 제공 — 환경 변수 미설정 경고에 사용

---

## 파일 동시 수정 규칙

| 변경 사항 | 동시에 수정할 파일 |
|-----------|------------------|
| 새 환경 변수 추가 | `.env.example` + `.env.local` |
| 새 shadcn 컴포넌트 추가 | CLI 자동 처리 (수동 수정 불필요) |
| Tailwind 새 색상 추가 | `app/globals.css` + `tailwind.config.ts` |
| 새 보호 라우트 추가 | `app/protected/` 하위에만 배치 |
| OAuth 제공자 추가 | `app/auth/callback/route.ts` + 관련 버튼 컴포넌트 |

---

## 미들웨어 규칙

### 세션 업데이트 로직 위치

- `lib/supabase/proxy.ts`의 `updateSession()` — 수정 시 쿠키 처리 로직 유지 필수
- `proxy.ts` (루트): 미들웨어 진입점, matcher 설정 포함

### Matcher 패턴

```typescript
// 정적 자산 제외 패턴 유지 (변경 시 성능 저하 주의)
matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]
```

---

## 커밋 규칙

### Conventional Commits 형식 (Commitlint 강제)

```
<type>(<scope>): <description>

# type 목록
feat:     새 기능
fix:      버그 수정
docs:     문서 변경
style:    코드 스타일 (로직 변경 없음)
refactor: 리팩토링
test:     테스트
chore:    빌드/설정 변경
```

### 커밋 메시지 언어: 한국어

```
# ✅ 올바른 커밋
feat(auth): Google OAuth 로그인 추가

# ❌ 잘못된 커밋 (영어 사용)
feat(auth): Add Google OAuth login
```

---

## AI 결정 기준

### 모호한 상황 판단 트리

```
새 페이지/기능 추가 요청
├── 로그인 필요? → app/protected/ 하위
└── 공개 접근? → app/ 직하에 배치

Supabase 데이터 패치 위치
├── 초기 데이터 로드 → Server Component (성능 우선)
└── 사용자 상호작용 후 → Client Component + createClient()

컴포넌트 생성
├── 인터랙션 있음? → "use client" + Client Component
└── 정적 렌더링? → Server Component (기본)

스타일 추가
├── 새 색상? → globals.css + tailwind.config.ts 동시 수정
├── 재사용 variant? → CVA 사용
└── 일회성 클래스? → cn() + Tailwind 클래스
```

---

## 절대 금지 사항

- **Server Component에서 `lib/supabase/client.ts` 임포트** — 세션 접근 불가
- **`app/protected/` 외부에 인증 필수 페이지 배치** — 보안 취약점
- **`supabase.auth.getSession()` 사용** — `getUser()` 사용 (서버 검증)
- **shadcn/ui 컴포넌트 파일 직접 수동 편집하여 구조 변경** — CLI로만 추가
- **전역 변수에 Supabase 서버 클라이언트 캐싱** — Fluid Compute 세션 오염
- **`NEXT_PUBLIC_` 접두사로 서비스 롤 키 노출** — 보안 위반
- **인라인 `style={{}}` 속성으로 Tailwind 대체** — 일관성 깨짐
- **상대 경로 임포트 (`../../lib/...`)** — `@/` 별칭 사용
- **TypeScript `any` 타입 사용** — `unknown` 또는 명시적 타입 사용
