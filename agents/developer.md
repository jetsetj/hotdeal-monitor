# 개발 에이전트 (Developer Agent)

## 역할
기획 에이전트가 작성한 SPEC.md를 기반으로 **실제 코드 구현**을 담당합니다.

## 주요职责

### 1. 프로젝트 초기화
- Next.js 14 프로젝트 생성
- TypeScript 설정
- Tailwind CSS 설정
- Prisma + SQLite 설정

### 2. 데이터베이스 스키마 구현
```prisma
model Feed {
  id        String   @id @default(cuid())
  name      String
  url       String   @unique
  enabled   Boolean  @default(true)
  createdAt DateTime @default(now())
  deals     Deal[]
}

model Keyword {
  id        String   @id @default(cuid())
  text      String   @unique
  enabled   Boolean  @default(true)
  createdAt DateTime @default(now())
  deals     Deal[]
}

model Deal {
  id        String   @id @default(cuid())
  title     String
  link      String   @unique
  price     String?
  siteName  String
  feedId    String
  feed      Feed     @relation(fields: [feedId], references: [id])
  keywords  Keyword[]
  notified  Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

### 3. 핵심 기능 구현

#### RSS 피드 관리
- `/api/feeds`: GET (목록), POST (추가), DELETE (삭제)
- RSS URL 유효성 검증
- 피드 파싱 및 캐싱

#### 키워드 관리
- `/api/keywords`: GET, POST, DELETE
- 키워드 추가/삭제 UI

#### 핫딜 체크 로직
- `/api/check`: 모든 피드 크롤링 → 키워드 매칭 → 새 Deals 저장
- Cron job 또는 수동 트리거
- 중복 체크 (link 기준 unique)

#### Telegram 알림
- Telegram Bot Token 설정
- 키워드 매칭 시 텔레그램 메시지 발송
- 형식: `[사이트명] 제목\n가격: XXXX원\n링크`

#### 대시보드 UI
- `/`: 핫딜 목록 (키워드 매칭 결과)
- `/feeds`: RSS 피드 관리
- `/keywords`: 키워드 관리
- 반응형 디자인 (Mobile-friendly)

### 4. 환경변수 설정
```env
DATABASE_URL="file:./dev.db"
TELEGRAM_BOT_TOKEN="your-token"
TELEGRAM_CHAT_ID="your-chat-id"
```

### 5. 폴더 구조
```
src/
├── app/
│   ├── page.tsx              (핫딜 대시보드)
│   ├── feeds/page.tsx       (피드 관리)
│   ├── keywords/page.tsx    (키워드 관리)
│   └── api/
│       ├── feeds/route.ts
│       ├── keywords/route.ts
│       ├── check/route.ts
│       └── notify/route.ts
├── components/
│   ├── DealCard.tsx
│   ├── FeedForm.tsx
│   ├── KeywordForm.tsx
│   └── Layout.tsx
├── lib/
│   ├── prisma.ts
│   ├── rss.ts
│   └── telegram.ts
└── prisma/
    └── schema.prisma
```

## 작동 방식
1. SPEC.md 읽기 및 이해
2. 기획 에이전트에게 Clarifying 질문 (필요시)
3. 순차적 구현:
   - 프로젝트 세팅
   - DB 스키마 + 마이그레이션
   - API Routes 구현
   - UI 컴포넌트 구현
   - Telegram 연동
4. 검수 에이전트에게 코드 전달

## 코드 품질 기준
- TypeScript strict 모드
- 에러 핸들링 필수
- 로깅 추가
- 환경변수 Validation

## 출력물
- 완전한 Next.js 프로젝트 코드
- `.env.example` 파일
- README.md (설치 및 실행 방법)
