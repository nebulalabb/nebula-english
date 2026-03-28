# 🔄 THIẾT KẾ LUỒNG XỬ LÝ (FLOW DESIGN) — NebulaLab.vn
> **Version:** 1.0 | **Date:** 24/03/2026 | **Ref:** Database Design v1.0

---

## MỤC LỤC

1. [Quy ước ký hiệu](#1-quy-ước-ký-hiệu)
2. [FLOW 0 — Kiến trúc tổng quan](#2-flow-0--kiến-trúc-tổng-quan)
3. [FLOW 1 — Auth (Đăng ký / Đăng nhập)](#3-flow-1--auth)
4. [FLOW 2 — Quota Engine](#4-flow-2--quota-engine)
5. [FLOW 3 — Module 1: AI Flashcard](#5-flow-3--module-1-ai-flashcard)
6. [FLOW 4 — Module 2: Giải bài từng bước](#6-flow-4--module-2-giải-bài-từng-bước)
7. [FLOW 5 — Module 3: Luyện đề](#7-flow-5--module-3-luyện-đề)
8. [FLOW 6 — Module 4: Micro-learning](#8-flow-6--module-4-micro-learning)
9. [FLOW 7 — Module 5: AI Note & Summary](#9-flow-7--module-5-ai-note--summary)
10. [FLOW 8 — Module 6: Tutor Marketplace](#10-flow-8--module-6-tutor-marketplace)
11. [FLOW 9 — Module 7: Quiz Generator](#11-flow-9--module-7-quiz-generator)
12. [FLOW 10 — Billing & Subscription](#12-flow-10--billing--subscription)
13. [FLOW 11 — Notification & Reminder](#13-flow-11--notification--reminder)
14. [Error Handling Toàn cục](#14-error-handling-toàn-cục)
15. [State Machine Tổng hợp](#15-state-machine-tổng-hợp)

---

## 1. QUY ƯỚC KÝ HIỆU

```
[CLIENT]      → Trình duyệt / App người dùng
[API]         → Backend Node.js
[AI]          → Gemini API
[DB]          → PostgreSQL
[CACHE]       → Redis
[STORAGE]     → Cloudinary
[GATEWAY]     → VNPay / MoMo
[QUEUE]       → Job Queue (Bull/BullMQ)
[EMAIL]       → SMTP / SendGrid

──►  Luồng chính (happy path)
--►  Luồng lỗi / ngoại lệ
═══  Luồng có điều kiện
░░░  Background job / async
▣    Lưu vào DB
◉    Gọi service ngoài
✓    Trả kết quả về client
✗    Trả lỗi về client
```

---

## 2. FLOW 0 — KIẾN TRÚC TỔNG QUAN

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Next.js)                                │
│  Landing Page → Auth → Dashboard → [Học Tập | Sức Khỏe | ...]               │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                │ HTTPS / REST API
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY (Node.js)                                │
│                                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  ┌───────────────┐  │
│  │ Auth Guard  │  │ Quota Guard  │  │ Rate Limiter   │  │ Logger        │  │
│  └──────┬──────┘  └──────┬───────┘  └───────┬────────┘  └───────────────┘  │
│         └────────────────┴──────────────────┘                               │
│                                │                                             │
│  ┌──────────┬──────────┬───────┴──┬──────────┬──────────┬──────────────┐   │
│  │/flashcard│ /solver  │  /exam   │/microlearn│  /note  │ /quiz        │   │
│  └────┬─────┴────┬─────┴─────┬────┴─────┬─────┴────┬────┴──────┬───────┘   │
│       │          │           │          │          │           │           │
└───────┼──────────┼───────────┼──────────┼──────────┼───────────┼───────────┘
        │          │           │          │          │           │
   ┌────┴───┐ ┌────┴───┐  ┌────┴───┐ ┌────┴───┐ ┌────┴───┐ ┌────┴───┐
   │  DB    │ │  AI    │  │ CACHE  │ │STORAGE │ │ QUEUE  │ │ EMAIL  │
   │(PgSQL) │ │(Gemini)│  │(Redis) │ │(Cloud) │ │(Bull)  │ │(SMTP)  │
   └────────┘ └────────┘  └────────┘ └────────┘ └────────┘ └────────┘
```

---

## 3. FLOW 1 — AUTH

### 3.1 Đăng ký bằng Email

```
[CLIENT]                    [API]                      [DB]         [EMAIL]
   │                          │                          │              │
   │── POST /auth/register ──►│                          │              │
   │   {email, password,      │                          │              │
   │    full_name}            │── Validate input ────────│              │
   │                          │   (email format,         │              │
   │                          │    password strength)    │              │
   │                          │                          │              │
   │                          │── Check email exists ──►│              │
   │                          │◄── exists=false ─────────│              │
   │                          │                          │              │
   │                          │── Hash password (bcrypt) │              │
   │                          │── INSERT users ─────────►│              │
   │                          │◄── user_id ──────────────│              │
   │                          │                          │              │
   │                          │── INSERT email_          │              │
   │                          │   verifications ────────►│              │
   │                          │◄── token ────────────────│              │
   │                          │                          │              │
   │                          │── Send verify email ─────────────────►│
   │                          │   (async, không block)   │              │
   │                          │                          │              │
   │◄── 201 {message:         │                          │              │
   │    "Kiểm tra email"}  ───│                          │              │

   -- Sau khi user click link xác thực --

   │── GET /auth/verify?      │                          │              │
   │   token=xxx ────────────►│                          │              │
   │                          │── Find token, check      │              │
   │                          │   expires_at ───────────►│              │
   │                          │── UPDATE users SET       │              │
   │                          │   email_verified=true ──►│              │
   │                          │── UPDATE verification    │              │
   │                          │   used_at=NOW() ────────►│              │
   │◄── Redirect /dashboard ──│                          │              │
```

---

### 3.2 Đăng nhập bằng Email

```
[CLIENT]              [API]               [DB]            [CACHE]
   │                    │                   │                │
   │── POST /auth/login►│                   │                │
   │   {email,password} │                   │                │
   │                    │── Find user ─────►│                │
   │                    │◄── user record ───│                │
   │                    │                   │                │
   │                    │── Verify bcrypt ──│                │
   │                    │   password hash   │                │
   │                    │                   │                │
   │                    ├─[Sai password]─── │                │
   │◄── 401 Unauthorized│                   │                │
   │                    │                   │                │
   │                    ├─[Đúng password]───│                │
   │                    │── Sign JWT        │                │
   │                    │   access_token    │                │
   │                    │   (expires 15m)   │                │
   │                    │── Sign JWT        │                │
   │                    │   refresh_token   │                │
   │                    │   (expires 7d)    │                │
   │                    │                   │                │
   │                    │── INSERT          │                │
   │                    │   user_sessions ─►│                │
   │                    │                   │                │
   │                    │── Cache user data─────────────────►│
   │                    │   (key: user:{id})│                │
   │                    │   TTL: 15 phút    │                │
   │                    │                   │                │
   │◄── 200 {           │                   │                │
   │    access_token,   │                   │                │
   │    refresh_token,  │                   │                │
   │    user}           │                   │                │
```

---

### 3.3 OAuth2 (Google)

```
[CLIENT]          [API]            [GOOGLE]           [DB]
   │                │                  │                 │
   │── Click        │                  │                 │
   │   "Login       │                  │                 │
   │   Google" ─────│                  │                 │
   │                │── Redirect ─────►│                 │
   │                │   Google OAuth   │                 │
   │                │   URL            │                 │
   │◄── Redirect to │                  │                 │
   │    Google ─────│                  │                 │
   │                │                  │                 │
   │── Đăng nhập Google, chấp thuận quyền               │
   │                │                  │                 │
   │                │◄── Callback ─────│                 │
   │                │    code=xxx      │                 │
   │                │                  │                 │
   │                │── Exchange code ►│                 │
   │                │   for tokens     │                 │
   │                │◄── access_token, │                 │
   │                │    profile ──────│                 │
   │                │                  │                 │
   │                │── Upsert user ──────────────────►│
   │                │   (tạo mới hoặc  │                 │
   │                │   cập nhật)      │                 │
   │                │── Upsert oauth   │                 │
   │                │   account ──────────────────────►│
   │                │                  │                 │
   │                │── Tạo JWT tokens │                 │
   │◄── Redirect    │                  │                 │
   │    /dashboard  │                  │                 │
   │    + set cookie│                  │                 │
```

---

### 3.4 Refresh Token

```
[CLIENT]           [API]              [DB]           [CACHE]
   │                 │                  │               │
   │── POST /auth/   │                  │               │
   │   refresh ─────►│                  │               │
   │   {refresh_     │                  │               │
   │    token}       │                  │               │
   │                 │── Verify JWT     │               │
   │                 │   signature      │               │
   │                 │                  │               │
   │                 │── Check session ►│               │
   │                 │   not revoked    │               │
   │                 │◄── session OK ───│               │
   │                 │                  │               │
   │                 │── Sign new       │               │
   │                 │   access_token   │               │
   │                 │   (15 phút)      │               │
   │                 │                  │               │
   │                 │── UPDATE         │               │
   │                 │   last_active_at►│               │
   │                 │                  │               │
   │◄── 200          │                  │               │
   │    {new_access_ │                  │               │
   │     token}      │                  │               │
```

---

## 4. FLOW 2 — QUOTA ENGINE

> Đây là middleware chạy TRƯỚC mọi request có dùng AI

```
[REQUEST] ──► [QUOTA MIDDLEWARE]
                     │
                     ▼
        ┌────────────────────────┐
        │  Lấy user.plan từ     │
        │  JWT token             │
        └────────────┬───────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  Check CACHE trước    │  ◄── Redis key: quota:{user_id}:{module}:{date}
        │  (Redis TTL: 24h)     │
        └────────────┬───────────┘
                     │
              ┌──────┴──────┐
              │ Cache hit?  │
              └──────┬──────┘
           Yes ──────┤──────── No
           │         │              │
           │         │              ▼
           │         │   ┌──────────────────────┐
           │         │   │ COUNT từ usage_logs  │
           │         │   │ WHERE user_id=?      │
           │         │   │ AND module=?         │
           │         │   │ AND date=TODAY       │
           │         │   └──────────┬───────────┘
           │         │              │
           │         │   ┌──────────▼───────────┐
           │         │   │ Set Cache (Redis)    │
           │         │   │ TTL = tới 00:00      │
           │         │   └──────────┬───────────┘
           │         │              │
           └─────────►──────────────┘
                     │
                     ▼
        ┌────────────────────────────────────────┐
        │ So sánh count với plan limit           │
        │                                        │
        │ Plan limits (từ subscription_plans):   │
        │  FREE:                                 │
        │   solver: 5/ngày                       │
        │   flashcard: 20 total                  │
        │   summary: 3/ngày                      │
        │   quiz: 1/ngày                         │
        │                                        │
        │  PREMIUM: limit = -1 (unlimited)       │
        └─────────────────┬──────────────────────┘
                          │
               ┌──────────┴──────────┐
               │   count < limit?    │
               └──────────┬──────────┘
          Yes (OK) ────────┤──────── No (Hết quota)
               │           │              │
               ▼           │              ▼
        ┌─────────┐        │      ┌──────────────────┐
        │ NEXT()  │        │      │ 429 Too Many     │
        │ Cho qua │        │      │ Requests         │
        └─────────┘        │      │ {                │
               │           │      │  error: "Hết     │
               ▼           │      │  lượt hôm nay",  │
        [Sau request        │      │  reset_at: ...,  │
         thành công]        │      │  upgrade_url: .. │
               │           │      │ }                │
               ▼           │      └──────────────────┘
        ┌───────────────┐  │
        │ INSERT        │  │
        │ usage_logs    │  │
        │ +1 Redis count│  │
        └───────────────┘  │
```

---

## 5. FLOW 3 — MODULE 1: AI FLASHCARD

### 5.1 Tạo Flashcard từ PDF/Text

```
[CLIENT]            [API]          [STORAGE]      [AI/Gemini]     [DB]
   │                  │                │               │             │
   │── POST           │                │               │             │
   │   /flashcard/    │                │               │             │
   │   generate ─────►│                │               │             │
   │   {file|text,    │                │               │             │
   │    title,        │                │               │             │
   │    subject}      │                │               │             │
   │                  │                │               │             │
   │                  ├─[Quota Check]──│               │             │
   │                  │                │               │             │
   │                  ├─[type=pdf]─────►               │             │
   │                  │  Upload PDF    │               │             │
   │                  │◄── file_url ───│               │             │
   │                  │  Extract text  │               │             │
   │                  │  (pdf-parse)   │               │             │
   │                  │                │               │             │
   │                  ├─[type=text]────│               │             │
   │                  │  Dùng trực tiếp│               │             │
   │                  │                │               │             │
   │                  │── Gọi Gemini ─────────────────►│             │
   │                  │  Prompt:       │               │             │
   │                  │  "Tạo N cặp   │               │             │
   │                  │  Q&A từ nội   │               │             │
   │                  │  dung này..."  │               │             │
   │                  │               │               │             │
   │                  │◄── JSON array ─────────────────│             │
   │                  │  [{front,back}]│               │             │
   │                  │                │               │             │
   │                  │── INSERT       │               │             │
   │                  │   flashcard_   │               │             │
   │                  │   sets ────────────────────────────────────►│
   │                  │── INSERT       │               │             │
   │                  │   flashcards   │               │             │
   │                  │   (bulk) ──────────────────────────────────►│
   │                  │── INSERT       │               │             │
   │                  │   usage_logs ──────────────────────────────►│
   │                  │                │               │             │
   │◄── 201 {set_id,  │                │               │             │
   │    flashcards[]} │                │               │             │
```

---

### 5.2 Học Flashcard (Flip + Review)

```
[CLIENT]                      [API]                    [DB]
   │                             │                        │
   │── GET /flashcard/           │                        │
   │   sets/:id/study ──────────►│                        │
   │                             │── Lấy flashcards       │
   │                             │   + review_schedules ─►│
   │                             │   ORDER BY             │
   │                             │   next_review_at ASC   │
   │◄── [{card, schedule}]  ─────│                        │

   -- User lật từng thẻ và đánh giá --

   │── POST /flashcard/          │                        │
   │   review ──────────────────►│                        │
   │   {card_id,                 │                        │
   │    quality: 0-5}            │                        │
   │                             │                        │
   │                             │── Tính SM-2:           │
   │                             │                        │
   │                             │   IF quality >= 3:     │
   │                             │     interval mới       │
   │                             │     = interval cũ      │
   │                             │       * easiness       │
   │                             │     easiness +=        │
   │                             │       0.1-(5-q)*0.08   │
   │                             │                        │
   │                             │   IF quality < 3:      │
   │                             │     interval = 1 ngày  │
   │                             │     repetition = 0     │
   │                             │                        │
   │                             │── UPDATE               │
   │                             │   review_schedules ───►│
   │                             │   {interval_days,      │
   │                             │    easiness_factor,    │
   │                             │    next_review_at,     │
   │                             │    last_quality}       │
   │                             │                        │
   │◄── {next_review_at,         │                        │
   │     cards_remaining}        │                        │
```

---

### 5.3 Nhắc ôn tập hàng ngày (Background Job)

```
[CRON: 07:00 sáng hàng ngày]
           │
           ▼
    [QUEUE - Bull Job]
    "send_flashcard_reminders"
           │
           ▼
    ┌──────────────────────────────────────┐
    │ SELECT DISTINCT user_id              │
    │ FROM review_schedules                │
    │ WHERE next_review_at <= NOW()        │
    │   AND user_id IN (                   │
    │     SELECT user_id FROM users        │
    │     WHERE deleted_at IS NULL         │
    │   )                                  │
    └─────────────────┬────────────────────┘
                      │
                      ▼
            For each user_id:
                      │
                      ▼
    ┌──────────────────────────────────────┐
    │ COUNT cards due hôm nay              │
    └─────────────────┬────────────────────┘
                      │
                      ▼
    ┌──────────────────────────────────────┐
    │ INSERT notifications                 │
    │ {type: 'flashcard_review_due',       │
    │  title: "Đến giờ ôn bài!",          │
    │  body: "Bạn có N thẻ cần ôn"}       │
    └─────────────────┬────────────────────┘
                      │
                      ▼
    ┌──────────────────────────────────────┐
    │ Send email reminder (if enabled)     │
    └──────────────────────────────────────┘
```

---

## 6. FLOW 4 — MODULE 2: GIẢI BÀI TỪNG BƯỚC

### 6.1 Giải bài text

```
[CLIENT]           [API]            [CACHE]        [AI/Gemini]     [DB]
   │                 │                 │                │             │
   │── POST          │                 │                │             │
   │   /solver/solve►│                 │                │             │
   │   {question,    │                 │                │             │
   │    subject,     │                 │                │             │
   │    grade_level} │                 │                │             │
   │                 ├─[Quota Check]   │                │             │
   │                 │                 │                │             │
   │                 │── Hash câu hỏi  │                │             │
   │                 │   MD5(question) │                │             │
   │                 │                 │                │             │
   │                 │── Check cache ─►│                │             │
   │                 │   key: solve:   │                │             │
   │                 │   {hash}        │                │             │
   │                 │                 │                │             │
   │                 │◄── Cache hit? ──│                │             │
   │                 │                 │                │             │
   │          ┌──────┴──────┐          │                │             │
   │          │ Cache hit?  │          │                │             │
   │          └──────┬──────┘          │                │             │
   │       Yes───────┤──────── No      │                │             │
   │          │      │         │       │                │             │
   │          │      │         ▼       │                │             │
   │          │      │  ┌─────────────────────────────────────────┐  │
   │          │      │  │ Build system prompt:                    │  │
   │          │      │  │ "Bạn là gia sư {subject} lớp           │  │
   │          │      │  │  {grade}. Giải bài sau theo từng        │  │
   │          │      │  │  bước rõ ràng, dùng Markdown, LaTeX     │  │
   │          │      │  │  cho công thức..."                      │  │
   │          │      │  └──────────────┬──────────────────────────┘  │
   │          │      │                 │                │             │
   │          │      │  ── Gọi Gemini ─────────────────►│             │
   │          │      │  ◄── solution ──────────────────│             │
   │          │      │                 │                │             │
   │          │      │  ── Set Cache ──►                │             │
   │          │      │     TTL: 24h    │                │             │
   │          │      │                 │                │             │
   │          └──────►                 │                │             │
   │                 │                 │                │             │
   │                 │── INSERT        │                │             │
   │                 │   solve_        │                │             │
   │                 │   histories ────────────────────────────────►│
   │                 │── INSERT        │                │             │
   │                 │   usage_logs ───────────────────────────────►│
   │                 │                 │                │             │
   │◄── 200 {        │                 │                │             │
   │    solution,    │                 │                │             │
   │    steps[],     │                 │                │             │
   │    history_id}  │                 │                │             │
```

---

### 6.2 Giải bài từ ảnh

```
[CLIENT]         [API]         [STORAGE]      [AI/Gemini]       [DB]
   │               │               │                │              │
   │── POST        │               │                │              │
   │   /solver/    │               │                │              │
   │   solve-image►│               │                │              │
   │   {image,     │               │                │              │
   │    subject}   │               │                │              │
   │               ├─[Quota Check] │                │              │
   │               │               │                │              │
   │               │── Validate    │                │              │
   │               │   file type   │                │              │
   │               │   (jpg/png,   │                │              │
   │               │   max 5MB)    │                │              │
   │               │               │                │              │
   │               │── Upload ────►│                │              │
   │               │◄── image_url ─│                │              │
   │               │               │                │              │
   │               │── Gọi Gemini ──────────────────►│              │
   │               │   multimodal  │                │              │
   │               │   {image,     │                │              │
   │               │    prompt}    │                │              │
   │               │◄── solution ──────────────────│              │
   │               │               │                │              │
   │               │── INSERT      │                │              │
   │               │   solve_history                │              │
   │               │   {image_url} ──────────────────────────────►│
   │◄── {solution} │               │                │              │
```

---

## 7. FLOW 5 — MODULE 3: LUYỆN ĐỀ

### 7.1 Làm bài thi

```
[CLIENT]                 [API]              [CACHE]         [DB]
   │                       │                   │               │
   │── POST /exam/         │                   │               │
   │   start ─────────────►│                   │               │
   │   {exam_id}           │                   │               │
   │                       │── Lấy exam +      │               │
   │                       │   questions ─────────────────────►│
   │                       │   (shuffle order) │               │
   │                       │                   │               │
   │                       │── INSERT          │               │
   │                       │   exam_attempts ─────────────────►│
   │                       │   {status:        │               │
   │                       │    'in_progress'} │               │
   │                       │                   │               │
   │                       │── Cache attempt ──►               │
   │                       │   {attempt_id,    │               │
   │                       │    answers: {},   │               │
   │                       │    start_time}    │               │
   │                       │   TTL = duration  │               │
   │                       │   + 5 phút        │               │
   │                       │                   │               │
   │◄── {attempt_id,       │                   │               │
   │    questions[],       │                   │               │
   │    duration_minutes}  │                   │               │

   -- Trong khi làm bài: auto-save từng câu --

   │── PUT /exam/attempt/  │                   │               │
   │   answer ────────────►│                   │               │
   │   {attempt_id,        │                   │               │
   │    question_id,       │                   │               │
   │    answer: ["A"]}     │                   │               │
   │                       │── Update cache ──►│               │
   │                       │   (không write DB │               │
   │                       │    từng câu)      │               │
   │◄── 200 {saved: true}  │                   │               │

   -- Submit bài --

   │── POST /exam/attempt/ │                   │               │
   │   submit ────────────►│                   │               │
   │   {attempt_id}        │                   │               │
   │                       │── Load answers ──►│               │
   │                       │   từ Cache        │               │
   │                       │                   │               │
   │                       │── Chấm điểm:      │               │
   │                       │   So answers với  │               │
   │                       │   correct_answers │               │
   │                       │                   │               │
   │                       │── Tính analysis:  │               │
   │                       │   Nhóm theo       │               │
   │                       │   topic_tag       │               │
   │                       │   {topic:         │               │
   │                       │    {correct,total}}               │
   │                       │                   │               │
   │                       │── INSERT bulk     │               │
   │                       │   attempt_answers────────────────►│
   │                       │── UPDATE          │               │
   │                       │   exam_attempts   │               │
   │                       │   {status:        │               │
   │                       │    'submitted',   │               │
   │                       │    score, analysis}──────────────►│
   │                       │── DELETE cache ──►│               │
   │                       │                   │               │
   │◄── {score, percentage,│                   │               │
   │    passed, analysis,  │                   │               │
   │    correct_answers}   │                   │               │
```

---

### 7.2 Timeout tự động

```
[CRON: mỗi 5 phút]
        │
        ▼
┌──────────────────────────────────────┐
│ SELECT * FROM exam_attempts          │
│ WHERE status = 'in_progress'         │
│   AND created_at + duration +        │
│       interval '5 min' < NOW()       │
└────────────────┬─────────────────────┘
                 │
                 ▼ For each expired attempt
┌──────────────────────────────────────┐
│ Load answers từ Cache                │
│ Chấm điểm với những gì đã có        │
│ UPDATE status = 'timeout'            │
│ INSERT attempt_answers               │
│ DELETE Cache                         │
└──────────────────────────────────────┘
```

---

## 8. FLOW 6 — MODULE 4: MICRO-LEARNING

### 8.1 Onboarding chọn chủ đề

```
[CLIENT]               [API]              [DB]
   │                     │                  │
   │── GET /microlearn/  │                  │
   │   topics ──────────►│                  │
   │                     │── SELECT         │
   │                     │   learning_topics►│
   │                     │   WHERE is_active │
   │◄── topics[] ────────│                  │
   │                     │                  │
   │── POST /microlearn/ │                  │
   │   enroll ──────────►│                  │
   │   {topic_id}        │                  │
   │                     │── Tạo             │
   │                     │   user_streaks ──►│
   │                     │   {current: 0}   │
   │                     │                  │
   │◄── {enrolled: true} │                  │
```

---

### 8.2 Học bài hàng ngày

```
[CLIENT]                [API]              [DB]            [CACHE]
   │                      │                  │                │
   │── GET /microlearn/   │                  │                │
   │   today ────────────►│                  │                │
   │                      │                  │                │
   │                      │── Check progress►│                │
   │                      │   đã học hôm     │                │
   │                      │   nay chưa?      │                │
   │                      │                  │                │
   │            ┌─────────┴────────┐         │                │
   │            │  Đã học hôm nay? │         │                │
   │            └────────┬─────────┘         │                │
   │          Yes ───────┤──── No            │                │
   │            │        │        │          │                │
   │            ▼        │        ▼          │                │
   │   {status: "done"   │  Lấy bài học ───►│                │
   │    come_back_       │  tiếp theo theo   │                │
   │    tomorrow}        │  day_index        │                │
   │                     │                  │                │
   │◄── {lesson} ────────│                  │                │
   │                     │                  │                │
   │── POST /microlearn/ │                  │                │
   │   complete ────────►│                  │                │
   │   {lesson_id,       │                  │                │
   │    quiz_answer}     │                  │                │
   │                     │                  │                │
   │                     │── Chấm quiz      │                │
   │                     │── UPDATE/INSERT  │                │
   │                     │   user_lesson_   │                │
   │                     │   progress ─────►│                │
   │                     │                  │                │
   │                     │── Cập nhật streak│                │
   │                     │   Logic:         │                │
   │                     │                  │                │
   │                     │   last_date =    │                │
   │                     │   yesterday?     │                │
   │                     │   → streak + 1   │                │
   │                     │                  │                │
   │                     │   last_date =    │                │
   │                     │   today?         │                │
   │                     │   → no change    │                │
   │                     │                  │                │
   │                     │   last_date <    │                │
   │                     │   yesterday?     │                │
   │                     │   → reset to 1   │                │
   │                     │                  │                │
   │                     │── UPDATE         │                │
   │                     │   user_streaks ─►│                │
   │                     │                  │                │
   │◄── {streak,         │                  │                │
   │    xp_earned,       │                  │                │
   │    is_milestone}    │                  │                │
```

---

### 8.3 Streak Reminder (Background)

```
[CRON: 20:00 tối hàng ngày]
            │
            ▼
┌──────────────────────────────────────────┐
│ SELECT u.id, s.current_streak            │
│ FROM user_streaks s                      │
│ JOIN users u ON u.id = s.user_id         │
│ WHERE s.last_activity_date < TODAY       │  ← Chưa học hôm nay
│   AND s.current_streak > 0              │  ← Đang có streak
└─────────────────────┬────────────────────┘
                      │
                      ▼ For each user
┌──────────────────────────────────────────┐
│ INSERT notifications                     │
│ {type: 'streak_reminder',                │
│  title: "Đừng để mất chuỗi N ngày!",    │
│  body: "Học 5 phút hôm nay để duy trì"} │
└──────────────────────────────────────────┘
```

---

## 9. FLOW 7 — MODULE 5: AI NOTE & SUMMARY

```
[CLIENT]          [API]       [STORAGE]    [AI/Gemini]     [DB]
   │                │              │             │            │
   │── POST         │              │             │            │
   │   /note/       │              │             │            │
   │   summarize ──►│              │             │            │
   │   {text|file,  │              │             │            │
   │    title}      │              │             │            │
   │                ├─[Quota Check]│             │            │
   │                │              │             │            │
   │     ┌──────────┴─────────┐    │             │            │
   │     │  Source type?      │    │             │            │
   │     └────────┬───────────┘    │             │            │
   │         text─┤─pdf            │             │            │
   │              │    │           │             │            │
   │              │    ▼           │             │            │
   │              │  Upload ──────►│             │            │
   │              │  Extract text  │             │            │
   │              │  from PDF      │             │            │
   │              │◄── text ───────│             │            │
   │              │                │             │            │
   │              ▼                │             │            │
   │   ┌──────────────────────────────────────────────────┐  │
   │   │ Gọi Gemini với prompt:                           │  │
   │   │ "Tóm tắt văn bản sau thành:                     │  │
   │   │  1. Đoạn tóm tắt ngắn (3-5 câu)                 │  │
   │   │  2. Bullet points ý chính (5-10 điểm)           │  │
   │   │  3. Từ khóa quan trọng (10-15 từ)               │  │
   │   │  Trả về JSON format: {short, bullets, keywords}" │  │
   │   └──────────────────────────┬───────────────────────┘  │
   │                              │             │            │
   │                              │─────────────►│            │
   │                              │◄── JSON ────│            │
   │                              │             │            │
   │                │── INSERT notes ───────────────────────►│
   │                │── INSERT          │             │      │
   │                │   note_summaries ─────────────────────►│
   │                │── INSERT          │             │      │
   │                │   usage_logs ─────────────────────────►│
   │                │              │             │            │
   │◄── {note_id,   │              │             │            │
   │    summary:    │              │             │            │
   │    {short,     │              │             │            │
   │     bullets[], │              │             │            │
   │     keywords}  │              │             │            │
   │    }           │              │             │            │
```

---

## 10. FLOW 8 — MODULE 6: TUTOR MARKETPLACE

### 10.1 Đăng ký làm gia sư

```
[CLIENT]           [API]          [STORAGE]        [DB]         [ADMIN]
   │                 │                │               │             │
   │── POST          │                │               │             │
   │   /tutor/       │                │               │             │
   │   register ────►│                │               │             │
   │   {bio,         │                │               │             │
   │    education,   │                │               │             │
   │    subjects[],  │                │               │             │
   │    hourly_rate, │                │               │             │
   │    certif_files}│                │               │             │
   │                 │                │               │             │
   │                 │── Upload certs►│               │             │
   │                 │◄── urls[] ─────│               │             │
   │                 │                │               │             │
   │                 │── INSERT       │               │             │
   │                 │   tutor_profiles               │             │
   │                 │   {status:     │               │             │
   │                 │    'pending'} ─────────────────►│             │
   │                 │── INSERT       │               │             │
   │                 │   tutor_subjects───────────────►│             │
   │                 │                │               │             │
   │◄── {status:     │                │               │             │
   │    'pending',   │                │               │             │
   │    message:     │                │               │             │
   │    "Đang review"}│               │               │             │
   │                 │                │               │             │
   │                 │── Notify admin ─────────────────────────────►│
   │                 │                │               │             │
   │                 │      Admin review (manual)     │             │
   │                 │                │               │────────────►│
   │                 │                │               │◄── approve ─│
   │                 │                │               │             │
   │                 │                │── UPDATE      │             │
   │                 │                │   status=     │             │
   │                 │                │   'approved' ─►│             │
   │                 │                │               │             │
   │                 │── Notify user  │               │             │
   │                 │   (email +     │               │             │
   │                 │    in-app)     │               │             │
```

---

### 10.2 Đặt lịch học

```
[CLIENT]        [API]           [DB]          [GATEWAY]     [EMAIL]
   │              │               │                │            │
   │── GET        │               │                │            │
   │   /tutor/    │               │                │            │
   │   :id/slots ►│               │                │            │
   │              │── Check       │                │            │
   │              │   availabilities               │            │
   │              │   vs booked ─►│                │            │
   │◄── slots[]   │               │                │            │
   │              │               │                │            │
   │── POST       │               │                │            │
   │   /booking/  │               │                │            │
   │   create ───►│               │                │            │
   │   {tutor_id, │               │                │            │
   │    date,time,│               │                │            │
   │    subject}  │               │                │            │
   │              │── Tính giá:   │                │            │
   │              │   duration *  │                │            │
   │              │   hourly_rate │                │            │
   │              │── Tính        │                │            │
   │              │   commission: │                │            │
   │              │   price*12%   │                │            │
   │              │               │                │            │
   │              │── INSERT      │                │            │
   │              │   bookings    │                │            │
   │              │   {status:    │                │            │
   │              │    'pending'} ►│               │            │
   │              │               │                │            │
   │◄── {         │               │                │            │
   │    booking_id│               │                │            │
   │    payment_  │               │                │            │
   │    url}      │               │                │            │
   │              │               │                │            │
   │── Thanh toán►│               │                │            │
   │              │── Tạo payment►│                │            │
   │              │── Redirect ───────────────────►│            │
   │◄── Redirect  │               │                │            │
   │    to gateway│               │                │            │
   │              │               │                │            │
   │              │◄── Callback ──────────────────│            │
   │              │    {success}  │                │            │
   │              │               │                │            │
   │              │── UPDATE      │                │            │
   │              │   booking     │                │            │
   │              │   status=     │                │            │
   │              │   'confirmed' ►│               │            │
   │              │── INSERT      │                │            │
   │              │   payments ──►│                │            │
   │              │               │                │            │
   │              │── Email xác   │                │            │
   │              │   nhận ────────────────────────────────────►│
   │              │   (student +  │                │            │
   │              │    tutor)     │                │            │
```

---

### 10.3 Hoàn thành buổi học & Đánh giá

```
[CRON: Sau giờ học kết thúc + 30 phút]
          │
          ▼
┌────────────────────────────────────┐
│ SELECT * FROM bookings             │
│ WHERE status = 'confirmed'         │
│   AND session_date = TODAY         │
│   AND end_time + '30 min' < NOW()  │
└─────────────────┬──────────────────┘
                  │
                  ▼
         UPDATE status = 'completed'
                  │
                  ▼
         Send review request email
         to student (link đánh giá)
                  │
                  ▼
[USER submit review]
         POST /booking/review
         {rating, comment}
                  │
                  ▼
         INSERT booking_reviews
                  │
                  ▼
         UPDATE tutor_profiles:
           rating_avg = AVG(all reviews)
           review_count += 1
           total_sessions += 1
```

---

## 11. FLOW 9 — MODULE 7: QUIZ GENERATOR

```
[CLIENT]         [API]        [STORAGE]    [AI/Gemini]     [DB]
   │               │               │            │             │
   │── POST        │               │            │             │
   │   /quiz/      │               │            │             │
   │   generate ──►│               │            │             │
   │   {text|file, │               │            │             │
   │    num_q:10,  │               │            │             │
   │    difficulty,│               │            │             │
   │    type}      │               │            │             │
   │               ├─[Quota Check] │            │             │
   │               │               │            │             │
   │               │── Upload ────►│            │             │
   │               │   (nếu file)  │            │             │
   │               │               │            │             │
   │               │── Gọi Gemini ──────────────►│             │
   │               │   Prompt:     │            │             │
   │               │   "Tạo 10 câu │            │             │
   │               │   trắc nghiệm │            │             │
   │               │   {difficulty}│            │             │
   │               │   từ nội dung.│            │             │
   │               │   JSON format:│            │             │
   │               │   [{question, │            │             │
   │               │     options,  │            │             │
   │               │     correct,  │            │             │
   │               │     explain}] │            │             │
   │               │◄── JSON ──────────────────│             │
   │               │               │            │             │
   │               │── INSERT      │            │             │
   │               │   quiz_sets ──────────────────────────►│
   │               │── INSERT bulk │            │             │
   │               │   quiz_       │            │             │
   │               │   questions ──────────────────────────►│
   │               │── Generate    │            │             │
   │               │   share_token │            │             │
   │               │   (nanoid)    │            │             │
   │               │               │            │             │
   │◄── {quiz_id,  │               │            │             │
   │    questions[]│               │            │             │
   │    share_link}│               │            │             │

   -- Người dùng khác vào link chia sẻ --

   │── GET /quiz/  │               │            │             │
   │   play/:token►│               │            │             │
   │               │── Find quiz   │            │             │
   │               │   by token ──►│             │            │
   │               │── UPDATE      │            │             │
   │               │   play_count+1►│            │             │
   │◄── {quiz}     │               │            │             │
```

---

## 12. FLOW 10 — BILLING & SUBSCRIPTION

### 12.1 Nâng cấp lên Premium

```
[CLIENT]      [API]        [DB]      [VNPAY/MOMO]    [EMAIL]
   │            │             │             │             │
   │── POST     │             │             │             │
   │   /billing/│             │             │             │
   │   upgrade ►│             │             │             │
   │   {plan:   │             │             │             │
   │    'premium│             │             │             │
   │    _monthly│             │             │             │
   │    '}      │             │             │             │
   │            │── Lấy plan  │             │             │
   │            │   details ─►│             │             │
   │            │             │             │             │
   │            │── Tạo       │             │             │
   │            │   payment   │             │             │
   │            │   record ──►│             │             │
   │            │   {status:  │             │             │
   │            │    'pending'}│            │             │
   │            │             │             │             │
   │            │── Tạo payment URL ────────►│             │
   │            │◄── payment_url ───────────│             │
   │            │             │             │             │
   │◄── {url}   │             │             │             │
   │── Redirect ►             │             │             │
   │   to gateway             │             │             │
   │                          │             │             │
   │── Thanh toán trên gateway│             │             │
   │                          │             │             │
   │           │◄── Webhook ──────────────│             │
   │           │    {txn_id,  │             │             │
   │           │     status:  │             │             │
   │           │     'success'}│            │             │
   │           │             │             │             │
   │           │── Verify    │             │             │
   │           │   signature  │             │             │
   │           │             │             │             │
   │           │── UPDATE    │             │             │
   │           │   payments  │             │             │
   │           │   status=   │             │             │
   │           │   'success' ►│            │             │
   │           │             │             │             │
   │           │── INSERT    │             │             │
   │           │   subscriptions►          │             │
   │           │   {expires_at:│           │             │
   │           │    +30 ngày} │            │             │
   │           │             │             │             │
   │           │── UPDATE    │             │             │
   │           │   users.plan│             │             │
   │           │   = 'premium'►           │             │
   │           │             │             │             │
   │           │── Gửi email ─────────────────────────►│
   │           │   xác nhận  │             │             │
   │           │             │             │             │
   │◄── Redirect /billing/   │             │             │
   │    success               │             │             │
```

---

### 12.2 Kiểm tra & Gia hạn tự động

```
[CRON: 00:00 hàng ngày]
         │
         ▼
┌────────────────────────────────────────────┐
│ SELECT * FROM subscriptions                │
│ WHERE status = 'active'                    │
│   AND expires_at BETWEEN NOW()             │
│                      AND NOW() + '3 days'  │
└──────────────────────┬─────────────────────┘
                       │
                       ▼ For each expiring subscription
              ┌────────┴────────┐
              │ auto_renew=true │
              └────────┬────────┘
            Yes ───────┤──── No
              │        │        │
              ▼        │        ▼
     Charge lại        │  Send reminder email
     gateway           │  "Gói sắp hết hạn"
              │        │
              ▼        │
    Success?           │
    ├── Yes: UPDATE expires_at += 30d
    └── No:  UPDATE status = 'expired'
             UPDATE users.plan = 'free'
             Send "thanh toán thất bại" email
```

---

## 13. FLOW 11 — NOTIFICATION & REMINDER

### 13.1 Luồng gửi notification

```
[TRIGGER]           [QUEUE]          [API]          [DB]          [CLIENT]
    │                  │               │               │               │
    │ (bất kỳ event)   │               │               │               │
    │── Push job ──────►│               │               │               │
    │   {user_id,       │               │               │               │
    │    type,          │               │               │               │
    │    payload}       │               │               │               │
    │                   │               │               │               │
    │                   │── Process ───►│               │               │
    │                   │               │               │               │
    │                   │               │── INSERT ────►│               │
    │                   │               │   notifications│              │
    │                   │               │               │               │
    │                   │               │── Realtime    │               │
    │                   │               │   push ──────────────────────►│
    │                   │               │   (WebSocket/ │               │
    │                   │               │    SSE)       │               │

-- Client polling (fallback) --

    │                                           │               │
    │── GET /notifications?                     │               │
    │   unread=true ────────────────────────────►│               │
    │◄── [{notif}] ─────────────────────────────│               │
    │                                           │               │
    │── POST /notifications/                    │               │
    │   read-all ───────────────────────────────►│               │
    │                                           │               │
    │                                           │── UPDATE ────►│
    │                                           │   is_read=true│
```

---

### 13.2 Email Notification Queue

```
[ANY EVENT] ──► [BULL QUEUE: email_queue]
                         │
                ┌────────┴──────────┐
                │  Job types:       │
                │  - verify_email   │
                │  - reset_password │
                │  - booking_confirm│
                │  - streak_remind  │
                │  - payment_confirm│
                │  - plan_expiring  │
                └────────┬──────────┘
                         │
                         ▼ Worker processes
                ┌────────────────────┐
                │ Load template      │
                │ Fill variables     │
                │ Send via SendGrid  │
                └────────┬───────────┘
                         │
                ┌────────┴────────┐
                │  Success?       │
                └────────┬────────┘
              Yes ───────┤──── No
                │        │        │
                ▼        │        ▼
             Log ok      │  Retry (max 3x)
                         │  Backoff: 1m, 5m, 30m
                         │
                         └── After 3 fails: alert admin
```

---

## 14. ERROR HANDLING TOÀN CỤC

### 14.1 HTTP Error Codes

```
200 OK              → Thành công
201 Created         → Tạo mới thành công
400 Bad Request     → Dữ liệu đầu vào sai (validation fail)
401 Unauthorized    → Chưa đăng nhập / token hết hạn
403 Forbidden       → Không có quyền (vd: xem note của người khác)
404 Not Found       → Resource không tồn tại
409 Conflict        → Đã tồn tại (vd: email đã đăng ký)
422 Unprocessable   → Logic error (vd: booking ngày đã qua)
429 Too Many        → Hết quota free / rate limit
500 Internal        → Lỗi server
503 Service         → AI service tạm thời không khả dụng
```

---

### 14.2 AI Fallback Strategy

```
[Gọi Gemini API]
        │
        ▼
┌───────────────────┐
│  Response OK?     │
└────────┬──────────┘
    No───┤──── Yes ──► Trả về client
         │
         ▼
┌────────────────────────────────┐
│  Phân loại lỗi:               │
│                                │
│  429 Rate Limit:               │
│  → Đợi 60s, retry 1 lần       │
│  → Fail: báo user thử lại sau │
│                                │
│  500/503 Server Error:         │
│  → Retry ngay 1 lần            │
│  → Fail: fallback message:    │
│    "AI tạm thời bận, thử lại" │
│                                │
│  Timeout (>30s):               │
│  → Cancel request              │
│  → KHÔNG tính vào usage_logs   │
│  → Báo user                   │
│                                │
│  Invalid JSON response:        │
│  → Parse lại với prompt khác   │
│  → Max 2 lần retry             │
└────────────────────────────────┘
```

---

### 14.3 Response Format chuẩn

```json
// Thành công
{
  "success": true,
  "data": { ... },
  "meta": {
    "quota_remaining": 3,
    "quota_reset_at": "2026-03-25T00:00:00Z"
  }
}

// Lỗi
{
  "success": false,
  "error": {
    "code": "QUOTA_EXCEEDED",
    "message": "Bạn đã dùng hết 5 lượt giải bài hôm nay",
    "details": {
      "limit": 5,
      "used": 5,
      "reset_at": "2026-03-25T00:00:00Z",
      "upgrade_url": "/billing/upgrade"
    }
  }
}
```

---

## 15. STATE MACHINE TỔNG HỢP

### 15.1 Booking States

```
                    ┌──────────┐
                    │ PENDING  │ ← Vừa tạo, chờ thanh toán
                    └────┬─────┘
             Thanh toán  │     Huỷ (student)
             thành công  │         │
                    ┌────▼─────┐   ▼
                    │CONFIRMED │  CANCELLED
                    └────┬─────┘
            Kết thúc     │     Vắng mặt
            buổi học     │         │
                    ┌────▼─────┐   ▼
                    │COMPLETED │  NO_SHOW
                    └──────────┘
```

---

### 15.2 Exam Attempt States

```
         ┌─────────────┐
         │ IN_PROGRESS │ ← Bắt đầu làm bài
         └──────┬──────┘
      Submit    │    Hết giờ
      thủ công  │         │
         ┌──────▼──────┐  │
         │  SUBMITTED  │  ▼
         └─────────────┘ TIMEOUT
```

---

### 15.3 Subscription States

```
         ┌──────────┐
         │  ACTIVE  │ ← Đang dùng
         └─────┬────┘
     Hết hạn   │   Huỷ chủ động
               │        │
         ┌─────▼────┐   ▼
         │  EXPIRED │  CANCELLED
         └─────┬────┘
     Gia hạn   │
               │
         ┌─────▼────┐
         │  ACTIVE  │ ← Khôi phục
         └──────────┘
```

---

### 15.4 Tutor Profile States

```
         ┌───────────┐
         │  PENDING  │ ← Vừa đăng ký
         └─────┬─────┘
    Admin      │     Admin từ chối
    duyệt      │          │
         ┌─────▼─────┐    ▼
         │ APPROVED  │  (xoá hoặc yêu cầu bổ sung)
         └─────┬─────┘
    Vi phạm    │
               │
         ┌─────▼─────┐
         │ SUSPENDED │
         └───────────┘
```

---

## 📊 THỐNG KÊ TỔNG QUAN FLOW

| Hạng mục | Con số |
|---|---|
| Tổng số flow chính | **11 flow** |
| Background jobs (Cron) | 5 jobs |
| Queue jobs (Async) | 3 queue |
| State machines | 4 |
| Error scenarios xử lý | 8 |
| External services tích hợp | 5 (Gemini, VNPay, Cloudinary, SendGrid, Redis) |

---

*Tài liệu này là phần tiếp theo của Database Design v1.0 — NebulaLab.vn | 24/03/2026*
