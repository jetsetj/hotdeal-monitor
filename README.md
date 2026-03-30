# 핫딜 모니터 (Hotdeal Monitor)

키워드 기반 핫딜 RSS 모니터링 및 Telegram 알림 서비스입니다.

## 주요 기능

- RSS 피드 관리 (추가/삭제/활성화)
- 키워드 필터링
- Telegram 실시간 알림
- 반응형 대시보드

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Prisma + SQLite
- **Styling**: Tailwind CSS

## 설치

```bash
# 의존성 설치
npm install

# Prisma 설정
cp .env.example .env
# .env 파일에 필요한 환경변수 설정

# 데이터베이스 마이그레이션
npx prisma generate
npx prisma db push
```

## 실행

```bash
# 개발 서버
npm run dev

# 프로덕션 빌드
npm run build
npm start
```

## 환경변수

```env
DATABASE_URL="file:./dev.db"
TELEGRAM_BOT_TOKEN="your-bot-token"
TELEGRAM_CHAT_ID="your-chat-id"
CRON_SECRET="your-cron-secret-key"
```

## Vercel 배포 체크리스트

Vercel에서는 로컬 `.env` 파일을 읽지 않으므로, **Project Settings → Environment Variables**에 직접 등록해야 합니다.

### 1) 환경변수 등록

- `DATABASE_URL`
- `TURSO_AUTH_TOKEN` (Turso/libsql 사용 시 필수)
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `CRON_SECRET`

### 2) DATABASE_URL 설정 방식

- **로컬 개발(SQLite)**: `file:./dev.db`
- **Vercel 운영 권장(Turso)**: `libsql://your-db.turso.io`

> Vercel 서버리스 환경에서는 로컬 SQLite 파일(`file:...`) 기반 영속 저장이 불안정하므로 Turso 같은 외부 DB 사용을 권장합니다.

### 3) 배포 후 DB 스키마 반영

최소 1회는 아래를 실행해 스키마를 반영하세요.

```bash
npx prisma db push
```

## Telegram Bot 설정

1. Telegram에서 @BotFather 검색
2. `/newbot` 명령어로 Bot 생성
3. Bot Token 저장
4. 생성된 Bot과 채팅 후 @userinfobot으로 Chat ID 확인

## 핫딜 체크

```bash
# 수동 실행
curl -X POST http://localhost:3000/api/check

# CRON_SECRET 헤더 필요
curl -X POST http://localhost:3000/api/check \
  -H "x-cron-secret: your-secret-key"
```

## 주요 핫딜 RSS

| 사이트 | RSS URL |
|--------|---------|
| 클리앙 | https://www.clien.net/service/board/jirum/rss |
| 뽐뿌 | http://www.ppomppu.co.kr/hotddeal.php?rss=1 |

## 디렉토리 구조

```
src/
├── app/           # App Router pages
├── components/   # UI 컴포넌트
├── lib/          # 유틸리티 (Prisma, RSS, Telegram)
└── types/        # TypeScript 타입
```
