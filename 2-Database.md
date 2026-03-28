# 🗄️ THIẾT KẾ DATABASE — NebulaLab.vn
> **Version:** 1.0 | **Engine:** PostgreSQL 16 | **Date:** 24/03/2026

---

## MỤC LỤC

1. [Nguyên tắc thiết kế](#1-nguyên-tắc-thiết-kế)
2. [ERD Tổng quan](#2-erd-tổng-quan)
3. [TẦNG 1 — Core / Auth](#3-tầng-1--core--auth)
4. [TẦNG 2 — Module 1: Flashcard](#4-tầng-2--module-1-flashcard)
5. [TẦNG 2 — Module 2: Giải bài](#5-tầng-2--module-2-giải-bài)
6. [TẦNG 2 — Module 3: Luyện đề](#6-tầng-2--module-3-luyện-đề)
7. [TẦNG 2 — Module 4: Micro-learning](#7-tầng-2--module-4-micro-learning)
8. [TẦNG 2 — Module 5: AI Note & Summary](#8-tầng-2--module-5-ai-note--summary)
9. [TẦNG 2 — Module 6: Tutor Marketplace](#9-tầng-2--module-6-tutor-marketplace)
10. [TẦNG 2 — Module 7: Quiz Generator](#10-tầng-2--module-7-quiz-generator)
11. [TẦNG 3 — Billing & Subscription](#11-tầng-3--billing--subscription)
12. [TẦNG 3 — Notification & Audit](#12-tầng-3--notification--audit)
13. [Indexes & Performance](#13-indexes--performance)
14. [Naming Conventions](#14-naming-conventions)
15. [Migration Order](#15-migration-order)

---

## 1. NGUYÊN TẮC THIẾT KẾ

| Nguyên tắc | Mô tả |
|---|---|
| **UUID v4** | Dùng UUID cho tất cả PK — tránh expose số thứ tự, an toàn hơn khi scale |
| **Soft delete** | Không xoá cứng — dùng `deleted_at TIMESTAMPTZ` |
| **Timestamps chuẩn** | Mọi bảng đều có `created_at`, `updated_at` |
| **Timezone** | Lưu tất cả thời gian dạng `TIMESTAMPTZ` (UTC) |
| **JSONB linh hoạt** | Dùng JSONB cho metadata động, tránh over-normalize |
| **Enum = TEXT + CHECK** | Dùng TEXT với CHECK CONSTRAINT thay vì PostgreSQL ENUM (dễ migrate) |
| **Row-level Security** | Bật RLS cho bảng nhạy cảm (payments, notes) |

---

## 2. ERD TỔNG QUAN

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CORE / AUTH                                 │
│  users ──── user_sessions ──── user_oauth_accounts                  │
│    │                                                                  │
│    ├──── subscriptions ──── subscription_plans                       │
│    ├──── usage_logs                                                   │
│    └──── notifications                                                │
└─────────────────────────────────────────────────────────────────────┘
         │
         ├── MODULE 1: flashcard_sets ──── flashcards ──── review_schedules
         │
         ├── MODULE 2: solve_histories
         │
         ├── MODULE 3: exams ──── exam_questions ──── exam_attempts ──── attempt_answers
         │
         ├── MODULE 4: learning_topics ──── daily_lessons ──── user_lesson_progress
         │                                                  └── user_streaks
         │
         ├── MODULE 5: notes ──── note_summaries
         │
         ├── MODULE 6: tutor_profiles ──── tutor_subjects
         │               └── bookings ──── booking_reviews
         │               └── tutor_availabilities
         │
         └── MODULE 7: quiz_sets ──── quiz_questions ──── quiz_attempts ──── quiz_answers
```

---

## 3. TẦNG 1 — CORE / AUTH

### 3.1 `users` — Bảng người dùng chính

```sql
CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email               TEXT UNIQUE NOT NULL,
    email_verified      BOOLEAN NOT NULL DEFAULT FALSE,
    password_hash       TEXT,                          -- NULL nếu chỉ dùng OAuth
    full_name           TEXT NOT NULL,
    avatar_url          TEXT,
    role                TEXT NOT NULL DEFAULT 'student'
                            CHECK (role IN ('student', 'tutor', 'admin')),
    plan                TEXT NOT NULL DEFAULT 'free'
                            CHECK (plan IN ('free', 'premium', 'enterprise')),
    plan_expires_at     TIMESTAMPTZ,
    locale              TEXT NOT NULL DEFAULT 'vi',
    timezone            TEXT NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    metadata            JSONB NOT NULL DEFAULT '{}',  -- flexible extra data
    deleted_at          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

**Giải thích các cột:**
| Cột | Mục đích |
|---|---|
| `password_hash` | bcrypt hash — NULL nếu user chỉ dùng Google/Facebook |
| `role` | student / tutor / admin — phân quyền hệ thống |
| `plan` | free / premium / enterprise — kiểm soát quota |
| `plan_expires_at` | Thời điểm hết hạn Premium |
| `metadata` | Lưu thêm: ngôn ngữ học, level, preferences... |

---

### 3.2 `user_oauth_accounts` — Đăng nhập mạng xã hội

```sql
CREATE TABLE user_oauth_accounts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider        TEXT NOT NULL CHECK (provider IN ('google', 'facebook', 'github')),
    provider_uid    TEXT NOT NULL,                   -- ID từ bên thứ 3
    access_token    TEXT,
    refresh_token   TEXT,
    token_expires_at TIMESTAMPTZ,
    raw_profile     JSONB NOT NULL DEFAULT '{}',     -- data thô từ provider
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (provider, provider_uid)
);
```

---

### 3.3 `user_sessions` — Quản lý phiên đăng nhập

```sql
CREATE TABLE user_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token   TEXT UNIQUE NOT NULL,
    ip_address      INET,
    user_agent      TEXT,
    last_active_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ NOT NULL,
    revoked_at      TIMESTAMPTZ,                     -- logout / revoke
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 3.4 `email_verifications` — OTP / link xác thực email

```sql
CREATE TABLE email_verifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       TEXT UNIQUE NOT NULL,
    type        TEXT NOT NULL CHECK (type IN ('verify_email', 'reset_password')),
    expires_at  TIMESTAMPTZ NOT NULL,
    used_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 3.5 `usage_logs` — Theo dõi quota người dùng

```sql
CREATE TABLE usage_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module      TEXT NOT NULL CHECK (module IN (
                    'flashcard', 'solver', 'exam',
                    'microlearn', 'note', 'quiz'
                )),
    action      TEXT NOT NULL,                       -- vd: 'generate', 'solve', 'summarize'
    tokens_used INTEGER NOT NULL DEFAULT 0,          -- AI tokens tiêu thụ
    metadata    JSONB NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Đếm usage trong ngày (dùng cho quota engine)
-- Câu query ví dụ:
-- SELECT COUNT(*) FROM usage_logs
-- WHERE user_id = $1 AND module = 'solver'
-- AND created_at >= CURRENT_DATE;
```

---

## 4. TẦNG 2 — MODULE 1: FLASHCARD

### 4.1 `flashcard_sets` — Bộ flashcard

```sql
CREATE TABLE flashcard_sets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    description     TEXT,
    subject         TEXT,                            -- vd: 'Toán', 'Tiếng Anh'
    source_type     TEXT CHECK (source_type IN ('pdf', 'text', 'manual')),
    source_url      TEXT,                            -- Cloudinary URL nếu upload PDF
    card_count      INTEGER NOT NULL DEFAULT 0,      -- denormalized counter
    is_public       BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 4.2 `flashcards` — Từng thẻ flashcard

```sql
CREATE TABLE flashcards (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    set_id          UUID NOT NULL REFERENCES flashcard_sets(id) ON DELETE CASCADE,
    front           TEXT NOT NULL,                   -- Câu hỏi / từ / khái niệm
    back            TEXT NOT NULL,                   -- Đáp án / định nghĩa
    hint            TEXT,
    image_url       TEXT,
    audio_url       TEXT,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 4.3 `review_schedules` — Lịch ôn tập (Spaced Repetition - thuật toán SM-2)

```sql
CREATE TABLE review_schedules (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    flashcard_id        UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,

    -- SM-2 Algorithm fields
    repetition          INTEGER NOT NULL DEFAULT 0,  -- số lần đã ôn
    easiness_factor     NUMERIC(4,2) NOT NULL DEFAULT 2.5, -- hệ số dễ (1.3 - 2.5)
    interval_days       INTEGER NOT NULL DEFAULT 1,  -- số ngày đến lần ôn tiếp
    next_review_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_reviewed_at    TIMESTAMPTZ,

    -- Kết quả lần ôn gần nhất (0-5 theo SM-2)
    last_quality        INTEGER CHECK (last_quality BETWEEN 0 AND 5),

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (user_id, flashcard_id)
);

-- Index để lấy thẻ cần ôn hôm nay
CREATE INDEX idx_review_schedules_due
    ON review_schedules(user_id, next_review_at)
    WHERE next_review_at <= NOW();
```

**SM-2 Algorithm logic (tham khảo implement):**
```
Nếu quality >= 3 (nhớ được):
  interval(1) = 1 ngày
  interval(2) = 6 ngày
  interval(n) = interval(n-1) * easiness_factor
  easiness_factor += 0.1 - (5 - quality) * 0.08

Nếu quality < 3 (quên):
  repetition = 0
  interval = 1 ngày
```

---

## 5. TẦNG 2 — MODULE 2: GIẢI BÀI

### 5.1 `solve_histories` — Lịch sử giải bài

```sql
CREATE TABLE solve_histories (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject         TEXT NOT NULL,                   -- 'Toán', 'Tiếng Anh', 'Lý', 'Hóa'...
    grade_level     TEXT,                            -- '10', '11', '12', 'đại học'
    question_text   TEXT NOT NULL,
    question_image_url TEXT,                         -- nếu upload ảnh bài
    answer_text     TEXT NOT NULL,                   -- lời giải từng bước
    answer_html     TEXT,                            -- render HTML (LaTeX, markdown)
    tokens_used     INTEGER NOT NULL DEFAULT 0,
    model_used      TEXT NOT NULL DEFAULT 'gemini-1.5-pro',
    is_saved        BOOLEAN NOT NULL DEFAULT FALSE,  -- user đánh dấu lưu lại
    rating          INTEGER CHECK (rating BETWEEN 1 AND 5), -- user đánh giá kết quả
    deleted_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 6. TẦNG 2 — MODULE 3: LUYỆN ĐỀ

### 6.1 `exams` — Đề thi

```sql
CREATE TABLE exams (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id      UUID REFERENCES users(id) ON DELETE SET NULL,
    title           TEXT NOT NULL,
    description     TEXT,
    subject         TEXT NOT NULL,
    grade_level     TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 45,
    total_questions INTEGER NOT NULL DEFAULT 0,      -- denormalized
    total_points    NUMERIC(6,2) NOT NULL DEFAULT 0, -- denormalized
    is_ai_generated BOOLEAN NOT NULL DEFAULT FALSE,
    is_public       BOOLEAN NOT NULL DEFAULT TRUE,
    pass_score      NUMERIC(5,2),                    -- % điểm để đậu
    deleted_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 6.2 `exam_questions` — Câu hỏi trong đề

```sql
CREATE TABLE exam_questions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id         UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    question_text   TEXT NOT NULL,
    question_image_url TEXT,
    question_type   TEXT NOT NULL DEFAULT 'single_choice'
                        CHECK (question_type IN (
                            'single_choice',    -- trắc nghiệm 1 đáp án
                            'multi_choice',     -- nhiều đáp án đúng
                            'true_false',       -- đúng/sai
                            'fill_blank'        -- điền vào chỗ trống
                        )),
    options         JSONB,                           -- [{id, text, image_url}]
    correct_answers JSONB NOT NULL,                  -- ["A"] hoặc ["A","C"]
    explanation     TEXT,                            -- giải thích đáp án
    points          NUMERIC(5,2) NOT NULL DEFAULT 1,
    difficulty      TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
    topic_tag       TEXT,                            -- chủ đề (để phân tích điểm yếu)
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 6.3 `exam_attempts` — Lần làm bài của user

```sql
CREATE TABLE exam_attempts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id         UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status          TEXT NOT NULL DEFAULT 'in_progress'
                        CHECK (status IN ('in_progress', 'submitted', 'timeout')),
    started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_at    TIMESTAMPTZ,
    time_spent_sec  INTEGER,                         -- thời gian làm bài (giây)
    score           NUMERIC(6,2),                    -- điểm thực tế
    max_score       NUMERIC(6,2),                    -- điểm tối đa
    percentage      NUMERIC(5,2),                    -- % điểm
    passed          BOOLEAN,
    analysis        JSONB,                           -- {topic: {correct, total}} phân tích điểm yếu
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 6.4 `attempt_answers` — Đáp án từng câu

```sql
CREATE TABLE attempt_answers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id      UUID NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
    question_id     UUID NOT NULL REFERENCES exam_questions(id) ON DELETE CASCADE,
    selected_answers JSONB NOT NULL DEFAULT '[]',    -- đáp án user chọn
    is_correct      BOOLEAN,
    points_earned   NUMERIC(5,2) NOT NULL DEFAULT 0,
    time_spent_sec  INTEGER,                         -- thời gian cho câu này
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (attempt_id, question_id)
);
```

---

## 7. TẦNG 2 — MODULE 4: MICRO-LEARNING

### 7.1 `learning_topics` — Chủ đề học

```sql
CREATE TABLE learning_topics (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,                   -- 'Tiếng Anh giao tiếp', 'Kỹ năng mềm'
    slug            TEXT UNIQUE NOT NULL,
    icon_url        TEXT,
    description     TEXT,
    lesson_count    INTEGER NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 7.2 `daily_lessons` — Bài học mỗi ngày

```sql
CREATE TABLE daily_lessons (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id        UUID NOT NULL REFERENCES learning_topics(id),
    title           TEXT NOT NULL,
    content         TEXT NOT NULL,                   -- Markdown content
    content_html    TEXT,
    estimated_minutes INTEGER NOT NULL DEFAULT 5,
    lesson_date     DATE,                            -- nếu schedule theo ngày
    day_index       INTEGER,                         -- ngày thứ N trong lộ trình
    is_premium      BOOLEAN NOT NULL DEFAULT FALSE,
    quiz_question   JSONB,                           -- câu quiz nhỏ cuối bài
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 7.3 `user_lesson_progress` — Tiến độ học

```sql
CREATE TABLE user_lesson_progress (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id       UUID NOT NULL REFERENCES daily_lessons(id) ON DELETE CASCADE,
    topic_id        UUID NOT NULL REFERENCES learning_topics(id),
    status          TEXT NOT NULL DEFAULT 'not_started'
                        CHECK (status IN ('not_started', 'in_progress', 'completed')),
    quiz_answered   BOOLEAN NOT NULL DEFAULT FALSE,
    quiz_correct    BOOLEAN,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, lesson_id)
);
```

---

### 7.4 `user_streaks` — Chuỗi ngày học liên tiếp

```sql
CREATE TABLE user_streaks (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_streak      INTEGER NOT NULL DEFAULT 0,  -- chuỗi hiện tại
    longest_streak      INTEGER NOT NULL DEFAULT 0,  -- kỷ lục
    last_activity_date  DATE,
    total_days_learned  INTEGER NOT NULL DEFAULT 0,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 8. TẦNG 2 — MODULE 5: AI NOTE & SUMMARY

### 8.1 `notes` — Ghi chú người dùng

```sql
CREATE TABLE notes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           TEXT NOT NULL DEFAULT 'Untitled Note',
    source_type     TEXT CHECK (source_type IN ('text', 'pdf', 'url', 'docx')),
    source_content  TEXT,                            -- text gốc người dùng nhập
    source_url      TEXT,                            -- Cloudinary URL nếu upload
    word_count      INTEGER,
    tags            TEXT[] NOT NULL DEFAULT '{}',
    is_pinned       BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 8.2 `note_summaries` — Kết quả tóm tắt AI

```sql
CREATE TABLE note_summaries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id         UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    summary_short   TEXT NOT NULL,                   -- tóm tắt 1 đoạn ngắn
    bullet_points   JSONB NOT NULL DEFAULT '[]',     -- ["ý chính 1", "ý chính 2"]
    keywords        TEXT[] NOT NULL DEFAULT '{}',    -- từ khóa quan trọng
    full_summary    TEXT,                            -- tóm tắt đầy đủ hơn (Premium)
    model_used      TEXT NOT NULL DEFAULT 'gemini-1.5-pro',
    tokens_used     INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 9. TẦNG 2 — MODULE 6: TUTOR MARKETPLACE

### 9.1 `tutor_profiles` — Hồ sơ gia sư

```sql
CREATE TABLE tutor_profiles (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bio                 TEXT,
    education           TEXT,                        -- Trường / bằng cấp
    experience_years    INTEGER NOT NULL DEFAULT 0,
    hourly_rate_vnd     INTEGER NOT NULL,            -- giá mỗi giờ (VNĐ)
    hourly_rate_min     INTEGER,                     -- giá thấp nhất (nếu thương lượng)
    teaching_style      TEXT,                        -- mô tả phong cách dạy
    certifications      JSONB NOT NULL DEFAULT '[]', -- [{name, image_url, year}]
    video_intro_url     TEXT,
    rating_avg          NUMERIC(3,2) NOT NULL DEFAULT 0.00,
    review_count        INTEGER NOT NULL DEFAULT 0,
    total_sessions      INTEGER NOT NULL DEFAULT 0,
    is_verified         BOOLEAN NOT NULL DEFAULT FALSE,
    is_available        BOOLEAN NOT NULL DEFAULT TRUE,
    status              TEXT NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'approved', 'suspended')),
    deleted_at          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 9.2 `tutor_subjects` — Môn gia sư dạy được

```sql
CREATE TABLE tutor_subjects (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id    UUID NOT NULL REFERENCES tutor_profiles(id) ON DELETE CASCADE,
    subject     TEXT NOT NULL,                       -- 'Toán', 'Tiếng Anh'
    grade_levels TEXT[] NOT NULL DEFAULT '{}',       -- ['10', '11', '12']
    proficiency TEXT NOT NULL DEFAULT 'advanced'
                    CHECK (proficiency IN ('intermediate', 'advanced', 'expert')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tutor_id, subject)
);
```

---

### 9.3 `tutor_availabilities` — Lịch rảnh của gia sư

```sql
CREATE TABLE tutor_availabilities (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id        UUID NOT NULL REFERENCES tutor_profiles(id) ON DELETE CASCADE,
    day_of_week     INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=CN, 1=T2...
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (end_time > start_time)
);
```

---

### 9.4 `bookings` — Đặt lịch học

```sql
CREATE TABLE bookings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tutor_id        UUID NOT NULL REFERENCES tutor_profiles(id) ON DELETE CASCADE,
    subject         TEXT NOT NULL,
    grade_level     TEXT,
    session_date    DATE NOT NULL,
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    duration_minutes INTEGER NOT NULL,
    platform        TEXT NOT NULL DEFAULT 'google_meet'
                        CHECK (platform IN ('google_meet', 'zoom', 'zalo', 'other')),
    meeting_url     TEXT,
    notes           TEXT,                            -- ghi chú từ học sinh

    -- Tài chính
    price_vnd       INTEGER NOT NULL,                -- giá buổi học
    commission_rate NUMERIC(4,2) NOT NULL DEFAULT 0.12, -- 12%
    commission_vnd  INTEGER NOT NULL,
    tutor_payout_vnd INTEGER NOT NULL,

    -- Trạng thái
    status          TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN (
                            'pending',      -- chờ gia sư xác nhận
                            'confirmed',    -- gia sư đã xác nhận
                            'completed',    -- buổi học kết thúc
                            'cancelled',    -- bị huỷ
                            'no_show'       -- vắng mặt
                        )),
    cancelled_by    UUID REFERENCES users(id),
    cancelled_at    TIMESTAMPTZ,
    cancel_reason   TEXT,
    completed_at    TIMESTAMPTZ,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 9.5 `booking_reviews` — Đánh giá sau buổi học

```sql
CREATE TABLE booking_reviews (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id      UUID UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    reviewer_id     UUID NOT NULL REFERENCES users(id),
    tutor_id        UUID NOT NULL REFERENCES tutor_profiles(id),
    rating          INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment         TEXT,
    is_public       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 10. TẦNG 2 — MODULE 7: QUIZ GENERATOR

### 10.1 `quiz_sets` — Bộ quiz

```sql
CREATE TABLE quiz_sets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    description     TEXT,
    source_type     TEXT CHECK (source_type IN ('text', 'pdf', 'manual')),
    source_url      TEXT,
    question_count  INTEGER NOT NULL DEFAULT 0,      -- denormalized
    difficulty      TEXT CHECK (difficulty IN ('easy', 'medium', 'hard', 'mixed')),
    is_public       BOOLEAN NOT NULL DEFAULT FALSE,
    share_token     TEXT UNIQUE,                     -- token chia sẻ link
    play_count      INTEGER NOT NULL DEFAULT 0,
    deleted_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 10.2 `quiz_questions` — Câu hỏi trong quiz

```sql
CREATE TABLE quiz_questions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id         UUID NOT NULL REFERENCES quiz_sets(id) ON DELETE CASCADE,
    question_text   TEXT NOT NULL,
    question_type   TEXT NOT NULL DEFAULT 'single_choice'
                        CHECK (question_type IN (
                            'single_choice',
                            'true_false',
                            'fill_blank'
                        )),
    options         JSONB,                           -- [{id, text}]
    correct_answers JSONB NOT NULL,
    explanation     TEXT,
    points          INTEGER NOT NULL DEFAULT 1,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 10.3 `quiz_attempts` — Lần làm quiz

```sql
CREATE TABLE quiz_attempts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id         UUID NOT NULL REFERENCES quiz_sets(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL = khách
    guest_name      TEXT,                            -- nếu là khách chưa đăng nhập
    status          TEXT NOT NULL DEFAULT 'in_progress'
                        CHECK (status IN ('in_progress', 'completed')),
    score           INTEGER NOT NULL DEFAULT 0,
    max_score       INTEGER NOT NULL DEFAULT 0,
    percentage      NUMERIC(5,2),
    time_spent_sec  INTEGER,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 10.4 `quiz_answers` — Đáp án từng câu quiz

```sql
CREATE TABLE quiz_answers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id      UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    question_id     UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    selected_answers JSONB NOT NULL DEFAULT '[]',
    is_correct      BOOLEAN,
    points_earned   INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (attempt_id, question_id)
);
```

---

## 11. TẦNG 3 — BILLING & SUBSCRIPTION

### 11.1 `subscription_plans` — Các gói cước

```sql
CREATE TABLE subscription_plans (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                TEXT UNIQUE NOT NULL,        -- 'free', 'premium_monthly', 'premium_yearly'
    display_name        TEXT NOT NULL,
    price_vnd           INTEGER NOT NULL DEFAULT 0,
    billing_cycle       TEXT CHECK (billing_cycle IN ('monthly', 'yearly', 'lifetime')),
    features            JSONB NOT NULL DEFAULT '{}',
    -- Ví dụ features:
    -- {
    --   "flashcard_limit": 20,          // -1 = unlimited
    --   "solver_daily_limit": 5,
    --   "summary_daily_limit": 3,
    --   "quiz_daily_limit": 1,
    --   "ai_model": "gemini-1.5-flash",
    --   "storage_mb": 100
    -- }
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order          INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed data
INSERT INTO subscription_plans (name, display_name, price_vnd, billing_cycle, features) VALUES
('free', 'Miễn phí', 0, NULL, '{
    "flashcard_limit": 20,
    "solver_daily_limit": 5,
    "summary_daily_limit": 3,
    "quiz_daily_limit": 1,
    "ai_model": "gemini-1.5-flash",
    "storage_mb": 100
}'),
('premium_monthly', 'Premium Tháng', 99000, 'monthly', '{
    "flashcard_limit": -1,
    "solver_daily_limit": -1,
    "summary_daily_limit": -1,
    "quiz_daily_limit": -1,
    "ai_model": "gemini-1.5-pro",
    "storage_mb": 5000
}'),
('premium_yearly', 'Premium Năm', 799000, 'yearly', '{
    "flashcard_limit": -1,
    "solver_daily_limit": -1,
    "summary_daily_limit": -1,
    "quiz_daily_limit": -1,
    "ai_model": "gemini-1.5-pro",
    "storage_mb": 10000
}');
```

---

### 11.2 `subscriptions` — Đăng ký của người dùng

```sql
CREATE TABLE subscriptions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id             UUID NOT NULL REFERENCES subscription_plans(id),
    status              TEXT NOT NULL DEFAULT 'active'
                            CHECK (status IN ('active', 'expired', 'cancelled', 'paused')),
    started_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at          TIMESTAMPTZ,
    cancelled_at        TIMESTAMPTZ,
    auto_renew          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 11.3 `payments` — Lịch sử thanh toán

```sql
CREATE TABLE payments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id),
    subscription_id     UUID REFERENCES subscriptions(id),
    amount_vnd          INTEGER NOT NULL,
    currency            TEXT NOT NULL DEFAULT 'VND',
    gateway             TEXT NOT NULL CHECK (gateway IN ('vnpay', 'momo', 'stripe', 'manual')),
    gateway_txn_id      TEXT,                        -- mã giao dịch bên cổng
    gateway_response    JSONB NOT NULL DEFAULT '{}', -- raw response từ cổng
    status              TEXT NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
    paid_at             TIMESTAMPTZ,
    refunded_at         TIMESTAMPTZ,
    refund_amount_vnd   INTEGER,
    note                TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 12. TẦNG 3 — NOTIFICATION & AUDIT

### 12.1 `notifications` — Thông báo trong app

```sql
CREATE TABLE notifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        TEXT NOT NULL CHECK (type IN (
                    'flashcard_review_due',
                    'streak_reminder',
                    'booking_confirmed',
                    'booking_reminder',
                    'payment_success',
                    'payment_failed',
                    'system'
                )),
    title       TEXT NOT NULL,
    body        TEXT NOT NULL,
    data        JSONB NOT NULL DEFAULT '{}',         -- link, entity_id...
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    read_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 12.2 `audit_logs` — Log hành động quan trọng

```sql
CREATE TABLE audit_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id    UUID REFERENCES users(id) ON DELETE SET NULL,
    action      TEXT NOT NULL,                       -- 'user.login', 'payment.success'...
    entity_type TEXT,                                -- 'user', 'booking', 'payment'
    entity_id   UUID,
    old_data    JSONB,
    new_data    JSONB,
    ip_address  INET,
    user_agent  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 13. INDEXES & PERFORMANCE

```sql
-- ══════════════════════════════════════
-- USERS
-- ══════════════════════════════════════
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_plan ON users(plan);

-- ══════════════════════════════════════
-- SESSIONS & AUTH
-- ══════════════════════════════════════
CREATE INDEX idx_sessions_user ON user_sessions(user_id) WHERE revoked_at IS NULL;
CREATE INDEX idx_sessions_token ON user_sessions(refresh_token);

-- ══════════════════════════════════════
-- USAGE LOGS (quan trọng cho quota)
-- ══════════════════════════════════════
CREATE INDEX idx_usage_logs_user_module_date
    ON usage_logs(user_id, module, created_at);

-- ══════════════════════════════════════
-- FLASHCARD
-- ══════════════════════════════════════
CREATE INDEX idx_flashcard_sets_user ON flashcard_sets(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_flashcards_set ON flashcards(set_id);
CREATE INDEX idx_review_due ON review_schedules(user_id, next_review_at);

-- ══════════════════════════════════════
-- SOLVE HISTORY
-- ══════════════════════════════════════
CREATE INDEX idx_solve_user_date ON solve_histories(user_id, created_at DESC);

-- ══════════════════════════════════════
-- EXAMS
-- ══════════════════════════════════════
CREATE INDEX idx_exams_subject ON exams(subject) WHERE deleted_at IS NULL;
CREATE INDEX idx_attempts_user ON exam_attempts(user_id, created_at DESC);

-- ══════════════════════════════════════
-- NOTES
-- ══════════════════════════════════════
CREATE INDEX idx_notes_user ON notes(user_id, updated_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_notes_tags ON notes USING GIN(tags);

-- ══════════════════════════════════════
-- TUTOR MARKETPLACE
-- ══════════════════════════════════════
CREATE INDEX idx_tutor_status ON tutor_profiles(status, is_available, rating_avg DESC);
CREATE INDEX idx_tutor_subjects_subject ON tutor_subjects(subject);
CREATE INDEX idx_bookings_student ON bookings(student_id, session_date);
CREATE INDEX idx_bookings_tutor ON bookings(tutor_id, session_date);

-- ══════════════════════════════════════
-- QUIZ
-- ══════════════════════════════════════
CREATE INDEX idx_quiz_sets_user ON quiz_sets(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_quiz_share_token ON quiz_sets(share_token) WHERE share_token IS NOT NULL;

-- ══════════════════════════════════════
-- NOTIFICATIONS
-- ══════════════════════════════════════
CREATE INDEX idx_notifications_user_unread
    ON notifications(user_id, created_at DESC)
    WHERE is_read = FALSE;

-- ══════════════════════════════════════
-- AUDIT
-- ══════════════════════════════════════
CREATE INDEX idx_audit_actor ON audit_logs(actor_id, created_at DESC);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
```

---

## 14. NAMING CONVENTIONS

| Loại | Quy tắc | Ví dụ |
|---|---|---|
| **Bảng** | `snake_case`, số nhiều | `flashcard_sets`, `exam_attempts` |
| **Cột** | `snake_case` | `created_at`, `user_id` |
| **Primary Key** | `id` (UUID) | `id UUID PRIMARY KEY` |
| **Foreign Key** | `{table_singular}_id` | `user_id`, `exam_id` |
| **Index** | `idx_{table}_{column(s)}` | `idx_users_email` |
| **Trigger** | `trg_{table}_{action}` | `trg_users_updated_at` |
| **Function** | `{verb}_{noun}` | `set_updated_at()` |
| **Enum values** | `snake_case` | `'in_progress'`, `'single_choice'` |
| **JSONB arrays** | camelCase bên trong | `[{"id": "A", "text": "..."}]` |

---

## 15. MIGRATION ORDER

Thứ tự chạy migration để tránh lỗi Foreign Key:

```
001_create_extension_uuid.sql          -- CREATE EXTENSION IF NOT EXISTS "pgcrypto"
002_create_function_updated_at.sql     -- trigger function

-- TẦNG 1: Core
003_create_users.sql
004_create_user_oauth_accounts.sql
005_create_user_sessions.sql
006_create_email_verifications.sql
007_create_usage_logs.sql

-- TẦNG 2: Modules
008_create_flashcard_sets.sql
009_create_flashcards.sql
010_create_review_schedules.sql

011_create_solve_histories.sql

012_create_exams.sql
013_create_exam_questions.sql
014_create_exam_attempts.sql
015_create_attempt_answers.sql

016_create_learning_topics.sql
017_create_daily_lessons.sql
018_create_user_lesson_progress.sql
019_create_user_streaks.sql

020_create_notes.sql
021_create_note_summaries.sql

022_create_tutor_profiles.sql
023_create_tutor_subjects.sql
024_create_tutor_availabilities.sql
025_create_bookings.sql
026_create_booking_reviews.sql

027_create_quiz_sets.sql
028_create_quiz_questions.sql
029_create_quiz_attempts.sql
030_create_quiz_answers.sql

-- TẦNG 3: Billing & System
031_create_subscription_plans.sql
032_create_subscriptions.sql
033_create_payments.sql
034_create_notifications.sql
035_create_audit_logs.sql

-- TẦNG 4: Indexes
036_create_all_indexes.sql

-- SEED DATA
037_seed_subscription_plans.sql
038_seed_learning_topics.sql
```

---

## 📊 THỐNG KÊ TỔNG QUAN

| Hạng mục | Con số |
|---|---|
| Tổng số bảng | **35 bảng** |
| Bảng Core / Auth | 5 bảng |
| Bảng Module học tập | 22 bảng |
| Bảng Billing & System | 5 bảng |
| Bảng Log & Audit | 3 bảng |
| Tổng số Index | **18 indexes** |
| Bảng có Soft Delete | 10 bảng |
| Bảng có JSONB | 18 bảng |

---

*Tài liệu này được tạo cho dự án NebulaLab.vn | Cập nhật: 24/03/2026*
