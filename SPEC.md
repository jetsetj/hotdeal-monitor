# 핫딜 모니터 - 프로젝트 사양

## 1. 개요

### 프로젝트 설명
사용자가 등록한 키워드 기반으로 여러 핫딜/할인 RSS 피드를 모니터링하여, 조건에 맞는 Deals이 발견되면 Telegram으로 실시간 알림을 발송하는 개인용 웹 앱입니다.

### 주요 기능
1. **RSS 피드 관리**: 핫딜 사이트 RSS 추가/삭제/활성화
2. **키워드 필터링**: 원하는 키워드 등록 후 자동 매칭
3. **핫딜 대시보드**: 매칭된 핫딜 목록 확인
4. **Telegram 알림**: 키워드 매칭 시 텔레그램 메시지 발송

### 타겟 유저
- 개인 사용 (본인만 사용)
- 한국어 기반 핫딜 모니터링 목적

---

## 2. 기술 스택

### 프레임워크
- **Next.js 14** (App Router)
- **TypeScript** (strict mode)
- **Tailwind CSS** (스타일링)

### 데이터베이스
- **Prisma ORM**
- **SQLite** (로컬 파일 DB)

### 라이브러리
- `rss-parser`: RSS 피드 파싱
- `node-telegram-bot-api`: 텔레그램 봇 연동

### 배포
- 로컬 실행 (Vercel 배포 가능)

---

## 3. 기능 요구사항

### 3.1 RSS 피드 관리
- [ ] RSS 피드 추가 (URL 입력)
- [ ] RSS 피드 목록 조회
- [ ] RSS 피드 삭제
- [ ] 피드 활성화/비활성화 토글
- [ ] URL 유효성 및 RSS 형식 검증

### 3.2 키워드 관리
- [ ] 키워드 추가
- [ ] 키워드 목록 조회
- [ ] 키워드 삭제
- [ ] 키워드 활성화/비활성화 토글

### 3.3 핫딜 체크 및 알림
- [ ] 모든 활성 피드 크롤링
- [ ] 제목/설명 키워드 매칭
- [ ] 새 Deal 감지 → DB 저장
- [ ] Telegram 알림 발송 (키워드 매칭 시)
- [ ] 이미 알림 보낸 Deal 재알림 방지

### 3.4 대시보드 UI
- [ ] 핫딜 목록 표시 (카드 형태)
- [ ] 필터/검색 기능
- [ ] 페이징 또는 무한 스크롤
- [ ] 반응형 디자인 (모바일 지원)

---

## 4. 데이터 모델

### Feed
| 필드 | 타입 | 설명 |
|------|------|------|
| id | String (cuid) | 고유 ID |
| name | String | 피드 이름 (사용자 지정) |
| url | String | RSS URL |
| enabled | Boolean | 활성화 여부 |
| createdAt | DateTime | 생성 시간 |

### Keyword
| 필드 | 타입 | 설명 |
|------|------|------|
| id | String (cuid) | 고유 ID |
| text | String | 키워드 텍스트 |
| enabled | Boolean | 활성화 여부 |
| createdAt | DateTime | 생성 시간 |

### Deal
| 필드 | 타입 | 설명 |
|------|------|------|
| id | String (cuid) | 고유 ID |
| title | String | 핫딜 제목 |
| link | String | 원본 링크 (unique) |
| price | String? | 가격 정보 |
| siteName | String | 사이트명 |
| feedId | String | Feed FK |
| notified | Boolean | 알림 발송 여부 |
| createdAt | DateTime | 감지 시간 |

---

## 5. API 엔드포인트

### Feeds
| Method | Endpoint | 설명 | Request Body |
|--------|----------|------|---------------|
| GET | /api/feeds | 피드 목록 조회 | - |
| POST | /api/feeds | 피드 추가 | `{ name: string, url: string }` |
| PATCH | /api/feeds | 피드 활성화/비활성화 | `{ id: string, enabled: boolean }` |
| DELETE | /api/feeds | 피드 삭제 | `{ id: string }` |

