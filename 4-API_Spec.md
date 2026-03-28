# 📡 API SPECIFICATION — NebulaLab.vn
> **Version:** 1.0 | **Base URL:** `https://api.nebulalab.vn/v1` | **Date:** 24/03/2026
> **Ref:** Database Design v1.0 | Flow Design v1.0

---

## MỤC LỤC

1. [Quy ước chung](#1-quy-ước-chung)
2. [Auth](#2-auth)
3. [User & Profile](#3-user--profile)
4. [Quota Engine](#4-quota-engine)
5. [Module 1 — AI Flashcard](#5-module-1--ai-flashcard)
6. [Module 2 — Giải bài từng bước](#6-module-2--giải-bài-từng-bước)
7. [Module 3 — Luyện đề](#7-module-3--luyện-đề)
8. [Module 4 — Micro-learning](#8-module-4--micro-learning)
9. [Module 5 — AI Note & Summary](#9-module-5--ai-note--summary)
10. [Module 6 — Tutor Marketplace](#10-module-6--tutor-marketplace)
11. [Module 7 — Quiz Generator](#11-module-7--quiz-generator)
12. [Billing & Subscription](#12-billing--subscription)
13. [Notification](#13-notification)
14. [Admin](#14-admin)
15. [Error Codes](#15-error-codes)
16. [Quota Limits Tổng hợp](#16-quota-limits-tổng-hợp)

---

## 1. QUY ƯỚC CHUNG

### 1.1 Request Format

```
Content-Type: application/json
Authorization: Bearer <access_token>   ← bắt buộc với route được bảo vệ
```

### 1.2 Response Format chuẩn

```json
// ✅ Thành công
{
  "success": true,
  "data": { ... },
  "meta": {
    "quota_remaining": 3,
    "quota_reset_at": "2026-03-25T00:00:00Z"
  }
}

// ❌ Lỗi
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

### 1.3 Phân quyền (Guards)

| Guard | Mô tả |
|---|---|
| `[public]` | Không cần token |
| `[auth]` | Cần JWT access_token hợp lệ |
| `[premium]` | Cần plan = premium hoặc enterprise |
| `[admin]` | Cần role = admin |
| `[tutor]` | Cần role = tutor và profile đã APPROVED |

### 1.4 Pagination chuẩn

Query params: `?page=1&limit=20`

```json
"meta": {
  "page": 1,
  "limit": 20,
  "total": 150,
  "total_pages": 8
}
```

---

## 2. AUTH

### 2.1 Đăng ký

**`POST /auth/register`** `[public]`

```json
// Request
{
  "email": "user@example.com",
  "password": "Abc@12345",
  "full_name": "Nguyễn Văn A"
}

// Response 201
{
  "success": true,
  "data": {
    "message": "Đăng ký thành công. Vui lòng kiểm tra email để xác thực.",
    "user_id": "uuid"
  }
}
```

**Validation:**
- `email`: format hợp lệ, chưa tồn tại
- `password`: tối thiểu 8 ký tự, có chữ hoa + số + ký tự đặc biệt
- `full_name`: 2–100 ký tự

**Errors:** `400 VALIDATION_ERROR` | `409 EMAIL_EXISTS`

---

### 2.2 Xác thực email

**`GET /auth/verify-email?token=xxx`** `[public]`

```json
// Response 200
{
  "success": true,
  "data": {
    "message": "Email đã được xác thực. Bạn có thể đăng nhập.",
    "redirect_url": "/dashboard"
  }
}
```

**Errors:** `400 INVALID_TOKEN` | `410 TOKEN_EXPIRED`

---

### 2.3 Đăng nhập

**`POST /auth/login`** `[public]`

```json
// Request
{
  "email": "user@example.com",
  "password": "Abc@12345"
}

// Response 200
{
  "success": true,
  "data": {
    "access_token": "eyJ...",       // expires 15 phút
    "refresh_token": "eyJ...",      // expires 7 ngày
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "Nguyễn Văn A",
      "avatar_url": null,
      "role": "student",
      "plan": "free",
      "plan_expires_at": null
    }
  }
}
```

**Errors:** `401 INVALID_CREDENTIALS` | `403 EMAIL_NOT_VERIFIED` | `403 ACCOUNT_SUSPENDED`

---

### 2.4 Đăng nhập Google OAuth2

**`GET /auth/google`** `[public]`
> Redirect người dùng đến Google OAuth consent screen

**`GET /auth/google/callback?code=xxx`** `[public]`
> Callback từ Google — xử lý token, tạo/cập nhật user, set cookie rồi redirect `/dashboard`

---

### 2.5 Refresh Token

**`POST /auth/refresh`** `[public]`

```json
// Request
{ "refresh_token": "eyJ..." }

// Response 200
{
  "success": true,
  "data": {
    "access_token": "eyJ...",
    "refresh_token": "eyJ..."   // rotate refresh token
  }
}
```

**Errors:** `401 INVALID_TOKEN` | `401 SESSION_REVOKED`

---

### 2.6 Đăng xuất

**`POST /auth/logout`** `[auth]`

```json
// Request
{ "refresh_token": "eyJ..." }

// Response 200
{ "success": true, "data": { "message": "Đã đăng xuất." } }
```

---

### 2.7 Quên mật khẩu

**`POST /auth/forgot-password`** `[public]`

```json
// Request
{ "email": "user@example.com" }

// Response 200
{ "success": true, "data": { "message": "Link đặt lại mật khẩu đã gửi về email." } }
```

---

### 2.8 Đặt lại mật khẩu

**`POST /auth/reset-password`** `[public]`

```json
// Request
{
  "token": "xxx",
  "new_password": "NewAbc@12345"
}

// Response 200
{ "success": true, "data": { "message": "Mật khẩu đã được cập nhật." } }
```

**Errors:** `400 INVALID_TOKEN` | `410 TOKEN_EXPIRED`

---

## 3. USER & PROFILE

### 3.1 Lấy thông tin user hiện tại

**`GET /user/me`** `[auth]`

```json
// Response 200
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "Nguyễn Văn A",
    "avatar_url": "https://cdn.cloudinary.com/...",
    "role": "student",
    "plan": "free",
    "plan_expires_at": null,
    "locale": "vi",
    "timezone": "Asia/Ho_Chi_Minh",
    "created_at": "2026-01-01T00:00:00Z"
  }
}
```

---

### 3.2 Cập nhật profile

**`PATCH /user/me`** `[auth]`

```json
// Request (các field đều optional)
{
  "full_name": "Nguyễn Văn B",
  "locale": "vi",
  "timezone": "Asia/Ho_Chi_Minh",
  "metadata": {
    "learning_subjects": ["Toán", "Tiếng Anh"],
    "grade": "12"
  }
}

// Response 200
{ "success": true, "data": { ...updated_user } }
```

---

### 3.3 Upload avatar

**`POST /user/me/avatar`** `[auth]`

```
Content-Type: multipart/form-data
Body: file (image/jpeg | image/png, max 5MB)
```

```json
// Response 200
{
  "success": true,
  "data": { "avatar_url": "https://cdn.cloudinary.com/..." }
}
```

---

### 3.4 Đổi mật khẩu

**`POST /user/me/change-password`** `[auth]`

```json
// Request
{
  "current_password": "OldAbc@12345",
  "new_password": "NewAbc@99999"
}

// Response 200
{ "success": true, "data": { "message": "Mật khẩu đã được cập nhật." } }
```

---

### 3.5 Lấy lịch sử sử dụng

**`GET /user/me/usage?module=solver&from=2026-03-01&to=2026-03-24`** `[auth]`

```json
// Response 200
{
  "success": true,
  "data": {
    "summary": {
      "solver": { "today": 3, "this_month": 47 },
      "flashcard": { "today": 0, "this_month": 12 },
      "note": { "today": 1, "this_month": 8 }
    },
    "logs": [ ...usage_log_items ]
  }
}
```

---

## 4. QUOTA ENGINE

### 4.1 Kiểm tra quota hiện tại

**`GET /quota`** `[auth]`

```json
// Response 200
{
  "success": true,
  "data": {
    "plan": "free",
    "modules": {
      "solver":     { "used": 3, "limit": 5,  "reset": "daily",   "reset_at": "2026-03-25T00:00:00Z" },
      "flashcard":  { "used": 12, "limit": 20, "reset": "monthly", "reset_at": "2026-04-01T00:00:00Z" },
      "note":       { "used": 1, "limit": 3,  "reset": "daily",   "reset_at": "2026-03-25T00:00:00Z" },
      "quiz":       { "used": 0, "limit": 1,  "reset": "daily",   "reset_at": "2026-03-25T00:00:00Z" },
      "exam":       { "used": 1, "limit": 3,  "reset": "monthly", "reset_at": "2026-04-01T00:00:00Z" }
    }
  }
}
```

> **Ghi chú:** Quota engine được nhúng vào mỗi endpoint AI như middleware — không cần gọi riêng trước khi dùng. Endpoint này chỉ dùng để hiển thị dashboard quota cho user.

---

## 5. MODULE 1 — AI FLASHCARD

### 5.1 Lấy danh sách bộ flashcard

**`GET /flashcard/sets?page=1&limit=20`** `[auth]`

```json
// Response 200
{
  "success": true,
  "data": {
    "sets": [
      {
        "id": "uuid",
        "title": "Từ vựng IELTS Band 7",
        "description": "...",
        "subject": "Tiếng Anh",
        "source_type": "pdf",
        "card_count": 50,
        "is_public": false,
        "created_at": "2026-03-20T10:00:00Z"
      }
    ]
  },
  "meta": { "page": 1, "limit": 20, "total": 5 }
}
```

---

### 5.2 Tạo bộ flashcard từ text

**`POST /flashcard/sets/generate/text`** `[auth]`

> Quota: Free 20 cards/tháng | Premium: không giới hạn

```json
// Request
{
  "title": "Chương 3 - Tế bào học",
  "subject": "Sinh học",
  "content": "Tế bào là đơn vị cơ bản...",
  "card_count": 10,        // số card muốn tạo (1–50)
  "language": "vi"
}

// Response 201
{
  "success": true,
  "data": {
    "set": {
      "id": "uuid",
      "title": "Chương 3 - Tế bào học",
      "card_count": 10
    },
    "cards": [
      { "id": "uuid", "front": "Tế bào là gì?", "back": "Đơn vị cơ bản cấu tạo nên cơ thể sống." },
      ...
    ]
  },
  "meta": { "quota_remaining": 10, "quota_reset_at": "..." }
}
```

**Errors:** `429 QUOTA_EXCEEDED` | `503 AI_UNAVAILABLE`

---

### 5.3 Tạo bộ flashcard từ PDF

**`POST /flashcard/sets/generate/pdf`** `[auth]`

```
Content-Type: multipart/form-data
Body:
  file: <PDF, max 10MB>
  title: "Tên bộ"
  subject: "Môn học"
  card_count: 20
```

```json
// Response 201 — tương tự 5.2
```

---

### 5.4 Tạo flashcard thủ công

**`POST /flashcard/sets`** `[auth]`

```json
// Request
{
  "title": "Từ vựng tự học",
  "subject": "Tiếng Anh",
  "cards": [
    { "front": "Ubiquitous", "back": "Có mặt ở khắp nơi", "hint": "adj" },
    { "front": "Ephemeral", "back": "Tồn tại trong thời gian ngắn" }
  ]
}
```

---

### 5.5 Lấy chi tiết bộ flashcard

**`GET /flashcard/sets/:set_id`** `[auth]`

```json
// Response 200
{
  "success": true,
  "data": {
    "set": { ...set_info },
    "cards": [ ...all_cards ]
  }
}
```

---

### 5.6 Cập nhật / Xoá bộ flashcard

**`PATCH /flashcard/sets/:set_id`** `[auth]`
**`DELETE /flashcard/sets/:set_id`** `[auth]`

---

### 5.7 Cập nhật / Xoá từng card

**`PATCH /flashcard/sets/:set_id/cards/:card_id`** `[auth]`
**`DELETE /flashcard/sets/:set_id/cards/:card_id`** `[auth]`

---

### 5.8 Lấy danh sách card cần ôn hôm nay (Spaced Repetition)

**`GET /flashcard/review/due`** `[auth]`

```json
// Response 200
{
  "success": true,
  "data": {
    "due_count": 12,
    "cards": [
      {
        "card_id": "uuid",
        "set_id": "uuid",
        "set_title": "Từ vựng IELTS",
        "front": "Ubiquitous",
        "back": "Có mặt ở khắp nơi",
        "repetition": 3,
        "ease_factor": 2.5
      }
    ]
  }
}
```

---

### 5.9 Submit kết quả ôn tập (SM-2)

**`POST /flashcard/review/submit`** `[auth]`

```json
// Request
{
  "reviews": [
    { "card_id": "uuid", "quality": 4 },   // quality: 0–5 (SM-2 scale)
    { "card_id": "uuid", "quality": 2 },
    { "card_id": "uuid", "quality": 5 }
  ]
}

// Response 200
{
  "success": true,
  "data": {
    "processed": 3,
    "next_due": [
      { "card_id": "uuid", "next_review_at": "2026-03-31T00:00:00Z", "interval_days": 7 },
      { "card_id": "uuid", "next_review_at": "2026-03-25T00:00:00Z", "interval_days": 1 }
    ]
  }
}
```

> **SM-2 Logic:**
> - quality 0–2 → interval = 1 ngày (ôn lại ngay)
> - quality 3 → interval = 3 ngày
> - quality 4–5 → interval tăng dần (7, 14, 30...)

---

## 6. MODULE 2 — GIẢI BÀI TỪNG BƯỚC

### 6.1 Giải bài từ text

**`POST /solver/solve`** `[auth]`

> Quota: Free 5 lần/ngày | Premium: không giới hạn

```json
// Request
{
  "question": "Giải phương trình: 2x² - 5x + 3 = 0",
  "subject": "Toán",    // "Toán" | "Lý" | "Hóa" | "Anh" | "Văn" | "Sinh" | "Sử" | "Địa" | "Khác"
  "level": "thpt",      // "thcs" | "thpt" | "dai_hoc" | "khac"
  "language": "vi"
}

// Response 200
{
  "success": true,
  "data": {
    "history_id": "uuid",
    "question": "Giải phương trình: 2x² - 5x + 3 = 0",
    "subject": "Toán",
    "solution": {
      "steps": [
        {
          "step": 1,
          "title": "Xác định hệ số",
          "content": "a = 2, b = -5, c = 3",
          "latex": "a=2,\\; b=-5,\\; c=3"
        },
        {
          "step": 2,
          "title": "Tính Delta",
          "content": "Δ = b² - 4ac = 25 - 24 = 1",
          "latex": "\\Delta = b^2 - 4ac = 25 - 24 = 1"
        },
        {
          "step": 3,
          "title": "Tính nghiệm",
          "content": "x₁ = (5+1)/4 = 3/2 và x₂ = (5-1)/4 = 1",
          "latex": "x_1 = \\frac{5+1}{4} = \\frac{3}{2},\\quad x_2 = \\frac{5-1}{4} = 1"
        }
      ],
      "conclusion": "Phương trình có 2 nghiệm: x₁ = 3/2 và x₂ = 1",
      "formula_used": ["Công thức nghiệm: x = (-b ± √Δ) / 2a"]
    }
  },
  "meta": { "quota_remaining": 2, "quota_reset_at": "2026-03-25T00:00:00Z" }
}
```

**Errors:** `429 QUOTA_EXCEEDED` | `503 AI_UNAVAILABLE`

---

### 6.2 Giải bài từ ảnh

**`POST /solver/solve/image`** `[auth]`

```
Content-Type: multipart/form-data
Body:
  image: <JPEG/PNG, max 5MB>
  subject: "Toán"
  level: "thpt"
```

```json
// Response 200 — tương tự 6.1, thêm field:
{
  "data": {
    "detected_question": "Câu hỏi được nhận diện từ ảnh...",
    ...solution
  }
}
```

---

### 6.3 Hỏi thêm (Follow-up)

**`POST /solver/solve/:history_id/followup`** `[auth]`

```json
// Request
{ "question": "Tại sao Δ = b² - 4ac vậy?" }

// Response 200
{
  "success": true,
  "data": {
    "answer": "Delta được tính từ công thức nghiệm bậc 2 tổng quát..."
  }
}
```

---

### 6.4 Lấy lịch sử giải bài

**`GET /solver/history?page=1&limit=20&subject=Toán`** `[auth]`

```json
// Response 200
{
  "success": true,
  "data": {
    "histories": [
      {
        "id": "uuid",
        "question_preview": "Giải phương trình: 2x²...",
        "subject": "Toán",
        "created_at": "2026-03-24T10:00:00Z"
      }
    ]
  }
}
```

---

### 6.5 Lấy chi tiết lịch sử

**`GET /solver/history/:history_id`** `[auth]`

---

### 6.6 Xoá lịch sử

**`DELETE /solver/history/:history_id`** `[auth]`

---

## 7. MODULE 3 — LUYỆN ĐỀ

### 7.1 Lấy danh sách đề thi

**`GET /exam/list?subject=Toán&grade=12&page=1&limit=20`** `[public]`

```json
// Response 200
{
  "success": true,
  "data": {
    "exams": [
      {
        "id": "uuid",
        "title": "Đề thi thử THPT Quốc gia 2026 - Toán",
        "subject": "Toán",
        "grade": 12,
        "question_count": 50,
        "duration_minutes": 90,
        "difficulty": "medium",
        "attempt_count": 1243,
        "is_ai_generated": false
      }
    ]
  }
}
```

---

### 7.2 AI tạo đề thi

**`POST /exam/generate`** `[auth]`

> Quota: Free 3 đề/tháng | Premium: không giới hạn

```json
// Request
{
  "title": "Đề ôn chương Hàm số",
  "subject": "Toán",
  "grade": 12,
  "question_count": 20,
  "difficulty": "medium",       // "easy" | "medium" | "hard" | "mixed"
  "question_types": ["single_choice", "true_false"],
  "topics": ["Hàm số bậc nhất", "Hàm số bậc hai"],
  "duration_minutes": 45
}

// Response 201
{
  "success": true,
  "data": {
    "exam": {
      "id": "uuid",
      "title": "Đề ôn chương Hàm số",
      "question_count": 20,
      "duration_minutes": 45
    }
  }
}
```

---

### 7.3 Lấy chi tiết đề thi (để bắt đầu làm)

**`GET /exam/:exam_id`** `[auth]`

```json
// Response 200
{
  "success": true,
  "data": {
    "exam": {
      "id": "uuid",
      "title": "...",
      "subject": "Toán",
      "duration_minutes": 90,
      "question_count": 50
    },
    "questions": [
      {
        "id": "uuid",
        "order_index": 1,
        "type": "single_choice",
        "content": "Cho hàm số y = 2x + 1. Tìm y khi x = 3.",
        "options": {
          "A": "5", "B": "7", "C": "6", "D": "8"
        }
        // ❌ KHÔNG trả về correct_answer ở đây
      }
    ]
  }
}
```

---

### 7.4 Bắt đầu làm bài

**`POST /exam/:exam_id/start`** `[auth]`

```json
// Response 201
{
  "success": true,
  "data": {
    "attempt_id": "uuid",
    "started_at": "2026-03-24T10:00:00Z",
    "expires_at": "2026-03-24T11:30:00Z"   // started_at + duration
  }
}
```

---

### 7.5 Nộp bài

**`POST /exam/attempts/:attempt_id/submit`** `[auth]`

```json
// Request
{
  "answers": [
    { "question_id": "uuid", "selected_option": "B" },
    { "question_id": "uuid", "selected_option": "A" }
  ]
}

// Response 200
{
  "success": true,
  "data": {
    "attempt_id": "uuid",
    "score": 8.5,
    "correct_count": 42,
    "total_count": 50,
    "time_taken_seconds": 3240,
    "result_detail": [
      {
        "question_id": "uuid",
        "order_index": 1,
        "your_answer": "B",
        "correct_answer": "B",
        "is_correct": true,
        "explanation": "y = 2(3) + 1 = 7"
      }
    ],
    "weakness_analysis": {
      "by_topic": [
        { "topic": "Hàm số bậc hai", "correct_rate": 0.6, "suggestion": "Cần ôn lại công thức" }
      ]
    }
  }
}
```

---

### 7.6 Lịch sử làm bài

**`GET /exam/attempts?page=1&limit=20`** `[auth]`

---

### 7.7 Chi tiết một lần làm bài

**`GET /exam/attempts/:attempt_id`** `[auth]`

---

## 8. MODULE 4 — MICRO-LEARNING

### 8.1 Lấy danh sách chủ đề học

**`GET /microlearn/topics`** `[public]`

```json
// Response 200
{
  "success": true,
  "data": {
    "topics": [
      { "id": "uuid", "name": "Tiếng Anh Giao Tiếp", "icon": "🌍", "lesson_count": 120, "is_premium": false },
      { "id": "uuid", "name": "Kỹ Năng Lãnh Đạo",    "icon": "👑", "lesson_count": 60,  "is_premium": true }
    ]
  }
}
```

---

### 8.2 Đăng ký chủ đề học

**`POST /microlearn/topics/subscribe`** `[auth]`

```json
// Request
{ "topic_ids": ["uuid1", "uuid2"] }

// Response 200
{ "success": true, "data": { "subscribed": ["uuid1", "uuid2"] } }
```

---

### 8.3 Lấy bài học hôm nay

**`GET /microlearn/today`** `[auth]`

```json
// Response 200
{
  "success": true,
  "data": {
    "lessons": [
      {
        "id": "uuid",
        "topic_id": "uuid",
        "topic_name": "Tiếng Anh Giao Tiếp",
        "title": "10 Cụm Từ Lịch Sự Trong Email",
        "content": "...",        // full lesson content (markdown)
        "reading_time_minutes": 5,
        "quiz": {
          "question": "Which phrase is most appropriate to open a formal email?",
          "options": { "A": "Hey there", "B": "Dear Sir/Madam", "C": "Yo!", "D": "What's up" },
          "correct": "B"
        },
        "is_completed": false
      }
    ],
    "streak": { "current": 7, "longest": 15 }
  }
}
```

---

### 8.4 Đánh dấu bài học hoàn thành

**`POST /microlearn/lessons/:lesson_id/complete`** `[auth]`

```json
// Request
{ "quiz_answer": "B" }   // optional — nếu bài có quiz

// Response 200
{
  "success": true,
  "data": {
    "completed": true,
    "quiz_correct": true,
    "streak": { "current": 8, "longest": 15 },
    "streak_milestone": null    // hoặc "7_days", "30_days"...
  }
}
```

---

### 8.5 Lấy streak thống kê

**`GET /microlearn/streak`** `[auth]`

```json
// Response 200
{
  "success": true,
  "data": {
    "current_streak": 8,
    "longest_streak": 15,
    "total_lessons_completed": 42,
    "calendar": [
      { "date": "2026-03-24", "completed": true },
      { "date": "2026-03-23", "completed": true },
      { "date": "2026-03-22", "completed": false }
    ]
  }
}
```

---

## 9. MODULE 5 — AI NOTE & SUMMARY

### 9.1 Tóm tắt từ text

**`POST /note/summarize/text`** `[auth]`

> Quota: Free 3 lần/ngày | Premium: không giới hạn

```json
// Request
{
  "title": "Chương 4 - Quang học",
  "content": "Ánh sáng là sóng điện từ...",
  "output_format": "bullets",   // "bullets" | "paragraph" | "mindmap"
  "language": "vi",
  "save": true                  // lưu vào thư viện
}

// Response 200
{
  "success": true,
  "data": {
    "note_id": "uuid",           // null nếu save = false
    "title": "Chương 4 - Quang học",
    "summary": {
      "bullets": [
        "Ánh sáng là sóng điện từ với bước sóng 380–700nm",
        "Hiện tượng khúc xạ xảy ra khi ánh sáng qua 2 môi trường",
        "Công thức Snell: n₁·sin(θ₁) = n₂·sin(θ₂)"
      ],
      "key_terms": ["sóng điện từ", "khúc xạ", "phản xạ", "lăng kính"],
      "one_liner": "Quang học nghiên cứu bản chất và hiện tượng của ánh sáng."
    }
  },
  "meta": { "quota_remaining": 2, "quota_reset_at": "..." }
}
```

---

### 9.2 Tóm tắt từ PDF/DOCX

**`POST /note/summarize/file`** `[auth]`

```
Content-Type: multipart/form-data
Body:
  file: <PDF hoặc DOCX, max 20MB>
  title: "Tên ghi chú"
  output_format: "bullets"
  save: true
```

---

### 9.3 Lấy danh sách note

**`GET /note?page=1&limit=20&q=quang+học`** `[auth]`

```json
// Response 200
{
  "success": true,
  "data": {
    "notes": [
      {
        "id": "uuid",
        "title": "Chương 4 - Quang học",
        "tags": ["Vật lý", "Lớp 11"],
        "content_preview": "Ánh sáng là sóng điện từ...",
        "updated_at": "2026-03-24T10:00:00Z"
      }
    ]
  }
}
```

---

### 9.4 Lấy chi tiết note

**`GET /note/:note_id`** `[auth]`

---

### 9.5 Cập nhật note

**`PATCH /note/:note_id`** `[auth]`

```json
// Request
{
  "title": "Chương 4 - Quang học (cập nhật)",
  "content": "...",   // nội dung gốc (không phải summary)
  "tags": ["Vật lý", "Lớp 11"]
}
```

---

### 9.6 Xoá note

**`DELETE /note/:note_id`** `[auth]`

---

## 10. MODULE 6 — TUTOR MARKETPLACE

### 10.1 Tìm kiếm gia sư

**`GET /tutor/search?subject=Toán&min_price=100000&max_price=500000&rating=4&page=1&limit=20`** `[public]`

```json
// Response 200
{
  "success": true,
  "data": {
    "tutors": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "full_name": "Nguyễn Thị B",
        "avatar_url": "...",
        "subjects": ["Toán", "Vật lý"],
        "bio": "Giáo viên 5 năm kinh nghiệm...",
        "price_per_hour": 200000,
        "rating_avg": 4.8,
        "review_count": 32,
        "is_available": true
      }
    ]
  }
}
```

---

### 10.2 Xem profile gia sư

**`GET /tutor/:tutor_id`** `[public]`

```json
// Response 200
{
  "success": true,
  "data": {
    "tutor": {
      "id": "uuid",
      "full_name": "...",
      "bio": "...",
      "subjects": ["Toán", "Vật lý"],
      "price_per_hour": 200000,
      "rating_avg": 4.8,
      "review_count": 32,
      "experience_years": 5,
      "education": "Đại học Sư phạm TP.HCM",
      "cv_url": "...",
      "availabilities": [
        { "day_of_week": 1, "start_time": "08:00", "end_time": "12:00" },
        { "day_of_week": 3, "start_time": "14:00", "end_time": "18:00" }
      ],
      "reviews": [
        {
          "student_name": "Minh T.",
          "rating": 5,
          "comment": "Thầy dạy rất dễ hiểu!",
          "created_at": "2026-03-01T00:00:00Z"
        }
      ]
    }
  }
}
```

---

### 10.3 Đăng ký làm gia sư

**`POST /tutor/register`** `[auth]`

```json
// Request
{
  "bio": "Tôi là giáo viên Toán 5 năm kinh nghiệm...",
  "subjects": ["Toán", "Vật lý"],
  "price_per_hour": 200000,
  "experience_years": 5,
  "education": "ĐH Sư phạm TP.HCM",
  "availabilities": [
    { "day_of_week": 1, "start_time": "08:00", "end_time": "12:00" }
  ]
}

// Response 201
{
  "success": true,
  "data": {
    "tutor_id": "uuid",
    "status": "pending",
    "message": "Hồ sơ đã gửi, đang chờ admin xét duyệt (1–3 ngày làm việc)."
  }
}
```

---

### 10.4 Upload CV gia sư

**`POST /tutor/me/cv`** `[auth]` `[tutor]`

```
Content-Type: multipart/form-data
Body: file (PDF, max 5MB)
```

---

### 10.5 Cập nhật profile gia sư

**`PATCH /tutor/me`** `[auth]` `[tutor]`

---

### 10.6 Đặt lịch học

**`POST /tutor/:tutor_id/book`** `[auth]`

```json
// Request
{
  "subject": "Toán",
  "session_date": "2026-03-30",
  "start_time": "09:00",
  "end_time": "10:00",
  "note": "Em muốn học về tích phân"
}

// Response 201
{
  "success": true,
  "data": {
    "booking_id": "uuid",
    "status": "pending",
    "total_amount": 200000,
    "payment_url": "https://api.nebulalab.vn/v1/billing/booking/uuid/pay"
  }
}
```

---

### 10.7 Lấy danh sách booking của học sinh

**`GET /tutor/bookings/my?status=confirmed&page=1`** `[auth]`

---

### 10.8 Lấy danh sách booking của gia sư

**`GET /tutor/me/bookings?status=confirmed&page=1`** `[auth]` `[tutor]`

---

### 10.9 Đánh giá sau buổi học

**`POST /tutor/bookings/:booking_id/review`** `[auth]`

```json
// Request
{
  "rating": 5,
  "comment": "Thầy dạy rất dễ hiểu, kiên nhẫn!"
}

// Response 201
{ "success": true, "data": { "review_id": "uuid" } }
```

**Errors:** `422 BOOKING_NOT_COMPLETED` | `409 ALREADY_REVIEWED`

---

## 11. MODULE 7 — QUIZ GENERATOR

### 11.1 Tạo quiz từ text

**`POST /quiz/generate/text`** `[auth]`

> Quota: Free 1 quiz/ngày (tối đa 10 câu) | Premium: không giới hạn

```json
// Request
{
  "title": "Quiz Lịch sử Việt Nam",
  "content": "Ngày 30/4/1975, miền Nam...",
  "question_count": 10,
  "difficulty": "medium",
  "question_types": ["single_choice", "true_false"],  // "single_choice" | "true_false" | "fill_blank"
  "language": "vi"
}

// Response 201
{
  "success": true,
  "data": {
    "quiz": {
      "id": "uuid",
      "title": "Quiz Lịch sử Việt Nam",
      "question_count": 10,
      "share_token": "abc123xyz",
      "share_url": "https://nebulalab.vn/quiz/abc123xyz"
    },
    "questions": [
      {
        "id": "uuid",
        "order_index": 1,
        "type": "single_choice",
        "content": "Sự kiện lịch sử nào xảy ra vào ngày 30/4/1975?",
        "options": {
          "A": "Hiệp định Paris ký kết",
          "B": "Giải phóng miền Nam, thống nhất đất nước",
          "C": "Chiến dịch Điện Biên Phủ",
          "D": "Cách mạng tháng 8"
        },
        "correct_answer": "B",
        "explanation": "Ngày 30/4/1975 đánh dấu sự kiện giải phóng Sài Gòn..."
      }
    ]
  }
}
```

---

### 11.2 Tạo quiz từ PDF

**`POST /quiz/generate/pdf`** `[auth]`

```
Content-Type: multipart/form-data
Body:
  file: <PDF, max 10MB>
  title: "Tên quiz"
  question_count: 10
  difficulty: "medium"
```

---

### 11.3 Lấy danh sách quiz của tôi

**`GET /quiz?page=1&limit=20`** `[auth]`

---

### 11.4 Lấy quiz để làm (public link)

**`GET /quiz/share/:share_token`** `[public]`

```json
// Response 200 — trả về quiz nhưng KHÔNG có correct_answer
```

---

### 11.5 Cập nhật quiz

**`PATCH /quiz/:quiz_id`** `[auth]`

```json
// Request
{
  "title": "Quiz mới",
  "questions": [
    { "id": "uuid", "content": "Câu hỏi cập nhật...", "correct_answer": "A" }
  ]
}
```

---

### 11.6 Xoá quiz

**`DELETE /quiz/:quiz_id`** `[auth]`

---

### 11.7 Làm quiz & nộp bài

**`POST /quiz/:quiz_id/attempt`** `[public]`

```json
// Request
{
  "participant_name": "Nguyễn Văn A",   // optional, dùng cho guest
  "answers": [
    { "question_id": "uuid", "answer": "B" },
    { "question_id": "uuid", "answer": "True" }
  ]
}

// Response 200
{
  "success": true,
  "data": {
    "attempt_id": "uuid",
    "score": 9,
    "total": 10,
    "percentage": 90,
    "result_detail": [
      {
        "question_id": "uuid",
        "your_answer": "B",
        "correct_answer": "B",
        "is_correct": true,
        "explanation": "..."
      }
    ]
  }
}
```

---

### 11.8 Xem kết quả các lần làm quiz

**`GET /quiz/:quiz_id/attempts`** `[auth]`

---

## 12. BILLING & SUBSCRIPTION

### 12.1 Lấy danh sách gói cước

**`GET /billing/plans`** `[public]`

```json
// Response 200
{
  "success": true,
  "data": {
    "plans": [
      {
        "id": "uuid",
        "name": "Free",
        "price_monthly": 0,
        "price_yearly": 0,
        "features": ["5 lượt giải bài/ngày", "20 flashcard/tháng", "3 lần summary/ngày"]
      },
      {
        "id": "uuid",
        "name": "Premium",
        "price_monthly": 99000,
        "price_yearly": 799000,
        "features": ["Không giới hạn tất cả công cụ", "AI mạnh hơn", "Lưu trữ không giới hạn"]
      }
    ]
  }
}
```

---

### 12.2 Tạo đơn thanh toán nâng cấp Premium

**`POST /billing/subscribe`** `[auth]`

```json
// Request
{
  "plan_id": "uuid",
  "billing_cycle": "monthly",   // "monthly" | "yearly"
  "gateway": "vnpay"            // "vnpay" | "momo" | "stripe"
}

// Response 201
{
  "success": true,
  "data": {
    "payment_id": "uuid",
    "payment_url": "https://sandbox.vnpayment.vn/...",
    "amount": 99000,
    "expires_at": "2026-03-24T10:30:00Z"   // URL hết hạn sau 30 phút
  }
}
```

---

### 12.3 Callback từ cổng thanh toán

**`POST /billing/webhook/vnpay`** `[public]` ← verify signature nội bộ
**`POST /billing/webhook/momo`** `[public]`
**`POST /billing/webhook/stripe`** `[public]`

> Backend xử lý, cập nhật `payments` và `subscriptions`, gửi email confirm.

---

### 12.4 Thanh toán booking gia sư

**`POST /billing/booking/:booking_id/pay`** `[auth]`

```json
// Request
{ "gateway": "vnpay" }

// Response 201
{
  "success": true,
  "data": {
    "payment_url": "https://sandbox.vnpayment.vn/...",
    "amount": 200000
  }
}
```

---

### 12.5 Lấy lịch sử thanh toán

**`GET /billing/history?page=1&limit=20`** `[auth]`

```json
// Response 200
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": "uuid",
        "type": "subscription",
        "amount_vnd": 99000,
        "gateway": "vnpay",
        "status": "success",
        "paid_at": "2026-03-01T10:00:00Z"
      }
    ]
  }
}
```

---

### 12.6 Huỷ subscription

**`POST /billing/subscription/cancel`** `[auth]`

```json
// Response 200
{
  "success": true,
  "data": {
    "message": "Subscription sẽ hết hạn vào 2026-04-01. Bạn vẫn dùng được đến ngày đó."
  }
}
```

---

## 13. NOTIFICATION

### 13.1 Lấy danh sách thông báo

**`GET /notification?page=1&limit=20&unread_only=true`** `[auth]`

```json
// Response 200
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "type": "flashcard_review_due",
        "title": "Đến lịch ôn flashcard rồi! 📚",
        "body": "Bạn có 12 thẻ cần ôn hôm nay.",
        "is_read": false,
        "created_at": "2026-03-24T07:00:00Z"
      }
    ],
    "unread_count": 3
  }
}
```

---

### 13.2 Đánh dấu đã đọc

**`PATCH /notification/:notification_id/read`** `[auth]`

**`PATCH /notification/read-all`** `[auth]`

---

## 14. ADMIN

> Toàn bộ endpoint Admin yêu cầu `[admin]` guard

### 14.1 Dashboard thống kê

**`GET /admin/stats`**

```json
// Response 200
{
  "success": true,
  "data": {
    "users": { "total": 5420, "new_today": 34, "premium": 312 },
    "revenue": { "today_vnd": 2970000, "this_month_vnd": 45600000 },
    "usage": { "solver_today": 1243, "flashcard_today": 387 }
  }
}
```

---

### 14.2 Quản lý người dùng

**`GET /admin/users?q=email&plan=premium&page=1`**
**`GET /admin/users/:user_id`**
**`PATCH /admin/users/:user_id`** — cập nhật plan, role, suspend

---

### 14.3 Duyệt gia sư

**`GET /admin/tutors?status=pending`**
**`PATCH /admin/tutors/:tutor_id/approve`**
**`PATCH /admin/tutors/:tutor_id/reject`**
**`PATCH /admin/tutors/:tutor_id/suspend`**

---

### 14.4 Quản lý đề thi

**`GET /admin/exams`**
**`POST /admin/exams`** — tạo đề admin
**`PATCH /admin/exams/:exam_id`**
**`DELETE /admin/exams/:exam_id`**

---

### 14.5 Quản lý bài học Micro-learning

**`GET /admin/lessons`**
**`POST /admin/lessons`**
**`PATCH /admin/lessons/:lesson_id`**
**`DELETE /admin/lessons/:lesson_id`**

---

## 15. ERROR CODES

| HTTP | Code | Mô tả |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Dữ liệu đầu vào không hợp lệ |
| 400 | `INVALID_TOKEN` | Token sai định dạng |
| 401 | `INVALID_CREDENTIALS` | Sai email hoặc mật khẩu |
| 401 | `UNAUTHORIZED` | Chưa đăng nhập |
| 401 | `SESSION_REVOKED` | Session đã bị thu hồi |
| 403 | `FORBIDDEN` | Không có quyền truy cập |
| 403 | `EMAIL_NOT_VERIFIED` | Email chưa xác thực |
| 403 | `ACCOUNT_SUSPENDED` | Tài khoản bị khoá |
| 404 | `NOT_FOUND` | Resource không tồn tại |
| 409 | `EMAIL_EXISTS` | Email đã được đăng ký |
| 409 | `ALREADY_REVIEWED` | Đã đánh giá rồi |
| 410 | `TOKEN_EXPIRED` | Token đã hết hạn |
| 422 | `BOOKING_NOT_COMPLETED` | Buổi học chưa hoàn thành |
| 429 | `QUOTA_EXCEEDED` | Hết quota miễn phí |
| 429 | `RATE_LIMIT` | Gọi API quá nhanh |
| 500 | `INTERNAL_ERROR` | Lỗi server |
| 503 | `AI_UNAVAILABLE` | Gemini API tạm thời lỗi |

---

## 16. QUOTA LIMITS TỔNG HỢP

| Module | Free | Premium | Reset |
|---|---|---|---|
| **Solver** — Giải bài | 5 lần/ngày | Không giới hạn | 00:00 mỗi ngày |
| **Flashcard** — Tạo card | 20 cards/tháng | Không giới hạn | Ngày 1 mỗi tháng |
| **Note** — Tóm tắt | 3 lần/ngày | Không giới hạn | 00:00 mỗi ngày |
| **Quiz** — Tạo quiz | 1 quiz/ngày (≤10 câu) | Không giới hạn | 00:00 mỗi ngày |
| **Exam** — Luyện đề | 3 đề/tháng | Không giới hạn | Ngày 1 mỗi tháng |
| **Microlearn** | Bài miễn phí | Toàn bộ kho | — |
| **Tutor** | Tìm kiếm miễn phí | Tìm kiếm miễn phí | — |

---

## 📊 THỐNG KÊ TỔNG QUAN API

| Hạng mục | Con số |
|---|---|
| Tổng số endpoint | **~75 endpoints** |
| Endpoint Public (không cần auth) | ~12 |
| Endpoint cần Auth | ~55 |
| Endpoint Premium only | ~0 (kiểm soát qua Quota) |
| Endpoint Admin | ~10 |
| Module có AI (Gemini) | 5 module |
| Module có File Upload | 4 module |
| Webhook endpoints | 3 (VNPay, MoMo, Stripe) |

---

*Tài liệu này là phần tiếp theo của Flow Design v1.0 — NebulaLab.vn | 24/03/2026*
