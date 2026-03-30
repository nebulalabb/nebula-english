-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "password_hash" TEXT,
    "full_name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "role" TEXT NOT NULL DEFAULT 'student',
    "plan" TEXT NOT NULL DEFAULT 'free',
    "plan_expires_at" TIMESTAMP(3),
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" TEXT NOT NULL DEFAULT 'A1',
    "locale" TEXT NOT NULL DEFAULT 'vi',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_oauth_accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_uid" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "token_expires_at" TIMESTAMP(3),
    "raw_profile" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_oauth_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "last_active_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_verifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "tokens_used" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flashcard_sets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "subject" TEXT,
    "source_type" TEXT,
    "source_url" TEXT,
    "card_count" INTEGER NOT NULL DEFAULT 0,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flashcard_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flashcards" (
    "id" TEXT NOT NULL,
    "set_id" TEXT NOT NULL,
    "front" TEXT NOT NULL,
    "back" TEXT NOT NULL,
    "hint" TEXT,
    "image_url" TEXT,
    "audio_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flashcards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_schedules" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "flashcard_id" TEXT NOT NULL,
    "repetition" INTEGER NOT NULL DEFAULT 0,
    "easiness_factor" DECIMAL(65,30) NOT NULL DEFAULT 2.5,
    "interval_days" INTEGER NOT NULL DEFAULT 1,
    "next_review_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_reviewed_at" TIMESTAMP(3),
    "last_quality" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solve_histories" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "grade_level" TEXT,
    "question_text" TEXT NOT NULL,
    "question_image_url" TEXT,
    "answer_text" TEXT NOT NULL,
    "answer_html" TEXT,
    "tokens_used" INTEGER NOT NULL DEFAULT 0,
    "model_used" TEXT NOT NULL DEFAULT 'gemini-1.5-pro',
    "is_saved" BOOLEAN NOT NULL DEFAULT false,
    "rating" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "solve_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exams" (
    "id" TEXT NOT NULL,
    "creator_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "subject" TEXT NOT NULL,
    "grade_level" TEXT,
    "duration_minutes" INTEGER NOT NULL DEFAULT 45,
    "total_questions" INTEGER NOT NULL DEFAULT 0,
    "total_points" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "is_ai_generated" BOOLEAN NOT NULL DEFAULT false,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "pass_score" DECIMAL(65,30),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_questions" (
    "id" TEXT NOT NULL,
    "exam_id" TEXT NOT NULL,
    "question_text" TEXT NOT NULL,
    "question_image_url" TEXT,
    "question_type" TEXT NOT NULL DEFAULT 'single_choice',
    "options" JSONB DEFAULT '[]',
    "correct_answers" JSONB NOT NULL,
    "explanation" TEXT,
    "points" DECIMAL(65,30) NOT NULL DEFAULT 1,
    "difficulty" TEXT,
    "topic_tag" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_attempts" (
    "id" TEXT NOT NULL,
    "exam_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submitted_at" TIMESTAMP(3),
    "time_spent_sec" INTEGER,
    "score" DECIMAL(65,30),
    "max_score" DECIMAL(65,30),
    "percentage" DECIMAL(65,30),
    "passed" BOOLEAN,
    "analysis" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attempt_answers" (
    "id" TEXT NOT NULL,
    "attempt_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "selected_answers" JSONB NOT NULL DEFAULT '[]',
    "is_correct" BOOLEAN,
    "points_earned" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "time_spent_sec" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attempt_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_topics" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon_url" TEXT,
    "description" TEXT,
    "lesson_count" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learning_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_lessons" (
    "id" TEXT NOT NULL,
    "topic_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "content_html" TEXT,
    "estimated_minutes" INTEGER NOT NULL DEFAULT 5,
    "lesson_date" TIMESTAMP(3),
    "day_index" INTEGER,
    "is_premium" BOOLEAN NOT NULL DEFAULT false,
    "quiz_question" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_lesson_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "topic_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "quiz_answered" BOOLEAN NOT NULL DEFAULT false,
    "quiz_correct" BOOLEAN,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_lesson_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_streaks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "longest_streak" INTEGER NOT NULL DEFAULT 0,
    "last_activity_date" TIMESTAMP(3),
    "total_days_learned" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_streaks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Untitled Note',
    "source_type" TEXT,
    "source_content" TEXT,
    "source_url" TEXT,
    "word_count" INTEGER,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "note_summaries" (
    "id" TEXT NOT NULL,
    "note_id" TEXT NOT NULL,
    "summary_short" TEXT NOT NULL,
    "bullet_points" JSONB NOT NULL DEFAULT '[]',
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "full_summary" TEXT,
    "model_used" TEXT NOT NULL DEFAULT 'gemini-1.5-pro',
    "tokens_used" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "note_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tutor_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "bio" TEXT,
    "education" TEXT,
    "experience_years" INTEGER NOT NULL DEFAULT 0,
    "hourly_rate_vnd" INTEGER NOT NULL,
    "hourly_rate_min" INTEGER,
    "teaching_style" TEXT,
    "certifications" JSONB NOT NULL DEFAULT '[]',
    "video_intro_url" TEXT,
    "rating_avg" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "total_sessions" INTEGER NOT NULL DEFAULT 0,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tutor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tutor_subjects" (
    "id" TEXT NOT NULL,
    "tutor_id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "grade_levels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "proficiency" TEXT NOT NULL DEFAULT 'advanced',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tutor_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tutor_availabilities" (
    "id" TEXT NOT NULL,
    "tutor_id" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tutor_availabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "tutor_id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "grade_level" TEXT,
    "session_date" TIMESTAMP(3) NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'google_meet',
    "meeting_url" TEXT,
    "notes" TEXT,
    "price_vnd" INTEGER NOT NULL,
    "commission_rate" DECIMAL(65,30) NOT NULL DEFAULT 0.12,
    "commission_vnd" INTEGER NOT NULL,
    "tutor_payout_vnd" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "cancelled_by" TEXT,
    "cancelled_at" TIMESTAMP(3),
    "cancel_reason" TEXT,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_reviews" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "reviewer_id" TEXT NOT NULL,
    "tutor_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_sets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "source_type" TEXT,
    "source_url" TEXT,
    "question_count" INTEGER NOT NULL DEFAULT 0,
    "difficulty" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "share_token" TEXT,
    "play_count" INTEGER NOT NULL DEFAULT 0,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quiz_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_questions" (
    "id" TEXT NOT NULL,
    "quiz_id" TEXT NOT NULL,
    "question_text" TEXT NOT NULL,
    "question_type" TEXT NOT NULL DEFAULT 'single_choice',
    "options" JSONB DEFAULT '[]',
    "correct_answers" JSONB NOT NULL,
    "explanation" TEXT,
    "points" INTEGER NOT NULL DEFAULT 1,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_attempts" (
    "id" TEXT NOT NULL,
    "quiz_id" TEXT NOT NULL,
    "user_id" TEXT,
    "guest_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "score" INTEGER NOT NULL DEFAULT 0,
    "max_score" INTEGER NOT NULL DEFAULT 0,
    "percentage" DECIMAL(65,30),
    "time_spent_sec" INTEGER,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_answers" (
    "id" TEXT NOT NULL,
    "attempt_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "selected_answers" JSONB NOT NULL DEFAULT '[]',
    "is_correct" BOOLEAN,
    "points_earned" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "price_vnd" INTEGER NOT NULL DEFAULT 0,
    "billing_cycle" TEXT,
    "features" JSONB NOT NULL DEFAULT '{}',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT DEFAULT 'blue',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forum_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_posts" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "content_html" TEXT,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forum_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_comments" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "content" TEXT NOT NULL,
    "content_html" TEXT,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "is_solution" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forum_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "post_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forum_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_post_tags" (
    "post_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,

    CONSTRAINT "forum_post_tags_pkey" PRIMARY KEY ("post_id","tag_id")
);

-- CreateTable
CREATE TABLE "forum_post_likes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "is_upvote" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forum_post_likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_oauth_accounts_provider_provider_uid_key" ON "user_oauth_accounts"("provider", "provider_uid");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_refresh_token_key" ON "user_sessions"("refresh_token");

-- CreateIndex
CREATE UNIQUE INDEX "email_verifications_token_key" ON "email_verifications"("token");

-- CreateIndex
CREATE INDEX "review_schedules_user_id_next_review_at_idx" ON "review_schedules"("user_id", "next_review_at");

-- CreateIndex
CREATE UNIQUE INDEX "review_schedules_user_id_flashcard_id_key" ON "review_schedules"("user_id", "flashcard_id");

-- CreateIndex
CREATE UNIQUE INDEX "attempt_answers_attempt_id_question_id_key" ON "attempt_answers"("attempt_id", "question_id");

-- CreateIndex
CREATE UNIQUE INDEX "learning_topics_slug_key" ON "learning_topics"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "user_lesson_progress_user_id_lesson_id_key" ON "user_lesson_progress"("user_id", "lesson_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_streaks_user_id_key" ON "user_streaks"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tutor_profiles_user_id_key" ON "tutor_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tutor_subjects_tutor_id_subject_key" ON "tutor_subjects"("tutor_id", "subject");

-- CreateIndex
CREATE UNIQUE INDEX "booking_reviews_booking_id_key" ON "booking_reviews"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_sets_share_token_key" ON "quiz_sets"("share_token");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_answers_attempt_id_question_id_key" ON "quiz_answers"("attempt_id", "question_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_name_key" ON "subscription_plans"("name");

-- CreateIndex
CREATE UNIQUE INDEX "forum_categories_slug_key" ON "forum_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "forum_tags_name_key" ON "forum_tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "forum_tags_slug_key" ON "forum_tags"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "forum_post_likes_user_id_post_id_key" ON "forum_post_likes"("user_id", "post_id");

-- AddForeignKey
ALTER TABLE "user_oauth_accounts" ADD CONSTRAINT "user_oauth_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_verifications" ADD CONSTRAINT "email_verifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_logs" ADD CONSTRAINT "usage_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcard_sets" ADD CONSTRAINT "flashcard_sets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_set_id_fkey" FOREIGN KEY ("set_id") REFERENCES "flashcard_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_schedules" ADD CONSTRAINT "review_schedules_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_schedules" ADD CONSTRAINT "review_schedules_flashcard_id_fkey" FOREIGN KEY ("flashcard_id") REFERENCES "flashcards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solve_histories" ADD CONSTRAINT "solve_histories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_questions" ADD CONSTRAINT "exam_questions_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_attempts" ADD CONSTRAINT "exam_attempts_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_attempts" ADD CONSTRAINT "exam_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "exam_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "exam_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_lessons" ADD CONSTRAINT "daily_lessons_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "learning_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_lesson_progress" ADD CONSTRAINT "user_lesson_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_lesson_progress" ADD CONSTRAINT "user_lesson_progress_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "daily_lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_lesson_progress" ADD CONSTRAINT "user_lesson_progress_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "learning_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_streaks" ADD CONSTRAINT "user_streaks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note_summaries" ADD CONSTRAINT "note_summaries_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutor_profiles" ADD CONSTRAINT "tutor_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutor_subjects" ADD CONSTRAINT "tutor_subjects_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutor_availabilities" ADD CONSTRAINT "tutor_availabilities_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_reviews" ADD CONSTRAINT "booking_reviews_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_reviews" ADD CONSTRAINT "booking_reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_reviews" ADD CONSTRAINT "booking_reviews_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_sets" ADD CONSTRAINT "quiz_sets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quiz_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quiz_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "quiz_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "quiz_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_posts" ADD CONSTRAINT "forum_posts_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "forum_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_posts" ADD CONSTRAINT "forum_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_comments" ADD CONSTRAINT "forum_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_comments" ADD CONSTRAINT "forum_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_comments" ADD CONSTRAINT "forum_comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "forum_comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_post_tags" ADD CONSTRAINT "forum_post_tags_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_post_tags" ADD CONSTRAINT "forum_post_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "forum_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_post_likes" ADD CONSTRAINT "forum_post_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_post_likes" ADD CONSTRAINT "forum_post_likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