### Keywords
| Method | Endpoint | 설명 | Request Body |
|--------|----------|------|---------------|
| GET | /api/keywords | 키워드 목록 조회 | - |
| POST | /api/keywords | 키워드 추가 | `{ text: string }` |
| PATCH | /api/keywords | 키워드 활성화/비활성화 | `{ id: string, enabled: boolean }` |
| DELETE | /api/keywords | 키워드 삭제 | `{ id: string }` |

### Deals
| Method | Endpoint | 설명 | Query Params |
|--------|----------|------|--------------|
| GET | /api/deals | 핫딜 목록 조회 | `page`, `limit`, `keyword`, `siteName` |

### System
| Method | Endpoint | 설명 | Auth |
|--------|----------|------|------|
| POST | /api/check | 핫딜 체크 실행 | `CRON_SECRET` header |

### API 응답 형식

#### 성공 응답 (200, 201)
```json
{
  "success": true,
  "data": { ... },
  "message": "Success message"
}
```

#### 에러 응답 (400, 404, 500)
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "에러 메시지"
  }
}
```

#### 페이지네이션 응답
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## 6. 에러 처리 규칙

### HTTP 상태 코드
| 상태 코드 | 의미 | 사용 시나리오 |
|----------|------|--------------|
| 200 | 성공 | 정상 조회/수정 |
| 201 | 생성됨 | 리소스 생성 성공 |
| 400 | 잘못된 요청 | 입력 검증 실패, 잘못된 파라미터 |
| 404 | 찾을 수 없음 | 존재하지 않는 리소스 |
| 500 | 서버 에러 | 내부 서버 에러 |

### 에러 코드 정의
| 코드 | 설명 |
|------|------|
| VALIDATION_ERROR | 입력값 검증 실패 |
| DUPLICATE_FEED | 중복된 RSS URL |
| INVALID_RSS | 유효하지 않은 RSS 형식 |
| FEED_NOT_FOUND | 피드를 찾을 수 없음 |
| KEYWORD_NOT_FOUND | 키워드를 찾을 수 없음 |
| TELEGRAM_ERROR | 텔레그램 메시지 전송 실패 |
| RSS_PARSE_ERROR | RSS 파싱 실패 |
| UNAUTHORIZED | 인증 실패 (크론 API) |

### 에러 처리 원칙
1. 모든 API는 try-catch로 감싸고, 예외는统一된 형식으로 반환
2. 클라이언트에는 내부 에러 details를 노출하지 않음
3. 로깅을 통해 에러 추적 (console.error 또는 로거)

---

## 7. Telegram Bot 설정 가이드

### 7.1 Bot 생성 방법
1. Telegram 앱에서 `@BotFather` 검색
2. `/newbot` 명령어 입력
3. Bot 이름과 username 입력
4. 생성된 **Bot Token** 저장 (`TELEGRAM_BOT_TOKEN`)

### 7.2 Chat ID 확인 방법
1. 생성한 Bot과 채팅 시작
2. `@userinfobot` 또는 `@getidsbot` 검색 후 Bot과 채팅
3. 표시되는 **Chat ID** 저장 (`TELEGRAM_CHAT_ID`)

### 7.3 Bot 설정 체크리스트
- [ ] BotFather에서 Bot 생성 완료
- [ ] Bot Token 확보 (`.env`에 설정)
- [ ] Chat ID 확보 (`.env`에 설정)
- [ ] Bot에게 메시지 발송하여 연결 테스트 완료

---

## 8. 크론 잡 설정

### 8.1 Vercel Cron 설정 (추천)

`vercel.json` 파일 생성:
```json
{
  "crons": [
    {
      "path": "/api/check",
      "schedule": "*/10 * * * *"
    }
  ]
}
```

**설정 옵션:**
| 주기 | 표현식 | 설명 |
|------|--------|------|
| 10분마다 | `*/10 * * * *` | 핫딜 체크 간격 |
| 30분마다 | `*/30 * * * *` | 핫딜 체크 간격 |
| 1시간마다 | `0 * * * *` | 핫딜 체크 간격 |

### 8.2 외부 크론 서비스 (대안)

**cron-job.org 사용:**
1. https://cron-job.org 가입
2. 새.job 생성 → 요청 URL: `https://your-domain.com/api/check`
3. 인증 필요 시 `CRON_SECRET` 헤더 추가

### 8.3 로컬 개발용

```bash
# 매 10분마다 실행
*/10 * * * * curl -X POST http://localhost:3000/api/check

# 또는 node-cron 사용 (package.json scripts에 추가)
"cron": "node scripts/cron.js"
```

### 8.4 보안 설정

크론 API 접근을 위해 `CRON_SECRET` 환경변수 설정:
```env
CRON_SECRET=your-secret-key
```

API 라우트에서 검증:
```typescript
// /api/check/route.ts
if (headers.get('x-cron-secret') !== process.env.CRON_SECRET) {
  return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
}
```

---

## 9. Telegram 메시지 형식

### 기본 알림 메시지
```
🔥 핫딜 발견!

[사이트명] 제목
가격: XXXXX원
🔗 링크
```

### 알림 제외 조건
- 비활성화된 키워드와 매칭된 경우
- 이미 `notified=true`인 Deal
- 파싱 실패한 RSS 피드

---

## 10. 환경변수

```env
# Database
DATABASE_URL="file:./dev.db"

# Telegram
TELEGRAM_BOT_TOKEN="your-bot-token"
TELEGRAM_CHAT_ID="your-chat-id"

# Cron Security
CRON_SECRET="your-cron-secret-key"

# Optional: Vercel 배포 시
# NODE_ENV="production"
```

---

## 11. 폴더 구조

```
hotdeal-monitor/
├── src/
│   ├── app/
│   │   ├── page.tsx              # 대시보드 (핫딜 목록)
│   │   ├── feeds/page.tsx       # 피드 관리
│   │   ├── keywords/page.tsx    # 키워드 관리
│   │   └── api/
│   │       ├── feeds/route.ts
│   │       ├── keywords/route.ts
│   │       ├── deals/route.ts
│   │       └── check/route.ts
│   ├── components/
│   │   ├── DealCard.tsx
│   │   ├── DealList.tsx
│   │   ├── FeedForm.tsx
│   │   ├── FeedList.tsx
│   │   ├── KeywordForm.tsx
│   │   ├── KeywordList.tsx
│   │   ├── Header.tsx
│   │   └── Nav.tsx
│   ├── lib/
│   │   ├── prisma.ts            # Prisma 클라이언트
│   │   ├── rss.ts               # RSS 파서 유틸
│   │   └── telegram.ts          # 텔레그램 유틸
│   └── types/
│       └── index.ts
├── prisma/
│   └── schema.prisma
├── vercel.json                  # Vercel Cron 설정
├── .env.example
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

---

## 12. 비기능적 요구사항

### 성능
- 핫딜 체크 응답 시간: 30초 이내 (피드 수 20개 기준)
- UI 로딩 시간: 2초 이내

### 보안
- 환경변수 파일 (.env) Git 추적 제외
- 사용자 입력 검증 (XSS 방지)
- 크론 API 인증 (`CRON_SECRET`)

### 확장성
- Vercel Cron 또는 외부 크론 서비스 연동 가능
- 새로운 RSS 파서 추가 용이

---

## 13. 주요 핫딜 RSS 사이트

| 사이트 | RSS URL |
|--------|---------|
| 클리앙 | https://www.clien.net/service/board/jirum/rss |
| 뽐뿌 | http://www.ppomppu.co.kr/hotddeal.php?rss=1 |
| 알리익스프레스 | https://koaliexpress.co.kr/rss |

---

## 14. 개발 가이드

### 시작하기
```bash
# 의존성 설치
npm install

# 데이터베이스 마이그레이션
npx prisma migrate dev

# 개발 서버 실행
npm run dev

# 핫딜 체크 수동 실행
curl -X POST http://localhost:3000/api/check
```

### 빌드 & 배포
```bash
# 프로덕션 빌드
npm run build

# Vercel 배포
vercel deploy
```
